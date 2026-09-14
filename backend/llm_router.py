import os
import re
import asyncio
import time
import logging
from dotenv import load_dotenv
import requests
# import google.generativeai as genai

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("LLMRouter")

# Load environment variables from .env
load_dotenv()

# Configure Groq Cloud
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL_NAME = "qwen/qwen3.8-27b"  # SOTA multilingual model on Groq

if not GROQ_API_KEY:
    logger.warning("GROQ_API_KEY not found in environment or .env file. Groq fallback will fail if triggered.")

# [COMMENTED OUT GEMINI FALLBACK]
# GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# if GEMINI_API_KEY:
#     genai.configure(api_key=GEMINI_API_KEY)
# else:
#     logger.warning("GEMINI_API_KEY not found in environment or .env file.")
# GEMINI_MODEL_NAME = "gemini-flash-latest"

DEFAULT_PRIMARY_MODEL = "haqai-model"
TIMEOUT_LIMIT = 12.0  # seconds

def detect_language(query: str) -> str:
    """
    Accurately detect language based on query grammar and syntax:
    - If Urdu script characters are found -> 'urdu'
    - Else if Roman Urdu grammatical markers dominate -> 'roman_urdu'
    - Else -> 'english'
    """
    # 1. Urdu Script range (Arabic unicode block)
    if any('\u0600' <= char <= '\u06FF' for char in query):
        return "urdu"
    
    # 2. Clean punctuation and split into words
    clean_query = re.sub(r'[^\w\s]', ' ', query.lower())
    words = set(clean_query.split())
    
    # Core Roman Urdu functional syntax (pronouns, auxiliary verbs, interrogatives)
    roman_urdu_core = {
        "hai", "hain", "kya", "kia", "kaise", "kese", "kyun", "kyu", "karo", "karna", "krna",
        "karein", "karen", "karne", "krne", "batao", "bataen", "bataiye", "mujhe", "mujhy",
        "mera", "meri", "mere", "hoga", "hogi", "hoge", "hoti", "hota", "hote", "nahi", "nhi",
        "nahin", "gaya", "gayi", "gaye", "chahiye", "chahta", "chahti", "sakta", "sakti", "sakte",
        "tha", "thi", "the", "raha", "rahi", "rahe", "apna", "apni", "apne", "kisi", "kisko",
        "kaun", "konsa", "kaisi", "tareeqa", "tareeqay", "faisla", "wirasat"
    }
    
    # Roman Urdu grammatical particles
    roman_urdu_particles = {
        "ki", "ka", "ko", "se", "ke", "me", "mein", "mai", "par", "pe", "aur", "ye", "yeh", "wo", "woh"
    }
    
    # English structural grammar (determiners, prepositions, English question words, aux verbs)
    english_core = {
        "what", "which", "where", "when", "why", "who", "how", "is", "are", "was", "were",
        "the", "this", "that", "these", "those", "under", "for", "with", "from", "about",
        "does", "did", "do", "can", "could", "should", "would", "shall", "will", "have",
        "has", "had", "between", "against", "explain", "punishment", "difference", "procedure"
    }
    
    core_ur_count = len(words.intersection(roman_urdu_core))
    part_ur_count = len(words.intersection(roman_urdu_particles))
    eng_count = len(words.intersection(english_core))
    
    total_ur_score = core_ur_count * 2 + part_ur_count
    total_en_score = eng_count * 2
    
    if total_ur_score > total_en_score:
        return "roman_urdu"
    elif total_en_score > 0:
        return "english"
    elif total_ur_score > 0:
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
            "instruction": (
                "The query is in Roman Urdu. You MUST respond entirely in natural, casual, human-like Roman Urdu using the provided Roman Urdu headers. "
                "CRITICAL: Translate all legal context, cases, and analysis from English into Roman Urdu. Do NOT write in English or Urdu script under any circumstances."
            ),
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

def call_groq_sync(model: str, prompt: str) -> str:
    """
    Synchronous call to Groq API (Qwen / Llama).
    """
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not configured in environment or .env file.")
    
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2,
        "max_tokens": 800
    }
    response = requests.post(url, headers=headers, json=payload, timeout=20.0)
    response.raise_for_status()
    data = response.json()
    return data["choices"][0]["message"]["content"]

# [COMMENTED OUT GEMINI FALLBACK SYNC]
# def call_gemini_sync(model: str, prompt: str) -> str:
#     if not GEMINI_API_KEY:
#         raise ValueError("GEMINI_API_KEY is not configured.")
#     model_instance = genai.GenerativeModel(model)
#     response = model_instance.generate_content(prompt)
#     return response.text

async def get_llm_response(query: str, context: str, documents: list, primary_model: str = DEFAULT_PRIMARY_MODEL) -> dict:
    """
    Routes query to Ollama first with a timeout, falling back to Groq Cloud (Qwen) if it fails or times out.
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
    
    # [COMMENTED OUT LOCAL OLLAMA CALL - GROQ IS NOW PRIMARY FOR FAST 1-2S RESPONSES]
    # try:
    #     logger.info(f"Attempting to call local Ollama model '{primary_model}'...")
    #     response_text = await asyncio.to_thread(call_ollama_sync, primary_model, prompt, TIMEOUT_LIMIT)
    #     model_used = f"local-ollama ({primary_model})"
    #     logger.info("Ollama responded successfully.")
    # except Exception as e:
    #     logger.warning(f"Ollama call failed or timed out: {e}. Falling back to Groq Cloud...")

    # Primary Engine: Groq Cloud (Qwen 3.8-27b)
    try:
        logger.info(f"Generating legal response via Groq Cloud ({GROQ_MODEL_NAME})...")
        response_text = await asyncio.to_thread(call_groq_sync, GROQ_MODEL_NAME, prompt)
        model_used = f"groq-cloud ({GROQ_MODEL_NAME})"
        logger.info("Groq Cloud responded successfully.")
    except Exception as groq_err:
        logger.error(f"Groq API call failed: {groq_err}")
        error_details = str(groq_err)
        is_quota_exceeded = "quota" in error_details.lower() or "429" in error_details or "limit" in error_details.lower()
        
        if is_quota_exceeded:
            response_text = (
                "System Notification / سسٹمی اطلاع:\n\n"
                "The Groq API has reached its temporary rate limit (429 Rate Limit Exceeded). Please wait a few seconds and try again.\n\n"
                "گروک کلاؤڈ کا ریٹ لمٹ آ گیا ہے، برائے مہربانی چند سیکنڈ انتظار کے بعد دوبارہ کوشش کریں۔"
            )
        else:
            response_text = (
                "System Notification / سسٹمی اطلاع:\n\n"
                f"Groq API Connection Error: {error_details}"
            )
        model_used = "system-error-handler"

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
