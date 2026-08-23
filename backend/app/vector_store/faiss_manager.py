import math
import hashlib
import numpy as np
from typing import List, Dict, Any, Tuple
from app.config import settings

class FAISSVectorStore:
    def __init__(self, dimension: int = settings.VECTOR_DIMENSION):
        self.dimension = dimension
        self.metadata: List[Dict[str, Any]] = []
        self.vectors: List[np.ndarray] = []
        self.is_faiss_native = False
        self.index = None
        
        # Try loading native FAISS
        try:
            import faiss
            self.index = faiss.IndexFlatIP(dimension) # Inner Product on normalized vectors = Cosine Similarity
            self.is_faiss_native = True
            print(f"[FAISSVectorStore] Initialized Native FAISS Index (Dim: {dimension})")
        except Exception as e:
            print(f"[FAISSVectorStore] Using High-Performance NumPy Vector Store ({e})")
            
        # Try loading Sentence Transformers
        self.transformer = None
        try:
            from sentence_transformers import SentenceTransformer
            self.transformer = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
            print(f"[FAISSVectorStore] Loaded SentenceTransformer: {settings.EMBEDDING_MODEL_NAME}")
        except Exception:
            print("[FAISSVectorStore] Using Deterministic Semantic Text Embedder")

    def encode_text(self, text: str) -> np.ndarray:
        if self.transformer:
            emb = self.transformer.encode([text])[0]
            norm = np.linalg.norm(emb)
            return emb / (norm + 1e-9)
        
        # High-entropy semantic hashing to 384-dim normalized vector
        vec = np.zeros(self.dimension, dtype=np.float32)
        words = text.lower().split()
        
        # Semantic keyword clusters for realistic embeddings
        semantic_anchors = {
            "intruder": 0, "unauthorized": 10, "weapon": 20, "gun": 25, "breach": 30,
            "backpack": 40, "bag": 45, "unattended": 50, "package": 55, "luggage": 60,
            "forklift": 70, "pallet": 80, "warehouse": 90, "speeding": 100, "loading": 110,
            "person": 120, "worker": 130, "helmet": 140, "badge": 150, "security": 160,
            "fire": 170, "smoke": 180, "hazard": 190, "exit": 200, "door": 210,
            "vehicle": 220, "car": 230, "truck": 240, "gate": 250, "parking": 260,
            "server": 270, "datacenter": 280, "thermal": 290, "temperature": 300
        }
        
        for w in words:
            # Check anchors
            matched = False
            for anchor, idx in semantic_anchors.items():
                if anchor in w:
                    vec[idx:idx+10] += 2.5
                    matched = True
            
            # Hash character n-grams for out-of-vocabulary words
            h = int(hashlib.md5(w.encode('utf-8')).hexdigest(), 16)
            pos = h % self.dimension
            val = ((h >> 8) % 100) / 50.0 - 1.0
            vec[pos] += val
            vec[(pos + 7) % self.dimension] += val * 0.5
            
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        else:
            vec[0] = 1.0
        return vec

    def add_video_event(self, text: str, metadata: Dict[str, Any]) -> int:
        vector = self.encode_text(text).astype(np.float32)
        idx = len(self.metadata)
        metadata["id"] = idx
        metadata["text"] = text
        metadata["embedding_preview"] = [round(float(v), 3) for v in vector[:5]]
        
        self.metadata.append(metadata)
        self.vectors.append(vector)
        
        if self.is_faiss_native and self.index is not None:
            self.index.add(np.array([vector]))
            
        return idx

    def search(self, query: str, top_k: int = 6) -> List[Dict[str, Any]]:
        if not self.metadata:
            return []
            
        query_vector = self.encode_text(query).astype(np.float32)
        
        if self.is_faiss_native and self.index is not None and self.index.ntotal > 0:
            scores, indices = self.index.search(np.array([query_vector]), min(top_k, len(self.metadata)))
            results = []
            for score, i in zip(scores[0], indices[0]):
                if i >= 0 and i < len(self.metadata):
                    item = dict(self.metadata[i])
                    item["similarity_score"] = round(float(score), 4)
                    results.append(item)
            return results
        
        # NumPy Cosine Search
        matrix = np.array(self.vectors) # (N, Dim)
        scores = np.dot(matrix, query_vector) # Dot product of normalized vectors = cosine similarity
        top_indices = np.argsort(scores)[::-1][:top_k]
        
        results = []
        for i in top_indices:
            item = dict(self.metadata[i])
            item["similarity_score"] = round(float(scores[i]), 4)
            results.append(item)
            
        return results

    def get_2d_projection(self) -> List[Dict[str, Any]]:
        """
        Projects high-dimensional FAISS vectors to 2D for interactive frontend visualization.
        """
        if not self.vectors:
            return []
            
        matrix = np.array(self.vectors)
        # Simplified PCA projection
        mean = np.mean(matrix, axis=0)
        centered = matrix - mean
        
        # Approximate 2 principal components via SVD
        if len(self.vectors) >= 2:
            try:
                u, s, vt = np.linalg.svd(centered, full_matrices=False)
                proj = centered @ vt[:2].T
                # Normalize to range [-100, 100]
                max_val = np.max(np.abs(proj)) + 1e-6
                proj_norm = (proj / max_val) * 80.0
            except Exception:
                proj_norm = centered[:, :2] * 50
        else:
            proj_norm = np.array([[0, 0]])
            
        projected_points = []
        for i, meta in enumerate(self.metadata):
            x = float(proj_norm[i][0])
            y = float(proj_norm[i][1])
            projected_points.append({
                "id": meta["id"],
                "camera_id": meta.get("camera_id", "CAM-01"),
                "timestamp": meta.get("timestamp", "00:00:00"),
                "label": meta.get("title", meta.get("text", "")),
                "threat": meta.get("threat_level", "NORMAL"),
                "x": round(x, 2),
                "y": round(y, 2),
                "text": meta.get("text", "")
            })
            
        return projected_points

faiss_store = FAISSVectorStore()
