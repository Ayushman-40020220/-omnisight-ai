import os

class Settings:
    PROJECT_NAME: str = "OmniSight AI - Multimodal Video Intelligence Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Security / Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "omnisight_ultra_secret_key_jwt_2026_vector_rag")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # LLM / Groq API
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    
    # AI / Vision / FAISS Settings
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    VECTOR_DIMENSION: int = 384
    DEFAULT_CONFIDENCE_THRESHOLD: float = 0.45
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()

