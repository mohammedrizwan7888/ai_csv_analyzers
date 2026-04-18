from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import insights
from app.routes import export
from app.routes import upload, data_preview, charts
from app.routes import history


app = FastAPI(title="AI CSV Analyzer")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(upload.router)
app.include_router(data_preview.router)
app.include_router(charts.router)
app.include_router(insights.router)
app.include_router(export.router)
app.include_router(history.router)