from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict, Any, Optional
from app.vision.detector import detector
from app.db.database import DatabaseManager

router = APIRouter(prefix="/vision", tags=["Computer Vision & Streams"])

@router.get("/cameras")
def get_cameras():
    return {
        "count": len(DatabaseManager.get_cameras()),
        "cameras": DatabaseManager.get_cameras()
    }

@router.get("/stream/{camera_id}")
def get_camera_stream(
    camera_id: str,
    confidence: float = Query(0.45, ge=0.1, le=1.0, description="YOLO confidence threshold")
):
    try:
        data = detector.process_camera_stream(camera_id, confidence)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/streams/all")
def get_all_streams(
    confidence: float = Query(0.45, ge=0.1, le=1.0)
):
    streams = detector.get_all_active_streams(confidence)
    threat_counts = {"NORMAL": 0, "ELEVATED": 0, "HIGH": 0, "CRITICAL": 0}
    total_objects = sum(s["object_count"] for s in streams)
    
    for s in streams:
        threat_counts[s["threat_level"]] = threat_counts.get(s["threat_level"], 0) + 1
        
    system_status = "CRITICAL" if threat_counts["CRITICAL"] > 0 else (
        "HIGH" if threat_counts["HIGH"] > 0 else (
            "ELEVATED" if threat_counts["ELEVATED"] > 0 else "NORMAL"
        )
    )
    
    return {
        "status": "ONLINE",
        "system_threat_posture": system_status,
        "active_cameras": len(streams),
        "tracked_entities_count": total_objects,
        "streams": streams
    }

@router.get("/detections/recent")
def get_recent_detections(limit: int = 50):
    return {
        "detections": DatabaseManager.get_recent_detections(limit)
    }

@router.post("/trigger-alert")
def trigger_alert(camera_id: str, alert_type: str = "LOCKDOWN"):
    return {
        "status": "ACKNOWLEDGED",
        "action": alert_type,
        "camera_id": camera_id,
        "protocol": "Sector Lockdown & Siren Dispatched",
        "timestamp": "JUST NOW"
    }
