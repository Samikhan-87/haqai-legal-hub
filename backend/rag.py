import os
import requests
import logging
from langchain_core.embeddings import Embeddings
from langchain_chroma import Chroma
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

logger = logging.getLogger("RAG")

# Dynamic vectorstore directory (local or cloud container)
if os.path.exists("vectorstore"):
    VECTORSTORE_DIR = "vectorstore"
elif os.path.exists("../vectorstore"):
    VECTORSTORE_DIR = "../vectorstore"
else:
    VECTORSTORE_DIR = os.getenv("VECTORSTORE_DIR", "vectorstore")

class HybridBgeM3Embeddings(Embeddings):
    """
    Dual-mode BGE-M3 Embeddings:
    1. Cloud Mode: Uses Hugging Face free Serverless Inference API if HF_TOKEN is present.
       - 0 MB server RAM overhead.
       - Ultra-fast 1024-dim embedding matching pre-ingested Chroma database.
    2. Local Mode: Falls back to local Ollama bge-m3 if HF_TOKEN is not provided.
    """
    def __init__(self):
        self.hf_token = os.getenv("HF_TOKEN")
        self.hf_url = "https://router.huggingface.co/hf-inference/models/BAAI/bge-m3"
        self._local_embeddings = None

    def _get_local(self):
        if self._local_embeddings is None:
            from langchain_ollama import OllamaEmbeddings
            self._local_embeddings = OllamaEmbeddings(model="bge-m3", base_url="http://127.0.0.1:11434")
        return self._local_embeddings

    def embed_query(self, text: str) -> list[float]:
        if self.hf_token:
            try:
                headers = {"Authorization": f"Bearer {self.hf_token}"}
                resp = requests.post(self.hf_url, headers=headers, json={"inputs": text}, timeout=12.0)
                if resp.status_code == 200:
                    vec = resp.json()
                    if isinstance(vec, list) and len(vec) > 0 and isinstance(vec[0], list):
                        import numpy as np
                        return np.mean(vec, axis=0).tolist()
                    elif isinstance(vec, list) and len(vec) == 1024:
                        return vec
                else:
                    logger.warning(f"HF BGE-M3 returned HTTP {resp.status_code}: {resp.text[:120]}. Falling back...")
            except Exception as hf_err:
                logger.warning(f"HF BGE-M3 request failed ({hf_err}). Falling back to local Ollama...")

        return self._get_local().embed_query(text)

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        if self.hf_token:
            try:
                headers = {"Authorization": f"Bearer {self.hf_token}"}
                resp = requests.post(self.hf_url, headers=headers, json={"inputs": texts}, timeout=20.0)
                if resp.status_code == 200:
                    vecs = resp.json()
                    if isinstance(vecs, list) and len(vecs) > 0:
                        return vecs
            except Exception as hf_err:
                logger.warning(f"HF BGE-M3 embed_documents failed: {hf_err}")

        return self._get_local().embed_documents(texts)

embeddings = HybridBgeM3Embeddings()
db = Chroma(persist_directory=VECTORSTORE_DIR, embedding_function=embeddings)
retriever = db.as_retriever(search_kwargs={"k": 2})

prompt = PromptTemplate.from_template(
    """You are HaqAI, an expert Pakistani legal assistant with deep knowledge of the Pakistan Penal Code (PPC), Criminal Procedure Code (CrPC), and Pakistani court judgments.

Analyze the legal query based ONLY on the context provided.

CRITICAL LANGUAGE INSTRUCTION:
{language_instruction}

CRITICAL RULES:
1. UNIFIED COHESIVE RESPONSE: Provide exactly ONE unified analysis combining all information. Do NOT repeat the headers or output separate sections/blocks for different documents or sources.
2. Relevant Judgment: The context contains actual court judgments and legal precedents. Summarize the key rulings, case titles, or holdings from these documents and explain how they apply to the query. Do NOT say "No relevant judgment was found" if there are court judgments or appeals in the context. Only say it if the context contains no cases at all.
3. Protect Legal Citations: Keep references EXACTLY as they appear (e.g., PPC, CrPC, PLD, SCMR, Section numbers).

FORMATTING RULES:
- Do NOT use markdown headings like ### or numbered titles like "1.", "2.", "3.".
- Do NOT use markdown separators (---).
- Keep paragraphs short (2-4 lines max). Use bullets where appropriate.
- At the end of the text, display the Source header followed by all cited documents on a single line, e.g.:
  Source: 2023LHC7122.pdf (Page 3), 2022LHC5543.pdf (Page 2)

Context from Pakistani Legal Documents:
{context}

Legal Query: {question}

Legal Analysis:"""
)

import time
import math
import logging
import os
import requests
import subprocess
import shutil

logger = logging.getLogger("RAG")

