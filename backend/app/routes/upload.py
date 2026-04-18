from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import uuid

router = APIRouter()

UPLOAD_DIR = "app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/api/upload")
async def upload_csv(file: UploadFile = File(...)):
    # ✅ CSV validation
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")

    # ✅ Save uploaded file
    with open(file_path, "wb") as f:
        f.write(await file.read())

    return {
        "message": "File uploaded successfully",
        "file_id": file_id,
        "filename": file.filename,
    }