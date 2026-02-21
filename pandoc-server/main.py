from fastapi import FastAPI, Response, Request
import base64
import os
import uuid
import subprocess

# Only ONE instance
app = FastAPI()

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Incoming request: {request.method} {request.url.path}")
    return await call_next(request)

@app.get("/")
@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/convert")
async def convert(request: Request):
    data = await request.json()
    markdown_content = data.get("text", "")
    output_format = data.get("to", "docx")

    files_data = data.get("files", {})
    ref_doc_base64 = files_data.get("referenceDoc")

    temp_filename = f"style_{uuid.uuid4()}.docx"
    cmd = ['pandoc', '-f', 'markdown', '-t', output_format]

    try:
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

        mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        return Response(content=stdout, media_type=mime)

    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)