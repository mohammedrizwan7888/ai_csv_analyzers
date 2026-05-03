from fastapi import APIRouter, HTTPException
import pandas as pd
import os

router = APIRouter()

#  Absolute upload folder path
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")


@router.post("/api/analyze/{file_id}")
def analyze_csv(file_id: str):
    try:
        #  Check upload folder exists
        if not os.path.exists(UPLOAD_DIR):
            raise HTTPException(status_code=404, detail="Upload folder not found")

        #  Find uploaded file by UUID start
        files = os.listdir(UPLOAD_DIR)
        matched_files = [f for f in files if f.startswith(file_id)]

        if not matched_files:
            raise HTTPException(status_code=404, detail="File not found")

        file_path = os.path.join(UPLOAD_DIR, matched_files[0])

        # Read CSV safely
        df = pd.read_csv(file_path)

        #  Generate safe stats
        stats = df.describe(include="all").fillna("").astype(str).to_dict()

        summary = {
            "rows": int(len(df)),
            "columns": list(df.columns),
            "missing_values": df.isnull().sum().astype(int).to_dict(),
            "duplicates": int(df.duplicated().sum()),
            "stats": stats,
        }

        return {
            "message": "Analysis complete",
            "summary": summary,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
