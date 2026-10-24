import fs from 'node:fs';
import path from 'node:path';

/**
 * Creates a valid PCM 16-bit Mono WAV Buffer with telephony voice/modulations
 */
function createSyntheticPhoneWav(durationSec: number, sampleRate = 22050): Buffer {
  const numSamples = Math.floor(durationSec * sampleRate);
  const blockAlign = 2; // 1 channel * 2 bytes (16-bit)
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // 'fmt ' chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk1 size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // audio format (1 = PCM)
  buffer.writeUInt16LE(1, 22);  // num channels (1 = mono)
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // bits per sample

  // 'data' chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Synthesize realistic telephony audio:
  // Ring-in tone at start, voice formant oscillations, telephony bandpass harmonic hum, subtle noise
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;

    // Telephony line background noise + low hum (50Hz hum)
    const hum = Math.sin(2 * Math.PI * 50 * t) * 0.04;
    const noise = (Math.random() * 2 - 1) * 0.03;

    // Voice cadence modulation (speech phrases with pauses)
    const phraseTime = t % 3.5;
    let voice = 0;
    if (phraseTime < 2.8) {
      // Speech active: fundamental pitch ~140Hz with formants (700Hz, 1200Hz, 2400Hz)
      const pitch = 135 + Math.sin(2 * Math.PI * 2.5 * t) * 15;
      const f1 = Math.sin(2 * Math.PI * pitch * t);
      const f2 = Math.sin(2 * Math.PI * (pitch * 3) * t) * 0.6;
      const f3 = Math.sin(2 * Math.PI * 850 * t) * 0.35;
      const f4 = Math.sin(2 * Math.PI * 1650 * t) * 0.25;

      const envelope = Math.sin((phraseTime / 2.8) * Math.PI);
      voice = (f1 + f2 + f3 + f4) * 0.28 * envelope;
    }

    // Call connect beep during first 0.4 seconds
    let beep = 0;
    if (t < 0.35) {
      beep = Math.sin(2 * Math.PI * 440 * t) * 0.25;
    }

    const sample = Math.max(-1, Math.min(1, hum + noise + voice + beep));
    const intSample = Math.floor(sample * 32767);
    buffer.writeInt16LE(intSample, offset);
    offset += 2;
  }

  return buffer;
}

export function generateAllDemoWavs() {
  const dirs = ['/public/data', '/data'];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const demos = [
    { name: 'digital_arrest.wav', duration: 18.0 },
    { name: 'fake_kyc.wav', duration: 16.0 },
    { name: 'fake_courier.wav', duration: 17.0 },
    { name: 'genuine_service.wav', duration: 16.0 },
  ];

  for (const demo of demos) {
    const wavBuffer = createSyntheticPhoneWav(demo.duration);
    for (const dir of dirs) {
      const filePath = path.join(dir, demo.name);
      fs.writeFileSync(filePath, wavBuffer);
      console.log(`Generated WAV: ${filePath} (${(wavBuffer.length / 1024).toFixed(1)} KB)`);
    }
  }
}

// If run directly
generateAllDemoWavs();
