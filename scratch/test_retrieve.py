from rag import retriever
docs = retriever.invoke("murder charges")
for i, doc in enumerate(docs):
    print(f"--- Doc {i+1} ({doc.metadata.get('source')} Page {doc.metadata.get('page')}) ---")
    print(doc.page_content[:500])
