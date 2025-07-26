# backend/app.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
import os
import uuid

from stt_module import HindiSTT
from tts_module import EmotionalHindiTTS
from simple_hindi_llm import SimpleHindiLLM

app = FastAPI()

# CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify http://localhost:3000 if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models
stt = HindiSTT()
tts = EmotionalHindiTTS()
llm = SimpleHindiLLM()

class TextInput(BaseModel):
    text: str

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        file_path = f"temp_audio/{uuid.uuid4()}.wav"
        os.makedirs("temp_audio", exist_ok=True)

        with open(file_path, "wb") as f:
            f.write(await file.read())

        text = stt.transcribe_file(file_path)
        os.remove(file_path)

        return {"text": text}
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.post("/respond")
async def get_response(input: TextInput):
    try:
        response = llm.generate_hindi_response(input.text)
        emotion = tts.extract_emotion_from_text(response)

        audio_path = f"tts_output/{uuid.uuid4()}.wav"
        os.makedirs("tts_output", exist_ok=True)

        tts.save_audio(response, audio_path)

        return {
            "response": response,
            "emotion": emotion,
            "audio_url": f"/audio/{os.path.basename(audio_path)}"
        }

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.get("/audio/{filename}")
async def serve_audio(filename: str):
    path = f"tts_output/{filename}"
    if os.path.exists(path):
        return FileResponse(path, media_type="audio/wav")
    else:
        return JSONResponse(content={"error": "File not found"}, status_code=404)
