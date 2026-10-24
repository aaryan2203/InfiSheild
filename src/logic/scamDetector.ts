/**
 * ScamShield AI — Detection Engine & Heuristics
 * Pure logic module for audio transcript analysis, multi-lingual explanations,
 * and scam risk classification across 13 major languages.
 */

export type RedFlagType =
  | 'THREAT'
  | 'OTP_REQUEST'
  | 'MONEY_REQUEST'
  | 'IMPERSONATION'
  | 'URGENCY'
  | 'SUSPICIOUS_LINK'
  | 'ISOLATION';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DetectedRedFlag {
  id: string;
  type: RedFlagType;
  evidence: string;
  explanation_hi: string;
  explanation_gu: string;
  explanation_mr: string;
  explanation_bn: string;
  explanation_ta: string;
  explanation_te: string;
  explanation_kn: string;
  explanation_ml: string;
  explanation_pa: string;
  explanation_or: string;
  explanation_as: string;
  explanation_ur: string;
  explanation_en: string;
  severity: number; // 1 (mild) to 5 (critical)
  timestampSec: number;
}

export interface AnalysisResult {
  risk_level: RiskLevel;
  is_suspicious: boolean;
  detected_red_flags: DetectedRedFlag[];
  recommended_action_hi: string;
  recommended_action_gu: string;
  recommended_action_mr: string;
  recommended_action_bn: string;
  recommended_action_ta: string;
  recommended_action_te: string;
  recommended_action_kn: string;
  recommended_action_ml: string;
  recommended_action_pa: string;
  recommended_action_or: string;
  recommended_action_as: string;
  recommended_action_ur: string;
  recommended_action_en: string;
  confidence: number;
  overall_score: number;
}

interface PatternRule {
  type: RedFlagType;
  regex: RegExp;
  severity: number;
  weight: number;
  explanation_en: string;
  explanation_hi: string;
  explanation_gu: string;
  explanation_mr: string;
  explanation_bn: string;
  explanation_ta: string;
  explanation_te: string;
  explanation_kn: string;
  explanation_ml: string;
  explanation_pa: string;
  explanation_or: string;
  explanation_as: string;
  explanation_ur: string;
}

