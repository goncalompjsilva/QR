"""
Authentication schemas for request/response models.
"""

from pydantic import BaseModel, Field
from typing import Optional


class UserLogin(BaseModel):
    """User login request."""
    phone_number: str = Field(..., description="User's phone number")
    password: Optional[str] = Field(None, description="User's password (optional for OTP login)")


class UserRegister(BaseModel):
    """User registration request."""
    phone_number: str = Field(..., description="User's phone number")
    email: Optional[str] = Field(None, description="User's email")
    full_name: Optional[str] = Field(None, description="User's full name")
    password: Optional[str] = Field(None, description="User's password")


class TokenResponse(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: int
    role: str


class GoogleAuthRequest(BaseModel):
    """Google OAuth request."""
    code: str = Field(..., description="Authorization code from Google")


class GoogleUserInfo(BaseModel):
    """Google user information."""
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    verified_email: bool = False
