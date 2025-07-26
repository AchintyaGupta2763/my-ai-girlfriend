# backend/stt_module.py

import whisper

class HindiSTT:
    def __init__(self, model_size="base"):
        self.model = whisper.load_model(model_size)

    def transcribe_file(self, filepath):
        try:
            result = self.model.transcribe(filepath, language="en", task="transcribe")
            return result["text"].strip()
        except Exception as e:
            print(f"[STT ERROR] {e}")
            return ""
