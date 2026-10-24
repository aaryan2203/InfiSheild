"""
Audio processing module for InfiShield AI.
Handles WAV audio loading, chunk segmentation, and playback synchronization.
"""

import os
from pathlib import Path
from typing import List, Dict, Any, Generator
import config

class AudioChunkProcessor:
    def __init__(self, chunk_duration_sec: float = config.DEFAULT_CHUNK_DURATION_SEC):
        self.chunk_duration_sec = chunk_duration_sec

    def get_demo_scenarios(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "digital_arrest",
                "title": "1. Digital Arrest Scam (CBI / Mumbai Police)",
                "file": "digital_arrest.wav",
                "chunks": [
                    {"start": 0.0, "end": 4.5, "text": "Namaste, I am DCP Vikram Rathore from Mumbai Police Cyber Crime Branch. We are monitoring your phone number."},
                    {"start": 4.5, "end": 9.0, "text": "A non-bailable arrest warrant and digital arrest has been registered against your Aadhaar card for 3.2 crore illegal money laundering."},
                    {"start": 9.0, "end": 13.5, "text": "You must stay on video call, close your room door, and do not tell your family members under the Official Secrets Act."},
                    {"start": 13.5, "end": 18.0, "text": "To avoid police raid at your house, immediately transfer 50,000 rupees to the RBI verification safe account right now."}
                ]
            },
            {
                "id": "fake_kyc",
                "title": "2. Fake Bank KYC Scam (SBI / Account Blocked)",
                "file": "fake_kyc.wav",
                "chunks": [
                    {"start": 0.0, "end": 4.0, "text": "Good afternoon, this is customer verification officer calling from State Bank of India headquarters."},
                    {"start": 4.0, "end": 8.0, "text": "Your bank account and debit card will be permanently blocked within 2 hours due to unlinked Aadhaar and expired KYC."},
                    {"start": 8.0, "end": 12.0, "text": "I have sent an urgent verification SMS. Please click the link sent via SMS or install AnyDesk to start verification."},
                    {"start": 12.0, "end": 16.0, "text": "Quickly read the 6-digit code or share the OTP you received right now on the phone to prevent account deactivation."}
                ]
            },
            {
                "id": "fake_courier",
                "title": "3. Fake Courier Scam (FedEx / MDMA Contraband)",
                "file": "fake_courier.wav",
                "chunks": [
                    {"start": 0.0, "end": 4.2, "text": "This is automated customs clearance notification from FedEx International Mumbai Airport hub."},
                    {"start": 4.2, "end": 8.5, "text": "An overseas parcel addressed to Taiwan under your name was intercepted containing 14 fake passports and 150 grams of contraband MDMA drugs."},
                    {"start": 8.5, "end": 12.8, "text": "Narcotics Control Bureau and CBI are preparing an emergency arrest raid at your registered residential address."},
                    {"start": 12.8, "end": 17.0, "text": "To avoid immediate detention, pay the legal clearance penalty fee of Rs 48,000 to the customs officer account right now."}
                ]
            },
            {
                "id": "genuine_service",
                "title": "4. Genuine Customer Service Call (Legitimate Verification)",
                "file": "genuine_service.wav",
                "chunks": [
                    {"start": 0.0, "end": 4.0, "text": "Hello sir, good morning. This is Priya calling from your bank customer care service desk."},
                    {"start": 4.0, "end": 8.0, "text": "We are calling regarding the cheque book request you submitted yesterday to confirm your mailing delivery address."},
                    {"start": 8.0, "end": 12.0, "text": "Please note that for your security, bank officials will never ask for your password, UPI PIN, or OTP."},
                    {"start": 12.0, "end": 16.0, "text": "No action or payment is required from your side. You can track this at your convenience on our mobile app. Have a pleasant day."}
                ]
            }
        ]
