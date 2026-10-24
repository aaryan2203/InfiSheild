import React, { useEffect, useRef } from 'react';
import { AudioChunk } from '../types';
import { MessageSquare, Sparkles } from 'lucide-react';
import { DetectedRedFlag } from '../logic/scamDetector';

interface TranscriptPanelProps {
  chunks: AudioChunk[];
  currentChunkIndex: number;
  analyzedChunkIndex: number;
  detectedFlags: DetectedRedFlag[];
  isPlaying: boolean;
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  chunks,
  currentChunkIndex,
  analyzedChunkIndex,
  detectedFlags,
  isPlaying,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active chunk
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentChunkIndex]);

  const formatTimestamp = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Check if chunk text contains evidence
  const isChunkFlagged = (transcript: string) => {
    return detectedFlags.some((f) =>
      transcript.toLowerCase().includes(f.evidence.toLowerCase())
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col h-[340px]">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Live Call Audio Transcript
          </h3>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
          <span>Processed: {Math.max(0, analyzedChunkIndex + 1)} / {chunks.length} Chunks</span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 text-slate-700 text-xs leading-relaxed"
      >
        {currentChunkIndex === -1 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-4">
            <Sparkles className="w-8 h-8 text-slate-300 mb-2 stroke-1" />
            <p className="font-medium text-slate-500 text-xs">Awaiting Call Initiation</p>
            <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
              Press "Play Demo Call" to listen and stream chunks into the real-time AI detection pipeline.
            </p>
          </div>
        ) : (
          chunks.slice(0, currentChunkIndex + 1).map((chunk, idx) => {
            const isActive = idx === currentChunkIndex && isPlaying;
            const flagged = isChunkFlagged(chunk.transcript);

            return (
              <div
                key={chunk.chunkIndex}
                className={`p-3 rounded-lg border transition-all ${
                  isActive
                    ? 'border-indigo-400 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-200'
                    : flagged
                    ? 'border-rose-200 bg-rose-50/30'
                    : 'border-slate-100 bg-slate-50/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1 text-[10px] text-slate-400 font-mono">
                  <span className="font-semibold text-slate-500">
                    Chunk #{chunk.chunkIndex + 1}
                  </span>
                  <span>
                    [{formatTimestamp(chunk.startTimeSec)} - {formatTimestamp(chunk.endTimeSec)}]
                  </span>
                </div>

                <p className={`text-xs font-medium ${flagged ? 'text-rose-900 font-semibold' : 'text-slate-800'}`}>
                  "{chunk.transcript}"
                </p>

                {flagged && (
                  <div className="mt-2 pt-1.5 border-t border-rose-100 flex items-center gap-1.5 text-[11px] text-rose-700 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                    <span>Red flag pattern detected in this segment</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
