from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag import get_legal_guidance
import pytesseract
from PIL import Image
import io
from agent import run_agent


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str
    thread_id: str = "default-session"

@app.post("/query")
def query(req: QueryRequest):
    return get_legal_guidance(req.query)

@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    contents = await file.read()
    
    # Check if the uploaded file is a PDF (by file extension or PDF magic bytes)
    if file.filename.lower().endswith('.pdf') or contents.startswith(b'%PDF'):
        import pdfplumber
        text = ""
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        if not text.strip():
            return {"error": "The uploaded PDF is empty or does not contain extractable text."}
    else:
        # Fallback to standard OCR if it is an image
        image = Image.open(io.BytesIO(contents))
        text = pytesseract.image_to_string(image)
        
    return get_legal_guidance(text)

@app.post("/agent-query")
def agent_query(req: QueryRequest):
    result = run_agent(req.query, thread_id=req.thread_id)
    return {"response": result}