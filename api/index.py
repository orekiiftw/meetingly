import sys
from pathlib import Path

# Add backend directory to Python path so relative imports inside main.py work
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from main import app

class VercelPathMiddleware:
    """
    ASGI middleware to prepend '/api' back onto incoming request paths.
    Vercel strips '/api' when routing requests to api/index.py.
    """
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] in ("http", "websocket"):
            path = scope.get("path", "")
            if not path.startswith("/api"):
                if path.startswith("/"):
                    scope["path"] = f"/api{path}"
                else:
                    scope["path"] = f"/api/{path}"
        await self.app(scope, receive, send)

# Wrap the FastAPI app with the path correction middleware
app = VercelPathMiddleware(app)
