from app.vector_store.faiss_manager import faiss_store
from app.db.database import DatabaseManager

HISTORICAL_VIDEO_EVENTS = [
    {
        "camera_id": "CAM-01",
        "title": "Unattended Backpack on Perimeter Bench",
        "timestamp": "14:22:15",
        "video_time_sec": 42.5,
        "threat_level": "HIGH",
        "objects": ["backpack", "person"],
        "description": "Black tactical backpack left unattended on bench near North Gate entrance for over 18 minutes without owner present.",
        "thumbnail_color": "#FF0055"
    },
    {
        "camera_id": "CAM-02",
        "title": "Unauthorized Tailgating into Research Lab 4",
        "timestamp": "14:35:40",
        "video_time_sec": 115.0,
        "threat_level": "CRITICAL",
        "objects": ["unauthorized_person", "door_breach"],
        "description": "Unidentified individual without biometric credentials entered Research Lab 4 behind authorized staff member.",
        "thumbnail_color": "#FF0033"
    },
    {
        "camera_id": "CAM-03",
        "title": "Forklift Speeding Violation & Fire Exit Blockade",
        "timestamp": "15:04:10",
        "video_time_sec": 204.0,
        "threat_level": "ELEVATED",
        "objects": ["forklift", "pallet", "worker"],
        "description": "Forklift #09 exceeded dock speed limit (14 mph in 5 mph zone) and placed stacked wooden pallets blocking Emergency Exit 2.",
        "thumbnail_color": "#FFAA00"
    },
    {
        "camera_id": "CAM-04",
        "title": "Datacenter Rack #12 Thermal Anomaly",
        "timestamp": "15:18:22",
        "video_time_sec": 318.0,
        "threat_level": "HIGH",
        "objects": ["server_rack", "thermal_hotspot"],
        "description": "Thermal camera detected temperature spike to 46.2°C in Rack Cluster 12 containing primary neural network training servers.",
        "thumbnail_color": "#FF5500"
    },
    {
        "camera_id": "CAM-01",
        "title": "FedEx Delivery Truck Arrival at Gate 1",
        "timestamp": "15:30:05",
        "video_time_sec": 450.0,
        "threat_level": "NORMAL",
        "objects": ["truck", "person"],
        "description": "White delivery truck arrived at Gate 1, driver scanned badge and proceeded to loading dock with scheduled supply shipment.",
        "thumbnail_color": "#00E5FF"
    },
    {
        "camera_id": "CAM-03",
        "title": "Warehouse Worker Operating Without Required Safety Helmet",
        "timestamp": "15:45:19",
        "video_time_sec": 545.0,
        "threat_level": "ELEVATED",
        "objects": ["worker", "safety_violation"],
        "description": "Technician observed moving heavy cargo under overhead gantry crane without mandatory ANSI hardhat.",
        "thumbnail_color": "#FFCC00"
    },
    {
        "camera_id": "CAM-02",
        "title": "Dr. Thorne Conducting Scheduled Cryo-chamber Calibration",
        "timestamp": "16:10:00",
        "video_time_sec": 670.0,
        "threat_level": "NORMAL",
        "objects": ["person", "laboratory_equipment"],
        "description": "Lead scientist entered cleanroom chamber with full PPE for routine sensor calibration protocol.",
        "thumbnail_color": "#00FF66"
    }
]

def seed_vector_index():
    if len(faiss_store.metadata) == 0:
        print("[VectorIndexer] Indexing historical video event embeddings into FAISS...")
        for event in HISTORICAL_VIDEO_EVENTS:
            text = f"{event['title']} - {event['description']} Objects: {', '.join(event['objects'])}"
            event_id = faiss_store.add_video_event(text, event)
            
            # Log initial detections in SQLite
            DatabaseManager.log_detection({
                "id": f"det_init_{event_id}",
                "camera_id": event["camera_id"],
                "timestamp": event["timestamp"],
                "objects": event["objects"],
                "threat_level": event["threat_level"],
                "scene_summary": event["description"],
                "embedding_id": event_id
            })
        print(f"[VectorIndexer] Successfully populated FAISS vector store with {len(HISTORICAL_VIDEO_EVENTS)} video events.")

# Run seeding
seed_vector_index()
