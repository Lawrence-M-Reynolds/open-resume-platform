from fastapi import FastAPI, Response, Request
import base64
import os
import uuid
import subprocess

app = FastAPI()

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Incoming request: {request.method} {request.url.path}")
    response = await call_next(request)
    return response

# 1. Disable strict slashes (so /convert and /convert/ both work)
app = FastAPI(redirect_slashes=False)

# 2. Use a "Catch-All" route to be 100% sure
@app.api_route("/{path_name:path}", methods=["POST"])
async def catch_all(request: Request, path_name: str):
    # This print will prove it's working in your logs
    print(f"!!! TRAP TRIGGERED !!! Path: {path_name}")

    # YOUR CONVERSION LOGIC HERE
    data = await request.json()
    # ... etc

@app.post("/")
@app.post("/convert")
async def convert(request: Request):
    data = await request.json()
    markdown_content = data.get("text", "")
    output_format = data.get("to", "docx")

    files_data = data.get("files", {})
    ref_doc_base64 = files_data.get("referenceDoc")

    # Create a unique filename for this specific request
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
        # The 'finally' block ensures cleanup even if Pandoc crashes
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

@app.get("/health")
def health(): return {"status": "ok"}