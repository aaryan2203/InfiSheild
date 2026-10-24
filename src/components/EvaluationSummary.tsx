import React from 'react';
import { EvaluationStats } from '../types';
import { Award, ShieldAlert, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface EvaluationSummaryProps {
  stats: EvaluationStats;
  onResetStats: () => void;
}

export const EvaluationSummary: React.FC<EvaluationSummaryProps> = ({ stats, onResetStats }) => {
  const totalCallsTested = stats.scamCallsTested + stats.genuineCallsTested;
  const earlyWarningRate =
    stats.scamCallsTested > 0
      ? ((stats.earlyWarningsIssued / stats.scamCallsTested) * 100).toFixed(0)
      : '100';
  const falsePositiveRate =
    stats.genuineCallsTested > 0
      ? ((stats.falsePositivesCount / stats.genuineCallsTested) * 100).toFixed(0)
      : '0';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <span>Session Evaluation Summary & False-Positive Verification</span>
          </h3>
          <p className="text-xs text-slate-500">
            Calculated dynamically from actual call runs in this session (No simulated numbers).
          </p>
        </div>
        <button
          onClick={onResetStats}
          className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer w-fit"
          title="Reset evaluation counters"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Metrics</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Scam Calls Tested */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">
            Scams Tested
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {stats.scamCallsTested}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Scam scenarios run</div>
        </div>

        {/* Genuine Calls Tested */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">
            Genuine Tested
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {stats.genuineCallsTested}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Control benchmark calls</div>
        </div>

        {/* Total Red Flags Detected */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">
            Red Flags Found
          </div>
          <div className="text-xl font-bold text-rose-600 mt-1">
            {stats.redFlagsDetected}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Suspicious statements</div>
        </div>

        {/* Early Warnings (Before Call Ended) */}
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3">
          <div className="text-[11px] font-semibold text-emerald-700 uppercase">
            Early Warning Rate
          </div>
          <div className="text-xl font-bold text-emerald-700 mt-1">
            {earlyWarningRate}%
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5">
            {stats.earlyWarningsIssued} warned before finish
          </div>
        </div>

        {/* False Positives Observed */}
        <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-3 col-span-2 sm:col-span-1">
          <div className="text-[11px] font-semibold text-blue-700 uppercase">
            False Positives
          </div>
          <div className="text-xl font-bold text-blue-700 mt-1">
            {stats.falsePositivesCount} ({falsePositiveRate}%)
          </div>
          <div className="text-[10px] text-blue-600 mt-0.5">Genuine calls flagged as high</div>
        </div>
      </div>
    </div>
  );
};
