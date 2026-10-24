import React from 'react';
import { ShieldAlert, ShieldCheck, Volume2, VolumeX, BookOpen, PhoneCall } from 'lucide-react';
import { LanguageCode, LanguageOption } from '../types';

interface HeaderProps {
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  status: 'ready' | 'analyzing' | 'warning' | 'safe';
  analyzingChunkIndex?: number;
  totalChunks?: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  autoReadAloud: boolean;
  onToggleAutoReadAloud: () => void;
  onOpenGuide: () => void;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'hi', label: 'Hindi', nativeLabel: 'Hindi (हिंदी)' },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'Gujarati (ગુજરાતી)' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'Marathi (मराठी)' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'Bengali (বাংলা)' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'Tamil (தமிழ்)' },
  { code: 'te', label: 'Telugu', nativeLabel: 'Telugu (తెలుగు)' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ml', label: 'Malayalam', nativeLabel: 'Malayalam (മലയാളം)' },
  { code: 'pa', label: 'Punjabi', nativeLabel: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'or', label: 'Odia', nativeLabel: 'Odia (ଓଡ଼ିଆ)' },
  { code: 'as', label: 'Assamese', nativeLabel: 'Assamese (অসমীয়া)' },
  { code: 'ur', label: 'Urdu', nativeLabel: 'Urdu (اردو)' },
  { code: 'en', label: 'English', nativeLabel: 'English' },
];

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  status,
  analyzingChunkIndex,
  totalChunks,
  soundEnabled,
  onToggleSound,
  autoReadAloud,
  onToggleAutoReadAloud,
  onOpenGuide,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">InfiShield AI</h1>
              <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-700 border border-slate-200">
                Hackathon MVP
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Your AI Guardian Against Scam Calls</p>
          </div>
        </div>

        {/* Center: Live Status Indicator */}
        <div className="flex items-center gap-2">
          {status === 'ready' && (
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>Status: Ready to Monitor Call</span>
            </div>
          )}
          {status === 'analyzing' && (
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>
                Analyzing Stream {analyzingChunkIndex !== undefined ? `(Chunk ${analyzingChunkIndex + 1}/${totalChunks})` : '...'}
              </span>
            </div>
          )}
          {status === 'warning' && (
            <div className="flex items-center gap-2 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-300">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>WARNING: Scam Red Flags Detected!</span>
            </div>
          )}
          {status === 'safe' && (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Legitimate Call Verified</span>
            </div>
          )}
        </div>

        {/* Controls: Language, Sound, Guide, Helpline */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Cyber Helpline Quick Badge */}
          <a
            href="tel:1930"
            className="flex items-center gap-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1.5 rounded-lg transition-colors"
            title="National Cyber Crime Reporting Helpline (Govt of India)"
          >
            <PhoneCall className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">Cyber Helpline:</span>
            <span className="font-bold">1930</span>
          </a>

          {/* Sound Toggle */}
          {/* Sound Chime Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 cursor-pointer ${
              soundEnabled
                ? 'bg-slate-100 border-slate-300 text-slate-800'
                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
            title={soundEnabled ? 'Alert chime is ON' : 'Alert chime is OFF'}
            aria-label="Toggle alert sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Auto Read Aloud Toggle for Elderly Accessibility */}
          <button
            onClick={onToggleAutoReadAloud}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
              autoReadAloud
                ? 'bg-indigo-600 border-indigo-700 text-white font-semibold shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title={autoReadAloud ? 'Auto Read Aloud is ON (चेतावनी बोलकर सुनाई जाएगी)' : 'Turn ON Auto Voice Read Aloud (आवाज से सुनें)'}
            aria-label="Toggle Auto Voice Read Aloud"
          >
            <span>🗣️</span>
            <span className="hidden sm:inline">{autoReadAloud ? 'Auto-Voice: ON' : 'Auto-Voice'}</span>
          </button>

          {/* Educational Guide Button */}
          <button
            onClick={onOpenGuide}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>Safety Guide</span>
          </button>

          {/* Language Selector */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              className="text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg py-1.5 px-2.5 pr-6 text-slate-800 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              aria-label="Select explanation language"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeLabel} ({lang.label})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
