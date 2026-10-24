# InfiShield AI — Real-Time Scam Call Detector 🛡️

**InfiShield AI** is an AI-powered scam-call detection assistant designed to protect elderly citizens, first-time smartphone users, and ordinary Indian citizens from:
- **Digital Arrest Scams** (CBI, Police, Court, and ED impersonation)
- **Fake Bank KYC & Account Block Scams** (OTP, PIN, and CVV harvesting)
- **Fake Courier & Customs Seizures** (FedEx/DHL drug and fake passport extortion)
- **Financial Impersonation & Safe Account Transfers**

The application analyzes simulated phone calls in **short real-time chunks (3–5 seconds)**, identifies suspicious statements, and raises multi-lingual warnings in **13 Indian and regional languages**:
- **Hindi (हिंदी)**
- **Gujarati (ગુજરાતી)**
- **Marathi (मराठी)**
- **Bengali (বাংলা)**
- **Tamil (தமிழ்)**
- **Telugu (తెలుగు)**
- **Kannada (ಕನ್ನಡ)**
- **Malayalam (മലയാളം)**
- **Punjabi (ਪੰਜਾਬੀ)**
- **Odia (ଓଡ଼ିଆ)**
- **Assamese (অসমীয়া)**
- **Urdu (اردو)**
- **English**

*All warnings are issued before the recording completes.*

---

## 🚀 Key Features

1. **Chunk-Based Real-Time Audio Analysis**:
   - Audio is divided into 3.5–4.5s segments.
   - Analysis executes progressively while the audio plays; warnings are rendered early without waiting for the full recording to finish.
2. **Hybrid Detection Engine**:
   - Google Gemini 3.8 Flash (`gemini-3.8-flash`) structured JSON output API.
   - High-accuracy regex and heuristic pattern engine for Indian cyber-fraud modus operandi.
3. **Multi-lingual Explanations & Alerts**:
   - Simple, jargon-free explanations in **Hindi**, **Gujarati**, **Marathi**, **Bengali**, **Tamil**, **Telugu**, and **English**.
4. **False-Positive Control Benchmark**:
   - Includes a genuine bank customer service recording to demonstrate that legitimate calls remain **LOW risk** with 0 false alarms.
5. **Session Evaluation Metrics**:
   - Live tracking of Scams Tested, Genuine Tested, Red Flags Detected, Early Warnings Issued, and False-Positive Rate.
6. **Accessible Senior-Friendly UI**:
   - High contrast, large control buttons, live synchronized waveforms, time-stamped transcript tracking, and audible chime warnings.
7. **Emergency Helpline Integration**:
   - 1-click access to the **National Cyber Crime Helpline: 1930** and guidelines for the 2-hour transaction freezing window.

---

## 📁 Repository Structure

```
.
├── src/
│   ├── logic/
│   │   ├── scamDetector.ts       # Core heuristic detection & language translations
│   │   └── scamDetector.test.ts  # Node test suite (node:test)
│   ├── components/
│   │   ├── Header.tsx            # Navigation, status badge, language dropdown
│   │   ├── ScenarioSelector.tsx  # Preloaded WAV selectors & upload trigger
│   │   ├── AudioPlayerControl.tsx# Waveform canvas, dual progress, playback buttons
│   │   ├── TranscriptPanel.tsx   # Live synchronized transcript feed
│   │   ├── ThreatIntelPanel.tsx  # Risk level, detected red flags, and explanations
│   │   ├── EventTimeline.tsx     # Chronological log of detected flags
│   │   ├── EvaluationSummary.tsx # Dynamic session statistics & false-positive rate
│   │   └── ElderlySafetyGuideModal.tsx # Educational scam-defense guide
│   ├── utils/
│   │   └── audioAlert.ts         # Web Audio API warning synthesizer
│   ├── types.ts                  # Shared interfaces
│   ├── App.tsx                   # Main React SPA
│   ├── main.tsx
│   └── index.css
├── server.ts                     # Full-stack Express server with Gemini SDK & Vite middlewares
├── public/data/                  # Synthesized demo WAV audio recordings
│   ├── digital_arrest.wav
│   ├── fake_kyc.wav
│   ├── fake_courier.wav
│   └── genuine_service.wav
├── app.py                        # Streamlit Python interface
├── detector.py                   # Python hybrid scam detection engine
├── audio_processor.py            # Python chunk processor & audio pipeline
├── translations.py               # Python multilingual dictionaries
├── config.py                     # Python configuration loader
├── requirements.txt              # Python dependencies
├── package.json                  # Node.js dependencies (Vite, React 19, Express, @google/genai)
└── README.md
```

---

## 🛠️ Quickstart Instructions

### Option A: Web Full-Stack Mode (React + Express + Gemini)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file or export your Gemini API key:
   ```bash
   GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
   PORT=3000
   ```

3. **Run Unit Tests**:
   ```bash
   npx --yes tsx --test src/logic/scamDetector.test.ts
   ```

4. **Start the Application**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

---

### Option B: Python & Streamlit Mode

1. **Set Up Python Environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Run Streamlit**:
   ```bash
   streamlit run app.py
   ```

---

## 🧪 Testing the 4 Scenarios

1. **Scenario 1 — Digital Arrest Extortion (Scam)**:
   - Select *Digital Arrest Extortion*.
   - Click **Play Call Demo**.
   - Within 4–8 seconds, the engine detects **IMPERSONATION** ("Mumbai Police Cyber Crime Branch") and **THREAT** ("Digital arrest warrant").
   - Risk escalates to **CRITICAL** with an alert chime and Hindi/Gujarati explanation warning that genuine police never arrest via video calls.

2. **Scenario 2 — Bank Account Blocked / Fake KYC (Scam)**:
   - Select *Bank Account Blocked / Urgent KYC Update*.
   - Click **Play Call Demo**.
   - Detects **URGENCY** ("account blocked in 2 hours") and **OTP_REQUEST** ("read the 6-digit code").
   - Risk elevates to **HIGH** before the call ends.

3. **Scenario 3 — Fake Courier Narcotics Seizure (Scam)**:
   - Select *FedEx / DHL Narcotics Parcel Seizure*.
   - Detects **THREAT** ("150 grams MDMA drugs found in parcel") and **MONEY_REQUEST** ("clearance penalty fee").

4. **Scenario 4 — Genuine Bank Customer Service (Legitimate Benchmark)**:
   - Select *Genuine Bank Customer Service Call*.
   - Click **Play Call Demo**.
   - Notice that the risk remains **LOW (Safe)** throughout the entire call.
   - Evaluation metrics record **0 false positives**, confirming the model does not trigger alarms simply because a bank or verification is mentioned.

---

## ⚖️ Disclaimer
InfiShield AI is an assistive cybersecurity research prototype built for hackathon demonstrations. In case of suspected cybercrime or financial fraud, immediately dial **1930** or lodge a complaint on the official Indian Government Cyber Crime Reporting Portal at **[cybercrime.gov.in](https://cybercrime.gov.in)**.
