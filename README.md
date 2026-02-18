# Lyria AI Studio

**AI Music Generation Studio** - Professional desktop application for creating, mixing, and exporting AI-generated music with real-time controls and visual feedback.

Multi-model support including Google Lyria Realtime, Lyria 2, Lyria 3, Meta MusicGen, and more.

![Platform](https://img.shields.io/badge/platform-macOS-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📋 Table of Contents

- [Features](#-features)
- [Requirements](#-requirements)
- [Installation](#-installation)
- [Getting Started](#-getting-started)
  - [Option 1: Google Lyria Realtime (Recommended)](#option-1-lyria-realtime-recommended)
  - [Option 2: MusicGen (Free, No API Key)](#option-2-musicgen-free-no-api-key)
  - [Option 3: Google Lyria 2 (Vertex AI)](#option-3-lyria-2-vertex-ai)
  - [Option 4: Google Lyria 3 (Vertex AI - Latest)](#option-4-lyria-3-vertex-ai---latest)
- [Lyria 3 vs Lyria 2](#-lyria-3-vs-lyria-2)
- [Usage Guide](#-usage-guide)
- [Troubleshooting](#-troubleshooting)
- [Technical Details](#-technical-details)
- [AI Models Comparison](#-ai-models-comparison)
- [Official Documentation](#-official-documentation)

---

## 🎵 Features

### Core Generation
- **Three Lyria Models**: Google Lyria Realtime (streaming), Lyria 2, and Lyria 3 (batch generation via Vertex AI)
- **Real-time Audio Generation**: Continuous, never-ending music that evolves based on your prompts
- **Ultra-Low Latency**: ~2 seconds from control change to audible effect
- **Intelligent Prompt Processing**: Auto-detect BPM and key from text prompts

### Parametric Controls
- **BPM Control**: 60–200 BPM range with auto-detection from prompts
- **Key/Scale Locking**: Set root note and musical mode
- **Density Slider**: Control note complexity (sparse → busy)
- **Brightness Slider**: Frequency emphasis (dark → bright)
- **Guidance Strength**: How strictly the model follows prompts (0.0–6.0)

### Mixing & Composition
- **Multi-weighted Prompt Mixer**: Blend multiple text prompts with weight percentages
- **Negative Prompts**: Explicitly exclude unwanted elements
- **Vocal Mixer**: Add vocal soundtracks to instrumental tracks
- **Preset Management**: Save and load favorite configurations

### Output & Visualization
- **Visual Waveform/Spectrum Analyzer**: Real-time audio feedback
- **Track Library**: Manage generated tracks with preview and playback
- **Export Formats**: Save as MP3 (320kbps, 128kbps) or WAV (48kHz stereo)
- **Track Length Control**: Specify duration for each generation

### User Interface
- **Three Themes**: Tokyo Night (default), Dark, Light
- **Fullscreen Maximized Window**: All controls visible without scrolling
- **Tooltips**: Contextual help for every control
- **Secure Settings**: Encrypted API key storage

---

## 📦 Requirements

### System Requirements
- **macOS** 26.2 or later (arm64 or x64)
- **8GB RAM** minimum (16GB recommended for multiple tracks)
- **Internet connection** for API access

### Software Dependencies
- [Bun](https://bun.sh/) (JavaScript runtime and package manager)
- [Rust](https://www.rust-lang.org/) (for Tauri backend)

### API Requirements

#### For Google Lyria Realtime (Recommended)
- **Gemini API Key** (free tier available)
- No special approvals needed

#### For Google Lyria 2 / Lyria 3 (Vertex AI)
- Google Cloud project with billing enabled
- Vertex AI API enabled
- Allowlist approval from Google (Lyria 2: `lyria-002`, Lyria 3: `lyria-003`)
- OAuth2 access token (expires hourly)

---

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd google-lyria-realtime
```

### 2. Install Dependencies
```bash
# Install JavaScript dependencies
bun install

# Tauri dependencies are automatically managed
```

### 3. Run Development Server
```bash
./run-dev.sh
```

The app will launch in a maximized window with hot reload enabled.

---

## 🎯 Getting Started

### Option 1: Google Lyria Realtime (Recommended)

**Google Lyria Realtime** is the easiest way to get started. It works with a free Gemini API key and requires no special approvals.

#### Step 1: Get a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated key (starts with `AIza...`)

**Important Notes:**
- Free tier includes **60 requests per minute**
- No credit card required
- API key never expires unless you delete it

#### Step 2: Configure Lyria AI Studio

1. Launch **Lyria AI Studio**
2. Click the **Settings** icon in the top-right corner
3. Under **"AI Model"**, select **"Google Lyria Realtime"** (should be default)
4. Paste your API key into the **"Gemini API Key"** field
5. Click **"Save Changes"**

#### Step 3: Generate Your First Track

1. In the **Prompt Mixer** section, enter a prompt:
   ```
   ambient electronic chill, 90 bpm, dreamy atmosphere
   ```
2. Set **Track Length** (e.g., 30 seconds)
3. Click **"Generate"**
4. Watch the visualizer show real-time generation progress
5. Once complete, click **"Preview"** to listen

**Prompt Tips for Google Lyria Realtime:**
- Keep prompts under **200 characters**
- Be specific but concise: "jazz piano trio, 120 bpm, upbeat"
- Include genre, tempo, mood, and key instruments
- Avoid complex multi-sentence descriptions

---

### Option 2: MusicGen (⚠️ API Deprecated)

**⚠️ Update (2026-02-04):** Hugging Face has deprecated their free Inference API (`api-inference.huggingface.co`). MusicGen is no longer available for free through this app.

**MusicGen** by Meta is an open-source model, but now requires:
- **Hugging Face Pro** subscription (paid) with Inference Endpoints
- **Replicate API** (paid, ~$0.0023/second)
- **Self-hosting** with a GPU (RTX 3090+ or A100)

**Recommendation:** Use **Google Lyria Realtime** (Option 1) instead - it's free with a Gemini API key and works immediately without approval or payment.

<details>
<summary>MusicGen Setup (for reference - not currently working)</summary>

#### Step 1: Select MusicGen in Settings

1. Launch **Lyria AI Studio**
2. Click the **Settings** icon in the top-right corner
3. Under **"AI Model"**, select **"MusicGen"**
4. Optionally, choose model size:
   - **Small**: Fastest, lower quality (~300M parameters)
   - **Medium**: Balanced (recommended, ~1.5B parameters)
   - **Large**: Best quality, slowest (~3.3B parameters)

#### Step 2: (Deprecated) Hugging Face Token

The free Hugging Face Inference API is no longer available. You would need a Pro subscription to use MusicGen through Hugging Face.

#### Step 3: Generate Music

1. Enter a prompt:
   ```
   upbeat electronic dance music with synths and drums
   ```
2. Set Track Length (e.g., 30 seconds)
3. Click **"Generate"**

**Prompt Tips for MusicGen:**
- Supports longer prompts (up to 500 characters)
- Describe genre, mood, instruments
- Examples: "lo-fi hip hop beat with jazzy piano", "epic orchestral soundtrack"
- Note: MusicGen generates instrumentals only (no vocals)

</details>

---

### Option 3: Google Lyria 2 (Vertex AI)

**Note:** Google Lyria 2 requires Vertex AI access approval. Most users will encounter a 404 error without it. **Use Google Lyria Realtime instead unless you have explicit access.**

#### Vertex AI Setup (shared by Lyria 2 and Lyria 3)

1. Apply for access at [Vertex AI Music Generation](https://cloud.google.com/vertex-ai/generative-ai/docs/music/overview)
2. Set up a [Google Cloud project](https://console.cloud.google.com/) with billing enabled
3. Enable the Vertex AI API:
   ```bash
   gcloud services enable aiplatform.googleapis.com --project=YOUR_PROJECT_ID
   ```
4. Install the Cloud SDK and authenticate:
   ```bash
   brew install --cask google-cloud-sdk
   gcloud init && gcloud auth login
   ```
5. Generate an access token (expires after 1 hour):
   ```bash
   gcloud auth print-access-token
   ```

#### Configure in Lyria AI Studio

1. Open **Settings**
2. Under **"AI Model"**, select **"Google Lyria 2 (Vertex AI)"**
3. Fill in **Project ID**, **Region**, and **Access Token**
4. Click **"Save Changes"**

#### Generate with Lyria 2

Enter a detailed prompt (up to **500 characters**):
```
Cinematic orchestral score with soaring strings, heroic brass fanfare,
dramatic timpani rolls, 140 bpm, epic fantasy adventure theme, key of D major
```

---

### Option 4: Google Lyria 3 (Vertex AI - Latest)

Google Lyria 3 (`lyria-003`) is the latest generation model available through Vertex AI. It uses the same Vertex AI setup as Lyria 2 (see above).

#### Configure in Lyria AI Studio

1. Complete the [Vertex AI Setup](#vertex-ai-setup-shared-by-lyria-2-and-lyria-3) above
2. Open **Settings**
3. Under **"AI Model"**, select **"Google Lyria 3 (Vertex AI)"**
4. Fill in **Project ID**, **Region**, and **Access Token**
5. Click **"Save Changes"**

#### Generate with Lyria 3

Enter a rich prompt (up to **1000 characters**):
```
Progressive electronic track blending organic and synthetic textures.
Start with a minimal ambient intro of granular pads, evolve into a
driving four-on-the-floor beat at 126 bpm with acid bass, arpeggiated
synths in A minor, side-chain compression, filtered builds, and a
euphoric breakdown with reverbed piano chords
```

**Token Expiration (Lyria 2 & 3):**
When you see an authentication error, run:
```bash
gcloud auth print-access-token
```
And update the Access Token in Settings.

---

## 🆚 Lyria 3 vs Lyria 2

| Feature | Lyria 2 (`lyria-002`) | Lyria 3 (`lyria-003`) |
|---|---|---|
| **Max prompt length** | 500 characters | 1000 characters |
| **Generation quality** | High | Highest - improved fidelity and coherence |
| **Prompt understanding** | Style + mood descriptions | Richer understanding of structure, instrumentation, and dynamics |
| **API endpoint** | Vertex AI `v1` (`:predict`) | Vertex AI `v1` (`:predict`) |
| **Authentication** | GCP access token | GCP access token (same setup) |
| **Pricing** | Paid (GCP billing) | Paid (GCP billing) |
| **Access** | Limited preview / allowlist | Limited preview / allowlist |

**When to use Lyria 3 over Lyria 2:**
- You need longer, more descriptive prompts (up to 1000 chars)
- You want the highest generation quality available
- Your prompts describe complex song structure (intros, builds, breakdowns)
- You're targeting production-quality output

**When Lyria 2 is sufficient:**
- Shorter prompt descriptions (under 500 chars)
- Quick generation with simpler style cues
- You already have a working Lyria 2 workflow

Both models share the same Vertex AI credentials (Project ID, Region, Access Token). Switching between them is a single dropdown change in Settings.

---

## 📖 Usage Guide

### Prompt Mixer

**Purpose:** Define what music you want to generate

**How to Use:**
1. Enter descriptive text (genre, mood, tempo, instruments)
2. Press **Enter** or click **"+"** to add the prompt
3. Add multiple prompts and adjust their weights (0-100%)
4. Higher weights = stronger influence

**Examples:**
- "deep house, 128 bpm, hypnotic bassline"
- "lo-fi hip hop, jazzy chords, vinyl crackle"
- "ambient drone, dark atmospheric pads"

### Negative Prompts

**Purpose:** Exclude unwanted elements

**How to Use:**
Enter what you DON'T want:
- "no drums"
- "no vocals"
- "no distortion"

### Parametric Controls

| Control | Range | Description |
|---------|-------|-------------|
| **BPM** | 60-200 | Tempo control (auto-detected from prompts) |
| **Key** | C-B | Root note for harmonic foundation |
| **Scale** | Major, Minor, etc. | Musical mode/scale |
| **Density** | 0.0-1.0 | Note complexity (0 = sparse, 1 = busy) |
| **Brightness** | 0.0-1.0 | Frequency emphasis (0 = dark, 1 = bright) |
| **Guidance** | 0.0-6.0 | Prompt adherence (higher = stricter) |

### Generation Workflow

1. **Configure Prompts** → Enter descriptions and weights
2. **Set Parameters** → Adjust BPM, key, density, brightness
3. **Set Track Length** → Choose duration (e.g., 30-60 seconds)
4. **Generate** → Click "Generate" and wait
5. **Preview** → Listen to the generated track
6. **Save** → Click "Save As" and choose format (MP3/WAV)

### Track Library

**Generated tracks appear here with:**
- Track name (auto-generated timestamp)
- Duration
- Preview button (🎵)
- Save As button (💾)

**Actions:**
- **Preview**: Play the track in the visualizer
- **Save As**: Export to MP3 (320k/128k) or WAV

### Visualizer

**Shows:**
- Waveform during generation/playback
- Frequency spectrum (real-time analysis)
- Generation status messages
- Error messages (if any)

---

## 🔧 Troubleshooting

### Common Issues

#### "Prompt was filtered" Error
**Cause:** API rejected the prompt (content policy violation)  
**Solution:**
- Remove potentially inappropriate content
- Simplify the prompt
- Avoid brand names or copyrighted references

#### "Authentication failed" (Lyria 2 / Lyria 3)
**Cause:** Access token expired (tokens last 1 hour)  
**Solution:**
```bash
gcloud auth print-access-token
```
Update the token in Settings → Vertex AI → Access Token

#### "Model not found" (Lyria 2 / Lyria 3)
**Cause:** Your project doesn't have Lyria 2 or Lyria 3 access  
**Solution:**
- Apply for access at [Vertex AI Music Docs](https://cloud.google.com/vertex-ai/generative-ai/docs/music/overview)
- Switch to Google Lyria Realtime in Settings

#### "Invalid API Key" (Google Lyria Realtime)
**Cause:** API key is incorrect or revoked  
**Solution:**
- Verify key at [Google AI Studio](https://aistudio.google.com/apikey)
- Create a new key if necessary
- Ensure no extra spaces when pasting

#### No Audio Output
**Cause:** Audio engine not initialized or generation failed  
**Solution:**
1. Check browser console (Cmd+Option+I) for errors
2. Verify API key is saved
3. Try reloading the app
4. Check internet connection

#### Timer Keeps Running After Track Ends
**Cause:** Bug in audio engine (should be fixed in latest version)  
**Solution:**
- Reload the app
- Update to latest version

---

## 🛠 Technical Details

### Architecture

```
┌─────────────────────────────────────────┐
│          Tauri Desktop App             │
│  ┌──────────────────────────────────┐  │
│  │   React + TypeScript Frontend    │  │
│  │  - Zustand State Management      │  │
│  │  - Web Audio API (Visualizer)    │  │
│  │  - Radix UI Components           │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │      Audio Engine (TS)           │  │
│  │  - Stream Processing             │  │
│  │  - Buffer Management             │  │
│  │  - Export (MP3/WAV)              │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │     Lyria Client (TS)            │  │
│  │  - RealTime: WebSocket (@google) │  │
│  │  - Lyria 2/3: REST API (Vertex AI) │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
           │                    │
           ▼                    ▼
    Gemini API         Vertex AI REST API
  (Google Lyria Realtime)    (Google Lyria 2 / 3)
```

### Audio Specifications

| Property | Value |
|----------|-------|
| Sample Rate | 48,000 Hz |
| Channels | 2 (Stereo) |
| Bit Depth | 16-bit (internal), 32-bit float (processing) |
| Latency | ~2 seconds (RealTime generation) |
| Buffer Size | 4096 samples |

### Export Formats

| Format | Bitrate | Quality | Use Case |
|--------|---------|---------|----------|
| **MP3 320kbps** | 320 kb/s | High | Streaming, sharing |
| **MP3 128kbps** | 128 kb/s | Medium | Smaller file size |
| **WAV** | 1536 kb/s | Lossless | Professional editing |

### Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Desktop**: Tauri 2.1 (Rust backend)
- **State**: Zustand
- **UI**: Radix UI primitives, Tailwind CSS
- **Audio**: Web Audio API, lamejs (MP3 encoding)
- **APIs**: Google Gemini SDK, Vertex AI REST

---

## 🎼 AI Models Comparison

**Wondering which AI music model to use?**

This app uses **Google Lyria** (Realtime, Lyria 2, and Lyria 3), but there are many other AI music generation models available. Each has different strengths, pricing, and use cases.

📖 **See the complete comparison:** [MODELS_COMPARISON.md](./MODELS_COMPARISON.md)

### Quick Overview

| Model | Rating | Best For | Vocals | API | Self-Host |
|-------|--------|----------|--------|-----|-----------|
| **Suno** | ⭐⭐⭐⭐⭐ | Complete songs with lyrics | ✅ | ❌ | ❌ |
| **Udio** | ⭐⭐⭐⭐⭐ | High-fidelity complex music | ✅ | ❌ | ❌ |
| **Lyria 3** | ⭐⭐⭐⭐⭐ | Highest quality batch generation | ❌ | ✅ | ❌ |
| **Lyria 2** | ⭐⭐⭐⭐½ | Batch generation via Vertex AI | ❌ | ✅ | ❌ |
| **Lyria Realtime** | ⭐⭐⭐⭐½ | Real-time/interactive | ❌ | ✅ | ❌ |
| **MusicGen** | ⭐⭐⭐⭐ | Instrumentals & self-hosting | ❌ | ✅ | ✅ |
| **Stable Audio** | ⭐⭐⭐½ | Sound FX & short samples | ❌ | ✅ | ✅ |

**Why Lyria AI Studio uses Lyria:**
- ✅ Free tier available (60 requests/min)
- ✅ Ultra-low latency (~2 seconds)
- ✅ Real-time parameter control
- ✅ Official API with SDKs
- ✅ Good instrumental quality

**For detailed comparisons, pricing, and links:** See [MODELS_COMPARISON.md](./MODELS_COMPARISON.md)

---

## 📚 Official Documentation

### Google Lyria Documentation

| Resource | URL |
|----------|-----|
| **Google Lyria Realtime Overview** | [ai.google.dev/gemini-api/docs/music-generation](https://ai.google.dev/gemini-api/docs/music-generation) |
| **Vertex AI Music (Google Lyria 2)** | [cloud.google.com/vertex-ai/generative-ai/docs/music/overview](https://cloud.google.com/vertex-ai/generative-ai/docs/music/overview) |
| **Gemini API Quickstart** | [ai.google.dev/gemini-api/docs/quickstart](https://ai.google.dev/gemini-api/docs/quickstart) |
| **Get API Key** | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| **Python Cookbook Example** | [github.com/google-gemini/cookbook/blob/main/quickstarts/Get_started_LyriaRealTime.py](https://github.com/google-gemini/cookbook/blob/main/quickstarts/Get_started_LyriaRealTime.py) |

### Google Cloud & Vertex AI

| Resource | URL |
|----------|-----|
| **Google Cloud Console** | [console.cloud.google.com](https://console.cloud.google.com/) |
| **Vertex AI API** | [cloud.google.com/vertex-ai/docs](https://cloud.google.com/vertex-ai/docs) |
| **Cloud SDK Installation** | [cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install) |
| **Authentication Guide** | [cloud.google.com/docs/authentication](https://cloud.google.com/docs/authentication) |

### Additional Resources

- **Web Audio API**: [developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- **Tauri Documentation**: [tauri.app/](https://tauri.app/)
- **React Documentation**: [react.dev/](https://react.dev/)

---

## 🎨 Themes

### Tokyo Night (Default)
Blue-purple tinted dark theme inspired by Tokyo Night color scheme

### Dark
Pure grayscale dark theme for minimal distraction

### Light
High-contrast light theme for bright environments

**Change themes in:** Settings → Theme

---

## 🔐 Security & Privacy

- **API Keys**: Encrypted and stored locally via Tauri secure storage
- **Access Tokens**: Stored in application state (expires in 1 hour)
- **No Telemetry**: No usage data is sent to external servers
- **Local Processing**: All audio processing happens on your machine

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🤝 Contributing

Contributions welcome! Please open an issue or pull request.

---

## 🆘 Support

For issues or questions:
1. Check [Troubleshooting](#-troubleshooting) section
2. Review [Official Documentation](#-official-documentation)
3. Open a GitHub issue with:
   - Operating system and version
   - Steps to reproduce the issue
   - Error messages from console (Cmd+Option+I)

---

## 🙏 Acknowledgments

- **Google DeepMind** for the Lyria models
- **Google AI** for the Gemini API
- **Tauri** for the desktop framework
- **Community** for feedback and testing

---

**Built with ❤️ for music creators and AI enthusiasts**
