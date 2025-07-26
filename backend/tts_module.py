# backend/tts_module.py

import torch
import os
import re
from TTS.api import TTS
from transformers import pipeline

# Patch torch.load
original_load = torch.load
def patched_load(*args, **kwargs):
    kwargs["weights_only"] = False
    return original_load(*args, **kwargs)
torch.load = patched_load

class EmotionalHindiTTS:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")  # English-only model
        self.tts.to(self.device)

        # Load a sentiment/emotion detection pipeline
        self.emotion_classifier = pipeline("text-classification", 
                                           model="j-hartmann/emotion-english-distilroberta-base", 
                                           top_k=None)

        # Map model labels to your emotion set
        self.emotion_map = {
            "joy": "happy",
            "sadness": "sad",
            "neutral": "neutral",
            "love": "caring",
            "excitement": "excited",
            "admiration": "caring",
            "gratitude": "happy",
            "anger": "sad",
            "surprise": "excited",
            "disappointment": "sad",
            "approval": "caring",
            "optimism": "happy",
        }

    def extract_emotion_from_text(self, text):
        try:
            result = self.emotion_classifier(text)
            top_emotion = result[0][0] if isinstance(result[0], list) else result[0]
            model_emotion = top_emotion["label"].lower()
            mapped_emotion = self.emotion_map.get(model_emotion, "normal")
            return mapped_emotion
        except Exception as e:
            print(f"[Emotion Detection Error] {e}")
            return "happy"


    def clean_text_for_tts(self, text):
        # Remove emojis and keep only English
        text = re.sub(r'[^\x00-\x7F]+', ' ', text)
        text = re.sub(r'[\[\]{}():;,.!?\'\"<>@#$%^&*_+=~`|\\/]', ' ', text)
        return text.strip()

    def save_audio(self, text, output_path, reference_audio="./female_voice.wav"):
        clean_text = self.clean_text_for_tts(text)
        try:
            audio = self.tts.tts_to_file(
                text=clean_text,
                speaker_wav=reference_audio,
                language="en",
                file_path=output_path
            )
        except Exception as e:
            print(f"[TTS ERROR] {e}")
