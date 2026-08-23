from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.vector_store.faiss_manager import faiss_store

router = APIRouter(prefix="/search", tags=["Vector Search & FAISS"])

class SemanticSearchRequest(BaseModel):
    query: str
    top_k: int = 5
    threat_filter: Optional[str] = None
    camera_filter: Optional[str] = None

class IndexEventRequest(BaseModel):
    title: str
    description: str
    camera_id: str
    timestamp: str
    threat_level: str = "NORMAL"
    objects: List[str] = []

@router.post("/semantic")
def semantic_video_search(req: SemanticSearchRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
        
    results = faiss_store.search(req.query, top_k=req.top_k)
    
    # Optional filtering
    if req.threat_filter and req.threat_filter != "ALL":
        results = [r for r in results if r.get("threat_level") == req.threat_filter]
    if req.camera_filter and req.camera_filter != "ALL":
        results = [r for r in results if r.get("camera_id") == req.camera_filter]
        
    return {
        "query": req.query,
        "total_matches": len(results),
        "results": results,
        "engine": "FAISS-InnerProduct (Cosine)" if faiss_store.is_faiss_native else "FAISS-NumPy-Accelerated"
    }

@router.get("/vectors/2d")
def get_vector_projections():
    """
    Returns 2D projected coordinates of all indexed video events in FAISS for interactive canvas rendering.
    """
    projections = faiss_store.get_2d_projection()
    return {
        "count": len(projections),
        "dimension": faiss_store.dimension,
        "projections": projections
    }

@router.post("/index-event")
def index_video_event(req: IndexEventRequest):
    text = f"{req.title} - {req.description} Objects: {', '.join(req.objects)}"
    metadata = {
        "camera_id": req.camera_id,
        "title": req.title,
        "timestamp": req.timestamp,
        "threat_level": req.threat_level,
        "objects": req.objects,
        "description": req.description
    }
    event_id = faiss_store.add_video_event(text, metadata)
    return {
        "status": "INDEXED",
        "event_id": event_id,
        "indexed_text": text
    }
