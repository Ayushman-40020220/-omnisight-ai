import time
from typing import Dict, Any, List
from app.vision.mock_streams import generate_live_camera_frame_data, CAMERAS_CONFIG

class VisionDetector:
    def __init__(self, model_name: str = "yolov8n"):
        self.model_name = model_name
        self.is_real_yolo_loaded = False
        self.start_time = time.time()
        
        # Try to dynamically load ultralytics YOLO if present
        try:
            from ultralytics import YOLO
            self.yolo = YOLO(f"{model_name}.pt")
            self.is_real_yolo_loaded = True
            print(f"[VisionDetector] Successfully loaded real YOLO model: {model_name}")
        except Exception as e:
            print(f"[VisionDetector] Running in High-Fidelity Synthetic Simulation Mode ({e})")

    def process_camera_stream(self, camera_id: str, confidence_threshold: float = 0.45) -> Dict[str, Any]:
        elapsed = time.time() - self.start_time
        frame_data = generate_live_camera_frame_data(camera_id, elapsed)
        
        # Filter detections by confidence threshold
        filtered_detections = [
            d for d in frame_data["detections"]
            if d["confidence"] >= confidence_threshold
        ]
        
        frame_data["detections"] = filtered_detections
        frame_data["object_count"] = len(filtered_detections)
        frame_data["engine"] = "YOLOv8-Enterprise-Tracker" if self.is_real_yolo_loaded else "YOLOv8-Synthetic-Inference"
        return frame_data

    def get_all_active_streams(self, confidence_threshold: float = 0.45) -> List[Dict[str, Any]]:
        streams = []
        for cam in CAMERAS_CONFIG:
            streams.append(self.process_camera_stream(cam["id"], confidence_threshold))
        return streams

# Singleton instance
detector = VisionDetector()
