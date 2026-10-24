import React from 'react';
import { X, ShieldAlert, PhoneCall, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { LanguageCode } from '../types';

interface ElderlySafetyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
}

export const ElderlySafetyGuideModal: React.FC<ElderlySafetyGuideModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Citizen & Elderly Fraud Prevention Guide
              </h2>
              <p className="text-xs text-slate-500">
                Official advice on Indian cyber extortion and digital arrest scams
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-sm text-slate-700">
          {/* Emergency Helpline Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <PhoneCall className="w-5 h-5 text-amber-700 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-amber-900 text-sm">
                National Cyber Crime Helpline: 1930
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                If you or a family member have transferred money or suspect fraud, call <strong>1930 immediately</strong>.
                Quick reporting within 2 hours enables Indian banks and police to freeze fraudulent transfer transactions.
              </p>
            </div>
          </div>

          {/* 3 Golden Rules */}
          <div>
            <h3 className="font-bold text-slate-900 mb-3 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>The 3 Golden Rules of Phone Safety</span>
            </h3>

            <div className="space-y-2.5">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-semibold text-slate-900 text-xs">
                  1. "Digital Arrest" is 100% Fake
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Neither the Indian Police, CBI, ED, nor the Supreme Court ever conducts arrests, interrogations, or hearings over WhatsApp, Skype, or phone calls.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-semibold text-slate-900 text-xs">
                  2. No "Safe RBI Verification Accounts" Exist
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  The Reserve Bank of India (RBI) never holds individual citizen accounts or requires money transfers to "verify" innocence. Any request to transfer funds is theft.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-semibold text-slate-900 text-xs">
                  3. Never Share OTPs or Install Remote Apps
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Never install apps like AnyDesk, TeamViewer, or QuickSupport on the instruction of a phone caller. Never share 6-digit SMS OTPs or UPI PINs.
                </p>
              </div>
            </div>
          </div>

          {/* Official Portal Reference */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Official Government Portal:</span>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              <span>cybercrime.gov.in</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs transition-colors cursor-pointer"
          >
            I Understand — Back to Detector
          </button>
        </div>
      </div>
    </div>
  );
};
