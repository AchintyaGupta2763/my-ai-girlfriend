# backend/simple_hindi_llm.py

from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

class SimpleHindiLLM:
    def __init__(self):
        model_path = "./deepseek-gf-qlora"  # Update path as needed
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_path, torch_dtype=torch.float32
        ).to("cpu")  # Use "cuda" if available and desired

    def generate_hindi_response(self, user_input, emotion="neutral"):
        prompt = f"### Boyfriend: {user_input}\n### Girlfriend:"
        input_ids = self.tokenizer(prompt, return_tensors="pt").input_ids.to("cpu")

        output = self.model.generate(
            input_ids,
            max_new_tokens=100,
            do_sample=True,
            temperature=0.75,
            top_p=0.9,
            repetition_penalty=1.2
        )

        response = self.tokenizer.decode(output[0], skip_special_tokens=True)
        response_lines = response.split("\n")

        for line in response_lines:
            if line.strip().lower().startswith("### girlfriend:"):
                return line.replace("### Girlfriend:", "").strip()

        # fallback if no prefix match
        return response.strip()