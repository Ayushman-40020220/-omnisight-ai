import time
import math
import random
from typing import List, Dict, Any

CAMERAS_CONFIG = [
    {
        "id": "CAM-01",
        "name": "North Entrance & Perimeter",
        "zone": "Zone A - Gate 1",
        "fps": 30,
        "base_threat": "NORMAL",
        "actors": [
            {"id": "act_101", "type": "person", "label": "Security Officer #4", "color": "#00FF66", "speed": 0.008, "path": "patrol"},
            {"id": "act_102", "type": "car", "label": "Courier Van (FedEx)", "color": "#00E5FF", "speed": 0.015, "path": "linear_x"},
            {"id": "act_103", "type": "backpack", "label": "Unattended Bag", "color": "#FF0055", "speed": 0, "path": "static_anomaly"}
        ]
    },
    {
        "id": "CAM-02",
        "name": "Restricted Research Wing",
        "zone": "Zone B - Lab 4",
        "fps": 30,
        "base_threat": "HIGH",
        "actors": [
            {"id": "act_201", "type": "person", "label": "Dr. Aris Thorne", "color": "#00E5FF", "speed": 0.005, "path": "circular"},
            {"id": "act_202", "type": "unauthorized_person", "label": "Unknown Intruder (No Badge)", "color": "#FF0033", "speed": 0.012, "path": "erratic"},
            {"id": "act_203", "type": "door_access", "label": "Biometric Breach Alert", "color": "#FFAA00", "speed": 0, "path": "static_door"}
        ]
    },
    {
        "id": "CAM-03",
        "name": "Main Loading Bay & Logistics",
        "zone": "Zone C - Dock 2",
        "fps": 30,
        "base_threat": "ELEVATED",
        "actors": [
            {"id": "act_301", "type": "forklift", "label": "Forklift #09 (Speeding)", "color": "#FFCC00", "speed": 0.02, "path": "linear_y"},
            {"id": "act_302", "type": "person", "label": "Warehouse Worker (No Helmet)", "color": "#FF5500", "speed": 0.009, "path": "patrol"},
            {"id": "act_303", "type": "pallet", "label": "Blocked Fire Exit Pallet", "color": "#FF0055", "speed": 0, "path": "static_dock"}
        ]
    },
    {
        "id": "CAM-04",
        "name": "Server Room & Core Datacenter",
        "zone": "Zone D - Vault",
        "fps": 30,
        "base_threat": "NORMAL",
        "actors": [
            {"id": "act_401", "type": "person", "label": "Lead SysAdmin (Badge #891)", "color": "#00FFCC", "speed": 0.004, "path": "circular"},
            {"id": "act_402", "type": "rack_sensor", "label": "Thermal Rack Cluster #12 (41°C)", "color": "#00E5FF", "speed": 0, "path": "static_rack"}
        ]
    }
]

def generate_live_camera_frame_data(camera_id: str, elapsed_time: float) -> Dict[str, Any]:
    camera = next((c for c in CAMERAS_CONFIG if c["id"] == camera_id), CAMERAS_CONFIG[0])
    
    detections: List[Dict[str, Any]] = []
    highest_threat = "NORMAL"
    
    for idx, actor in enumerate(camera["actors"]):
        path_type = actor["path"]
        speed = actor["speed"]
        
        # Calculate dynamic bounding box coordinates (normalized 0.0 - 1.0)
        if path_type == "patrol":
            t = (elapsed_time * speed) % (2 * math.pi)
            x_center = 0.5 + 0.3 * math.sin(t)
            y_center = 0.5 + 0.15 * math.cos(t)
            w, h = 0.12, 0.28
        elif path_type == "linear_x":
            t = (elapsed_time * speed) % 1.2 - 0.1
            x_center = t
            y_center = 0.65
            w, h = 0.25, 0.20
        elif path_type == "linear_y":
            t = (elapsed_time * speed) % 1.2 - 0.1
            x_center = 0.4
            y_center = t
            w, h = 0.18, 0.22
        elif path_type == "circular":
            t = (elapsed_time * speed) % (2 * math.pi)
            x_center = 0.5 + 0.2 * math.cos(t)
            y_center = 0.45 + 0.18 * math.sin(t)
            w, h = 0.14, 0.29
        elif path_type == "erratic":
            t = (elapsed_time * speed * 2) % (2 * math.pi)
            x_center = 0.7 + 0.15 * math.sin(t * 1.5)
            y_center = 0.35 + 0.2 * math.cos(t)
            w, h = 0.13, 0.27
        elif path_type == "static_anomaly":
            x_center, y_center = 0.32, 0.72
            w, h = 0.09, 0.12
        elif path_type == "static_door":
            x_center, y_center = 0.85, 0.40
            w, h = 0.12, 0.35
        elif path_type == "static_dock":
            x_center, y_center = 0.15, 0.80
            w, h = 0.16, 0.18
        else: # static_rack
            x_center, y_center = 0.60, 0.50
            w, h = 0.20, 0.40
            
        # Clamp to bounds
        xmin = max(0.02, min(0.95 - w, x_center - w/2))
        ymin = max(0.02, min(0.95 - h, y_center - h/2))
        xmax = xmin + w
        ymax = ymin + h
        
        confidence = round(0.85 + 0.12 * math.sin(elapsed_time * 0.5 + idx), 2)
        confidence = min(0.99, max(0.70, confidence))
        
        threat = "NORMAL"
        if actor["type"] in ["unauthorized_person", "backpack", "weapon"]:
            threat = "CRITICAL" if actor["type"] == "unauthorized_person" else "HIGH"
        elif "No Helmet" in actor["label"] or "Speeding" in actor["label"] or "Breach" in actor["label"]:
            threat = "ELEVATED"
            
        if threat in ["CRITICAL", "HIGH"] and highest_threat != "CRITICAL":
            highest_threat = threat
        elif threat == "ELEVATED" and highest_threat == "NORMAL":
            highest_threat = threat
            
        detections.append({
            "actor_id": actor["id"],
            "class_name": actor["type"],
            "label": actor["label"],
            "confidence": confidence,
            "bbox": [round(ymin, 3), round(xmin, 3), round(ymax, 3), round(xmax, 3)],
            "color": actor["color"],
            "threat": threat,
            "velocity_mps": round(speed * 120, 1),
            "dwell_time_sec": round(elapsed_time % 300, 1)
        })
        
    scene_summary = f"{len(detections)} entities tracked in {camera['zone']}. Highest threat posture: {highest_threat}."
    
    return {
        "camera_id": camera["id"],
        "camera_name": camera["name"],
        "zone": camera["zone"],
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime()),
        "fps": camera["fps"],
        "threat_level": highest_threat,
        "object_count": len(detections),
        "detections": detections,
        "scene_summary": scene_summary
    }
