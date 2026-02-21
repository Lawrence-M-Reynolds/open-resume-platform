from fastapi import FastAPI, Response, Request
import base64
import os
import uuid
import subprocess

# ONLY ONE app instance
app = FastAPI(redirect_slashes=False)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Incoming request: {request.method} {request.url.path}")
    return await call_next(request)

# Healthcheck for Railway (handles GET / and GET /health)
@app.get("/")
@app.get("/health")
def health():
    return {"status": "ok"}

# The conversion logic (handles any POST request)
@app.api_route("/{path_name:path}", methods=["POST"])
async def convert(request: Request, path_name: str):
    print(f"!!! TRAP TRIGGERED !!! Path: {path_name}")

    try:
        data = await request.json()
        markdown_content = data.get("text", "")
        output_format = data.get("to", "docx")

        files_data = data.get("files", {}) or {}
        ref_doc_base64 = files_data.get("referenceDoc")

        temp_filename = f"style_{uuid.uuid4()}.docx"
        cmd = ['pandoc', '-f', 'markdown', '-t', output_format]

        if ref_doc_base64:
            with open(temp_filename, "wb") as f:
                f.write(base64.b64decode(ref_doc_base64))
            cmd.extend(['--reference-doc', temp_filename])

        process = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )

        stdout, stderr = process.communicate(input=markdown_content.encode('utf-8'))

        if os.path.exists(temp_filename):
            os.remove(temp_filename)

        # Basic error handling for Pandoc itself
        if stderr and not stdout:
            print(f"Pandoc Error: {stderr.decode()}")
            return Response(content=stderr, status_code=400)

        mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        return Response(content=stdout, media_type=mime)

    except Exception as e:
        print(f"Error: {e}")
        return Response(content=str(e), status_code=500)