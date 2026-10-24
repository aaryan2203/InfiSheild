import React, { useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, Activity, Zap } from 'lucide-react';

interface AudioPlayerControlProps {
  isPlaying: boolean;
  isPaused: boolean;
  currentTimeSec: number;
  totalDurationSec: number;
  analyzedChunksCount: number;
  totalChunksCount: number;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  title: string;
}

export const AudioPlayerControl: React.FC<AudioPlayerControlProps> = ({
  isPlaying,
  isPaused,
  currentTimeSec,
  totalDurationSec,
  analyzedChunksCount,
  totalChunksCount,
  onPlay,
  onPause,
  onReset,
  title,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Render animated waveform when playing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let offset = 0;
    const drawWaveform = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Background subtle grid lines
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      const numBars = 50;
      const barWidth = width / numBars - 2;

      for (let i = 0; i < numBars; i++) {
        let barHeight = 4;
        if (isPlaying && !isPaused) {
          const wave1 = Math.sin((i * 0.3) + offset * 0.1);
          const wave2 = Math.cos((i * 0.15) - offset * 0.08);
          const pulse = Math.abs(wave1 * wave2);
          barHeight = Math.max(6, pulse * (height * 0.75));
        } else {
          barHeight = 4 + Math.sin(i * 0.2) * 2;
        }

        const x = i * (barWidth + 2);
        const y = (height - barHeight) / 2;

        if (isPlaying) {
          // Gradient from blue to violet
          const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
          grad.addColorStop(0, '#4f46e5');
          grad.addColorStop(1, '#06b6d4');
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = '#cbd5e1';
        }

        ctx.fillRect(x, y, barWidth, barHeight);
      }

      if (isPlaying && !isPaused) {
        offset += 1;
        animFrameRef.current = requestAnimationFrame(drawWaveform);
      }
    };

    drawWaveform();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, isPaused]);

  const playbackPct = totalDurationSec > 0 ? Math.min(100, (currentTimeSec / totalDurationSec) * 100) : 0;
  const analysisPct = totalChunksCount > 0 ? Math.min(100, (analyzedChunksCount / totalChunksCount) * 100) : 0;

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${mins}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
      {/* Title & Call Status */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
          <h3 className="text-sm font-bold text-slate-900 truncate">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
          <span>{formatTime(currentTimeSec)}</span>
          <span>/</span>
          <span>{formatTime(totalDurationSec)}</span>
        </div>
      </div>

      {/* Waveform Canvas */}
      <div className="relative bg-slate-950 rounded-lg p-2 mb-4 overflow-hidden shadow-inner">
        <canvas
          ref={canvasRef}
          width={600}
          height={64}
          className="w-full h-16 block rounded"
        />
        {isPlaying && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>STREAMING AUDIO</span>
          </div>
        )}
      </div>

      {/* Audio Playback Progress vs AI Processing Progress (Requirement 5) */}
      <div className="space-y-2 mb-4 bg-slate-50 border border-slate-100 rounded-lg p-3">
        {/* Playback progress */}
        <div>
          <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              <span>Audio Playback Progress</span>
            </span>
            <span className="font-mono">{playbackPct.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-150 ease-out"
              style={{ width: `${playbackPct}%` }}
            />
          </div>
        </div>

        {/* AI Analysis Progress */}
        <div>
          <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>AI Chunk Analysis Progress (Segmented Real-Time)</span>
            </span>
            <span className="font-mono text-amber-700 font-semibold">
              {analyzedChunksCount} of {totalChunksCount} Chunks ({analysisPct.toFixed(0)}%)
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${analysisPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Playback Action Buttons (Large, high-contrast for accessibility & elderly users) */}
      <div className="flex items-center gap-3">
        {!isPlaying || isPaused ? (
          <button
            onClick={onPlay}
            className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            aria-label="Play call demo"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{isPaused ? 'Resume Call' : 'Play Call Demo'}</span>
          </button>
        ) : (
          <button
            onClick={onPause}
            className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            aria-label="Pause call"
          >
            <Pause className="w-5 h-5 fill-current" />
            <span>Pause Call</span>
          </button>
        )}

        <button
          onClick={onReset}
          className="py-3 px-4 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-300 text-slate-700 font-semibold rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          title="Stop and Reset Call to Start"
          aria-label="Stop and reset"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Stop & Reset</span>
        </button>
      </div>
    </div>
  );
};