def ensure_ollama_running():
    """Checks if Ollama server is responding; if not, attempts to launch it in background."""
    try:
        r = requests.get("http://127.0.0.1:11434/api/tags", timeout=1.0)
        if r.status_code == 200:
            return True
    except Exception:
        pass
    
    ollama_path = shutil.which("ollama") or r"C:\Users\LenOvO\AppData\Local\Programs\Ollama\ollama.exe"
    try:
        creation_flags = subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0
        subprocess.Popen([ollama_path, "serve"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, creationflags=creation_flags)
        for _ in range(6):
            time.sleep(0.5)
            try:
                r = requests.get("http://127.0.0.1:11434/api/tags", timeout=1.0)
                if r.status_code == 200:
                    logger.info("Ollama server auto-started successfully.")
                    return True
            except Exception:
                continue
    except Exception as launch_err:
        logger.warning(f"Could not automatically start Ollama: {launch_err}")
    return False

def detect_query_lang(query: str) -> str:
    # 1. Check for Urdu Script characters (Arabic range)
    if any(u'\u0600' <= char <= u'\u06FF' for char in query):
        return "Urdu Script"
    
    # 2. Check for Roman Urdu
    roman_urdu_words = {
        "hai", "hain", "ki", "ka", "ko", "se", "aur", "ab", "kya", "kia", "karo", "karu", "saza", "qatl", "faisla", 
        "muqadma", "vakeel", "court", "kanoon", "hoga", "hoti", "hota", "gaya", "gayi", "mera", "meri", "kuch", "nahi"
    }
    words = query.lower().split()
    if any(w in roman_urdu_words for w in words):
        return "Roman Urdu"
        
    return "English"

def cosine_similarity(v1, v2):
    dot_product = sum(a * b for a, b in zip(v1, v2))
    magnitude_v1 = math.sqrt(sum(a * a for a in v1))
    magnitude_v2 = math.sqrt(sum(b * b for b in v2))
    if not magnitude_v1 or not magnitude_v2:
        return 0.0
    return dot_product / (magnitude_v1 * magnitude_v2)

def format_docs(docs):
    formatted = []
    for doc in docs:
        source = doc.metadata.get("source", "Unknown")
        page = doc.metadata.get("page", "N/A")
        formatted.append(f"[Source: {source}, Page: {page}]\n{doc.page_content}")
    return "\n\n".join(formatted)

def get_legal_guidance(query: str) -> dict:
    start_time = time.time()
    
    # 1. Retrieve Documents with scores directly from database (avoids re-embedding documents on CPU)
    docs_with_scores = []
    try:
        docs_with_scores = db.similarity_search_with_score(query, k=2)
    except Exception as e:
        logger.warning(f"Initial Chroma similarity search failed ({e}). Checking Ollama status...")
        if ensure_ollama_running():
            try:
                docs_with_scores = db.similarity_search_with_score(query, k=2)
            except Exception as retry_err:
                logger.error(f"Retry search failed: {retry_err}")
        else:
            logger.error("Ollama service unavailable for local embeddings. Falling back to direct LLM knowledge.")

    docs = [doc for doc, score in docs_with_scores]
    retrieval_end_time = time.time()
    
    # 2. Convert L2 distance scores to similarity percentages
    scores = []
    for doc, dist in docs_with_scores:
        # L2 distance is typically between 0 and 2. Map it to 0-1 similarity score
        sim = max(0.0, min(1.0, 1.0 - (dist / 2.0)))
        scores.append(sim)
    avg_score = sum(scores) / len(scores) if scores else 0.85
    
    # 3. Generate Answer
    context = format_docs(docs)
    
    from llm_router import get_llm_response
    import asyncio
    import concurrent.futures

    def run_routing():
        return asyncio.run(get_llm_response(query, context, docs))

    with concurrent.futures.ThreadPoolExecutor() as executor:
        router_result = executor.submit(run_routing).result()

    answer = router_result["response"]
    model_used = router_result["model_used"]
    generation_latency = router_result["generation_latency"]
    
    # 4. Latency Math
    retrieval_latency = retrieval_end_time - start_time
    total_latency = retrieval_latency + generation_latency
    
    # 5. Print Metrics Dashboard to Terminal
    print("\n" + "\033[93m" + "="*60 + "\033[0m")
    print("\033[93m" + "               HAQAI QUERY METRICS DASHBOARD" + "\033[0m")
    print("\033[93m" + "="*60 + "\033[0m")
    print(f"\033[94mQuery:\033[0m {query}")
    print(f"\033[94mModel Used:\033[0m     {model_used}")
    print(f"\033[94mTotal Latency:\033[0m      {total_latency:.2f}s")
    print(f"  +- Retrieval:      {retrieval_latency:.2f}s")
    print(f"  +- Generation:     {generation_latency:.2f}s")
    print(f"\033[94mRetrieved Chunks:\033[0m   {len(docs)}")
    for idx, (doc, score) in enumerate(zip(docs, scores)):
        src = doc.metadata.get("source", "Unknown").split("\\")[-1].split("/")[-1]
        page = doc.metadata.get("page", "N/A")
        print(f"  [{idx+1}] Source: {src} (Page {page})")
        print(f"      Similarity/Accuracy Score: \033[92m{score*100:.1f}%\033[0m")
    print(f"\033[94mAverage Accuracy / Relevance:\033[0m \033[92m{avg_score*100:.1f}%\033[0m")
    print("\033[93m" + "="*60 + "\033[0m\n")
    
    # 6. Format Sources List
    sources_list = []
    seen_sources = set()
    for doc in docs:
        src = doc.metadata.get("source", "Unknown").split("\\")[-1].split("/")[-1]
        page = doc.metadata.get("page", "N/A")
        source_key = f"{src} (Page {page})"
        if source_key not in seen_sources:
            seen_sources.add(source_key)
            sources_list.append({"file": src, "page": page})
            
    return {
        "response": answer,
        "sources": sources_list,
        "model_used": model_used,
        "metrics": {
            "retrieval_latency": round(retrieval_latency, 2),
            "generation_latency": round(generation_latency, 2),
            "total_latency": round(total_latency, 2),
            "average_accuracy": round(avg_score * 100, 1),
            "scores": [round(s * 100, 1) for s in scores]
        }
    }