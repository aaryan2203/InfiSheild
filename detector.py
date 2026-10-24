"""
Scam Detection Engine for InfiShield AI.
Hybrid detection combining Google GenAI SDK (gemini-3.8-flash) and regex rule-based heuristics across 13 languages.
"""

import re
import json
from typing import Dict, List, Any, Optional
from config import GEMINI_API_KEY

try:
    from google import genai
    from google.genai import types
    HAS_GENAI = bool(GEMINI_API_KEY)
    if HAS_GENAI:
        ai_client = genai.Client(api_key=GEMINI_API_KEY)
    else:
        ai_client = None
except Exception:
    ai_client = None
    HAS_GENAI = False

RULES = [
    {
        "type": "IMPERSONATION",
        "pattern": r"(cbi|mumbai police|delhi police|cyber crime branch|crime branch|narcotics control bureau|ncb|supreme court|customs department|trai|rbi official|ed officer)",
        "severity": 5,
        "weight": 30,
        "explanation_en": "Caller claims to be high-level law enforcement (CBI, Police, Customs) without credible verification.",
        "explanation_hi": "कॉलर डराने के लिए खुद को सीबीआई, पुलिस या सरकारी जांच एजेंसी का अधिकारी बता रहा है।",
        "explanation_gu": "કોલર પોતાને CBI, પોલીસ અથવા કસ્ટમ્સ અધિકારી તરીકે રજૂ કરી રહ્યો છે.",
        "explanation_kn": "ಕರೆ ಮಾಡಿದವರು ಸಿಬಿಐ ಅಥವಾ ಪೊಲೀಸ್ ಅಧಿಕಾರಿ ಎಂದು ಹೆದರಿಸುತ್ತಿದ್ದಾರೆ.",
        "explanation_ml": "സിബിഐ അല്ലെങ്കിൽ പോലീസ് ഉദ്യോഗസ്ഥൻ ചമഞ്ഞ് ഭയപ്പെടുത്തുന്നു.",
        "explanation_pa": "ਕਾਲਰ ਡਰਾਉਣ ਲਈ ਆਪਣੇ ਆਪ ਨੂੰ ਸੀਬੀਆਈ ਜਾਂ ਪੁਲਿਸ ਅਧਿਕਾਰੀ ਦੱਸ ਰਿਹਾ ਹੈ।",
        "explanation_or": "କଲର୍ ନିଜକୁ ସିବିଆଇ ବା ପୋଲିସ ଅଧିକାରୀ ବୋଲି ଡରାଉଛି।",
        "explanation_as": "কলাৰে নিজকে চিবিআই বা আৰক্ষী বিষয়া বুলি ভাবুকি দিছে।",
        "explanation_ur": "کال کرنے والا خود کو سی بی آئی یا پولیس ظاہر کر رہا ہے۔"
    },
    {
        "type": "THREAT",
        "pattern": r"(digital arrest|non-bailable warrant|arrest warrant|fir registered|arrest you within 2 hours|money laundering case|human trafficking|passport cancellation)",
        "severity": 5,
        "weight": 35,
        "explanation_en": "Threat of arrest, warrant, or legal action ('Digital Arrest' has zero legal validity in India).",
        "explanation_hi": "तुरंत गिरफ्तारी या डिजिटल अरेस्ट की धमकी (कानून में 'डिजिटल अरेस्ट' का कोई अस्तित्व नहीं है)।",
        "explanation_gu": "તાત્કાલિક ધરપકડ કે ડિજિટલ અરેસ્ટની ધમકી (ભારતીય કાયદામાં ડિજિટલ અરેસ્ટ જેવું કશું જ નથી).",
        "explanation_kn": "ಡಿಜಿಟಲ್ ಬಂಧನದ ಬೆದರಿಕೆ (ಕಾನೂನಿನಲ್ಲಿ ಡಿಜಿಟಲ್ ಬಂಧನ ಎಂಬುದು ಇಲ್ಲ).",
        "explanation_ml": "ഡിജിറ്റൽ അറസ്റ്റ് ഭീഷണി (ഇങ്ങനെ ഒരു നിയമമില്ല).",
        "explanation_pa": "ਡਿਜੀਟਲ ਅਰੈਸਟ ਦੀ ਧਮਕੀ (ਕਾਨੂੰਨ ਵਿੱਚ ਇਸਦੀ ਕੋਈ ਮਾਨਤਾ ਨਹੀਂ)।",
        "explanation_or": "ଡିଜିଟାଲ୍ ଆରେଷ୍ଟର ମିଛ ଧମକ।",
        "explanation_as": "ডিজিটেল এৰেষ্টৰ ভুৱা ভাবুকি।",
        "explanation_ur": "ڈیجیٹل گرفتاری کی جعلی دھمکی۔"
    },
    {
        "type": "ISOLATION",
        "pattern": r"(do not disconnect|stay on video call|skype call|close your room door|do not tell your family|strict secrecy|official secrets act|stay alone in the room)",
        "severity": 4,
        "weight": 25,
        "explanation_en": "Isolation tactic: Coercing victim to remain on video call and forbidding family consultation.",
        "explanation_hi": "अलगाव का दबाव: कमरे का दरवाजा बंद रखने और परिवार या वकील से बात न करने का दबाव बनाया जा रहा है।",
        "explanation_gu": "એકલતાનું ષડયંત્ર: વીડિયો કૉલ ચાલુ રાખવા અને પરિવાર સાથે વાત ન કરવા માટે દબાણ કરવામાં આવે છે.",
        "explanation_kn": "ಕುಟುಂಬದೊಂದಿಗೆ ಮಾತನಾಡದಂತೆ ರೂಮಿನಲ್ಲಿ ಪ್ರತ್ಯೇಕವಾಗಿರಲು ಒತ್ತಾಯಿಸಲಾಗುತ್ತಿದೆ.",
        "explanation_ml": "കുടുംബവുമായി സംസാരിക്കാതെ മുറിയിൽ കഴിയാൻ ഭീഷണിപ്പെടുത്തുന്നു.",
        "explanation_pa": "ਪਰਿਵਾਰ ਨਾਲ ਗੱਲ ਨਾ ਕਰਨ ਦਾ ਦਬਾਅ ਬਣਾਇਆ ਜਾ ਰਿਹਾ ਹੈ।",
        "explanation_or": "ପରିବାରଠାରୁ ଅଲଗା ରହିବାକୁ ବାଧ୍ୟ କରାଯାଉଛି।",
        "explanation_as": "পৰিয়ালৰ পৰা আঁতৰি থাকিবলৈ কোৱা হৈছে।",
        "explanation_ur": "خاندان سے بات نہ کرنے پر مجبور کیا جا رہا ہے۔"
    },
    {
        "type": "MONEY_REQUEST",
        "pattern": r"(rbi verification account|transfer funds to safe account|security deposit for verification|clearance fee of rs|refund your money after verification|break your fd and send|pay penalty fee)",
        "severity": 5,
        "weight": 35,
        "explanation_en": "Extortion demand: transfer money to 'safe' or 'verification' account.",
        "explanation_hi": "जांच या सुरक्षा के नाम पर किसी खाते में पैसे ट्रांसफर करने की मांग। असली पुलिस कभी पैसे नहीं मांगती।",
        "explanation_gu": "તપાસના નામે સુરક્ષિત ખાતામાં પૈસા ટ્રાન્સફર કરવાની માંગ. સરકારી એજન્સીઓ ક્યારેય પૈસા માંગતી નથી.",
        "explanation_kn": "ಸುರಕ್ಷಿತ ಖಾತೆಗೆ ಹಣ ವರ್ಗಾಯಿಸಲು ಒತ್ತಾಯ. ಅಧಿಕಾರಿಗಳು ಹಣ ಕೇಳುವುದಿಲ್ಲ.",
        "explanation_ml": "സേഫ് അക്കൗണ്ടിലേക്ക് പണം മാറ്റാൻ ആവശ്യപ്പെടുന്നു.",
        "explanation_pa": "ਜਾਂਚ ਦੇ ਨਾਮ \'ਤੇ ਪੈਸੇ ਠੱਗਣ ਦੀ ਕੋਸ਼ਿਸ਼।",
        "explanation_or": "ସୁରକ୍ଷିତ ଖାତାକୁ ଟଙ୍କା ପଠାଇବାକୁ ଦାବି।",
        "explanation_as": "সুৰক্ষিত একাউণ্টলৈ টকা স্থানান্তৰৰ দাবী।",
        "explanation_ur": "محفوظ اکاؤنٹ کے نام پر رقم اینٹھنے کی کوشش۔"
    },
    {
        "type": "OTP_REQUEST",
        "pattern": r"(share (the|your) otp|read the [0-9]-digit|tell me the (verification code|otp)|give (me )?(the )?otp|what is the otp|enter your upi pin|tell me your (upi pin|atm pin|password)|share your (cvv|pin|password|card))",
        "severity": 5,
        "weight": 35,
        "explanation_en": "Credential theft: requesting OTP, PIN, CVV, or banking password.",
        "explanation_hi": "OTP, पिन या CVV मांगने की कोशिश। बैंक या पुलिस कभी भी OTP नहीं मांगते।",
        "explanation_gu": "તમારો OTP, PIN અથવા CVV માંગવાનો પ્રયાસ. કોઈ પણ સંજોગોમાં OTP શેર ન કરો.",
        "explanation_kn": "OTP ಅಥವಾ ಪಿನ್ ಕದಿಯುವ ಯತ್ನ. ಯಾರಿಗೂ OTP ನೀಡಬೇಡಿ.",
        "explanation_ml": "ഒടിപിയോ പാസ്‌വേഡോ ചോർത്താനുള്ള ശ്രമം.",
        "explanation_pa": "ਓਟੀਪੀ ਜਾਂ ਪਾਸਵਰਡ ਚੋਰੀ ਕਰਨ ਦੀ ਕੋਸ਼ਿਸ਼।",
        "explanation_or": "ଓଟିପି ବା ପିନ୍ ମାଗିବା ଚେଷ୍ଟା।",
        "explanation_as": "OTP বা পাছৱৰ্ড বিচৰাৰ চেষ্টা।",
        "explanation_ur": "او ٹی پی یا پاس ورڈ چرانے کی کوشش۔"
    },
    {
        "type": "SUSPICIOUS_LINK",
        "pattern": r"(install anydesk|install quicksupport|teamviewer|screen share|download this apk|click the link sent via sms|open bit\.ly|fill the google form for kyc)",
        "severity": 4,
        "weight": 25,
        "explanation_en": "Malicious link or remote access software installation attempt (AnyDesk/QuickSupport).",
        "explanation_hi": "रिमोट एक्सेस ऐप (AnyDesk) इंस्टॉल कराने या संदिग्ध लिंक पर क्लिक करवाने की कोशिश।",
        "explanation_gu": "રિમોટ એક્સેસ એપ્લિકેશન (AnyDesk) ઇન્સ્ટોલ કરાવવાની અથવા શંકાસ્પદ લિંક પર ક્લિક કરાવવાની માંગ.",
        "explanation_kn": "AnyDesk ನಂತಹ ರಿಮೋಟ್ ಆ್ಯಪ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಲು ಕೇಳುತ್ತಿದ್ದಾರೆ.",
        "explanation_ml": "AnyDesk ഇൻസ്റ്റാൾ ചെയ്യാൻ ആവശ്യപ്പെടുന്നു.",
        "explanation_pa": "AnyDesk ਐਪ ਇੰਸਟਾਲ ਕਰਵਾਉਣ ਦੀ ਕੋਸ਼ਿਸ਼।",
        "explanation_or": "AnyDesk ଆପ୍ ଇନଷ୍ଟଲ୍ କରିବାକୁ ଚାପ।",
        "explanation_as": "AnyDesk ইনষ্টল কৰিবলৈ অনুৰোধ।",
        "explanation_ur": "ریموٹ ایپ ڈاؤن لوڈ کروانے کا مطالبہ۔"
    },
    {
        "type": "URGENCY",
        "pattern": r"(account will be blocked within 2 hours|electricity will be disconnected tonight|sim card will be blocked|act right now|only 15 minutes left|urgent verification)",
        "severity": 3,
        "weight": 20,
        "explanation_en": "Artificial urgency: threatening immediate cutoff to prevent calm decision-making.",
        "explanation_hi": "नकली हड़बड़ी: सोचने का अवसर न देने के लिए तुरंत ब्लॉक होने की झूठी धमकी दी जा रही है।",
        "explanation_gu": "કૃત્રિમ ઉતાવળ: વિચારવાનો સમય ન મળે તે માટે ખાતું બંધ થવાની તાત્કાલિક ધમકી.",
        "explanation_kn": "ಖಾತೆ ತಕ್ಷಣ ಬ್ಲಾಕ್ ಆಗುತ್ತದೆ ಎಂಬ ಕೃತಕ ಆತಂಕ.",
        "explanation_ml": "അക്കൗണ്ട് പൂട്ടുമെന്ന് കൃത്രിമ ഭീതി.",
        "explanation_pa": "ਤੁਰੰਤ ਖਾਤਾ ਬੰਦ ਹੋਣ ਦੀ ਝੂਠੀ ਧਮਕੀ।",
        "explanation_or": "ତୁରନ୍ତ ଖାତା ବନ୍ଦ ହେବାର ମିଛ ଭୟ।",
        "explanation_as": "একাউণ্ট বন্ধ হ’ব বুলি অপপ্ৰচাৰ।",
        "explanation_ur": "فوری اکاؤنٹ بند ہونے کی جھوٹی دھمکی۔"
    }
]

