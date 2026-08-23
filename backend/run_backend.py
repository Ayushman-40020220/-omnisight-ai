import sys
import os
import uvicorn

# Ensure app package is in python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

if __name__ == "__main__":
    print("=" * 60)
    print("🔥 Starting OmniSight AI Multimodal Intelligence Backend on http://localhost:8000")
    print("📚 Swagger API Docs: http://localhost:8000/docs")
    print("=" * 60)
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
