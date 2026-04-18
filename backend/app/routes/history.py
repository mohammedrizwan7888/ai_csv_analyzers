from fastapi import APIRouter
import os

router = APIRouter()

UPLOAD_DIR = "app/uploads"


@router.get("/api/history")
def get_upload_history():
    if not os.path.exists(UPLOAD_DIR):
        return {"history": []}

    files = os.listdir(UPLOAD_DIR)

    history = []
    for file in files:
        file_id = file.split("_")[0]
        history.append({
            "file_id": file_id,
            "filename": file
        })

    return {"history": history}