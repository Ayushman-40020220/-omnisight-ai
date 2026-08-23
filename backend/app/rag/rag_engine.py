import time
import uuid
from typing import Dict, Any, List
from app.vector_store.faiss_manager import faiss_store
from app.rag.groq_client import groq_client
from app.db.database import DatabaseManager

SYSTEM_RAG_PROMPT = """You are the OmniSight Autonomous Multimodal Video Intelligence Copilot.
You specialize in analyzing Computer Vision (YOLO) detections, multi-camera telemetry, and spatial events to produce rigorous Root Cause Analysis (RCA), safety reports, and threat assessments.

Context format provided:
- Camera ID & Zone location
- Timestamp & Dwell Time
- Detected Object Classes & Bounding Box Overlaps
- Threat Level Assessment & Confidence Scores

Provide professional, concise, structured intelligence reports with timestamps, evidence citations, and recommended security/safety procedures.
"""

class RAGEngine:
    def __init__(self):
        self.client = groq_client

    def generate_incident_report(self, query: str, camera_filter: str = "") -> Dict[str, Any]:
        # 1. Retrieve relevant video events from FAISS
        search_results = faiss_store.search(query, top_k=4)
        
        # 2. Build Context Prompt
        context_blocks = []
        for idx, item in enumerate(search_results):
            context_blocks.append(
                f"[Evidence #{idx+1}] Camera: {item.get('camera_id')} | Time: {item.get('timestamp')} | "
                f"Threat: {item.get('threat_level')} | Objects: {item.get('objects')} | Description: {item.get('description')}"
            )
            
        context_str = "\n".join(context_blocks)
        user_prompt = f"""User Request / Query: {query}
        
Retrieved Video Intelligence Context from FAISS:
{context_str}

Please generate an investigative incident report and root cause analysis based on this video evidence."""

        # 3. Call Groq / LLM
        report_markdown = self.client.generate_completion(SYSTEM_RAG_PROMPT, user_prompt)
        
        # 4. Save to Database
        incident_id = f"INC-{int(time.time())}-{uuid.uuid4().hex[:4].upper()}"
        primary_cam = search_results[0].get("camera_id", "CAM-01") if search_results else "CAM-01"
        threat = search_results[0].get("threat_level", "HIGH") if search_results else "NORMAL"
        
        incident_record = {
            "id": incident_id,
            "title": f"Incident Analysis: {query[:50]}",
            "threat_level": threat,
            "camera_id": primary_cam,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime()),
            "summary": report_markdown,
            "root_cause": "Identified via Multimodal FAISS vector retrieval & telemetry correlation.",
            "recommended_actions": ["Dispatch security team", "Lockdown sector", "Export evidentiary video loop"],
            "evidence_clip_url": f"/api/streams/clip/{primary_cam}"
        }
        
        DatabaseManager.save_incident(incident_record)
        
        return {
            "incident_id": incident_id,
            "query": query,
            "report_markdown": report_markdown,
            "evidence_matches": search_results,
            "timestamp": incident_record["timestamp"]
        }

rag_engine = RAGEngine()
