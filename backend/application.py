#!/usr/bin/env python3
"""
Application server script for the QR Backend API.
"""

import uvicorn
from app.core.config import settings

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info" if not settings.debug else "debug"
    )
