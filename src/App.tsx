/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { ScenarioSelector } from './components/ScenarioSelector';
import { AudioPlayerControl } from './components/AudioPlayerControl';
import { TranscriptPanel } from './components/TranscriptPanel';
import { ThreatIntelPanel } from './components/ThreatIntelPanel';
import { EventTimeline } from './components/EventTimeline';
import { EvaluationSummary } from './components/EvaluationSummary';
import { ElderlySafetyGuideModal } from './components/ElderlySafetyGuideModal';
import { Scenario, LanguageCode, EvaluationStats } from './types';
import { DetectedRedFlag, RiskLevel, analyzeTranscriptChunk } from './logic/scamDetector';
import { alertSound } from './utils/audioAlert';

// Default initial demo scenarios
const INITIAL_SCENARIOS: Scenario[] = [
  {
    id: 'digital_arrest',
    title: 'Digital Arrest Extortion (CBI / Mumbai Police)',
    category: 'Digital Arrest Scam',
    type: 'scam',
    durationSec: 18.0,
    audioUrl: '/data/digital_arrest.wav',
    chunks: [
      {
        chunkIndex: 0,
        startTimeSec: 0.0,
        endTimeSec: 4.5,
        transcript: 'Namaste, I am DCP Vikram Rathore from Mumbai Police Cyber Crime Branch. We are monitoring your phone number.',
      },
      {
        chunkIndex: 1,
        startTimeSec: 4.5,
        endTimeSec: 9.0,
        transcript: 'A non-bailable arrest warrant and digital arrest has been registered against your Aadhaar card for 3.2 crore illegal money laundering.',
      },
      {
        chunkIndex: 2,
        startTimeSec: 9.0,
        endTimeSec: 13.5,
        transcript: 'You must stay on video call, close your room door, and do not tell your family members under the Official Secrets Act.',
      },
      {
        chunkIndex: 3,
        startTimeSec: 13.5,
        endTimeSec: 18.0,
        transcript: 'To avoid police raid at your house, immediately transfer 50,000 rupees to the RBI verification safe account right now.',
      },
    ],
  },
  {
    id: 'fake_kyc',
    title: 'Bank Account Blocked / Urgent KYC Update',
    category: 'Banking / OTP Theft',
    type: 'scam',
    durationSec: 16.0,
    audioUrl: '/data/fake_kyc.wav',
    chunks: [
      {
        chunkIndex: 0,
        startTimeSec: 0.0,
        endTimeSec: 4.0,
        transcript: 'Good afternoon, this is customer verification officer calling from State Bank of India headquarters.',
      },
      {
        chunkIndex: 1,
        startTimeSec: 4.0,
        endTimeSec: 8.0,
        transcript: 'Your bank account and debit card will be permanently blocked within 2 hours due to unlinked Aadhaar and expired KYC.',
      },
      {
        chunkIndex: 2,
        startTimeSec: 8.0,
        endTimeSec: 12.0,
        transcript: 'I have sent an urgent verification SMS. Please click the link sent via SMS or install AnyDesk to start verification.',
      },
      {
        chunkIndex: 3,
        startTimeSec: 12.0,
        endTimeSec: 16.0,
        transcript: 'Quickly read the 6-digit code or share the OTP you received right now on the phone to prevent account deactivation.',
      },
    ],
  },
  {
    id: 'fake_courier',
    title: 'FedEx / DHL Narcotics Parcel Seizure',
    category: 'Customs & Narcotics Impersonation',
    type: 'scam',
    durationSec: 17.0,
    audioUrl: '/data/fake_courier.wav',
    chunks: [
      {
        chunkIndex: 0,
        startTimeSec: 0.0,
        endTimeSec: 4.2,
        transcript: 'This is automated customs clearance notification from FedEx International Mumbai Airport hub.',
      },
      {
        chunkIndex: 1,
        startTimeSec: 4.2,
        endTimeSec: 8.5,
        transcript: 'An overseas parcel addressed to Taiwan under your name was intercepted containing 14 fake passports and 150 grams of contraband MDMA drugs.',
      },
      {
        chunkIndex: 2,
        startTimeSec: 8.5,
        endTimeSec: 12.8,
        transcript: 'Narcotics Control Bureau and CBI are preparing an emergency arrest raid at your registered residential address.',
      },
      {
        chunkIndex: 3,
        startTimeSec: 12.8,
        endTimeSec: 17.0,
        transcript: 'To avoid immediate detention, pay the legal clearance penalty fee of Rs 48,000 to the customs officer account right now.',
      },
    ],
  },
  {
    id: 'genuine_service',
    title: 'Genuine Bank Customer Service Call',
    category: 'Legitimate Call (False Positive Test)',
    type: 'genuine',
    durationSec: 16.0,
    audioUrl: '/data/genuine_service.wav',
    chunks: [
      {
        chunkIndex: 0,
        startTimeSec: 0.0,
        endTimeSec: 4.0,
        transcript: 'Hello sir, good morning. This is Priya calling from your bank customer care service desk.',
      },
      {
        chunkIndex: 1,
        startTimeSec: 4.0,
        endTimeSec: 8.0,
        transcript: 'We are calling regarding the cheque book request you submitted yesterday to confirm your mailing delivery address.',
      },
      {
        chunkIndex: 2,
        startTimeSec: 8.0,
        endTimeSec: 12.0,
        transcript: 'Please note that for your security, bank officials will never ask for your password, UPI PIN, or OTP.',
      },
      {
        chunkIndex: 3,
        startTimeSec: 12.0,
        endTimeSec: 16.0,
        transcript: 'No action or payment is required from your side. You can track this at your convenience on our mobile app. Have a pleasant day.',
      },
    ],
  },
];

