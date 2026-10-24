# 🛡️ ScamShield AI
### Your AI Guardian Against Scam Calls

**Detect suspicious calls. Understand the red flags. Protect yourself before it's too late.**

ScamShield AI is an AI-powered scam-call detection prototype designed to help Indian citizens identify digital arrest scams, fake KYC calls, courier fraud, OTP theft, and financial impersonation.

Using audio analysis, AI-powered risk assessment, and simple-language explanations, ScamShield AI aims to warn users while a simulated call is still in progress.

> 🚧 **Project Status:** Hackathon MVP / Prototype  
> 🎯 **Focus:** Voice AI · AI Agents · Cybersecurity · Social Impact  
> 🇮🇳 **Designed for:** Indian users, especially elderly people and first-time smartphone users

---

## 📌 Table of Contents

- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [How It Works](#-how-it-works)
- [Technology Stack](#-technology-stack)
- [Project Architecture](#-project-architecture)
- [Project Structure](#-project-structure)
- [Installation and Setup](#-installation-and-setup)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [Demo Scenarios](#-demo-scenarios)
- [Example Warning](#-example-warning)
- [Future Improvements](#-future-improvements)
- [Limitations](#-limitations)
- [Privacy and Security](#-privacy-and-security)
- [Contributing](#-contributing)
- [Disclaimer](#-disclaimer)

---

## 🚨 The Problem

Digital arrest scams, fake KYC messages, fraudulent courier calls, and banking impersonation are serious cybersecurity threats in India.

Scammers often manipulate victims using:

- Threats of arrest or legal action.
- Claims of being police officers, bank officials, or government authorities.
- Requests for OTPs, PINs, passwords, or confidential information.
- Pressure to transfer money immediately.
- Instructions to install remote-access applications.
- Attempts to isolate victims from family members.

These scams are particularly dangerous when victims are alone and have nobody to consult during the call.

**The challenge:** People need understandable, timely warnings while suspicious conversations are happening, not just advice after they lose money.

---

## 💡 Our Solution

ScamShield AI acts as an intelligent safety assistant that analyzes simulated call audio, identifies suspicious conversation patterns, and provides actionable warnings in simple Hindi or Gujarati.

Instead of simply labeling a call as suspicious, the system explains *why* it raised an alert.

For example:

- **Detected:** A caller threatens immediate arrest.
- **Risk indicator:** Threats and urgency.
- **Warning:** Police do not conduct arrests simply by threatening someone over a video call.
- **Recommended action:** Do not transfer money or share OTPs. Independently contact a trusted family member or the relevant official organization.

The application demonstrates this experience using prerecorded WAV recordings and incremental audio analysis.

---

## ✨ Key Features

### 🎙️ Audio Analysis
- Supports prerecorded WAV scam-call demonstrations.
- Processes audio in short chunks.
- Updates the transcript and risk assessment as analysis progresses.
- Demonstrates warnings before playback ends when processing is fast enough.

### 🚨 Scam Detection
Identifies suspicious indicators such as:

- Digital arrest threats.
- Fake police or government impersonation.
- OTP and credential requests.
- Urgent money-transfer demands.
- Suspicious KYC or courier-payment requests.
- Remote-access and screen-sharing requests.
- Attempts to prevent the victim from contacting others.

### 🌐 Multilingual Safety Warnings
- Hindi explanations for common scam patterns.
- Gujarati explanations for local accessibility.
- English support for the interface and technical information.

### 📊 Risk Dashboard
- LOW, MEDIUM, HIGH, and CRITICAL risk levels.
- Detected red flags with supporting evidence.
- Recommended safety actions.
- Transcript and analysis timeline.
- Clear indication of uncertain results.

### ✅ Genuine-Call Testing
Includes a genuine customer-service scenario to evaluate false positives and demonstrate that the system should consider context rather than suspicious keywords alone.

### 🔒 Privacy-Conscious Design
- No collection of banking credentials.
- API keys kept on the server side.
- No default requirement to save recordings.
- Clear disclosure when audio is processed by an external AI service.

---

## ⚙️ How It Works

1. **Select a recording:** Choose a scam-call or genuine-call WAV file.
2. **Play the recording:** Start the simulated call.
3. **Process audio chunks:** Divide the recording into manageable segments.
4. **Analyze the conversation:** Use an audio-capable AI service or speech-to-text followed by an LLM.
5. **Identify red flags:** Combine contextual AI analysis with rule-based checks.
6. **Calculate risk:** Assess the available evidence and uncertainty.
7. **Display a warning:** Show the detected behavior and a Hindi or Gujarati safety explanation.
8. **Continue monitoring:** Analyze subsequent chunks and update the event timeline.

The prototype aims to display warnings while playback continues. Actual warning latency depends on chunk size, model capabilities, network conditions, and API response time.

---

## 🧰 Technology Stack

| Component | Technology |
|---|---|
| Frontend | Streamlit |
| Backend | Python |
| AI analysis | Gemini audio-capable model or compatible speech/LLM pipeline |
| Audio processing | SoundFile, NumPy |
| Configuration | Environment variables and `.env` |
| Data handling | Python dictionaries / JSON |
| Version control | Git and GitHub |

*Update this table to match the libraries and model actually used in your implementation.*

---

## 🏗️ Project Architecture

```text
                 ┌──────────────────────┐
                 │  Prerecorded WAV Call│
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │  Audio Chunk Processor│
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ Speech / Audio AI     │
                 │ Analysis Pipeline     │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ Scam Risk Assessment │
                 │ AI + Safety Rules    │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │  Risk & Evidence UI  │
                 │ Hindi / Gujarati     │
                 └──────────────────────┘
```

---

## 📁 Project Structure

```text
scamshield-ai/
├── app.py
├── detector.py
├── audio_processor.py
├── translations.py
├── config.py
├── requirements.txt
├── .env.example
├── .gitignore
├── README.md
├── data/
│   ├── digital_arrest.wav
│   ├── fake_kyc.wav
│   ├── fake_courier.wav
│   └── genuine_service.wav
└── tests/
    └── test_detector.py
```

The files and recordings shown above represent the intended project structure. Remove or rename entries to reflect what is actually present in the repository.

---

## 🚀 Installation and Setup

### Prerequisites

- Python 3.10 or a compatible version supported by your dependencies.
- pip.
- Git (optional).
- An API key if using a hosted AI model.
- Prerecorded WAV files for the full audio demonstration.

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/scamshield-ai.git
cd scamshield-ai
```

Replace `YOUR_USERNAME/scamshield-ai` with your actual GitHub repository path.

### 2. Create a virtual environment

**Windows PowerShell**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, use:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

**Linux / macOS**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies

```bash
python -m pip install -r requirements.txt
```

Make sure `requirements.txt` lists the actual dependencies used by the project.

### 4. Configure the API key

Copy `.env.example` to `.env` and fill in the required key for your selected AI provider.

Never commit `.env` to GitHub.

### 5. Add demo recordings

Place your recordings in the `data/` directory using the filenames expected by the application.

Use fictional conversations or recordings that you have permission to process.

---

## 🔑 Environment Variables

Example `.env.example`:

```dotenv
GEMINI_API_KEY=your_api_key_here
AI_PROVIDER=gemini
DEMO_MODE=true
```

These names are examples. Make sure they match the configuration variables your application actually reads.

- `GEMINI_API_KEY`: API key for the configured Gemini integration.
- `AI_PROVIDER`: Selects the configured AI provider.
- `DEMO_MODE`: Enables a clearly labeled demonstration mode if implemented.

Keep `.env.example` free of real credentials.

---

## ▶️ Running the Application

Start the Streamlit application:

```bash
streamlit run app.py
```

Open the local URL printed in your terminal, usually:

```text
http://localhost:8501
```

Then:

1. Select the preferred language.
2. Choose a WAV recording.
3. Press Play Demo.
4. Observe the transcript and risk assessment.
5. Review the detected red flags and safety recommendation.
6. Repeat with the genuine-call example.

If the AI provider is unavailable, use a fallback only if the application implements one, and label simulated analysis clearly.

---

## 🧪 Demo Scenarios

| Scenario | Expected indicators |
|---|---|
| Digital arrest | Threats, impersonation, urgency |
| Fake bank KYC | Credential requests, suspicious links, pressure |
| Fake courier | Unexpected fees, urgency, payment pressure |
| Genuine customer service | Contextual assessment without an automatic high-risk alert |

Expected indicators are test objectives, not guaranteed results. Record the actual output during testing.

---

## 🛑 Example Warning

**HIGH RISK — POSSIBLE DIGITAL ARREST SCAM**

**Hindi**

> सावधान! कोई व्यक्ति वीडियो कॉल पर गिरफ्तारी की धमकी देकर पैसे माँग रहा है, तो यह धोखाधड़ी का संकेत हो सकता है। पैसे ट्रांसफर न करें और OTP साझा न करें। किसी भरोसेमंद व्यक्ति से संपर्क करें।

**Gujarati**

> સાવધાન! વીડિયો કૉલ પર ધરપકડની ધમકી આપીને પૈસા માંગવામાં આવે તો તે છેતરપિંડીનો સંકેત હોઈ શકે છે. પૈસા ટ્રાન્સફર ન કરો અને OTP શેર ન કરો. કોઈ વિશ્વાસુ વ્યક્તિનો સંપર્ક કરો.

**Detected indicators**
- Threat of arrest.
- Urgent pressure.
- Possible financial manipulation.

The warning is an example of intended application behavior, not a claim that the system has already achieved a particular detection accuracy.

---

## 🔮 Future Improvements

- Real-time speech streaming with lower detection latency.
- Better recognition of colloquial Hindi and Gujarati.
- Additional Indian languages.
- More robust contextual detection and false-positive reduction.
- Optional on-device processing for privacy-sensitive use cases.
- Accessible voice alerts for visually impaired and elderly users.
- Integration with consent-based call-audio sources where legally and technically supported.
- Evaluation on a larger, diverse dataset of scam and genuine calls.
- Explainable risk scoring and performance metrics.
- Secure reporting workflows that require user confirmation.

---

## ⚠️ Limitations

ScamShield AI is an experimental prototype.

- AI can miss scams or incorrectly flag genuine conversations.
- Audio quality, accents, background noise, and code-switching can affect recognition.
- Chunk processing may miss context across segment boundaries.
- Model response times may delay warnings.
- A low-risk assessment does not guarantee that a call is genuine.
- Prerecorded demonstrations do not establish that the system can intercept or monitor live phone calls.

Users should independently verify suspicious requests through official contact channels.

---

## 🔐 Privacy and Security

ScamShield AI follows a privacy-conscious design approach:

- Do not request or store OTPs, passwords, PINs, or banking credentials.
- Avoid persistent recording storage unless explicitly required and consented to.
- Disclose when audio or transcripts are sent to an external AI provider.
- Keep credentials in environment variables or a secure secrets manager.
- Use fictional information in demonstration recordings.
- Never automatically transfer funds or contact authorities based solely on an AI classification.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test the relevant functionality.
5. Submit a pull request with a clear description.

Potential contribution areas include audio processing, multilingual warnings, detection rules, accessibility, and evaluation tests.

---

## ⚖️ Disclaimer

ScamShield AI is an educational cybersecurity project developed for demonstration and awareness purposes. It is not a certified fraud-detection system, a legal authority, or a replacement for official verification.

Risk levels are estimates based on available audio and model analysis. A warning should prompt careful verification, not be treated as definitive proof of fraud.

---

## ❤️ Built for Social Impact

**ScamShield AI — Because everyone deserves protection from digital fraud.**

*Built with AI, designed for accessibility, and focused on safer digital experiences for India.*