export const SCAM_RULES: PatternRule[] = [
  // 1. DIGITAL ARREST / POLICE / COURT IMPERSONATION
  {
    type: 'IMPERSONATION',
    regex: /(cbi|mumbai police|delhi police|cyber crime branch|crime branch|narcotics control bureau|ncb|supreme court|customs department|trai|rbi official|ed officer|enforcement directorate)/i,
    severity: 5,
    weight: 30,
    explanation_en: 'Impersonation Alert: Caller claims to be high-level law enforcement (CBI, Police, Customs, or Court) to intimidate you.',
    explanation_hi: 'पहचान का धोखा (Impersonation): कॉलर आपको डराने के लिए खुद को सीबीआई या पुलिस का बड़ा अधिकारी बता रहा है। Genuine police never intimidate via phone calls.',
    explanation_gu: 'નકલી ઓળખ (Impersonation): કોલર તમને ડરાવવા માટે પોતાને CBI અથવા પોલીસ અધિકારી તરીકે રજૂ કરી રહ્યો છે.',
    explanation_mr: 'बनावट अधिकारी (Impersonation): कॉलर स्वतःला सीबीआय किंवा पोलीस अधिकारी सांगत आहे.',
    explanation_bn: 'ভুয়া কর্মকর্তা (Impersonation): কলার নিজেকে সিবিআই বা পুলিশ কর্মকর্তা বলে দাবি করছে।',
    explanation_ta: 'போலி அதிகாரி (Impersonation): அழைப்பாளர் சிபிஐ அல்லது போலீஸ் அதிகாரி என மிரட்டுகிறார்.',
    explanation_te: 'నకిలీ అధికారి (Impersonation): కాలర్ సిబిఐ లేదా పోలీస్ అధికారిగా నటిస్తున్నారు.',
    explanation_kn: 'ನಕಲಿ ಅಧಿಕಾರಿ (Impersonation): ಕರೆ ಮಾಡಿದವರು ಸಿಬಿಐ ಅಥವಾ ಪೊಲೀಸ್ ಅಧಿಕಾರಿ ಎಂದು ಹೆದರಿಸುತ್ತಿದ್ದಾರೆ.',
    explanation_ml: 'വ്യാജ ഉദ്യോഗസ്ഥൻ (Impersonation): സിബിഐ അല്ലെങ്കിൽ പോലീസ് ഉദ്യോഗസ്ഥൻ ചമഞ്ഞ് ഭയപ്പെടുത്തുന്നു.',
    explanation_pa: 'ਨਕਲੀ ਅਧਿਕਾਰੀ (Impersonation): ਕਾਲਰ ਡਰਾਉਣ ਲਈ ਆਪਣੇ ਆਪ ਨੂੰ ਸੀਬੀਆਈ ਜਾਂ ਪੁਲਿਸ ਅਧਿਕਾਰੀ ਦੱਸ ਰਿਹਾ ਹੈ।',
    explanation_or: 'ନକଲି ଅଧିକାରୀ (Impersonation): କଲର୍ ନିଜକୁ ସିବିଆଇ ବା ପୋଲିସ ଅଧିକାରୀ ବୋଲି ଡରାଉଛି।',
    explanation_as: 'ভুৱা বিষয়া (Impersonation): কলাৰে নিজকে চিবিআই বা আৰক্ষী বিষয়া বুলি ভাবুকি দিছে।',
    explanation_ur: 'جعلی افسر (Impersonation): کال کرنے والا خود کو سی بی آئی یا پولیس افسر ظاہر کر کے ڈرا رہا ہے۔',
  },
  {
    type: 'THREAT',
    regex: /(digital arrest|non-bailable warrant|arrest warrant|fir registered|send police to your address|arrest you within 2 hours|money laundering case|human trafficking|passport cancellation)/i,
    severity: 5,
    weight: 35,
    explanation_en: 'Threat & Extortion: Threat of arrest or non-bailable warrant. Note: "Digital Arrest" has zero legal validity in India.',
    explanation_hi: 'धमकी (Illegal Threat): तुरंत गिरफ्तारी या डिजिटल अरेस्ट की धमकी (कानून में "डिजिटल अरेस्ट" नाम की कोई चीज नहीं होती)। "Digital Arrest" is 100% fake.',
    explanation_gu: 'ધમકી (Extortion Threat): તાત્કાલિક ધરપકડ કે વોરંટની ધમકી (ભારતીય કાયદામાં "ડિજિટલ અરેસ્ટ" હોતું જ નથી).',
    explanation_mr: 'अटकेची धमकी (Threat): कायद्यात "डिजिटल अरेस्ट" असा कोणताही प्रकार अस्तित्वात नाही.',
    explanation_bn: 'গ্রেফতারের হুমকি (Threat): আইনে "ডিজিটাল অ্যারেস্ট" বলে কিছু নেই। এটি সম্পূর্ণ প্রতারণা।',
    explanation_ta: 'கைது மிரட்டல் (Threat): சட்டத்தில் "டிஜிட்டல் கைது" என்பது கிடையாது. இது மோசடி.',
    explanation_te: 'అరెస్టు బెదిరింపు (Threat): చట్టంలో "డిజిటల్ అరెస్ట్" అనేది ఏదీ లేదు. ఇది మోసం.',
    explanation_kn: 'ಬಂಧನದ ಬೆದರಿಕೆ (Threat): ಕಾನೂನಿನಲ್ಲಿ "ಡಿಜಿಟಲ್ ಬಂಧನ" ಎಂಬುದು ಅಸ್ತಿತ್ವದಲ್ಲೇ ಇಲ್ಲ. ಇದು ಸಂಪೂರ್ಣ ವಂಚನೆ.',
    explanation_ml: 'അറസ്റ്റ് ഭീഷണി (Threat): നിയമത്തിൽ "ഡിജിറ്റൽ അറസ്റ്റ്" എന്നൊന്നില്ല. ഇത് തട്ടിപ്പാണ്.',
    explanation_pa: 'ਗ੍ਰਿਫ਼ਤਾਰੀ ਦੀ ਧਮਕੀ (Threat): ਕਾਨੂੰਨ ਵਿੱਚ "ਡਿਜੀਟਲ ਅਰੈਸਟ" ਨਾਮ ਦੀ ਕੋਈ ਚੀਜ਼ ਨਹੀਂ ਹੈ।',
    explanation_or: 'ଗିରଫଦାରୀ ଧମକ (Threat): ଆଇନରେ "ଡିଜିଟାଲ୍ ଆରେଷ୍ଟ" ବୋଲି କିଛି ନାହିଁ।',
    explanation_as: 'গ্ৰেপ্তাৰৰ ভাবুকি (Threat): আইনত "ডিজিটেল এৰেষ্ট" নামৰ কোনো ব্যৱস্থা নাই।',
    explanation_ur: 'گرفتاری کی دھمکی (Threat): قانون میں "ڈیجیٹل گرفتاری" کی کوئی حیثیت نہیں ہے۔',
  },
  {
    type: 'ISOLATION',
    regex: /(do not disconnect|stay on video call|skype call|close your room door|do not tell your family|strict secrecy|official secrets act|do not consult anyone|stay alone in the room)/i,
    severity: 4,
    weight: 25,
    explanation_en: 'Psychological Isolation: Forcing you to stay isolated on video call and forbidding you from consulting family.',
    explanation_hi: 'अलगाव की चाल (Isolation Tactic): कमरे में अकेले रहने और परिवार या वकील से बात न करने का दबाव बनाया जा रहा है। Always consult family.',
    explanation_gu: 'એકલતાનું ષડયંત્ર (Isolation Tactic): વીડિયો કૉલ પર રહેવા અને પરિવાર સાથે વાત ન કરવા માટે દબાણ.',
    explanation_mr: 'अलगीकरणाची युक्ती (Isolation): खोलीत एकटे राहण्याची आणि कुटुंबीयांशी बोलण्यास मनाई केली जात आहे.',
    explanation_bn: 'বিচ্ছিন্ন করার অপচেষ্টা (Isolation): পরিবারের সাথে যোগাযোগ বন্ধ রাখার চাপ দেওয়া হচ্ছে।',
    explanation_ta: 'தனிமைப்படுத்தும் தந்திரம் (Isolation): குடும்பத்தினரிடம் பேசக் கூடாது என அச்சுறுத்துகிறார்கள்.',
    explanation_te: 'వేరుచేసే కుట్ర (Isolation): కుటుంబ సభ్యులతో మాట్లాడవద్దని ఒత్తిడి తెస్తున్నారు.',
    explanation_kn: 'ಪ್ರತ್ಯೇಕಿಸುವ ತಂತ್ರ (Isolation): ಕುಟುಂಬಸ್ಥರೊಂದಿಗೆ ಮಾತನಾಡದಂತೆ ಮತ್ತು ರೂಮಿನಲ್ಲಿ ಒಬ್ಬರೇ ಇರಲು ಒತ್ತಾಯಿಸಲಾಗುತ್ತಿದೆ.',
    explanation_ml: 'ഒറ്റപ്പെടുത്തൽ തന്ത്രം (Isolation): കുടുംബവുമായി സംസാരിക്കരുതെന്ന് വിലക്കി വീഡിയോ കോളിൽ തളച്ചിടുന്നു.',
    explanation_pa: 'ਇਕੱਲੇ ਰੱਖਣ ਦੀ ਚਾਲ (Isolation): ਕਮਰੇ ਵਿੱਚ ਬੰਦ ਰਹਿਣ ਅਤੇ ਪਰਿਵਾਰ ਨੂੰ ਨਾ ਦੱਸਣ ਦਾ ਦਬਾਅ ਬਣਾਇਆ ਜਾ ਰਿਹਾ ਹੈ।',
    explanation_or: 'ଏକାକୀ ରଖିବା ଷଡ଼ଯନ୍ତ୍ର (Isolation): ପରିବାର ସହ କଥା ନହେବା ପାଇଁ ବାଧ୍ୟ କରାଯାଉଛି।',
    explanation_as: 'বিচ্ছিন্ন কৰাৰ কৌশল (Isolation): পৰিয়ালৰ সৈতে কথা নাপাতিবলৈ ভাবুকি দিয়া হৈছে।',
    explanation_ur: 'الگ تھلگ کرنے کی چال (Isolation): کمرہ بند رکھنے اور خاندان سے بات نہ کرنے کا دباؤ ڈالا جا رہا ہے۔',
  },

  // 2. FINANCIAL EXTORTION & "SAFE ACCOUNT" TRANSFER
  {
    type: 'MONEY_REQUEST',
    regex: /(rbi verification account|transfer funds to safe account|security deposit for verification|clearance fee of rs|refund your money after verification|break your fd and send|pay penalty fee)/i,
    severity: 5,
    weight: 35,
    explanation_en: 'Financial Extortion: Demanding money transfer into a "safe" or "verification" account. Authorities never request funds.',
    explanation_hi: 'पैसे की मांग (Extortion): जांच के नाम पर किसी खाते में पैसे ट्रांसफर करने की मांग। सरकारी एजेंसियां कभी पैसे नहीं मांगतीं। Never transfer money.',
    explanation_gu: 'પૈસાની માંગણી (Extortion): તપાસના નામે સુરક્ષિત ખાતામાં પૈસા ટ્રાન્સફર કરવાની માંગ. સરકારી એજન્સીઓ ક્યારેય પૈસા માંગતી નથી.',
    explanation_mr: 'पैसे ट्रान्सफर करण्याची मागणी (Money Fraud): पोलीस किंवा बँक कधीही खात्यात पैसे भरण्यास सांगत नाहीत.',
    explanation_bn: 'টাকা পাঠানোর দাবি (Extortion): যাচাইয়ের নামে সুরক্ষিত অ্যাকাউন্টে টাকা পাঠানোর ভুয়া দাবি।',
    explanation_ta: 'பணம் மாற்றும் கோரிக்கை (Money Request): உண்மையான அதிகாரிகள் பணம் கேட்க மாட்டார்கள்.',
    explanation_te: 'డబ్బు బదిలీ డిమాండ్ (Money Request): నిజమైన అధికారులు ఎప్పుడూ డబ్బులు అడగరు.',
    explanation_kn: 'ಹಣದ ಬೇಡಿಕೆ (Money Extortion): ಸುರಕ್ಷಿತ ಖಾತೆಗೆ ಹಣ ವರ್ಗಾಯಿಸಲು ಕೇಳುತ್ತಿದ್ದಾರೆ. ಅಧಿಕಾರಿಗಳು ಹಣ ಕೇಳುವುದಿಲ್ಲ.',
    explanation_ml: 'പണം തട്ടൽ (Money Request): അന്വേഷണത്തിന്റെ പേരിൽ സേഫ് അക്കൗണ്ടിലേക്ക് പണം മാറ്റാൻ ആവശ്യപ്പെടുന്നു.',
    explanation_pa: 'ਪੈਸੇ ਦੀ ਮੰਗ (Money Fraud): ਜਾਂਚ ਦੇ ਨਾਮ \'ਤੇ ਪੈਸੇ ਟ੍ਰਾਂਸਫਰ ਕਰਨ ਦੀ ਮੰਗ। ਪੁਲਿਸ ਕਦੇ ਪੈਸੇ ਨਹੀਂ ਮੰਗਦੀ।',
    explanation_or: 'ଟଙ୍କା ଦାବି (Extortion): ତଦନ୍ତ ନାମରେ ସୁରକ୍ଷିତ ଖାତାକୁ ଟଙ୍କା ପଠାଇବାକୁ ଦାବି।',
    explanation_as: 'টকা হস্তান্তৰৰ দাবী (Extortion): সুৰক্ষিত একাউণ্টলৈ টকা পঠিয়াবলৈ কোৱা হৈছে।',
    explanation_ur: 'رقم کا مطالبہ (Money Extortion): نام نہاد محفوظ اکاؤنٹ میں رقم بھیجنے کا مطالبہ۔ کبھی رقم نہ بھیجیں۔',
  },

  // 3. OTP & AUTHENTICATION SECRETS HARVESTING
  {
    type: 'OTP_REQUEST',
    regex: /(share (the|your) otp|read the [0-9]-digit|tell me the (verification code|otp)|give (me )?(the )?otp|what is the otp|enter your upi pin|tell me your (upi pin|atm pin|password)|share your (cvv|pin|password|card))/i,
    severity: 5,
    weight: 35,
    explanation_en: 'Credential Theft: Attempt to steal your OTP, PIN, CVV, or netbanking password. Banks NEVER request these.',
    explanation_hi: 'OTP चोरी का प्रयास (OTP Theft): OTP, PIN या पासवर्ड मांगने की कोशिश। बैंक या पुलिस कभी भी OTP नहीं मांगते। Never share OTP.',
    explanation_gu: 'OTP ચોરીનો પ્રયાસ (OTP Theft): તમારો OTP, PIN અથવા પાસવર્ડ ચોરવાનો પ્રયાસ. કોઈને પણ OTP આપશો નહીં.',
    explanation_mr: 'OTP चोरी (OTP Theft): तुमचा OTP किंवा पासवर्ड चोरण्याचा प्रयत्न. कोणालाही सांगू नका.',
    explanation_bn: 'ওটিপি চুরির চেষ্টা (OTP Theft): আপনার ওটিপি বা পাসওয়ার্ড নেওয়ার চেষ্টা। কাউকে বলবেন না।',
    explanation_ta: 'OTP பறிக்கும் முயற்சி (OTP Theft): OTP அல்லது கடவுச்சொல்லை எவரிடமும் பகிராதீர்கள்.',
    explanation_te: 'OTP దొంగతనం (OTP Theft): మీ OTP లేదా పాస్‌వర్డ్‌ను ఎవరికీ చెప్పవద్దు.',
    explanation_kn: 'OTP ಕಳ್ಳತನ (OTP Theft): ನಿಮ್ಮ ರಹಸ್ಯ OTP ಅಥವಾ ಪಿನ್ ಕದಿಯುವ ಯತ್ನ. ಯಾರಿಗೂ OTP ಹಂಚಿಕೊಳ್ಳಬೇಡಿ.',
    explanation_ml: 'ഒടിപി തട്ടിപ്പ് (OTP Theft): ഒടിപിയോ പാസ്‌വേഡോ ചോർത്താനുള്ള ശ്രമം. ആരുമായും ഒടിപി പങ്കിടരുത്.',
    explanation_pa: 'ਓਟੀਪੀ ਚੋਰੀ (OTP Theft): ਤੁਹਾਡਾ ਓਟੀਪੀ ਜਾਂ ਪਾਸਵਰਡ ਚੋਰੀ ਕਰਨ ਦੀ ਕੋਸ਼ਿਸ਼।',
    explanation_or: 'ଓଟିପି ଚୋରି (OTP Theft): ଆପଣଙ୍କ ଓଟିପି ବା ପାସୱାର୍ଡ ମାଗିବା ଚେଷ୍ଟା। କାହାକୁ ଦିଅନ୍ତୁ ନାହିଁ।',
    explanation_as: 'OTP চুৰি (OTP Theft): আপোনাৰ OTP বা পাছৱৰ্ড বিচৰাৰ চেষ্টা। কাকো নিদিব।',
    explanation_ur: 'او ٹی پی چوری (OTP Theft): او ٹی پی یا پاس ورڈ چرانے کی کوشش۔ کبھی کسی کو او ٹی پی نہ بتائیں۔',
  },

  // 4. SUSPICIOUS LINKS & REMOTE ACCESS MALWARE
  {
    type: 'SUSPICIOUS_LINK',
    regex: /(install anydesk|install quicksupport|teamviewer|screen share|download this apk|click the link sent via sms|open bit\.ly|fill the google form for kyc)/i,
    severity: 4,
    weight: 25,
    explanation_en: 'Malware / Remote Screen Control: Requesting remote access app installation (AnyDesk/QuickSupport) or unknown link.',
    explanation_hi: 'रिमोट स्क्रीन ऐप (Malicious App): AnyDesk या QuickSupport ऐप इंस्टॉल कराने या लिंक पर क्लिक कराने की कोशिश। Never install AnyDesk on call.',
    explanation_gu: 'રિમોટ એપ્લિકેશન (Malicious App): AnyDesk અથવા અજાણી લિંક ખોલવાની માંગ.',
    explanation_mr: 'रिमोट ॲप धोका (Malicious App): AnyDesk ॲप इन्स्टॉल करू नका.',
    explanation_bn: 'ক্ষতিকর অ্যাপ (Malicious App): AnyDesk ইনস্টল করবেন না বা লিঙ্কে ক্লিক করবেন না।',
    explanation_ta: 'ஆபத்தான செயலி (Malicious App): AnyDesk செயலியை நிறுவ வேண்டாம்.',
    explanation_te: 'ప్రమాదకర యాప్ (Malicious App): AnyDesk ఇన్‌స్టాల్ చేయవద్దు.',
    explanation_kn: 'ಅಪಾಯಕಾರಿ ಆ್ಯಪ್ (Malicious App): AnyDesk ಅಥವಾ ಅಪರಿಚಿತ ಆ್ಯಪ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಲು ಕೇಳುತ್ತಿದ್ದಾರೆ.',
    explanation_ml: 'റിമോട്ട് ആപ്പ് കെണി (Malicious App): AnyDesk ഇൻസ്റ്റാൾ ചെയ്യാൻ ആവശ്യപ്പെടുന്നു.',
    explanation_pa: 'ਖ਼ਤਰਨਾਕ ਐਪ (Malicious App): AnyDesk ਐਪ ਇੰਸਟਾਲ ਨਾ ਕਰੋ।',
    explanation_or: 'ବିପଦଜ୍ଜନକ ଆପ୍ (Malicious App): AnyDesk ଆପ୍ ଇନଷ୍ଟଲ୍ କରନ୍ତୁ ନାହିଁ।',
    explanation_as: 'বিপজ্জনক এপ্ (Malicious App): AnyDesk ইনষ্টল কৰিবলৈ অনুৰোধ।',
    explanation_ur: 'خطرناک ایپ (Malicious App): ریموٹ ایکسس ایپ (AnyDesk) ڈاؤن لوڈ کروانے کی کوشش۔',
  },

  // 5. ARTIFICIAL PANIC & TIME PRESSURE (URGENCY)
  {
    type: 'URGENCY',
    regex: /(account will be blocked within 2 hours|electricity will be disconnected tonight|sim card will be blocked|act right now|only 15 minutes left|before midnight tonight|urgent verification)/i,
    severity: 3,
    weight: 20,
    explanation_en: 'Artificial Urgency: Imposing strict immediate deadlines (account blocked in 2 hours) to panic you into compliance.',
    explanation_hi: 'नकली हड़बड़ी (Panic Tactic): सोचने का समय न देने के लिए 2 घंटे में खाता बंद होने की झूठी चेतावनी। Do not panic.',
    explanation_gu: 'કૃત્રિમ ઉતાવળ (Panic Tactic): વિચારવાનો સમય ન મળે તે માટે ખાતું બંધ થવાની તાત્કાલિક ખોટી બીક.',
    explanation_mr: 'खोटी घाई (Urgency Tactic): त्वरित खाते बंद होण्याची खोटी भीती दाखवली जात आहे.',
    explanation_bn: 'মিথ্যা আতঙ্ক (Urgency Tactic): ভাবার সময় না দিয়ে অ্যাকাউন্ট বন্ধের তাড়া দেওয়া হচ্ছে।',
    explanation_ta: 'செயற்கை அவசரம் (Urgency Tactic): உடனடியாக கணக்கு முடக்கப்படும் என பயமுறுத்துகிறார்கள்.',
    explanation_te: 'కల్పిత ఆందోళన (Urgency Tactic): ఆలోచించడానికి సమయం ఇవ్వకుండా భయపెడుతున్నారు.',
    explanation_kn: 'ಕೃತಕ ಆತಂಕ (Urgency Tactic): ಯೋಚಿಸಲು ಸಮಯ ಕೊಡದೆ ಖಾತೆ ಬ್ಲಾಕ್ ಆಗುತ್ತದೆ ಎಂದು ಬೆದರಿಸುತ್ತಿದ್ದಾರೆ.',
    explanation_ml: 'കൃത്രിമ പരിഭ്രാന്തി (Urgency Tactic): ചിന്തിക്കാൻ സമയം നൽകാതെ ഉടൻ അക്കൗണ്ട് പൂട്ടുമെന്ന് ഭീഷണി.',
    explanation_pa: 'ਝੂਠੀ ਜਲਦਬਾਜ਼ੀ (Urgency Tactic): ਤੁਰੰਤ ਖਾਤਾ ਬੰਦ ਹੋਣ ਦਾ ਡਰਾਵਾ ਦੇ ਕੇ ਦਬਾਅ ਬਣਾਇਆ ਜਾ ਰਿਹਾ ਹੈ।',
    explanation_or: 'ମିଛ ଆତଙ୍କ (Urgency Tactic): ଭାବିବାକୁ ସମୟ ନଦେଇ ଖାତା ବନ୍ଦ ହେବାର ଭୟ।',
    explanation_as: 'কৃত্ৰিম খৰখেদা (Urgency Tactic): একাউণ্ট বন্ধ হ’ব বুলি ভাবুকি দি আতঙ্ক সৃষ্টিৰ চেষ্টা।',
    explanation_ur: 'مصنوعی گھبراہٹ (Urgency Tactic): سوچنے کا وقت نہ دے کر فوری اکاؤنٹ بند ہونے کا خوف دلایا جا رہا ہے۔',
  },

  // 6. FAKE COURIER / DRUGS CONTRABAND
  {
    type: 'THREAT',
    regex: /(parcel contains mdma|drugs found in parcel|14 fake passports|taiwan parcel|fedex international hub|narcotics seizure)/i,
    severity: 5,
    weight: 30,
    explanation_en: 'Contraband Extortion: Fabricated illegal parcel claim (narcotics/drugs/fake passports) sent in your identity.',
    explanation_hi: 'फर्जी पार्सल का डर (Fake Courier): आपके नाम के पार्सल में ड्रग्स या गैरकानूनी पासपोर्ट मिलने का झूठा दावा। It is a known courier scam.',
    explanation_gu: 'નકલી કુરિયર આરોપ (Fake Courier): તમારા નામના પાર્સલમાં ડ્રગ્સ કે ગેરકાયદેસર સામાન મળ્યાનો નકલી આરોપ.',
    explanation_mr: 'बनावट पार्सल (Fake Courier): पार्सलमध्ये ड्रग्ज सापडल्याचा बनावट दावा.',
    explanation_bn: 'ভুয়া পার্সেল (Fake Courier): পার্সেলটিতে মাদক বা অবৈধ পণ্য পাওয়া গেছে বলে মিথ্যা দাবি।',
    explanation_ta: 'போலி பார்சல் (Fake Courier): பார்சலில் போதைப்பொருள் இருப்பதாகக் கூறும் போலி மிரட்டல்.',
    explanation_te: 'నకిలీ పార్సెల్ (Fake Courier): పార్సెల్‌లో మాదకద్రవ్యాలు ఉన్నాయని చెప్పే నకిలీ బెదిరింపు.',
    explanation_kn: 'ನಕಲಿ ಪಾರ್ಸೆಲ್ ಆರೋಪ (Fake Courier): ನಿಮ್ಮ ಹೆಸರಿನ ಪಾರ್ಸೆಲ್‌ನಲ್ಲಿ ಮಾದಕವಸ್ತು ಸಿಕ್ಕಿದೆ ಎಂಬ ಸುಳ್ಳು ಬೆದರಿಕೆ.',
    explanation_ml: 'വ്യാജ കൊറിയർ തട്ടിപ്പ് (Fake Courier): പാഴ്സലിൽ ലഹരിമരുന്ന് കണ്ടെത്തിയെന്ന് വ്യാജ ഭീഷണി.',
    explanation_pa: 'ਨਕਲੀ ਪਾਰਸਲ ਦਾ ਡਰ (Fake Courier): ਪਾਰਸਲ ਵਿੱਚ ਨਸ਼ੇ ਹੋਣ ਦਾ ਝੂਠਾ ਦੋਸ਼ ਲਗਾ ਕੇ ਬਲੈਕਮੇਲਿੰਗ।',
    explanation_or: 'ନକଲି ପାର୍ସଲ ଠକେଇ (Fake Courier): ପାର୍ସଲରେ ଡ୍ରଗ୍ସ ମିଳିଥିବା ମିଛ ଅଭିଯୋଗ।',
    explanation_as: 'ভুৱা পাৰ্চেল ভীতি (Fake Courier): পাৰ্চেলত নিষিদ্ধ সামগ্ৰী ওলোৱা বুলি ভাবুকি।',
    explanation_ur: 'جعلی پارسل کا خوف (Fake Courier): پارسل میں منشیات نکلنے کا جھوٹا دعویٰ کر کے بلیک میلنگ۔',
  },
];

