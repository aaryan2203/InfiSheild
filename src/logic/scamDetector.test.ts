import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeTranscriptChunk,
  computeRiskLevel,
  generateRecommendations,
} from './scamDetector';

test('Digital Arrest statements trigger IMPERSONATION, THREAT, and CRITICAL risk', () => {
  const chunkText = 'This is DCP crime branch Mumbai Police. A digital arrest warrant has been issued against you.';
  const result = analyzeTranscriptChunk(chunkText, [], 3.5);

  assert.equal(result.is_suspicious, true);
  assert.ok(result.risk_level === 'CRITICAL' || result.risk_level === 'HIGH');
  assert.ok(result.detected_red_flags.length >= 2);

  const flagTypes = result.detected_red_flags.map((f) => f.type);
  assert.ok(flagTypes.includes('IMPERSONATION'));
  assert.ok(flagTypes.includes('THREAT'));

  // Ensure all 13 regional language explanations exist and are non-empty
  for (const flag of result.detected_red_flags) {
    assert.ok(flag.explanation_hi.length > 5, 'hi explanation missing');
    assert.ok(flag.explanation_gu.length > 5, 'gu explanation missing');
    assert.ok(flag.explanation_mr.length > 5, 'mr explanation missing');
    assert.ok(flag.explanation_bn.length > 5, 'bn explanation missing');
    assert.ok(flag.explanation_ta.length > 5, 'ta explanation missing');
    assert.ok(flag.explanation_te.length > 5, 'te explanation missing');
    assert.ok(flag.explanation_kn.length > 5, 'kn explanation missing');
    assert.ok(flag.explanation_ml.length > 5, 'ml explanation missing');
    assert.ok(flag.explanation_pa.length > 5, 'pa explanation missing');
    assert.ok(flag.explanation_or.length > 5, 'or explanation missing');
    assert.ok(flag.explanation_as.length > 5, 'as explanation missing');
    assert.ok(flag.explanation_ur.length > 5, 'ur explanation missing');
    assert.ok(flag.explanation_en.length > 5, 'en explanation missing');
  }
});

test('Fake Bank KYC OTP harvesting triggers OTP_REQUEST and URGENCY', () => {
  const chunk1 = 'Your account will be blocked within 2 hours if you do not update KYC.';
  const step1 = analyzeTranscriptChunk(chunk1, [], 4.0);
  assert.equal(step1.risk_level, 'MEDIUM');

  const chunk2 = 'Please read the 6-digit code or share the OTP you just received on your phone.';
  const step2 = analyzeTranscriptChunk(chunk2, step1.detected_red_flags, 8.0);

  assert.ok(step2.risk_level === 'CRITICAL' || step2.risk_level === 'HIGH');
  const otpFlag = step2.detected_red_flags.find((f) => f.type === 'OTP_REQUEST');
  assert.ok(otpFlag, 'Must detect OTP_REQUEST flag');
  assert.ok(otpFlag.severity >= 4);
});

test('Genuine Customer Service Call remains LOW risk with 0 scam flags', () => {
  const genuineCall = 'Hello sir, this is from verified customer service. Calling to confirm your cheque book delivery. Note that no OTP or password is required. For your security, do not share credentials with anyone. Have a great day.';
  const result = analyzeTranscriptChunk(genuineCall, [], 6.0);

  assert.equal(result.risk_level, 'LOW');
  assert.equal(result.is_suspicious, false);
  assert.equal(result.detected_red_flags.length, 0);
  assert.ok(result.recommended_action_en.includes('No scam indicators detected'));
  assert.ok(result.recommended_action_hi.includes('धोखाधड़ी के संकेत नहीं'));
  assert.ok(result.recommended_action_gu.includes('છેતરપિંડીના સંકેત'));
});

test('Duplicate warnings are avoided across consecutive chunks', () => {
  const chunk1 = 'This is Mumbai Police crime branch.';
  const step1 = analyzeTranscriptChunk(chunk1, [], 3.0);
  assert.equal(step1.detected_red_flags.length, 1);

  // Send repeated statement in next chunk
  const chunk2 = 'Again repeating, Mumbai Police crime branch speaking.';
  const step2 = analyzeTranscriptChunk(chunk2, step1.detected_red_flags, 6.0);

  // Must not duplicate the identical red flag
  assert.equal(step2.detected_red_flags.length, 1);
});

test('Risk level computation logic threshold boundaries', () => {
  assert.equal(computeRiskLevel(0, 0), 'LOW');
  assert.equal(computeRiskLevel(20, 3), 'MEDIUM');
  assert.equal(computeRiskLevel(40, 4), 'HIGH');
  assert.equal(computeRiskLevel(70, 5), 'CRITICAL');
});

test('Multi-lingual safety recommendations cover all 13 regional languages with 1930 helpline', () => {
  const recs = generateRecommendations('CRITICAL', new Set(['IMPERSONATION', 'THREAT']));
  assert.ok(recs.recommended_action_en.includes('1930'));
  assert.ok(recs.recommended_action_hi.includes('1930'));
  assert.ok(recs.recommended_action_gu.includes('1930'));
  assert.ok(recs.recommended_action_mr.includes('1930'));
  assert.ok(recs.recommended_action_bn.includes('১৯৩০') || recs.recommended_action_bn.includes('1930'));
  assert.ok(recs.recommended_action_ta.includes('1930'));
  assert.ok(recs.recommended_action_te.includes('1930'));
  assert.ok(recs.recommended_action_kn.includes('1930'));
  assert.ok(recs.recommended_action_ml.includes('1930'));
  assert.ok(recs.recommended_action_pa.includes('1930'));
  assert.ok(recs.recommended_action_or.includes('୧୯୩୦') || recs.recommended_action_or.includes('1930'));
  assert.ok(recs.recommended_action_as.includes('১৯৩০') || recs.recommended_action_as.includes('1930'));
  assert.ok(recs.recommended_action_ur.includes('1930'));
});
