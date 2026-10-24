import test from 'node:test';
import assert from 'node:assert/strict';
import { speechService, LANGUAGE_BCP47_MAP } from './textToSpeech';

test('Text-to-Speech cleans telephone helpline numbers and emojis for audio accessibility', () => {
  const input = '⚠️ सावधान! कॉल तुरंत काट दें। 1930 पर कॉल करें। https://cybercrime.gov.in';
  const cleaned = speechService.cleanTextForSpeech(input);

  assert.ok(!cleaned.includes('⚠️'), 'Should strip warning emoji');
  assert.ok(cleaned.includes('one nine three zero'), 'Should format 1930 clearly for speech synthesis');
  assert.ok(!cleaned.includes('https://'), 'Should sanitize raw URLs');
});

test('All 13 supported languages map to valid BCP 47 locale identifiers', () => {
  const expectedLanguages = [
    'hi', 'gu', 'mr', 'bn', 'ta', 'te',
    'kn', 'ml', 'pa', 'or', 'as', 'ur', 'en'
  ] as const;

  for (const lang of expectedLanguages) {
    const locales = LANGUAGE_BCP47_MAP[lang];
    assert.ok(locales && locales.length > 0, `Missing locales for ${lang}`);
    assert.ok(locales[0].includes('-') || locales[0].length === 2, `Invalid BCP47 identifier for ${lang}: ${locales[0]}`);
  }
});