GENUINE_PATTERNS = [
    r"(no otp or password is required|never share your password with anyone|for your security, do not share credentials|official branch visit|at your convenience|verified customer service|cheque book delivery confirmation)"
]

def analyze_chunk_local(
    text: str,
    existing_flags: Optional[List[Dict[str, Any]]] = None,
    current_time_sec: float = 0.0
) -> Dict[str, Any]:
    flags = list(existing_flags or [])
    seen_keys = {f"{f['type']}:{f['evidence'][:20]}" for f in flags}
    score = sum(f.get("severity", 1) * 8 for f in flags)
    max_severity = max([f.get("severity", 1) for f in flags], default=1)

    # Check genuine markers
    for gp in GENUINE_PATTERNS:
        if re.search(gp, text, re.IGNORECASE):
            score = max(0, score - 20)

    for rule in RULES:
        match = re.search(rule["pattern"], text, re.IGNORECASE)
        if match:
            # If caller is advising never to share credentials, ignore
            if rule["type"] == "OTP_REQUEST" and re.search(r"(never ask|will never ask|do not share|never share)", text, re.IGNORECASE):
                continue

            evidence = match.group(0)
            key = f"{rule['type']}:{evidence[:20]}"
            if key not in seen_keys:
                seen_keys.add(key)
                score += rule["weight"]
                max_severity = max(max_severity, rule["severity"])
                flags.append({
                    "id": f"flag-{len(flags) + 1}",
                    "type": rule["type"],
                    "evidence": evidence,
                    "explanation_hi": rule["explanation_hi"],
                    "explanation_gu": rule["explanation_gu"],
                    "explanation_kn": rule.get("explanation_kn", rule["explanation_en"]),
                    "explanation_ml": rule.get("explanation_ml", rule["explanation_en"]),
                    "explanation_pa": rule.get("explanation_pa", rule["explanation_en"]),
                    "explanation_or": rule.get("explanation_or", rule["explanation_en"]),
                    "explanation_as": rule.get("explanation_as", rule["explanation_en"]),
                    "explanation_ur": rule.get("explanation_ur", rule["explanation_en"]),
                    "explanation_en": rule["explanation_en"],
                    "severity": rule["severity"],
                    "timestamp": current_time_sec
                })

    if score >= 60 or max_severity >= 5:
        risk_level = "CRITICAL"
    elif score >= 35 or max_severity >= 4:
        risk_level = "HIGH"
    elif score >= 18 or max_severity >= 3:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    is_suspicious = risk_level in ["CRITICAL", "HIGH", "MEDIUM"]

    if risk_level in ["CRITICAL", "HIGH"]:
        action_hi = "सावधान! कॉल तुरंत काट दें। किसी भी खाते में पैसे ट्रांसफर न करें और 1930 राष्ट्रीय साइबर हेल्पलाइन पर शिकायत करें।"
        action_gu = "સાવધાન! કૉલ તરત જ કાપી નાખો. કોઈપણ ખાતામાં પૈસા ન મોકલો અને 1930 સાયબર હેલ્પલાઇન પર સંપર્ક કરો."
        action_kn = "ಎಚ್ಚರಿಕೆ! ಕರೆಯನ್ನು ಕಟ್ ಮಾಡಿ. ಯಾವುದೇ ಖಾತೆಗೆ ಹಣ ಕಳುಹಿಸಬೇಡಿ ಮತ್ತು 1930 ಸೈಬರ್ ಸಹಾಯವಾಣಿಗೆ ಕರೆ ಮಾಡಿ."
    elif risk_level == "MEDIUM":
        action_hi = "सावधानी बरतें। किसी भी लिंक पर क्लिक न करें और आधिकारिक बैंक ऐप से ही जांच करें।"
        action_gu = "સાવચેત રહો. કોઈપણ લિંક પર ક્લિક ન કરો અને સત્તાવાર શાખાનો સંપર્ક કરો."
        action_kn = "ಎಚ್ಚರಿಕೆಯಿಂದಿರಿ. ಲಿಂಕ್‌ಗಳ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಬೇಡಿ."
    else:
        action_hi = "अभी तक कोई धोखाधड़ी के संकेत नहीं मिले हैं। कॉल सामान्य लग रही है।"
        action_gu = "હજુ સુધી કોઈ છેતરપિંડીના સંકેત મળ્યા નથી. કૉલ સામાન્ય લાગે છે."
        action_kn = "ಇಲ್ಲಿಯವರೆಗೆ ಯಾವುದೇ ವಂಚನೆಯ ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಕರೆ ಸುರಕ್ಷಿತವಾಗಿದೆ."

    return {
        "risk_level": risk_level,
        "is_suspicious": is_suspicious,
        "detected_red_flags": flags,
        "recommended_action_hi": action_hi,
        "recommended_action_gu": action_gu,
        "recommended_action_kn": action_kn,
        "confidence": 0.92 if score == 0 else min(0.98, 0.65 + (score / 150) * 0.3)
    }
