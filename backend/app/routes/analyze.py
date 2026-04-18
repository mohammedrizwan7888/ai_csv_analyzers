from fastapi import APIRouter, HTTPException
import pandas as pd
import os

router = APIRouter()

UPLOAD_DIR = "app/uploads"


@router.post("/api/analyze/{file_id}")
def analyze_csv(file_id: str):
    files = os.listdir(UPLOAD_DIR)
    matched_files = [f for f in files if f.startswith(file_id)]

    if not matched_files:
        raise HTTPException(status_code=404, detail="File not found")

    file_path = os.path.join(UPLOAD_DIR, matched_files[0])

    # ✅ Read CSV safely
    df = pd.read_csv(file_path)

    # ✅ Safe JSON serializable stats
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