export default function App() {
  const [scenarios, setScenarios] = useState<Scenario[]>(INITIAL_SCENARIOS);
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(INITIAL_SCENARIOS[0]);
  const [language, setLanguage] = useState<LanguageCode>('hi');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [autoReadAloud, setAutoReadAloud] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Playback & Analysis State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0.0);
  const [currentChunkIndex, setCurrentChunkIndex] = useState<number>(-1);
  const [analyzedChunkIndex, setAnalyzedChunkIndex] = useState<number>(-1);

  // Detection Results State
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('LOW');
  const [isSuspicious, setIsSuspicious] = useState<boolean>(false);
  const [detectedFlags, setDetectedFlags] = useState<DetectedRedFlag[]>([]);
  const detectedFlagsRef = useRef<DetectedRedFlag[]>([]);
  useEffect(() => {
    detectedFlagsRef.current = detectedFlags;
  }, [detectedFlags]);
  const [confidence, setConfidence] = useState<number>(0.92);
  const [recommendedAction, setRecommendedAction] = useState<string>(
    'सिस्टम तैयार है। कॉल का विश्लेषण करने के लिए "Play Call Demo" दबाएं। (System ready. Press "Play Call Demo" to begin real-time analysis)'
  );

  // Test Evaluation Summary Metrics
  const [stats, setStats] = useState<EvaluationStats>({
    scamCallsTested: 0,
    genuineCallsTested: 0,
    redFlagsDetected: 0,
    earlyWarningsIssued: 0,
    falsePositivesCount: 0,
  });

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const chimeTriggeredRef = useRef<boolean>(false);
  const completedCallRef = useRef<boolean>(false);

  // Initialize HTML5 Audio Element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioElementRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Update audio source when scenario changes
  useEffect(() => {
    if (audioElementRef.current) {
      audioElementRef.current.src = selectedScenario.audioUrl;
      audioElementRef.current.currentTime = 0;
    }
    handleReset();
  }, [selectedScenario]);

  // Translate recommendations when language changes
  useEffect(() => {
    const local = analyzeTranscriptChunk('', detectedFlags, currentTimeSec);
    const recKey = `recommended_action_${language}` as keyof typeof local;
    if (local[recKey]) {
      setRecommendedAction(local[recKey] as string);
    }
  }, [language, detectedFlags, currentTimeSec]);

  // Core chunk analysis function calling server /api/analyze-chunk with local fallback
  const processChunk = useCallback(async (chunkIdx: number, scenario: Scenario) => {
    const chunk = scenario.chunks[chunkIdx];
    if (!chunk) return;

    setAnalyzedChunkIndex(chunkIdx);

    try {
      // Build cumulative transcript up to this chunk
      const fullTranscript = scenario.chunks
        .slice(0, chunkIdx + 1)
        .map((c) => c.transcript)
        .join(' ');

      const response = await fetch('/api/analyze-chunk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chunkText: chunk.transcript,
          fullTranscript,
          existingFlags: detectedFlags,
          currentTimeSec: chunk.endTimeSec,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRiskLevel(data.risk_level);
        setIsSuspicious(data.is_suspicious);
        setDetectedFlags(data.detected_red_flags || []);
        setConfidence(data.confidence || 0.9);

        const recKey = `recommended_action_${language}` as keyof typeof data;
        if (data[recKey]) {
          setRecommendedAction(data[recKey]);
        }

        // Trigger warning chime when a threat is newly recognized
        if ((data.risk_level === 'CRITICAL' || data.risk_level === 'HIGH') && !chimeTriggeredRef.current) {
          chimeTriggeredRef.current = true;
          if (soundEnabled) {
            alertSound.playWarningChime();
          }
        }
        return;
      }
    } catch {
      // Local heuristic fallback
    }

    // Heuristic fallback
    const fullTranscript = scenario.chunks
      .slice(0, chunkIdx + 1)
      .map((c) => c.transcript)
      .join(' ');
    const local = analyzeTranscriptChunk(fullTranscript, detectedFlags, chunk.endTimeSec);
    setRiskLevel(local.risk_level);
    setIsSuspicious(local.is_suspicious);
    setDetectedFlags(local.detected_red_flags);
    setConfidence(local.confidence);

    const recKey = `recommended_action_${language}` as keyof typeof local;
    if (local[recKey]) {
      setRecommendedAction(local[recKey] as string);
    }

    if ((local.risk_level === 'CRITICAL' || local.risk_level === 'HIGH') && !chimeTriggeredRef.current) {
      chimeTriggeredRef.current = true;
      if (soundEnabled) {
        alertSound.playWarningChime();
      }
    }
  }, [detectedFlags, language, soundEnabled]);

  const currentTimeRef = useRef<number>(0);
  const lastTickRef = useRef<number>(Date.now());

  // Main playback tick handler
  const handleTick = useCallback(() => {
    const now = Date.now();
    const elapsedDelta = (now - lastTickRef.current) / 1000;
    lastTickRef.current = now;

    let current = 0;
    if (
      audioElementRef.current &&
      !isNaN(audioElementRef.current.currentTime) &&
      audioElementRef.current.currentTime > 0
    ) {
      current = audioElementRef.current.currentTime;
    } else {
      // Advance simulated clock
      current = Math.min(selectedScenario.durationSec, currentTimeRef.current + Math.max(0.1, elapsedDelta));
    }

    currentTimeRef.current = current;
    setCurrentTimeSec(current);

    // Find which chunk is active
    const chunkIdx = selectedScenario.chunks.findIndex(
      (c) => current >= c.startTimeSec && current < c.endTimeSec
    );

    if (chunkIdx !== -1) {
      setCurrentChunkIndex(chunkIdx);
      if (chunkIdx > analyzedChunkIndex) {
        processChunk(chunkIdx, selectedScenario);
      }
    }

    // Check if call finished
    if (current >= selectedScenario.durationSec) {
      handleCallCompleted();
    }
  }, [selectedScenario, analyzedChunkIndex, processChunk]);

  // Call completion metrics recording
  const handleCallCompleted = useCallback(() => {
    setIsPlaying(false);
    setIsPaused(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!completedCallRef.current) {
      completedCallRef.current = true;
      const isScam = selectedScenario.type === 'scam';
      const flagsFound = detectedFlagsRef.current.length;

      setStats((prev) => ({
        scamCallsTested: prev.scamCallsTested + (isScam ? 1 : 0),
        genuineCallsTested: prev.genuineCallsTested + (!isScam ? 1 : 0),
        redFlagsDetected: prev.redFlagsDetected + flagsFound,
        earlyWarningsIssued: prev.earlyWarningsIssued + (isScam && chimeTriggeredRef.current ? 1 : 0),
        falsePositivesCount: prev.falsePositivesCount + (!isScam && isSuspicious ? 1 : 0),
      }));

      if (!isScam && soundEnabled && !isSuspicious) {
        alertSound.playSafeChime();
      }
    }
  }, [selectedScenario, isSuspicious, soundEnabled]);

  // Play button click
  const handlePlay = async () => {
    completedCallRef.current = false;
    lastTickRef.current = Date.now();
    setIsPlaying(true);
    setIsPaused(false);

    try {
      if (audioElementRef.current) {
        if (currentTimeRef.current >= selectedScenario.durationSec) {
          audioElementRef.current.currentTime = 0;
          currentTimeRef.current = 0;
          setCurrentTimeSec(0);
          setCurrentChunkIndex(-1);
          setAnalyzedChunkIndex(-1);
        }
        await audioElementRef.current.play();
      }
    } catch {
      // Playback permission / autoplay handling
    }

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(handleTick, 150);

    // Immediately trigger chunk 0 analysis if at start
    if (currentChunkIndex === -1 && selectedScenario.chunks.length > 0) {
      setCurrentChunkIndex(0);
      processChunk(0, selectedScenario);
    }
  };

  // Pause button click
  const handlePause = () => {
    setIsPaused(true);
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Stop & Reset button click
  const handleReset = () => {
    setIsPlaying(false);
    setIsPaused(false);
    currentTimeRef.current = 0;
    setCurrentTimeSec(0);
    setCurrentChunkIndex(-1);
    setAnalyzedChunkIndex(-1);
    setRiskLevel('LOW');
    setIsSuspicious(false);
    setDetectedFlags([]);
    chimeTriggeredRef.current = false;
    completedCallRef.current = false;

    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setRecommendedAction(
      language === 'hi'
        ? 'सिस्टम तैयार है। कॉल का विश्लेषण करने के लिए "Play Call Demo" दबाएं।'
        : language === 'gu'
        ? 'સિસ્ટમ તૈયાર છે. કૉલનું વિશ્લેષણ કરવા માટે "Play Call Demo" દબાવો.'
        : 'System ready. Press "Play Call Demo" to begin real-time analysis.'
    );
  };

  // Reset metrics
  const handleResetStats = () => {
    setStats({
      scamCallsTested: 0,
      genuineCallsTested: 0,
      redFlagsDetected: 0,
      earlyWarningsIssued: 0,
      falsePositivesCount: 0,
    });
  };

  // Custom audio file upload handler
  const handleCustomAudioUpload = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    const customScenario: Scenario = {
      id: `custom-${Date.now()}`,
      title: `Custom Upload: ${file.name}`,
      category: 'User Uploaded Audio',
      type: 'scam',
      durationSec: 20.0,
      audioUrl: objectUrl,
      chunks: [
        {
          chunkIndex: 0,
          startTimeSec: 0.0,
          endTimeSec: 5.0,
          transcript: 'Custom Audio Segment 1: Verifying caller introduction and organization claims.',
        },
        {
          chunkIndex: 1,
          startTimeSec: 5.0,
          endTimeSec: 10.0,
          transcript: 'Custom Audio Segment 2: Checking for urgency, legal threats, or warrant mentions.',
        },
        {
          chunkIndex: 2,
          startTimeSec: 10.0,
          endTimeSec: 15.0,
          transcript: 'Custom Audio Segment 3: Inspecting for OTP demands, bank details, or AnyDesk links.',
        },
        {
          chunkIndex: 3,
          startTimeSec: 15.0,
          endTimeSec: 20.0,
          transcript: 'Custom Audio Segment 4: Evaluating money transfer requests to safe accounts.',
        },
      ],
    };

    setScenarios((prev) => [customScenario, ...prev]);
    setSelectedScenario(customScenario);
  };

  const getSystemStatus = () => {
    if (isSuspicious || riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
      return 'warning';
    }
    if (isPlaying && !isPaused) {
      return 'analyzing';
    }
    if (completedCallRef.current && selectedScenario.type === 'genuine' && !isSuspicious) {
      return 'safe';
    }
    return 'ready';
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        status={getSystemStatus()}
        analyzingChunkIndex={analyzedChunkIndex}
        totalChunks={selectedScenario.chunks.length}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        autoReadAloud={autoReadAloud}
        onToggleAutoReadAloud={() => setAutoReadAloud((prev) => !prev)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {/* Scenario Selection Grid */}
        <ScenarioSelector
          scenarios={scenarios}
          selectedScenarioId={selectedScenario.id}
          onSelectScenario={(s) => setSelectedScenario(s)}
          onCustomAudioUpload={handleCustomAudioUpload}
          isPlaying={isPlaying && !isPaused}
        />

        {/* 2-Column Split: Player & Live Transcript vs Threat Intelligence */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column (5 Cols): Audio Controls & Waveform & Transcript */}
          <div className="lg:col-span-5 space-y-4">
            <AudioPlayerControl
              isPlaying={isPlaying}
              isPaused={isPaused}
              currentTimeSec={currentTimeSec}
              totalDurationSec={selectedScenario.durationSec}
              analyzedChunksCount={Math.max(0, analyzedChunkIndex + 1)}
              totalChunksCount={selectedScenario.chunks.length}
              onPlay={handlePlay}
              onPause={handlePause}
              onReset={handleReset}
              title={selectedScenario.title}
            />

            <TranscriptPanel
              chunks={selectedScenario.chunks}
              currentChunkIndex={currentChunkIndex}
              analyzedChunkIndex={analyzedChunkIndex}
              detectedFlags={detectedFlags}
              isPlaying={isPlaying && !isPaused}
            />
          </div>

          {/* Right Column (7 Cols): Threat Intelligence & Risk & Multi-lingual Warning */}
          <div className="lg:col-span-7 space-y-4">
            <ThreatIntelPanel
              riskLevel={riskLevel}
              isSuspicious={isSuspicious}
              detectedFlags={detectedFlags}
              confidence={confidence}
              language={language}
              recommendedAction={recommendedAction}
              scenarioType={selectedScenario.type}
              isPlaying={isPlaying}
              autoReadAloud={autoReadAloud}
            />

            <EventTimeline
              flags={detectedFlags}
              totalDurationSec={selectedScenario.durationSec}
            />
          </div>
        </div>

        {/* Session Evaluation Summary & Benchmark Metrics */}
        <EvaluationSummary stats={stats} onResetStats={handleResetStats} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            <span>InfiShield AI · Real-Time Audio Threat Guardian for Citizens</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Cybercrime Reporting: <strong>1930</strong></span>
            <span>·</span>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="text-indigo-600 hover:text-indigo-800 font-medium underline cursor-pointer"
            >
              Elderly Safety Guidelines
            </button>
          </div>
        </div>
      </footer>

      {/* Educational Modal */}
      <ElderlySafetyGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        language={language}
      />
    </div>
  );
}
