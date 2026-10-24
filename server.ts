import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { analyzeTranscriptChunk, DetectedRedFlag } from './src/logic/scamDetector.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Shared Gemini client with telemetry header as required by skill
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Demo call scenario presets with chunked timeline
 */
export const DEMO_SCENARIOS = [
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

// Return preloaded scenarios
app.get('/api/scenarios', (_req: Request, res: Response) => {
  res.json({ scenarios: DEMO_SCENARIOS });
});

/**
 * Chunk Analysis Endpoint
 * Hybrid model: uses Gemini 3.8 Flash with structured schema when configured,
 * seamlessly merged with local high-accuracy heuristic engine.
 */
app.post('/api/analyze-chunk', async (req: Request, res: Response) => {
  try {
    const {
      chunkText,
      fullTranscript = '',
      existingFlags = [],
      currentTimeSec = 0,
    } = req.body as {
      chunkText: string;
      fullTranscript?: string;
      existingFlags?: DetectedRedFlag[];
      currentTimeSec?: number;
    };

    if (!chunkText && !fullTranscript) {
      return res.status(400).json({ error: 'Missing audio transcript content to analyze' });
    }

    const textToAnalyze = `${fullTranscript} ${chunkText}`.trim();

    // Base heuristic analysis
    const localResult = analyzeTranscriptChunk(textToAnalyze, existingFlags, currentTimeSec);

    // If Gemini client is available, refine contextual understanding
    if (ai && process.env.GEMINI_API_KEY) {
      try {
        const prompt = `You are InfiShield AI, an expert scam call detection system protecting Indian citizens and elderly people from cyber extortion, digital arrest scams, fake KYC, and OTP theft.
Analyze this audio transcript segment from a live phone call:
"${textToAnalyze}"

Evaluate whether there are indicators of:
1. Digital arrest / Police / CBI impersonation
2. Urgency & threats of arrest or account blocking
3. Asking for OTP, UPI PIN, passwords, or installing remote apps (AnyDesk)
4. Transferring money to "safe accounts" or verification fees
5. Isolation (demanding victim stay on video call, close doors, not tell family)
Or if this is a genuine customer service call.

Respond in exact JSON.`;

        const geminiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                risk_level: {
                  type: Type.STRING,
                  description: 'LOW, MEDIUM, HIGH, or CRITICAL',
                },
                is_suspicious: { type: Type.BOOLEAN },
                detected_red_flags: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING },
                      evidence: { type: Type.STRING },
                      explanation_hi: { type: Type.STRING },
                      explanation_gu: { type: Type.STRING },
                      severity: { type: Type.INTEGER },
                    },
                    required: ['type', 'evidence', 'explanation_hi', 'explanation_gu', 'severity'],
                  },
                },
                recommended_action_hi: { type: Type.STRING },
                recommended_action_gu: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
              },
              required: ['risk_level', 'is_suspicious', 'detected_red_flags', 'recommended_action_hi', 'recommended_action_gu'],
            },
          },
        });

        if (geminiResponse.text) {
          const parsed = JSON.parse(geminiResponse.text);
          // Combine or elevate results
          const finalRisk = localResult.risk_level === 'CRITICAL' ? 'CRITICAL' : parsed.risk_level || localResult.risk_level;
          return res.json({
            ...localResult,
            risk_level: finalRisk,
            is_suspicious: localResult.is_suspicious || parsed.is_suspicious,
            recommended_action_hi: parsed.recommended_action_hi || localResult.recommended_action_hi,
            recommended_action_gu: parsed.recommended_action_gu || localResult.recommended_action_gu,
            confidence: parsed.confidence || localResult.confidence,
            ai_engine: 'gemini-3.8-flash + heuristic',
          });
        }
      } catch (geminiError) {
        console.warn('Gemini API call skipped or errored; using robust local heuristic:', geminiError);
      }
    }

    // Default fast local response
    return res.json({
      ...localResult,
      ai_engine: 'rule_heuristic_fallback',
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({
      error: 'Failed to analyze transcript chunk',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Serve static wav files if requested
app.use('/data', express.static(path.join(__dirname, 'public/data')));

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // In dev: integrate with Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In prod: serve dist static files
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`InfiShield AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
