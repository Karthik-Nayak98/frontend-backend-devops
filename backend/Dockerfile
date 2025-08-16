# Stage 1: Build stage
FROM python:3.12-alpine AS builder

WORKDIR /app

COPY requirements.txt .

# Install dependencies into a temporary folder
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

COPY . .

# Stage 2: Production stage
FROM python:3.12-alpine

WORKDIR /backend

# Copy installed packages from builder stage
COPY --from=builder /install /usr/local

# Copy application code
COPY --from=builder /app .

EXPOSE 8000

CMD ["python3", "app.py"]
