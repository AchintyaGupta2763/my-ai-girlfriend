# Lily AI – An Online Girlfriend

## For all those people who could afford the subscriptions based ai model or couldn't get a girlfriend in real life (just kidding, this is just my attempt to replicate a high end girlfriend simulator in less resources)

### Drawbacks :- vey slow in response and processing due heavy reliance on cpu and absence of gpu

Lily AI is a English-speaking emotional girlfriend simulator that uses your voice input to generate emotionally rich voice responses, synced with corresponding video animations. It combines STT, a lightweight LLM, emotional TTS, and synchronized multimedia for a fully immersive AI interaction.

---

## ✨ Features

- 🎙️ **Speech-to-Text (STT)** using Whisper (Base model set for English conversation)
- 🧠 **Custom Romantic LLM** Trained to generate emotional responses
- 😍 **Emotion Detection** from generated text (`happy`, `sad`, `angry`, etc.)
- 🗣️ **Text To Speech (TTS) Integration** for emotion-based voice synthesis
- 🎥 **Video Sync** that matches emotional tone with looping playback
- 📁 **Recording Storage** to debug and verify audio capture
- 🖥️ **Responsive Frontend** with dynamic video and audio handling

---

https://github.com/user-attachments/assets/df088bdd-8558-4e78-aeca-7bd72dcd531a

---
## 🛠️ Tech Stack

| Layer       | Technology                  |
|-------------|------------------------------|
| **Frontend**| HTML, CSS, JavaScript         |
| **Backend** | FastAPI (Python)              |
| **STT**     | OpenAI Whisper Base Model     |
| **LLM**     | deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B trained on custom romatic dataset |
| **TTS**     | pretrained and finetuned tts_models/multilingual/multi-dataset/xtts_v2 in combination with basic sentiment analysis model and female voice cloning through sample audio|
| **Video**   | HTML5 Video + JS Control      |

---

## 📁 Project Structure

- ├── backend/
- │ ├── app.py # FastAPI server
- │ ├── stt_module.py # Speech-to-text module
- │ ├── tts_module.py # Emotional TTS module
- │ ├── simple_hindi_llm.py # response generator
- │ ├── output_audio/ # Stores generated TTS audio
- │ └── recordings/ # Stores user recordings
- ├── frontend/
- │ ├── index.html # Main HTML page
- │ ├── script.js # Frontend interaction logic
- │ ├── style.css # Custom UI styling
- │ └── videos/ # Emotion-specific and default videos
- └── README.md # Project documentation

---


---

## 🚀 How It Works

1. User clicks the **Mic** button to start recording and clicks it again to stop recording.
2. Audio is sent to **STT** which transcribes the speech.
3. The transcription is passed to the **LLM**, which Generates a emotional response.
4. The **TTS module** converts the response into audio with matching emotional tone as well as perform female voice cloning through sample audio.
5. The **frontend** switches the video based on detected emotion and plays both the video and audio **synchronously**.
6. When the audio ends, the video resets to a default idle state.

---

## 📦 Installation & Setup

### Initial setup
```
# 1. Clone the repository
git clone https://github.com/AchintyaGupta2763/my-ai-girlfriend.git
cd my-ai-girlfriend

# 2. Create virtual environment
python -m venv .venv
source .venv/bin/activate    # On Windows: .venv/Scripts/Activate.psl

# 3. Install dependencies
pip install -r requirements.txt
```

### open two terminals simultaneously

#### terminal 1
```
# 4. Run FastAPI server
cd my-ai-girlfriend/backend
uvicorn app:app --reload --port 8000
```

#### terminal 2
```
# 4. Run FastAPI server
cd my-ai-girlfriend/frontend
python -m http.server 3000
```
and type localhost:3000 in your browser

### Windows Additional requirements

open command prompt as administrator

```
winget install --id=Kitware.CMake  -e
winget install --id=Gyan.FFmpeg  -e
```

## THANKS FOR SUPPORTING

