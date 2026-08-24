import json
import sqlite3
from datetime import datetime
from typing import List, Dict, Any, Optional
import os

DB_PATH = "/tmp/omnisight.db" if os.getenv("VERCEL") else "omnisight.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL,
        full_name TEXT,
        role TEXT DEFAULT 'operator',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Camera Streams Registry
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cameras (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        zone TEXT NOT NULL,
        status TEXT DEFAULT 'ACTIVE',
        resolution TEXT DEFAULT '1080p',
        fps INTEGER DEFAULT 30,
        threat_level TEXT DEFAULT 'LOW',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Video Detections Archive
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS detections (
        id TEXT PRIMARY KEY,
        camera_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        objects TEXT NOT NULL, -- JSON list of detected objects with bboxes and confidence
        threat_level TEXT NOT NULL,
        scene_summary TEXT NOT NULL,
        embedding_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Incident Reports & RAG Audits
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        threat_level TEXT NOT NULL,
        camera_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        summary TEXT NOT NULL,
        root_cause TEXT,
        recommended_actions TEXT, -- JSON array
        evidence_clip_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    conn.commit()
    conn.close()

# Seed default cameras and sample incidents if empty
def seed_initial_data():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM cameras")
    if cursor.fetchone()[0] == 0:
        cameras = [
            ("CAM-01", "North Entrance & Perimeter", "Perimeter Gate 1", "Zone A", "ACTIVE", "4K", 60, "NORMAL"),
            ("CAM-02", "Restricted Research Wing", "Research Lab 4", "Zone B", "ACTIVE", "1080p", 30, "HIGH"),
            ("CAM-03", "Main Loading Bay & Logistics", "Logistics Dock 2", "Zone C", "ACTIVE", "1080p", 30, "ELEVATED"),
            ("CAM-04", "Server Room & Core Datacenter", "Core Vault", "Zone D", "ACTIVE", "4K", 30, "NORMAL"),
        ]
        cursor.executemany("INSERT INTO cameras (id, name, location, zone, status, resolution, fps, threat_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", cameras)

    
    conn.commit()
    conn.close()

# Database Helper Class
class DatabaseManager:
    @staticmethod
    def get_connection():
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    @staticmethod
    def get_cameras() -> List[Dict[str, Any]]:
        conn = DatabaseManager.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM cameras")
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return rows

    @staticmethod
    def log_detection(detection_data: Dict[str, Any]):
        conn = DatabaseManager.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT OR REPLACE INTO detections (id, camera_id, timestamp, objects, threat_level, scene_summary, embedding_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            detection_data["id"],
            detection_data["camera_id"],
            detection_data["timestamp"],
            json.dumps(detection_data.get("objects", [])),
            detection_data.get("threat_level", "NORMAL"),
            detection_data.get("scene_summary", ""),
            detection_data.get("embedding_id", 0)
        ))
        conn.commit()
        conn.close()

    @staticmethod
    def get_recent_detections(limit: int = 50) -> List[Dict[str, Any]]:
        conn = DatabaseManager.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM detections ORDER BY timestamp DESC LIMIT ?", (limit,))
        rows = []
        for r in cursor.fetchall():
            d = dict(r)
            try:
                d["objects"] = json.loads(d["objects"])
            except Exception:
                pass
            rows.append(d)
        conn.close()
        return rows

    @staticmethod
    def save_incident(incident: Dict[str, Any]):
        conn = DatabaseManager.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT OR REPLACE INTO incidents (id, title, threat_level, camera_id, timestamp, summary, root_cause, recommended_actions, evidence_clip_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            incident["id"],
            incident["title"],
            incident["threat_level"],
            incident["camera_id"],
            incident["timestamp"],
            incident["summary"],
            incident.get("root_cause", ""),
            json.dumps(incident.get("recommended_actions", [])),
            incident.get("evidence_clip_url", "")
        ))
        conn.commit()
        conn.close()

    @staticmethod
    def get_incidents() -> List[Dict[str, Any]]:
        conn = DatabaseManager.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM incidents ORDER BY created_at DESC")
        rows = []
        for r in cursor.fetchall():
            d = dict(r)
            try:
                d["recommended_actions"] = json.loads(d["recommended_actions"])
            except Exception:
                pass
            rows.append(d)
        conn.close()
        return rows

# Initialize DB on load
init_db()
seed_initial_data()
