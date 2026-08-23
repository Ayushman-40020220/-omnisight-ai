from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.rag.rag_engine import rag_engine
from app.rag.groq_client import groq_client
from app.db.database import DatabaseManager

router = APIRouter(prefix="/rag", tags=["Multimodal RAG & Groq LLM"])

class IncidentReportRequest(BaseModel):
    query: str
    camera_filter: Optional[str] = None

class ChatCopilotRequest(BaseModel):
    message: str
    context_camera_id: Optional[str] = None

@router.post("/incident-report")
def generate_report(req: IncidentReportRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query prompt required for incident generation")
        
    report = rag_engine.generate_incident_report(req.query, req.camera_filter or "")
    return report

@router.post("/chat")
def copilot_chat(req: ChatCopilotRequest):
    system_prompt = (
        "You are OmniSight's AI Security & Safety Copilot. "
        "Answer user questions accurately using multi-camera video telemetry, object tracking data, and safety logs. "
        "Keep answers professional, concise, and formatted in clear markdown."
    )
    user_prompt = f"User Question: {req.message}"
    if req.context_camera_id:
        user_prompt += f"\nCurrent Active Camera Context: {req.context_camera_id}"
        
    reply = groq_client.generate_completion(system_prompt, user_prompt)
    return {
        "reply": reply,
        "model": groq_client.model if groq_client.is_configured() else "OmniSight-Autonomous-LLM",
        "timestamp": "2026-08-23"
    }

@router.get("/incidents")
def get_incidents():
    return {
        "incidents": DatabaseManager.get_incidents()
    }
