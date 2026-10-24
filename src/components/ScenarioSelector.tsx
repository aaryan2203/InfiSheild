import React, { useRef } from 'react';
import { Scenario } from '../types';
import { ShieldAlert, CheckCircle2, Upload, AlertTriangle, Building2, PackageSearch } from 'lucide-react';

interface ScenarioSelectorProps {
  scenarios: Scenario[];
  selectedScenarioId: string;
  onSelectScenario: (scenario: Scenario) => void;
  onCustomAudioUpload: (file: File) => void;
  isPlaying: boolean;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  scenarios,
  selectedScenarioId,
  onSelectScenario,
  onCustomAudioUpload,
  isPlaying,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getScenarioIcon = (scenario: Scenario) => {
    if (scenario.id === 'digital_arrest') return <AlertTriangle className="w-4 h-4 text-rose-600" />;
    if (scenario.id === 'fake_kyc') return <Building2 className="w-4 h-4 text-orange-600" />;
    if (scenario.id === 'fake_courier') return <PackageSearch className="w-4 h-4 text-amber-600" />;
    return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.wav')) {
        alert('Please upload a WAV audio file (.wav)');
        return;
      }
      onCustomAudioUpload(file);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>Select Simulated Call Audio</span>
            <span className="text-xs text-slate-500 font-normal">(Prerecorded WAV & Custom Upload)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Pick a realistic scam call recording or the genuine customer-service control benchmark.
          </p>
        </div>

        {/* Custom WAV Upload Button */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".wav,audio/wav"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isPlaying}
            className="text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg px-3 py-1.5 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Upload Custom WAV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {scenarios.map((scenario) => {
          const isSelected = scenario.id === selectedScenarioId;
          const isGenuine = scenario.type === 'genuine';

          return (
            <button
              key={scenario.id}
              onClick={() => onSelectScenario(scenario)}
              disabled={isPlaying}
              className={`text-left p-3 rounded-lg border transition-all relative flex flex-col justify-between ${
                isSelected
                  ? isGenuine
                    ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                    : 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/80'
              } ${isPlaying ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {getScenarioIcon(scenario)}
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      {scenario.category}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {scenario.durationSec.toFixed(0)}s
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-900 leading-snug mb-1">
                  {scenario.title}
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className={isGenuine ? 'text-emerald-700 font-medium' : 'text-rose-700 font-medium'}>
                  {isGenuine ? '● Genuine Benchmark' : '▲ Scam Simulator'}
                </span>
                <span className="text-slate-400">
                  {scenario.chunks.length} chunks
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