// Legitimate service indicators that reduce risk score
const GENUINE_INDICATORS = [
  /(no otp or password is required|never share your password with anyone|for your security, do not share credentials|official branch visit|at your convenience|verified customer service|cheque book delivery confirmation)/i,
];

/**
 * Computes Risk Level from composite score and highest severity
 */
export function computeRiskLevel(score: number, maxSeverity: number): RiskLevel {
  if (score >= 60 || maxSeverity >= 5) {
    return 'CRITICAL';
  }
  if (score >= 35 || maxSeverity >= 4) {
    return 'HIGH';
  }
  if (score >= 18 || maxSeverity >= 3) {
    return 'MEDIUM';
  }
  return 'LOW';
}

/**
 * Generates recommendation text tailored to the detected risk level and specific red flags across all supported languages
 */
export function generateRecommendations(riskLevel: RiskLevel, detectedTypes: Set<RedFlagType>) {
  if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
    const isDigitalArrest = detectedTypes.has('IMPERSONATION') || detectedTypes.has('ISOLATION');
    const isOtp = detectedTypes.has('OTP_REQUEST');

    let en = 'Disconnect call immediately! Do NOT transfer any money or break fixed deposits. Call National Cyber Crime Helpline at 1930.';
    let hi = 'कॉल तुरंत काट दें (Disconnect Now)! किसी भी खाते में पैसे ट्रांसफर न करें और न ही OTP बताएं। राष्ट्रीय साइबर हेल्पलाइन 1930 पर तुरंत कॉल करें।';
    let gu = 'કૉલ તરત જ કાપી નાખો (Disconnect Now)! કોઈ પૈસા ટ્રાન્સફર ન કરો કે OTP આપશો નહીં. રાષ્ટ્રીય સાયબર હેલ્પલાઇન 1930 પર તરત જ સંપર્ક કરો.';
    let mr = 'कॉल लगेच कट करा (Disconnect Now)! कोणत्याही खात्यात पैसे पाठवू नका. राष्ट्रीय सायबर हेल्पलाइन 1930 वर तक्रार नोंदवा.';
    let bn = 'কলটি অবিলম্বে কেটে দিন (Disconnect Now)! কোনো টাকা পাঠাবেন না বা ওটিপি দেবেন না। জাতীয় সাইবার হেল্পলাইন ১৯৩০ নম্বরে যোগাযোগ করুন।';
    let ta = 'அழைப்பை உடனடியாக துண்டிக்கவும்! பணம் எதையும் அனுப்பாதீர்கள். தேசிய சைபர் உதவி எண் 1930 ஐ அழைக்கவும்.';
    let te = 'కాల్ వెంటనే కట్ చేయండి! ఎలాంటి డబ్బులు పంపవద్దు. జాతీయ సైబర్ హెల్ప్‌లైన్ 1930 కి కాల్ చేయండి.';
    let kn = 'ಕರೆಯನ್ನು ತಕ್ಷಣವೇ ಕಟ್ ಮಾಡಿ! ಯಾವುದೇ ಖಾತೆಗೆ ಹಣ ಕಳುಹಿಸಬೇಡಿ ಅಥವಾ OTP ಹೇಳಬೇಡಿ. ರಾಷ್ಟ್ರೀಯ ಸೈಬರ್ ಸಹಾಯವಾಣಿ 1930 ಗೆ ಕರೆ ಮಾಡಿ.';
    let ml = 'കോൾ ഉടൻ കട്ട് ചെയ്യുക! പണം അയക്കുകയോ ഒടിപി നൽകുകയോ ചെയ്യരുത്. ദേശീയ സൈബർ ഹെൽപ്പ്‌ലൈൻ 1930-ൽ വിളിക്കുക.';
    let pa = 'ਕਾਲ ਤੁਰੰਤ ਕੱਟੋ! ਕਿਸੇ ਵੀ ਖਾਤੇ ਵਿੱਚ ਪੈਸੇ ਟ੍ਰਾਂਸਫਰ ਨਾ ਕਰੋ। ਰਾਸ਼ਟਰੀ ਸਾਈਬਰ ਹੈਲਪਲਾਈਨ 1930 \'ਤੇ ਕਾਲ ਕਰੋ।';
    let or = 'କଲ୍ ତୁରନ୍ତ କାଟି ଦିଅନ୍ତୁ! କୌଣସି ଖାତାକୁ ଟଙ୍କା ପଠାନ୍ତୁ ନାହିଁ। ଜାତୀୟ ସାଇବର୍ ହେଲ୍ପଲାଇନ୍ ୧୯୩୦ ରେ ଫୋନ୍ କରନ୍ତୁ।';
    let as = 'কলটো ততালিকে কাটি দিয়ক! কোনো একাউণ্টলৈ টকা নিদিব। ৰাষ্ট্ৰীয় চাইবাৰ হেল্পলাইন ১৯৩০ নম্বৰত যোগাযোগ কৰক।';
    let ur = 'فوراً کال کاٹ دیں! کسی بھی اکاؤنٹ میں رقم نہ بھیجیں اور قومی سائبر ہیلپ لائن 1930 پر رابطہ کریں۔';

    if (isDigitalArrest) {
      hi = 'सावधान! (ALERT) असली पुलिस या अदालत कभी वीडियो कॉल पर "डिजिटल अरेस्ट" नहीं करती। कॉल काटें और 1930 डायल करें। Genuine police never arrest via video.';
      gu = 'સાવધાન! (ALERT) અસલી પોલીસ કે અદાલત ક્યારેય વીડિયો કૉલ પર "ડિજિટલ અરેસ્ટ" કરતી નથી. કૉલ કાપીને 1930 ડાયલ કરો.';
      kn = 'ಎಚ್ಚರಿಕೆ! (ALERT) ನಿಜವಾದ ಪೊಲೀಸರು ಎಂದಿಗೂ ವೀಡಿಯೊ ಕರೆಯಲ್ಲಿ ಬಂಧಿಸುವುದಿಲ್ಲ. ಕರೆಯನ್ನು ಕಟ್ ಮಾಡಿ 1930 ಗೆ ಕರೆ ಮಾಡಿ.';
      ml = 'ജാഗ്രത! (ALERT) യഥാർത്ഥ പോലീസ് ഒരിക്കലും വീഡിയോ കോളിലൂടെ അറസ്റ്റ് ചെയ്യില്ല. കോൾ കട്ട് ചെയ്ത് 1930-ൽ വിളിക്കുക.';
      pa = 'ਸਾਵਧਾਨ! (ALERT) ਅਸਲੀ ਪੁਲਿਸ ਕਦੇ ਵੀਡੀਓ ਕਾਲ \'ਤੇ "ਡਿਜੀਟਲ ਅਰੈਸਟ" ਨਹੀਂ ਕਰਦੀ। 1930 \'ਤੇ ਕਾਲ ਕਰੋ।';
      or = 'ସାବଧାନ! (ALERT) ପ୍ରକୃତ ପୋଲିସ୍ କେବେ ଭିଡିଓ କଲ୍‌ରେ ଗିରଫ କରେ ନାହିଁ। କଲ୍ କାଟି ୧୯୩୦ କୁ ଡାଏଲ୍ କରନ୍ତୁ।';
      as = 'সাৱধান! (ALERT) প্ৰকৃত আৰক্ষীয়ে কেতিয়াও ভিডিঅ’ কলত গ্ৰেপ্তাৰ নকৰে। ১৯৩০ নম্বৰত ফোন কৰক।';
      ur = 'خبردار! (ALERT) اصل پولیس کبھی ویڈیو کال پر گرفتاری نہیں کرتی۔ کال کاٹ کر 1930 پر رابطہ کریں۔';
    } else if (isOtp) {
      hi = 'सावधान! (ALERT) बैंक अधिकारी कभी भी OTP, PIN या CVV नहीं मांगते। कॉल काटें और बैंक की आधिकारिक शाखा से संपर्क करें। Never share OTP.';
      gu = 'સાવધાન! (ALERT) બેંક અધિકારી ક્યારેય OTP, PIN અથવા CVV માંગતા નથી. કૉલ કાપો અને બેંક શાખાનો સંપર્ક કરો.';
      kn = 'ಎಚ್ಚರಿಕೆ! (ALERT) ಬ್ಯಾಂಕ್ ಅಧಿಕಾರಿಗಳು ಎಂದಿಗೂ OTP, PIN ಅಥವಾ CVV ಕೇಳುವುದಿಲ್ಲ. ಯಾರಿಗೂ OTP ನೀಡಬೇಡಿ.';
      ml = 'ജാഗ്രത! (ALERT) ബാങ്ക് ജീവനക്കാർ ഒടിപിയോ പിൻ നമ്പറോ ചോദിക്കില്ല. ആരുമായും ഒടിപി പങ്കിടരുത്.';
      pa = 'ਸਾਵਧਾਨ! (ALERT) ਬੈਂਕ ਕਰਮਚਾਰੀ ਕਦੇ ਓਟੀਪੀ ਜਾਂ ਪਿੰਨ ਨਹੀਂ ਮੰਗਦੇ। ਕਦੇ ਕਿਸੇ ਨਾਲ ਓਟੀਪੀ ਸਾਂਝਾ ਨਾ ਕਰੋ।';
      or = 'ସାବଧାନ! (ALERT) ବ୍ୟାଙ୍କ ଅଧିକାରୀ କେବେ ବି ଓଟିପି ବା ପିନ୍ ମାଗନ୍ତି ନାହିଁ।';
      as = 'সাৱধান! (ALERT) বেংকৰ কোনো বিষয়াই কেতিয়াও OTP বা PIN নিবিচাৰে। কাকো নিদিব।';
      ur = 'خبردار! (ALERT) بینک ملازمین کبھی بھی او ٹی پی یا پن نہیں مانگتے۔ کسی سے او ٹی پی شیئر نہ کریں۔';
    }

    return {
      recommended_action_en: en,
      recommended_action_hi: hi,
      recommended_action_gu: gu,
      recommended_action_mr: mr,
      recommended_action_bn: bn,
      recommended_action_ta: ta,
      recommended_action_te: te,
      recommended_action_kn: kn,
      recommended_action_ml: ml,
      recommended_action_pa: pa,
      recommended_action_or: or,
      recommended_action_as: as,
      recommended_action_ur: ur,
    };
  }

  if (riskLevel === 'MEDIUM') {
    return {
      recommended_action_en: 'Proceed with caution. Do not click links or share personal identifiers. Verify caller through official bank app.',
      recommended_action_hi: 'सावधानी बरतें (Caution)। किसी भी लिंक पर क्लिक न करें। केवल आधिकारिक बैंक ऐप से ही जानकारी सत्यापित करें।',
      recommended_action_gu: 'સાવચેત રહો (Caution). કોઈપણ લિંક પર ક્લિક ન કરો. માત્ર સત્તાવાર બેંક શાખા અથવા એપ્લિકેશન દ્વારા ચકાસણી કરો.',
      recommended_action_mr: 'काळजीपूर्वक रहा. कोणत्याही लिंकवर क्लिक करू नका. अधिकृत बँकेशी संपर्क साधा.',
      recommended_action_bn: 'সতর্ক থাকুন। কোনো লিঙ্কে ক্লিক করবেন না। অফিসিয়াল ব্যাংক অ্যাপ দিয়ে যাচাই করুন।',
      recommended_action_ta: 'எச்சரிக்கையுடன் இருங்கள். இணைப்புகளைக் கிளிக் செய்யாதீர்கள்.',
      recommended_action_te: 'జాగ్రత్తగా ఉండండి. లింక్‌లపై క్లిక్ చేయవద్దు.',
      recommended_action_kn: 'ಎಚ್ಚರಿಕೆಯಿಂದಿರಿ (Caution). ಯಾವುದೇ ಲಿಂಕ್‌ಗಳನ್ನು ಕ್ಲಿಕ್ ಮಾಡಬೇಡಿ. ಅಧಿಕೃತ ಬ್ಯಾಂಕ್ ಆ್ಯಪ್ ಮೂಲಕ ಪರಿಶೀಲಿಸಿ.',
      recommended_action_ml: 'ജാഗ്രത പാലിക്കുക. ലിങ്കുകളിൽ ക്ലിക്ക് ചെയ്യരുത്. ബാങ്ക് ആപ്പ് വഴി നേരിട്ട് സ്ഥിരീകരിക്കുക.',
      recommended_action_pa: 'ਸਾਵਧਾਨ ਰਹੋ। ਕਿਸੇ ਵੀ ਸ਼ੱਕੀ ਲਿੰਕ \'ਤੇ ਕਲਿੱਕ ਨਾ ਕਰੋ।',
      recommended_action_or: 'ସତର୍କ ରୁହନ୍ତୁ। କୌଣସି ଲିଙ୍କ୍ ଉପରେ କ୍ଲିକ୍ କରନ୍ତୁ ନାହିଁ।',
      recommended_action_as: 'সাৱধান হওক। কোনো অস্বাভাৱিক লিংকত ক্লিক নকৰিব।',
      recommended_action_ur: 'احتیاط برتیں۔ کسی بھی نامعلوم لنک پر کلک نہ کریں اور بینک کی آفیشل ایپ سے تصدیق کریں۔',
    };
  }

  return {
    recommended_action_en: 'No scam indicators detected so far. Call appears legitimate. Always remain vigilant with personal information.',
    recommended_action_hi: 'सुरक्षित (Safe): अभी तक कोई धोखाधड़ी के संकेत नहीं मिले हैं। कॉल सामान्य लग रही है। अपनी गोपनीय जानकारी कभी साझा न करें।',
    recommended_action_gu: 'સુરક્ષિત (Safe): હજુ સુધી કોઈ છેતરપિંડીના સંકેત મળ્યા નથી. કૉલ સામાન્ય લાગે છે. હંમેશા અંગત માહિતી ગુપ્ત રાખો.',
    recommended_action_mr: 'सुरक्षित (Safe): आत्तापर्यंत कोणताही फसवणुकीचा संकेत आढळलेला नाही. कॉल सुरक्षित वाटत आहे.',
    recommended_action_bn: 'নিরাপদ (Safe): এখনও কোনো প্রতারণার লক্ষণ সনাক্ত করা যায়নি। কলটি সাধারণ বলে মনে হচ্ছে।',
    recommended_action_ta: 'பாதுகாப்பானது (Safe): இதுவரை மோசடி அறிகுறிகள் எதுவும் கண்டறியப்படவில்லை.',
    recommended_action_te: 'సురక్షితం (Safe): ఇప్పటివరకు ఎటువంటి మోసపూరిత సంకేతాలు కనిపించలేదు.',
    recommended_action_kn: 'ಸುರಕ್ಷಿತ (Safe): ಇಲ್ಲಿಯವರೆಗೆ ಯಾವುದೇ ವಂಚನೆಯ ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಕರೆ ಸುರಕ್ಷಿತವಾಗಿದೆ.',
    recommended_action_ml: 'സുരക്ഷിതം (Safe): ഇതുവരെ തട്ടിപ്പ് ലക്ഷണങ്ങൾ കണ്ടെത്തിയിട്ടില്ല. സംഭാഷണം സുരക്ഷിതമാണ്.',
    recommended_action_pa: 'ਸੁਰੱਖਿਅਤ (Safe): ਹੁਣ ਤੱਕ ਕੋਈ ਧੋਖਾਧੜੀ ਦਾ ਸੰਕੇਤ ਨਹੀਂ ਮਿਲਿਆ।',
    recommended_action_or: 'ସୁରକ୍ଷିତ (Safe): ବର୍ତ୍ତମାନ ସୁଦ୍ଧା କୌଣସି ଠକେଇ ସଂକେତ ମିଳିନାହିଁ।',
    recommended_action_as: 'সুৰক্ষিত (Safe): এতিয়ালৈকে কোনো জালিয়াতিৰ লক্ষণ পোৱা হোৱা নাই।',
    recommended_action_ur: 'محفوظ (Safe): فی الحال کسی دھوکہ دہی کے آثار نہیں ملے۔ کال عمومی معلوم ہوتی ہے۔',
  };
}

