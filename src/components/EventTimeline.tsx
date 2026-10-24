import React from 'react';
import { DetectedRedFlag } from '../logic/scamDetector';
import { Clock, ShieldAlert, CheckCircle } from 'lucide-react';

interface EventTimelineProps {
  flags: DetectedRedFlag[];
  totalDurationSec: number;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ flags, totalDurationSec }) => {
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins}:${s.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Detection Event Timeline
          </h3>
        </div>
        <span className="text-xs text-slate-500">
          {flags.length > 0 ? `${flags.length} events logged` : 'Timeline idle'}
        </span>
      </div>

      {flags.length === 0 ? (
        <div className="py-4 text-center text-slate-400 text-xs">
          No threat events logged yet. Events will be stamped as chunks are analyzed.
        </div>
      ) : (
        <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {flags.map((flag, idx) => {
            const isEarly = flag.timestampSec < totalDurationSec;

            return (
              <div key={flag.id || idx} className="relative group">
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-rose-600 ring-4 ring-rose-100 flex items-center justify-center" />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded text-[11px]">
                      At {formatTime(flag.timestampSec)}
                    </span>
                    <span className="font-semibold text-slate-900 uppercase text-[11px]">
                      {flag.type.replace('_', ' ')}
                    </span>
                  </div>
                  {isEarly && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 w-fit">
                      <CheckCircle className="w-3 h-3" />
                      <span>Detected before call ended!</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1 italic">
                  "{flag.evidence}"
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
