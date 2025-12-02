# app/main.py 
 
# FastApi modulea
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse

from typing import List
import math

# Custom module
# from inference.model_loader import load_model


# Load model globally ONCE
# MODEL_PATH = "/models/DiTXL-05x01x01b-last.ckpt"
# model = load_model(MODEL_PATH, device="cuda")


app = FastAPI(
    title="LatentFlow Inference API",
    description="API for controlled generative image manipulation using VAEs and Flow-Matching models.",
    version="1.0.0"
)


@app.get("/")
async def root():
    return {"message": "Hello World"}


def generate_dummy_sequence(num_steps: int):
    """Generate a dummy sequence of interpolated image filenames."""
    return [f"interpolated_image_step_{i}.png" for i in range(num_steps)]


@app.post("/interpolate/")
async def interpolate_images(
    image1: UploadFile = File(...),
    image2: UploadFile = File(...),
    steps: int = Form(...),
    alpha: float = Form(...)
):
    """
   Image interpolation endpoint:
    - image1, image2: uploaded files
    - steps: number of selected interpolation steps
    - alpha: value between 0.0 and 1.0
    Returns the interpolated image at the alpha position.
    """

    ALLOWED_TYPES = ["image/png", "image/jpeg"]

    if image1 is None or image2 is None:
        raise HTTPException(status_code=400, detail="Two images need to be uploaded.")
    
    if image1.content_type not in ALLOWED_TYPES or image2.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only PNG or JPEG images are allowed.")

    if steps < 1:
        raise HTTPException(status_code=400, detail="Steps need to be larger than 0.")
        
    if not 0 <= alpha <= 1:
        raise HTTPException(status_code=400, detail="Alpha must be between 0 and 1.")

    # Create dummy sequence
    interpolated_images = generate_dummy_sequence(steps)

    # Compute which step to select
    step_index = min(math.floor(alpha * steps), steps - 1)
    selected_image = interpolated_images[step_index]

    return {
        "image1_filename": image1.filename,
        "image2_filename": image2.filename,
        "steps": steps,
        "alpha": alpha,
        "selected_step": step_index,
        "selected_image": selected_image,
        "all_images": interpolated_images
    }