/**
 * Analyzes audio transcript chunk or cumulative text using rule-based pattern heuristics
 */
export function analyzeTranscriptChunk(
  text: string,
  existingFlags: DetectedRedFlag[] = [],
  currentTimeSec: number = 0
): AnalysisResult {
  const detectedFlags: DetectedRedFlag[] = [...existingFlags];
  const detectedKeys = new Set(existingFlags.map((f) => `${f.type}:${f.evidence.slice(0, 20)}`));
  const detectedTypes = new Set<RedFlagType>(existingFlags.map((f) => f.type));

  let score = existingFlags.reduce((sum, f) => sum + (f.severity * 8), 0);
  let maxSeverity = existingFlags.reduce((max, f) => Math.max(max, f.severity), 0);

  // Check genuine indicators
  for (const pattern of GENUINE_INDICATORS) {
    if (pattern.test(text)) {
      score = Math.max(0, score - 20);
    }
  }

  for (const rule of SCAM_RULES) {
    const match = text.match(rule.regex);
    if (match) {
      // If caller is advising customer NOT to share OTP/password, do not flag as scam
      if (rule.type === 'OTP_REQUEST' && /(never ask|will never ask|do not share|never share)/i.test(text)) {
        continue;
      }

      const evidence = match[0];
      const flagKey = `${rule.type}:${evidence.slice(0, 20)}`;

      if (!detectedKeys.has(flagKey)) {
        detectedKeys.add(flagKey);
        detectedTypes.add(rule.type);
        score += rule.weight;
        maxSeverity = Math.max(maxSeverity, rule.severity);

        detectedFlags.push({
          id: `flag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: rule.type,
          evidence: evidence,
          explanation_en: rule.explanation_en,
          explanation_hi: rule.explanation_hi,
          explanation_gu: rule.explanation_gu,
          explanation_mr: rule.explanation_mr,
          explanation_bn: rule.explanation_bn,
          explanation_ta: rule.explanation_ta,
          explanation_te: rule.explanation_te,
          explanation_kn: rule.explanation_kn,
          explanation_ml: rule.explanation_ml,
          explanation_pa: rule.explanation_pa,
          explanation_or: rule.explanation_or,
          explanation_as: rule.explanation_as,
          explanation_ur: rule.explanation_ur,
          severity: rule.severity,
          timestampSec: currentTimeSec,
        });
      }
    }
  }

  const risk_level = computeRiskLevel(score, maxSeverity);
  const is_suspicious = risk_level === 'HIGH' || risk_level === 'CRITICAL' || risk_level === 'MEDIUM';
  const confidence = Math.min(0.98, Math.max(0.45, score > 0 ? 0.65 + (score / 150) * 0.3 : 0.92));
  const recommendations = generateRecommendations(risk_level, detectedTypes);

  return {
    risk_level,
    is_suspicious,
    detected_red_flags: detectedFlags,
    ...recommendations,
    confidence: Number(confidence.toFixed(2)),
    overall_score: score,
  };
}
