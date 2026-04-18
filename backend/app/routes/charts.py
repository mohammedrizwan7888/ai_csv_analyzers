from fastapi import APIRouter, HTTPException
import pandas as pd
import os

router = APIRouter()

UPLOAD_DIR = "app/uploads"


@router.get("/api/charts/{file_id}")
def get_chart_data(file_id: str):
    files = os.listdir(UPLOAD_DIR)
    matched_files = [f for f in files if f.startswith(file_id)]

    if not matched_files:
        raise HTTPException(status_code=404, detail="File not found")

    file_path = os.path.join(UPLOAD_DIR, matched_files[0])

    try:
        df = pd.read_csv(file_path)

        # ✅ force numeric conversion
        target_cols = ["revenue", "orders", "ad_spend"]

        for col in target_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

        numeric_cols = [col for col in target_cols if col in df.columns]

        if not numeric_cols:
            raise HTTPException(
                status_code=400,
                detail="No numeric columns found"
            )

        chart_column = numeric_cols[0]

        chart_data = df[["date"] + numeric_cols].copy()
        chart_data["date"] = chart_data["date"].astype(str)

        return {
            "chart_column": chart_column,
            "data": chart_data.to_dict(orient="records")
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))