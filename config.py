"""
Configuration module for ScamShield AI Python application.
Loads environment variables safely from .env and defines default constants.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

# API Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
APP_PORT = int(os.getenv("PORT", 8501))

# Audio Processing Configuration
DEFAULT_CHUNK_DURATION_SEC = 4.0
SAMPLE_RATE = 22050
DATA_DIR = BASE_DIR / "data"

# Ensure data directory exists
DATA_DIR.mkdir(parents=True, exist_ok=True)

# Risk Thresholds
RISK_THRESHOLDS = {
    "LOW": 0,
    "MEDIUM": 20,
    "HIGH": 40,
    "CRITICAL": 60,
}
