from fastapi import APIRouter, HTTPException
import pandas as pd
import os

router = APIRouter()

UPLOAD_DIR = "app/uploads"


@router.get("/api/insights/{file_id}")
def get_ai_insights(file_id: str):
    files = os.listdir(UPLOAD_DIR)
    matched_files = [f for f in files if f.startswith(file_id)]

    if not matched_files:
        raise HTTPException(status_code=404, detail="File not found")

    file_path = os.path.join(UPLOAD_DIR, matched_files[0])
    df = pd.read_csv(file_path)

    insights = []

    # revenue insights
    if "revenue" in df.columns:
        insights.append(f"Total Revenue: ₹{df['revenue'].sum()}")
        insights.append(f"Average Revenue: ₹{df['revenue'].mean():.2f}")
        insights.append(f"Best Revenue Day: ₹{df['revenue'].max()}")

    if "orders" in df.columns:
        insights.append(f"Total Orders: {df['orders'].sum()}")
        insights.append(f"Average Orders: {df['orders'].mean():.2f}")

    if "ad_spend" in df.columns:
        insights.append(f"Total Ad Spend: ₹{df['ad_spend'].sum()}")

    if "category" in df.columns:
        top_category = df["category"].mode()[0]
        insights.append(f"Top Category: {top_category}")

    return {
        "message": "AI insights generated",
        "insights": insights
    }