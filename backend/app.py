import gradio as gr
from main import app as fastapi_app

# HaqAI Gradio Landing View for the API Space
with gr.Blocks(title="HaqAI Legal Backend API") as demo:
    gr.Markdown(
        """
        # ⚖️ HaqAI Legal Intelligence API Server
        The backend API is running and healthy.
        
        - **Documentation:** [/docs](/docs)
        - **Query Endpoint:** `POST /agent-query`
        - **OCR Endpoint:** `POST /upload-image`
        """
    )

# Mount Gradio UI at /status so root endpoints remain 100% standard FastAPI
app = gr.mount_gradio_app(fastapi_app, demo, path="/status")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
