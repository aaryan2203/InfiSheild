
"""
InfiShield AI - Real-Time Scam Call Detector
Streamlit hackathon prototype.
"""

import time
import streamlit as st

from audio_processor import AudioChunkProcessor
from detector import analyze_chunk_local
from translations import LANGUAGES

st.set_page_config(
    page_title="InfiShield AI - Scam Call Detector",
    page_icon="🛡️",
    layout="wide",
)

# --------------------------------------------------
# Styling
# --------------------------------------------------

st.markdown(
    """
    <style>
    .main-title {
        font-size: 2.2rem;
        font-weight: 800;
        color: #60a5fa;
        margin-bottom: 0;
    }
    .tagline {
        color: #94a3b8;
        font-size: 1.1rem;
        margin-top: 4px;
        margin-bottom: 1.5rem;
    }
    .threat-card-critical {
        background: #fee2e2;
        border: 2px solid #ef4444;
        border-radius: 12px;
        padding: 1rem;
        color: #991b1b;
    }
    .threat-card-high {
        background: #ffedd5;
        border: 2px solid #f97316;
        border-radius: 12px;
        padding: 1rem;
        color: #9a3412;
    }
    .threat-card-safe {
        background: #ecfdf5;
        border: 2px solid #10b981;
        border-radius: 12px;
        padding: 1rem;
        color: #065f46;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# --------------------------------------------------
# Header and language selection
# --------------------------------------------------

col1, col2 = st.columns([3, 1])

with col1:
    st.markdown(
        '<div class="main-title">🛡️ InfiShield AI</div>',
        unsafe_allow_html=True,
    )
    st.markdown(
        '<div class="tagline">'
        'Your AI Guardian Against Scam Calls'
        '</div>',
        unsafe_allow_html=True,
    )

with col2:
    selected_lang = st.selectbox(
        "🌐 Language / भाषा / ગુજરાતી",
        options=list(LANGUAGES.keys()),
        format_func=lambda code: LANGUAGES[code],
        index=1,
    )

# --------------------------------------------------
# Demo scenarios
# --------------------------------------------------

processor = AudioChunkProcessor()
scenarios = processor.get_demo_scenarios()

if not scenarios:
    st.error("No demo scenarios are available.")
    st.stop()

st.sidebar.header("📁 Audio Call Selection")

scenario_titles = [s["title"] for s in scenarios]
scenario_titles.append("Upload Custom WAV Call")

choice = st.sidebar.selectbox(
    "Choose demo scenario:",
    scenario_titles,
)

uploaded_file = None

if choice == "Upload Custom WAV Call":
    uploaded_file = st.sidebar.file_uploader(
        "Upload audio file (.wav)",
        type=["wav"],
    )
    st.sidebar.info(
        "Custom audio transcription and analysis must be "
        "implemented separately. Uploading alone does not "
        "analyze the recording."
    )

scenario_data = next(
    (s for s in scenarios if s["title"] == choice),
    None,
)

# --------------------------------------------------
# Call controls
# --------------------------------------------------

st.subheader("Simulated Call Control & Playback")

col_play, col_middle, col_reset = st.columns([1, 1, 1])

with col_play:
    play_btn = st.button(
        "▶️ Play Demo Call",
        use_container_width=True,
        disabled=(scenario_data is None),
    )

with col_middle:
    st.caption("Chunk-by-chunk demo analysis")

with col_reset:
    reset_btn = st.button(
        "⏹️ Reset Dashboard",
        use_container_width=True,
    )

# --------------------------------------------------
# Dashboard placeholders
# --------------------------------------------------

col_left, col_right = st.columns(2)

with col_left:
    st.markdown("### 🎙️ Live Call Audio & Transcript")
    transcript_area = st.empty()
    progress_bar = st.progress(0)

with col_right:
    st.markdown("### ⚠️ Scam Intelligence & Advisory")
    risk_display = st.empty()
    flags_display = st.container()
    action_display = st.empty()

# --------------------------------------------------
# Reset action
# --------------------------------------------------

if reset_btn:
    transcript_area.info(
        "Dashboard reset. Press Play Demo Call to begin."
    )
    progress_bar.progress(0)
    risk_display.info("Status: Ready to Monitor")
    flags_display.empty()
    action_display.empty()

elif play_btn and scenario_data is not None:
    from html import escape

    chunks = scenario_data.get("chunks", [])

    if not chunks:
        st.error("This demo scenario contains no transcript chunks.")
        st.stop()

    flags = []
    full_text = ""
    result = {
        "risk_level": "UNKNOWN",
        "detected_red_flags": [],
    }

    transcript_area.info("Starting demo analysis...")
    progress_bar.progress(0)
    risk_display.info("Analyzing call...")
    flags_display.empty()
    action_display.empty()

    for i, chunk in enumerate(chunks):
        time.sleep(1.5)

        segment = chunk.get("text", "")
        full_text += " " + segment
        current_time = chunk.get("end", 0)

        result = analyze_chunk_local(
            full_text,
            flags,
            current_time_sec=current_time,
        )

        flags = result.get("detected_red_flags", [])
        risk = result.get("risk_level", "UNKNOWN")

        progress_bar.progress((i + 1) / len(chunks))

        transcript_area.markdown(
            f"""
            **Latest Segment**

            > {escape(segment)}

            **Full Transcript**

            {escape(full_text.strip())}
            """
        )

        if risk == "CRITICAL":
            risk_display.markdown(
                """
                <div class="threat-card-critical">
                    <h3>🚨 CRITICAL RISK DETECTED</h3>
                    <p>Strong scam indicators were identified.</p>
                </div>
                """,
                unsafe_allow_html=True,
            )
        elif risk == "HIGH":
            risk_display.markdown(
                """
                <div class="threat-card-high">
                    <h3>⚠️ HIGH RISK DETECTED</h3>
                    <p>Potential scam indicators were identified.</p>
                </div>
                """,
                unsafe_allow_html=True,
            )
        else:
            risk_display.markdown(
                f"""
                <div class="threat-card-safe">
                    <h3>ℹ️ {escape(str(risk))} RISK</h3>
                    <p>No high-risk classification at this stage.
                    This does not guarantee that the call is genuine.</p>
                </div>
                """,
                unsafe_allow_html=True,
            )

        # Render the current flags once per update.
        with flags_display.container():
            st.markdown("### 🚩 Detected Red Flags")

            if flags:
                for flag in flags:
                    explanation = flag.get(
                        f"explanation_{selected_lang}",
                        flag.get(
                            "explanation_en",
                            "Suspicious behavior detected.",
                        ),
                    )

                    with st.container(border=True):
                        st.markdown(
                            f"**⚠️ {flag.get('type', 'WARNING')}**"
                        )
                        st.write(
                            f"Evidence: {flag.get('evidence', 'Not specified')}"
                        )
                        st.caption(explanation)
            else:
                st.info("No red flags identified yet.")

        # Safety advice from the detector, if provided.
        recommendation = result.get(
            f"recommended_action_{selected_lang}",
            result.get(
                "recommended_action_en",
                "Do not share OTPs, PINs, passwords, or money "
                "with an unverified caller.",
            ),
        )

        action_display.info(
            f"**Safety Recommendation**\n\n"
            f"{recommendation}\n\n"
            "**India Cyber Crime Helpline: 1930**"
        )

    st.success(
        "Demo analysis completed. Review the final risk assessment "
        "and detected evidence above."
    )

# --------------------------------------------------
# Initial dashboard state
# --------------------------------------------------

else:
    transcript_area.info(
        "Press Play Demo Call to begin chunk-by-chunk analysis."
    )
    progress_bar.progress(0)
    risk_display.info("Status: Ready to Monitor")

    with flags_display.container():
        st.markdown("### 🚩 Detected Red Flags")
        st.info("No analysis has been run yet.")

    action_display.info(
        "Safety advice will appear when analysis begins."
    )
