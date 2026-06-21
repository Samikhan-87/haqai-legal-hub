from langchain_community.document_loaders import PyPDFium2Loader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores import Chroma
import os
import time

PDF_DIR = "Legal-KB"
VECTORSTORE_DIR = "../vectorstore"

# Recursively search for all PDF files in Legal-KB subdirectories
pdf_files = []
for root, dirs, files in os.walk(PDF_DIR):
    for file in files:
        if file.lower().endswith(".pdf"):
            pdf_files.append(os.path.join(root, file))

print(f"Found {len(pdf_files)} PDF files under {PDF_DIR}\n")

docs = []
for i, filepath in enumerate(pdf_files, 1):
    try:
        filename = os.path.basename(filepath)
        parent_dir = os.path.basename(os.path.dirname(filepath))
        print(f"[{i}/{len(pdf_files)}] Loading: {filename} (from {parent_dir})")
        loader = PyPDFium2Loader(filepath)
        loaded = loader.load()
        docs.extend(loaded)
    except Exception as e:
        print(f"  SKIPPED (error): {filepath} - {e}")

print(f"\nTotal docs loaded: {len(docs)}")

splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = splitter.split_documents(docs)
print(f"Total chunks: {len(chunks)}\n")

if len(chunks) == 0:
    print("ERROR: No chunks found.")
else:
    print("Starting embedding + storing in ChromaDB...")
    print("This will take a while for the PDFs — be patient.\n")

    embeddings = OllamaEmbeddings(model="bge-m3", base_url="http://127.0.0.1:11434")

   
    batch_size = 50
    start_time = time.time()

    db = None
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i+batch_size]
        if db is None:
            db = Chroma.from_documents(batch, embeddings, persist_directory=VECTORSTORE_DIR)
        else:
            db.add_documents(batch)
        elapsed = time.time() - start_time
        print(f"  Processed {min(i+batch_size, len(chunks))}/{len(chunks)} chunks | Elapsed: {elapsed:.0f}s")

    print(f"\nIngestion done! Total chunks: {len(chunks)}")
    print(f"Total time: {time.time() - start_time:.0f}s")