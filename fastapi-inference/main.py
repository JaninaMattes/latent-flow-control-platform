from fastapi import FastAPI, File, UploadFile
from typing import Annotated



app = FastAPI(
    title="LatentFlow Inference API",
    description="API for controlled generative image manipulation using VAEs and Flow-Matching models.",
    version="1.0.0"
)



@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/files/")
async def create_file(file: Annotated[bytes, File()]):
    return {"file_size": len(file)}


@app.post("/uploadfile/")
async def create_upload_file(file: UploadFile):
    return {"filename": file.filename}