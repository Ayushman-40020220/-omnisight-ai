import sys
import os

# Add the project root and backend directory to the python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(project_root, "backend"))

# Import the FastAPI instance
from app.main import app
