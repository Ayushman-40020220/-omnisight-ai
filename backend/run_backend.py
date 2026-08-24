import sys
import os
import uvicorn

# Configure UTF-8 on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Ensure app package is in python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    print("=" * 60)
    print(f"Starting OmniSight AI Multimodal Intelligence Backend on http://{host}:{port}")
    print(f"Swagger API Docs: http://{host}:{port}/docs")
    print("=" * 60)
    uvicorn.run("app.main:app", host=host, port=port, reload=False)


