/**
 * Web Speech API Text-to-Speech (TTS) Utility
 * Provides spoken audio feedback for elderly citizens in 13 Indian and regional languages.
 */

import { LanguageCode } from '../types';

export const LANGUAGE_BCP47_MAP: Record<LanguageCode, string[]> = {
  hi: ['hi-IN', 'hi'],
  gu: ['gu-IN', 'gu'],
  mr: ['mr-IN', 'mr'],
  bn: ['bn-IN', 'bn-BD', 'bn'],
  ta: ['ta-IN', 'ta-LK', 'ta'],
  te: ['te-IN', 'te'],
  kn: ['kn-IN', 'kn'],
  ml: ['ml-IN', 'ml'],
  pa: ['pa-IN', 'pa'],
  or: ['or-IN', 'hi-IN'],
  as: ['as-IN', 'bn-IN'],
  ur: ['ur-IN', 'ur-PK', 'ur'],
  en: ['en-IN', 'en-GB', 'en-US', 'en'],
};

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking: boolean = false;
  private listeners: Set<(speaking: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public isSupported(): boolean {
    return !!this.synth;
  }

  public subscribe(listener: (speaking: boolean) => void): () => void {
    this.listeners.add(listener);
    listener(this.isSpeaking);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(speaking: boolean) {
    this.isSpeaking = speaking;
    this.listeners.forEach((l) => l(speaking));
  }

  /**
   * Sanitizes text for cleaner, natural speech output (removes markdown, URLs, symbols)
   */
  public cleanTextForSpeech(text: string): string {
    return text
      .replace(/https?:\/\/\S+/gi, 'official government cyber portal')
      .replace(/1930/g, 'one nine three zero')
      .replace(/[⚠️🚨✅▲●]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Finds the most suitable voice for the requested language code
   */
  private getBestVoice(language: LanguageCode): SpeechSynthesisVoice | null {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return null;

    const targetLocales = LANGUAGE_BCP47_MAP[language] || ['en-IN', 'en'];

    for (const locale of targetLocales) {
      const match = voices.find(
        (v) => v.lang.toLowerCase() === locale.toLowerCase() || v.lang.toLowerCase().startsWith(locale.toLowerCase())
      );
      if (match) return match;
    }

    // Fallback: look for Indian English or standard English
    const fallbackIndianEn = voices.find((v) => v.lang.includes('IN') || v.lang.includes('en'));
    return fallbackIndianEn || voices[0] || null;
  }

  /**
   * Speaks the given text in the requested language
   */
  public speak(text: string, language: LanguageCode, onEnd?: () => void) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    // Cancel any previous speech
    this.stop();

    const clean = this.cleanTextForSpeech(text);
    if (!clean) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(clean);
    const targetLocales = LANGUAGE_BCP47_MAP[language] || ['en-IN'];
    utterance.lang = targetLocales[0];

    const voice = this.getBestVoice(language);
    if (voice) {
      utterance.voice = voice;
    }

    // Senior-friendly pacing: slightly slower than normal (0.88x) and clear pitch
    utterance.rate = 0.88;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.notify(true);
    };

    utterance.onend = () => {
      this.notify(false);
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.notify(false);
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.notify(false);
      this.currentUtterance = null;
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const speechService = new SpeechService();
