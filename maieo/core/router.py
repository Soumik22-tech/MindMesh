import os
import time
import random
from dotenv import load_dotenv
from google import genai
from openai import OpenAI
import openai

load_dotenv()

class LLMRouter:
    def __init__(self):
        self._groq_client = None
        self._google_clients = {}
        self._cerebras_client = None

        self.default_models = {
            "groq": "llama-3.3-70b-versatile",
            "google": "gemini-2.5-flash",
            "cerebras": "qwen-3-235b-a22b-instruct-2507"
        }

    def _get_groq_client(self):
        if self._groq_client is None:
            api_key = os.getenv("GROQ_API_KEY")
            if not api_key:
                raise ValueError("GROQ_API_KEY not found in environment.")
            self._groq_client = OpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")
        return self._groq_client

    def _get_google_client(self, model: str):
        # Choose key based on model
        is_gemma = "gemma" in model.lower()
        key_var = "GOOGLE_API_KEY_CHALLENGER" if is_gemma else "GOOGLE_API_KEY_SYNTHESIZER"
        
        api_key = os.getenv(key_var)
        if not api_key:
            # Fallback to main key if specific one not set
            api_key = os.getenv("GOOGLE_API_KEY")
            
        if not api_key:
            raise ValueError(f"Google API key not found. Tried {key_var} and GOOGLE_API_KEY.")
            
        if api_key not in self._google_clients:
            self._google_clients[api_key] = genai.Client(api_key=api_key)
            
        return self._google_clients[api_key]

    def _get_cerebras_client(self):
        if self._cerebras_client is None:
            api_key = os.getenv("CEREBRAS_API_KEY")
            if not api_key:
                raise ValueError("CEREBRAS_API_KEY not found in environment.")
            self._cerebras_client = OpenAI(api_key=api_key, base_url="https://api.cerebras.ai/v1")
        return self._cerebras_client

    def complete(
        self, 
        provider: str, 
        model: str = None, 
        system_prompt: str = "", 
        user_prompt: str = "", 
        temperature: float = 0.7, 
        max_tokens: int = 1000
    ) -> str:
        providers_to_try = [provider.lower()]
        # Add fallbacks if the primary fails
        if providers_to_try[0] == "cerebras":
            providers_to_try.extend(["groq", "google"])
        elif providers_to_try[0] == "groq":
            providers_to_try.extend(["cerebras", "google"])
        elif providers_to_try[0] == "google":
            providers_to_try.extend(["groq", "cerebras"])

        last_error = None
        for current_provider in providers_to_try:
            try:
                return self._complete_with_retry(
                    current_provider, 
                    model if current_provider == provider.lower() else None,
                    system_prompt, 
                    user_prompt, 
                    temperature, 
                    max_tokens
                )
            except Exception as e:
                print(f"  [!] Provider {current_provider} failed: {str(e)}")
                last_error = e
                continue
        
        raise last_error

    def _complete_with_retry(self, provider, model, system_prompt, user_prompt, temperature, max_tokens):
        target_model = model if model else self.default_models[provider]
        max_retries = 3
        
        for attempt in range(max_retries):
            try:
                if provider == "groq":
                    client = self._get_groq_client()
                    messages = []
                    if system_prompt:
                        messages.append({"role": "system", "content": system_prompt})
                    messages.append({"role": "user", "content": user_prompt})
                    
                    response = client.chat.completions.create(
                        model=target_model,
                        messages=messages,
                        temperature=temperature,
                        max_tokens=max_tokens
                    )
                    return response.choices[0].message.content

                elif provider == "google":
                    from google.genai.errors import ServerError
                    client = self._get_google_client(target_model)
                    from google.genai import types
                    
                    kwargs = {"temperature": temperature, "max_output_tokens": max_tokens}
                    if system_prompt:
                        if "gemma" in target_model.lower():
                            user_prompt = f"{system_prompt}\n\n{user_prompt}"
                        else:
                            kwargs["system_instruction"] = system_prompt
                            
                    config = types.GenerateContentConfig(**kwargs)
                    response = client.models.generate_content(
                        model=target_model,
                        contents=user_prompt,
                        config=config
                    )
                    return response.text

                elif provider == "cerebras":
                    client = self._get_cerebras_client()
                    messages = []
                    if system_prompt:
                        messages.append({"role": "system", "content": system_prompt})
                    messages.append({"role": "user", "content": user_prompt})
                    
                    response = client.chat.completions.create(
                        model=target_model,
                        messages=messages,
                        temperature=temperature,
                        max_tokens=max_tokens
                    )
                    return response.choices[0].message.content

            except (openai.RateLimitError, openai.APIStatusError) as e:
                # Handle 429 and 5xx for OpenAI-compatible clients (Groq, Cerebras)
                status_code = getattr(e, 'status_code', 0)
                if (status_code == 429 or status_code >= 500) and attempt < max_retries - 1:
                    wait_time = (2 ** attempt) + random.random()
                    print(f"  [!] {provider.capitalize()} API error ({status_code}). Retrying in {wait_time:.1f}s... ({attempt + 1}/{max_retries})")
                    time.sleep(wait_time)
                    continue
                raise e
            except Exception as e:
                # Handle Google specific errors if applicable, or general ones
                if "503" in str(e) or "429" in str(e) or "UNAVAILABLE" in str(e):
                    if attempt < max_retries - 1:
                        wait_time = (2 ** attempt) + random.random()
                        print(f"  [!] {provider.capitalize()} API error. Retrying in {wait_time:.1f}s... ({attempt + 1}/{max_retries})")
                        time.sleep(wait_time)
                        continue
                raise e
        
        return None # Should not reach here if raise e is in loop
