"""
InfiShield AI — Real-Time Scam Call Detector (Streamlit MVP)
"""

import time
import streamlit as st
from audio_processor import AudioChunkProcessor
from detector import analyze_chunk_local
from translations import LANGUAGES, UI_TEXT, ALERT_MESSAGES

st.set_page_config(
    page_title="InfiShield AI — Scam Call Detector",
    page_icon="🛡️",
    layout="wide"
)

# Custom Styling
st.markdown("""
<style>
    .main-title { font-size: 2.2rem; font-weight: 800; color: #1e293b; margin-bottom: 0; }
    .tagline { color: #64748b; font-size: 1.1rem; margin-top: -8px; margin-bottom: 1.5rem; }
    .threat-card-critical { background: #fee2e2; border: 2px solid #ef4444; border-radius: 12px; padding: 1.2rem; color: #991b1b; }
    .threat-card-high { background: #ffedd5; border: 2px solid #f97316; border-radius: 12px; padding: 1.2rem; color: #9a3412; }
    .threat-card-safe { background: #ecfdf5; border: 2px solid #10b981; border-radius: 12px; padding: 1.2rem; color: #065f46; }
    .red-flag-pill { background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 0.6rem; margin-bottom: 0.5rem; }
</style>
""", unsafe_allow_html=True)

# Top Bar
col1, col2 = st.columns([3, 1])
with col1:
    st.markdown('<div class="main-title">🛡️ InfiShield AI</div>', unsafe_allow_html=True)
    st.markdown('<div class="tagline">Your AI Guardian Against Scam Calls</div>', unsafe_allow_html=True)

with col2:
    selected_lang = st.selectbox("🌐 Language / भाषा / ભાષા", options=list(LANGUAGES.keys()), format_func=lambda x: LANGUAGES[x], index=1)

processor = AudioChunkProcessor()
scenarios = processor.get_demo_scenarios()

st.sidebar.header("📁 Audio Call Selection")
scenario_titles = [s["title"] for s in scenarios] + ["Upload Custom WAV Call"]
choice = st.sidebar.selectbox("Choose demo scenario:", scenario_titles)

uploaded_file = None
if choice == "Upload Custom WAV Call":
    uploaded_file = st.sidebar.file_uploader("Upload audio file (.wav)", type=["wav"])

# Main Dashboard
st.subheader("Simulated Call Control & Playback")
col_ctl1, col_ctl2, col_ctl3 = st.columns(3)
play_btn = col_ctl1.button("▶️ Play Demo Call", use_container_width=True)
reset_btn = col_ctl3.button("⏹️ Reset State", use_container_width=True)

# State initialization
if "call_running" not in st.session_state:
    st.session_state.call_running = False

scenario_data = scenarios[0]
for s in scenarios:
    if s["title"] == choice:
        scenario_data = s

# Main Layout
col_left, col_right = st.columns([1, 1])

with col_left:
    st.markdown("### 🎙️ Live Call Audio & Transcript")
    transcript_area = st.empty()
    progress_bar = st.progress(0.0)

with col_right:
    st.markdown("### ⚠️ Scam Intelligence & Advisory")
    risk_display = st.empty()
    flags_display = st.empty()
    action_display = st.empty()

if play_btn:
    st.session_state.call_running = True
    flags = []
    full_text = ""
    chunks = scenario_data["chunks"]

    for i, chunk in enumerate(chunks):
        time.sleep(1.5)  # Simulate real playback duration
        full_text += " " + chunk["text"]
        result = analyze_chunk_local(full_text, flags, current_time_sec=chunk["end"])
        flags = result["detected_red_flags"]

        # Update left
        progress_bar.progress((i + 1) / len(chunks))
        transcript_area.markdown(f"**Latest Segment:**\n\n> {chunk['text']}\n\n**Full Transcript:**\n{full_text}")

        # Update right
        risk = result["risk_level"]
        if risk in ["CRITICAL", "HIGH"]:
            risk_display.markdown(f"""
            <div class="threat-card-critical">
                <h3>🚨 {risk} RISK DETECTED!</h3>
                <p>Warning triggered before call ended!</p>
            </div>
            """, unsafe_allow_html=True)
        else:
            risk_display.markdown(f"""
            <div class="threat-card-safe">
                <h3>✅ {risk} RISK</h3>
                <p>No critical scam patterns detected.</p>
            </div>
            """, unsafe_allow_html=True)

        if flags:
            flag_html = "<h4>Detected Red Flags:</h4>"
            for f in flags:
                exp = f.get(f"explanation_{selected_lang}", f.get("explanation_hi", f["explanation_en"]))
                flag_html += f"""
                <div class="red-flag-pill">
                    <b>[{f['type']}]</b> "{f['evidence']}"<br>
                    <span style="color:#475569">{exp}</span>
                </div>
                """
            flags_display.markdown(flag_html, unsafe_allow_html=True)

        rec = result.get(f"recommended_action_{selected_lang}", result["recommended_action_hi"])
        action_display.info(f"**Safety Recommendation:**\n{rec}\n\n**Emergency Helpline: Call 1930**")

elif reset_btn:
    st.session_state.call_running = False
    progress_bar.progress(0.0)
    transcript_area.info("Press Play Demo Call to start.")
    risk_display.info("System Ready")
    flags_display.empty()
    action_display.empty()
else:
    transcript_area.info("Press Play Demo Call to begin chunk-by-chunk stream analysis.")
    risk_display.info("Status: Ready to Monitor")
