from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import pandas as pd
import os
import json

router = APIRouter()

UPLOAD_DIR = "app/uploads"
EXPORT_DIR = "app/exports"

os.makedirs(EXPORT_DIR, exist_ok=True)


@router.get("/api/export/{file_id}")
def export_results(file_id: str):
    files = os.listdir(UPLOAD_DIR)
    matched_files = [f for f in files if f.startswith(file_id)]

    if not matched_files:
        raise HTTPException(status_code=404, detail="File not found")

    file_path = os.path.join(UPLOAD_DIR, matched_files[0])
    df = pd.read_csv(file_path)

    report = {
        "rows": int(len(df)),
        "columns": list(df.columns),
        "duplicates": int(df.duplicated().sum()),
        "missing_values": df.isnull().sum().astype(int).to_dict(),
    }

    export_path = os.path.join(EXPORT_DIR, f"{file_id}_report.json")

    with open(export_path, "w") as f:
        json.dump(report, f, indent=4)

    return FileResponse(
        export_path,
        media_type="application/json",
        filename=f"{file_id}_report.json"
    )