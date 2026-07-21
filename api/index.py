import sys
from pathlib import Path

# Add backend directory to Python path so relative imports inside main.py work
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from main import app
