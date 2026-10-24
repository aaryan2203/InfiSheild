import React, { useState, useEffect } from 'react';
import { RiskLevel, DetectedRedFlag } from '../logic/scamDetector';
import { LanguageCode } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  Info,
  PhoneForwarded,
  CheckCircle,
  Volume2,
  Square,
  Ear,
} from 'lucide-react';
import { speechService } from '../utils/textToSpeech';

interface ThreatIntelPanelProps {
  riskLevel: RiskLevel;
  isSuspicious: boolean;
  detectedFlags: DetectedRedFlag[];
  confidence: number;
  language: LanguageCode;
  recommendedAction: string;
  scenarioType: 'scam' | 'genuine';
  isPlaying: boolean;
  autoReadAloud?: boolean;
}

export const ThreatIntelPanel: React.FC<ThreatIntelPanelProps> = ({
  riskLevel,
  isSuspicious,
  detectedFlags,
  confidence,
  language,
  recommendedAction,
  scenarioType,
  isPlaying,
  autoReadAloud = false,
}) => {
  const [speakingTarget, setSpeakingTarget] = useState<string | null>(null);

  // Subscribe to speech service state
  useEffect(() => {
    const unsubscribe = speechService.subscribe((isSpeaking) => {
      if (!isSpeaking) {
        setSpeakingTarget(null);
      }
    });

    return () => {
      speechService.stop();
      unsubscribe();
    };
  }, []);

  // When language changes, stop active speech so it does not overlap
  useEffect(() => {
    speechService.stop();
    setSpeakingTarget(null);
  }, [language]);

  // Optional Auto Read Aloud when a HIGH or CRITICAL threat is first detected
  useEffect(() => {
    if (autoReadAloud && (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') && recommendedAction) {
      handleSpeakRecommendation();
    }
  }, [riskLevel]);

  const getRiskBadge = () => {
    switch (riskLevel) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-600',
          textColor: 'text-white',
          border: 'border-rose-700',
          label: 'CRITICAL RISK — IMMEDIATE THREAT',
          subLabel: 'Extreme likelihood of financial or impersonation fraud',
          icon: <AlertOctagon className="w-5 h-5 text-white animate-bounce" />,
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-500',
          textColor: 'text-white',
          border: 'border-orange-600',
          label: 'HIGH RISK — SCAM DETECTED',
          subLabel: 'Severe coercion or credential theft detected',
          icon: <AlertTriangle className="w-5 h-5 text-white" />,
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-500',
          textColor: 'text-white',
          border: 'border-amber-600',
          label: 'MEDIUM RISK — SUSPICIOUS PATTERNS',
          subLabel: 'Urgency tactics or unverified inquiries found',
          icon: <Info className="w-5 h-5 text-white" />,
        };
      default:
        return {
          bg: 'bg-emerald-600',
          textColor: 'text-white',
          border: 'border-emerald-700',
          label: 'LOW RISK — CALL VERIFIED SAFE',
          subLabel: 'No malicious indicators or coercive tactics detected',
          icon: <ShieldCheck className="w-5 h-5 text-white" />,
        };
    }
  };

  const badge = getRiskBadge();

  // Helper for localized flag explanation
  const getFlagExplanation = (flag: DetectedRedFlag) => {
    if (language === 'hi') return flag.explanation_hi;
    if (language === 'gu') return flag.explanation_gu;
    if (language === 'mr') return flag.explanation_mr;
    if (language === 'bn') return flag.explanation_bn;
    if (language === 'ta') return flag.explanation_ta;
    if (language === 'te') return flag.explanation_te;
    if (language === 'kn') return flag.explanation_kn;
    if (language === 'ml') return flag.explanation_ml;
    if (language === 'pa') return flag.explanation_pa;
    if (language === 'or') return flag.explanation_or;
    if (language === 'as') return flag.explanation_as;
    if (language === 'ur') return flag.explanation_ur;
    return flag.explanation_en;
  };

  const handleSpeakRecommendation = () => {
    if (speakingTarget === 'recommendation') {
      speechService.stop();
      setSpeakingTarget(null);
    } else {
      setSpeakingTarget('recommendation');
      speechService.speak(recommendedAction, language, () => {
        setSpeakingTarget(null);
      });
    }
  };

  const handleSpeakFlag = (flag: DetectedRedFlag) => {
    if (speakingTarget === flag.id) {
      speechService.stop();
      setSpeakingTarget(null);
    } else {
      setSpeakingTarget(flag.id);
      const text = `${flag.type.replace('_', ' ')}. ${getFlagExplanation(flag)}`;
      speechService.speak(text, language, () => {
        setSpeakingTarget(null);
      });
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col h-full space-y-4">
      {/* Header Risk Level Banner */}
      <div className={`p-4 rounded-xl ${badge.bg} ${badge.textColor} shadow-xs transition-all`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5">{badge.icon}</div>
            <div>
              <div className="text-xs font-semibold tracking-wider uppercase opacity-90">
                Threat Assessment Level
              </div>
              <div className="text-base sm:text-lg font-black tracking-tight leading-tight">
                {badge.label}
              </div>
              <div className="text-xs opacity-90 mt-0.5">{badge.subLabel}</div>
            </div>
          </div>
          <div className="text-right flex-shrink-0 bg-black/15 px-2.5 py-1 rounded-md">
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Confidence</div>
            <div className="text-sm font-mono font-bold">{(confidence * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>

      {/* Safety Recommendation with Read Aloud Accessibility Control */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <PhoneForwarded className="w-3.5 h-3.5 text-indigo-600" />
            <span>Safety Recommendation (नागरिक सुरक्षा सलाह)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              {language.toUpperCase()}
            </span>

            {/* Read Aloud Button for Elderly Users */}
            <button
              onClick={handleSpeakRecommendation}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                speakingTarget === 'recommendation'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white'
              }`}
              title="Listen to recommendation aloud (बोलकर सुनें)"
              aria-label={speakingTarget === 'recommendation' ? 'Stop reading recommendation' : 'Read recommendation aloud'}
            >
              {speakingTarget === 'recommendation' ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Voice</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Read Aloud</span>
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-800 font-medium leading-relaxed bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          {recommendedAction}
        </p>

        {speakingTarget === 'recommendation' && (
          <div className="mt-2 flex items-center gap-2 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
            <Ear className="w-3.5 h-3.5 animate-bounce text-indigo-600" />
            <span>Speaking safety advisory aloud in {language.toUpperCase()}...</span>
          </div>
        )}
      </div>

      {/* Detected Red Flags Section with Individual Voice Buttons */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>Detected Red Flags ({detectedFlags.length})</span>
          </h4>
          <span className="text-[11px] text-slate-500">
            {detectedFlags.length === 0 ? 'No flags triggered' : 'Tap 🔊 to listen to each flag'}
          </span>
        </div>

        <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
          {detectedFlags.length === 0 ? (
            <div className="py-6 text-center text-slate-400">
              <CheckCircle className="w-7 h-7 text-emerald-400 mx-auto mb-1.5 stroke-1" />
              <p className="text-xs font-medium text-slate-600">
                {scenarioType === 'genuine'
                  ? 'Genuine Call: No fraudulent red flags detected'
                  : 'Listening... Any scam phrases will trigger instant warning'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Evaluates threats, impersonation, OTP requests, and isolation tactics.
              </p>
            </div>
          ) : (
            detectedFlags.map((flag, idx) => {
              const isFlagSpeaking = speakingTarget === flag.id;

              return (
                <div
                  key={flag.id || idx}
                  className={`border rounded-lg p-3 text-xs transition-all ${
                    isFlagSpeaking
                      ? 'bg-rose-100/70 border-rose-400 ring-2 ring-rose-300'
                      : 'bg-rose-50/60 border-rose-200 hover:bg-rose-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="font-bold text-rose-800 text-[11px] uppercase tracking-wide">
                      ⚠️ {flag.type.replace('_', ' ')}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-rose-600 font-mono">
                        Severity: {flag.severity}/5
                      </span>

                      {/* Read Aloud button for this red flag */}
                      <button
                        onClick={() => handleSpeakFlag(flag)}
                        className={`p-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors ${
                          isFlagSpeaking
                            ? 'bg-rose-600 text-white'
                            : 'bg-white border border-rose-300 text-rose-700 hover:bg-rose-100'
                        }`}
                        title="Read this red flag explanation aloud"
                        aria-label={isFlagSpeaking ? 'Stop speaking this flag' : 'Read this flag aloud'}
                      >
                        {isFlagSpeaking ? <Square className="w-3 h-3 fill-current" /> : <Volume2 className="w-3 h-3" />}
                        <span className="text-[10px]">{isFlagSpeaking ? 'Stop' : 'Listen'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/90 border border-rose-100 rounded px-2.5 py-1 mb-1.5 text-slate-900 font-mono text-[11px]">
                    "{flag.evidence}"
                  </div>

                  <p className="text-slate-700 text-[11px] leading-snug">
                    {getFlagExplanation(flag)}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
