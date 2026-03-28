FROM python:3.12-slim

# Non-interactive apt and pip root ignore
ENV DEBIAN_FRONTEND=noninteractive
ENV PIP_ROOT_USER_ACTION=ignore
ENV PYTHONPATH=/app

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git build-essential ffmpeg libsm6 libxext6 && \
    rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --upgrade pip

# Install PyTorch CPU + torchvision
RUN pip install torch==2.5.1 torchvision==0.20.1 --index-url https://download.pytorch.org/whl/cpu

# Install Lightning
RUN pip install lightning==2.5.0

# Install FastAPI and Uvicorn
RUN pip install fastapi "uvicorn[standard]"

# Set working directory
WORKDIR /app

# Copy the FastAPI app code
COPY . /app

# Expose the port FastAPI will run on
EXPOSE 5000

# Run FastAPI with Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000"]
