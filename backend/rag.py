from langchain_ollama import OllamaEmbeddings, OllamaLLM
from langchain_chroma import Chroma
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

VECTORSTORE_DIR = "../vectorstore"

embeddings = OllamaEmbeddings(model="bge-m3", base_url="http://127.0.0.1:11434")
db = Chroma(persist_directory=VECTORSTORE_DIR, embedding_function=embeddings)
retriever = db.as_retriever(search_kwargs={"k": 2})

llm = OllamaLLM(model="haqai-model", num_ctx=2048, base_url="http://127.0.0.1:11434")

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
    
    # 1. Retrieve Documents
    docs = retriever.invoke(query)
    retrieval_end_time = time.time()
    
    # 2. Compute Cosine Similarity between Query and Documents
    query_vector = embeddings.embed_query(query)
    doc_contents = [doc.page_content for doc in docs]
    doc_vectors = embeddings.embed_documents(doc_contents) if doc_contents else []
    
    scores = [cosine_similarity(query_vector, dv) for dv in doc_vectors]
    avg_score = sum(scores) / len(scores) if scores else 0.0
    
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