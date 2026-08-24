# OmniSight AI — Multimodal Video Intelligence & Temporal RAG Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB.svg?logo=react&logoColor=black)](https://reactjs.org)
[![YOLOv8](https://img.shields.io/badge/Vision-YOLOv8%20%2B%20OpenCV-00FFFF.svg)](https://ultralytics.com)
[![FAISS](https://img.shields.io/badge/Vector%20DB-FAISS%20Cosine%20Search-FF6F00.svg)](https://github.com/facebookresearch/faiss)
[![Groq](https://img.shields.io/badge/LLM-Groq%20LLaMA--3.3%2070B-F55036.svg)](https://groq.com)

**OmniSight AI** is a production-grade multimodal video intelligence platform that bridges **Computer Vision (YOLO + OpenCV)**, **Dense Vector Retrieval (FAISS + Sentence Transformers)**, **Fast LLM Reasoning (Groq LLaMA-3.3 / RAG Engine)**, **FastAPI Backend (Async, JWT/Auth, WebSockets)**, and a **Cyberpunk Glassmorphism React Dashboard**.

---

## 🌟 Key Architecture & Capabilities

```
                     ┌──────────────────────────────────────────────┐
                     │          React + Vite Frontend UI            │
                     │  - Multi-Camera Live Stream & Canvas Overlays│
                     │  - Natural Language Semantic Video Scrubber  │
                     │  - RAG Incident Copilot & PDF Report Gen     │
                     │  - Interactive 2D/3D Vector Space Explorer   │
                     └──────────────────────┬───────────────────────┘
                                            │ REST / WebSockets / SSE
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │             FastAPI Backend Hub              │
                     │  - JWT & Firebase Authentication             │
                     │  - Async Video Ingestion & Frame Pipeline    │
                     │  - Telemetry & Event Streaming (SSE/WS)      │
                     └───────┬──────────────┬───────────────┬───────┘
                             │              │               │
                             ▼              ▼               ▼
                   ┌────────────────┐┌──────────────┐┌──────────────┐
                   │  Vision Engine ││ Vector Search││  RAG Engine  │
                   │  - YOLOv8      ││ - FAISS Index││ - Groq / LLM │
                   │  - OpenCV      ││ - Sentence   ││ - Contextual │
                   │  - Spatial/    ││   Transformer││   Incident   │
                   │    Trajectory  ││ - Temporal   ││   Reasoning  │
                   │    Analytics   ││   Metadata   ││ - Root-Cause │
                   └────────────────┘└──────────────┘└──────────────┘
```

1. **Multi-Camera YOLO Spatial Detection**: Real-time bounding box tracking, velocity vector calculation, dwell time estimation, and confidence thresholding across concurrent camera streams.
2. **FAISS Dense Vector Temporal Search**: 384-dimensional Sentence Transformer embeddings (`all-MiniLM-L6-v2`) mapped to a FAISS Inner Product index for sub-5ms natural language video clip retrieval.
3. **Multimodal Incident RAG Copilot**: Groq LLaMA-3.3 70B synthesizes cross-camera video telemetry into structured Root Cause Analysis (RCA) and compliance audit reports.
4. **Interactive 2D Vector Space Visualizer**: Real-time PCA dimensionality reduction projecting high-dimensional event clusters on an interactive radar canvas.
5. **Full-Stack Security & Persistence**: JWT token authentication with Firebase token support, backed by SQLite/PostgreSQL relational schemas.

---

## 🚀 Quickstart & Installation

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** & `npm`

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# (Optional) Set Groq API Key for live LLM inference
# export GROQ_API_KEY="your_groq_api_key"

# Run FastAPI backend
python run_backend.py
```
*API will be active at `http://localhost:8000` with interactive Swagger docs at `http://localhost:8000/docs`.*

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
*Frontend will open at `http://localhost:5173`.*

---

## 📚 API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/vision/streams/all` | Live multi-camera YOLO detection telemetry & threat posture |
| `GET` | `/api/vision/stream/{cam_id}` | Detailed optical stream telemetry with confidence filter |
| `POST` | `/api/search/semantic` | FAISS dense vector search across video event archives |
| `GET` | `/api/search/vectors/2d` | 2D PCA projected vector coordinates for visualization |
| `POST` | `/api/rag/incident-report` | Groq LLaMA-3.3 grounded Root Cause Analysis report generator |
| `POST` | `/api/rag/chat` | Conversational video surveillance AI assistant |
| `POST` | `/api/auth/login` | JWT access token authentication |
| `GET` | `/api/health` | System health check & FAISS index status |

---

## 📄 Resume Talking Points
See [RESUME_POINTS.md](./RESUME_POINTS.md) for ready-to-use resume bullet points, metrics, and interview discussion questions.
