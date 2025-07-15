"""API routes package."""

from fastapi import APIRouter
from app.api import auth

# Create main API router
api_router = APIRouter()

# Include all route modules
api_router.include_router(auth.router)
