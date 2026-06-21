import os
import re
import asyncio
import time
import logging
from dotenv import load_dotenv
import requests
import google.generativeai as genai

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("LLMRouter")

# Load environment variables from .env
load_dotenv()

# Configure Google Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY not found in environment or .env file. Gemini fallback will fail if triggered.")

# Default configurations
DEFAULT_PRIMARY_MODEL = "haqai-model"
GEMINI_MODEL_NAME = "gemini-flash-latest"  # Fallback model
TIMEOUT_LIMIT = 12.0  # seconds

def detect_language(query: str) -> str:
    """
    Detect language based on query content.
    - If Urdu script characters are found -> urdu
    - Else if matches Roman Urdu word list -> roman_urdu
    - Else -> english
    """
    # 1. Urdu Script range (Arabic unicode block)
    if any('\u0600' <= char <= '\u06FF' for char in query):
        return "urdu"
    
    # 2. Roman Urdu common vocabulary words
    roman_urdu_words = {
        "hai", "hain", "ki", "ka", "ko", "se", "aur", "ab", "kya", "kia", "karo", "karu", "saza", "qatl", "faisla", 
        "muqadma", "vakeel", "court", "kanoon", "hoga", "hoti", "hota", "gaya", "gayi", "mera", "meri", "kuch", "nahi"
    }
    words = set(query.lower().split())
    if words.intersection(roman_urdu_words):
        return "roman_urdu"
        
    return "english"

def get_language_config(lang: str) -> dict:
    """
    Get prompt instructions and headers based on the language.
    """
    if lang == "urdu":
        return {
            "instruction": "The query is in Urdu Script. You MUST respond entirely in Urdu Script using the provided Urdu headers. Do NOT write in English or Roman Urdu.",
            "headers": (
                "متعلقہ قانون\n\n"
                "قانونی تجزیہ\n\n"
                "سزا\n\n"
                "عدالتی حوالہ جات\n\n"
                "تجویز کردہ اقدامات / مشورہ"
            )
        }
    elif lang == "roman_urdu":
        return {
            "instruction": "The query is in Roman Urdu. You MUST respond entirely in natural, casual, human-like Roman Urdu using the provided Roman Urdu headers. Do NOT write in Urdu script or English.",
            "headers": (
                "Mutaliqa Qanoon\n\n"
                "Qanooni Tajzia\n\n"
                "Saza\n\n"
                "Adalati Hawala\n\n"
                "Mashwara / Agla Qadam"
            )
        }
    else:
        return {
            "instruction": "The query is in English. You MUST respond entirely in English using the provided English headers. Do NOT write in Urdu Script or Roman Urdu.",
            "headers": (
                "Relevant Law\n\n"
                "Legal Analysis\n\n"
                "Punishment\n\n"
                "Court References\n\n"
                "Advice / Next Steps"
            )
        }

def call_ollama_sync(model: str, prompt: str, timeout: float) -> str:
    """
    Synchronous POST request to Ollama HTTP API with a hard timeout.
    """
    url = "http://127.0.0.1:11434/api/generate"
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "num_ctx": 2048,
            "temperature": 0.3,
            "num_thread": 4,
            "num_predict": 512
        }
    }
    # Standard request timeout
    response = requests.post(url, json=payload, timeout=timeout)
    response.raise_for_status()
    return response.json()["response"]

def call_gemini_sync(model: str, prompt: str) -> str:
    """
    Synchronous call to Gemini API.
    """
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not configured.")
    model_instance = genai.GenerativeModel(model)
    response = model_instance.generate_content(prompt)
    return response.text

async def get_llm_response(query: str, context: str, documents: list, primary_model: str = DEFAULT_PRIMARY_MODEL) -> dict:
    """
    Routes query to Ollama first with an 8-second timeout, falling back to Gemini if it fails or times out.
    """
    # 1. Detect language
    lang = detect_language(query)
    lang_cfg = get_language_config(lang)
    
    # 2. Build prompt
    prompt = f"""You are HaqAI, an expert Pakistani legal assistant with deep knowledge of the Pakistan Penal Code (PPC), Criminal Procedure Code (CrPC), and Pakistani court judgments.

Analyze the legal query based ONLY on the context provided.

CRITICAL INSTRUCTIONS FOR GENERAL QUERIES:
- If the query is a general question (e.g., starting with or asking "What is...", "Define...", or similar general explanations), you MUST first provide a "General Definition" (Aam Taareef) of the concept at the very beginning.
- Following the General Definition, you must reference specific case laws, rulings, or court precedents from the provided context.
- You are strictly bound to check and reference the basic sections of the Pakistan Penal Code (PPC) relevant to the query.

CRITICAL LANGUAGE INSTRUCTION:
{lang_cfg['instruction']}

CRITICAL FORMATTING RULES:
1. You MUST structure your response into these exact sections with the specified headers (do not use numbered titles or markdown separators):
{lang_cfg['headers']}

2. Keep paragraphs short (2-4 lines max). Use bullet points where appropriate.
3. Do NOT produce large unbroken text blocks.
4. Do NOT include any "Sources" header or bullet points inside your main analysis. It will be added automatically outside of your generation.

Context from Pakistani Legal Documents:
{context}

Legal Query: {query}

Legal Analysis:"""

    response_text = ""
    model_used = ""
    start_time = time.time()
    
    # 3. Call Primary local Ollama model
    try:
        logger.info(f"Attempting to call local Ollama model '{primary_model}'...")
        # Run synchronous request in a separate thread to support timeout cleanly
        response_text = await asyncio.to_thread(call_ollama_sync, primary_model, prompt, TIMEOUT_LIMIT)
        model_used = f"local-ollama ({primary_model})"
        logger.info("Ollama responded successfully.")
    except Exception as e:
        logger.warning(f"Ollama call failed or timed out: {e}. Falling back to Google Gemini...")
        
        # 4. Fallback to Google Gemini
        fallback_start = time.time()
        try:
            response_text = await asyncio.to_thread(call_gemini_sync, GEMINI_MODEL_NAME, prompt)
            model_used = f"gemini-fallback ({GEMINI_MODEL_NAME})"
            logger.info("Gemini responded successfully as fallback.")
        except Exception as gemini_err:
            logger.error(f"Gemini fallback also failed: {gemini_err}")
            # If everything fails, raise an exception or return a helpful local error message
            raise RuntimeError("Both primary Ollama and fallback Gemini models failed to respond.") from gemini_err

    generation_latency = time.time() - start_time

    # Strip all double asterisks (stars) from the generated response
    response_text = response_text.replace("**", "")
    
    # 5. Format sources section
    sources_section = "\n\nSources\n"
    seen_sources = set()
    for doc in documents:
        src = doc.metadata.get("source", "Unknown").split("\\")[-1].split("/")[-1]
        page = doc.metadata.get("page", "N/A")
        source_key = f"{src} (Page {page})"
        if source_key not in seen_sources:
            seen_sources.add(source_key)
            sources_section += f"- {src} (Page {page})\n"
            
    # Combine the generated answer and the sources section
    full_response = response_text.strip() + sources_section

    return {
        "response": full_response,
        "model_used": model_used,
        "generation_latency": round(generation_latency, 2)
    }
