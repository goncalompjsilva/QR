"""
Authentication schemas for request/response models.
"""

from pydantic import BaseModel, Field
from typing import Optional, Union
from enum import Enum


class LoginMethod(str, Enum):
    """Supported login methods."""
    PHONE_OTP = "phone_otp"
    EMAIL_PASSWORD = "email_password"
    GOOGLE_OAUTH = "google_oauth"


class PhoneOTPRequest(BaseModel):
    """Request OTP for phone number."""
    phone_number: str = Field(..., description="User's phone number")


class PhoneOTPVerify(BaseModel):
    """Verify OTP for phone number login."""
    phone_number: str = Field(..., description="User's phone number")
    otp_code: str = Field(..., description="6-digit OTP code")


class EmailPasswordLogin(BaseModel):
    """Email and password login request."""
    email: str = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")


class UserLogin(BaseModel):
    """User login request - legacy support."""
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


class OTPResponse(BaseModel):
    """OTP request response."""
    message: str
    expires_in: int = 600  # 10 minutes
