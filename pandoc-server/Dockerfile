# We use Alpine because it's tiny and stable
FROM alpine:3.18

# 1. Install Pandoc and Python
RUN apk add --no-cache pandoc python3 py3-pip

# 2. Setup the Python environment
WORKDIR /app
RUN pip install fastapi uvicorn --break-system-packages

# 3. Copy your bridge script
COPY main.py .

EXPOSE 8080

# 4. Run the Python bridge
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]