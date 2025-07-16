"""
Authentication API endpoints.
"""

from datetime import timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import create_access_token, verify_password, get_password_hash, get_current_user_id
from app.core.config import settings
from app.models.user import User
from app.schemas.auth import (
    UserLogin, 
    UserRegister, 
    TokenResponse, 
    GoogleAuthRequest,
    PhoneOTPRequest,
    PhoneOTPVerify,
    EmailPasswordLogin,
    OTPResponse
)
from app.services.google_oauth import google_oauth
from app.services.otp_service import OTPService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
async def register_user(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    """Register a new user."""
    # Check if user already exists
    existing_user = db.query(User).filter(
        User.phone_number == user_data.phone_number
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this phone number already exists"
        )
    
    # Check email if provided
    if user_data.email:
        existing_email = db.query(User).filter(User.email == user_data.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
    
    # Create new user
    user = User(
        phone_number=user_data.phone_number,
        email=user_data.email,
        full_name=user_data.full_name,
        password_hash=get_password_hash(user_data.password) if user_data.password else None,
        role="customer"
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role},
        expires_delta=access_token_expires
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.access_token_expire_minutes * 60,
        user_id=user.id,
        role=user.role
    )


# === Phone Number + OTP Authentication ===
@router.post("/phone/request-otp", response_model=OTPResponse)
async def request_phone_otp(
    otp_request: PhoneOTPRequest,
    db: Session = Depends(get_db)
):
    """Request OTP for phone number authentication."""
    try:
        # Generate and send OTP
        otp_code = OTPService.create_otp(db, otp_request.phone_number)
        
        # Send SMS (in production, integrate with SMS service)
        success = OTPService.send_otp_sms(otp_request.phone_number, otp_code)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send OTP SMS"
            )
        
        return OTPResponse(
            message="OTP sent successfully",
            expires_in=600  # 10 minutes
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send OTP: {str(e)}"
        )


@router.post("/phone/verify-otp", response_model=TokenResponse)
async def verify_phone_otp(
    otp_verify: PhoneOTPVerify,
    db: Session = Depends(get_db)
):
    """Verify OTP and login user."""
    # Verify OTP
    is_valid = OTPService.verify_otp(db, otp_verify.phone_number, otp_verify.otp_code)
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired OTP code"
        )
    
    # Find or create user
    user = db.query(User).filter(User.phone_number == otp_verify.phone_number).first()
    
    if not user:
        # Create new user if doesn't exist
        user = User(
            phone_number=otp_verify.phone_number,
            phone_verified=True,
            role="customer"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Mark phone as verified
        user.phone_verified = True
        db.commit()
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role},
        expires_delta=access_token_expires
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.access_token_expire_minutes * 60,
        user_id=user.id,
        role=user.role
    )


# === Email + Password Authentication ===
@router.post("/email/login", response_model=TokenResponse)
async def login_with_email(
    login_data: EmailPasswordLogin,
    db: Session = Depends(get_db)
):
    """Login user with email and password."""
    # Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This account was created with OAuth. Please use Google login or phone number authentication."
        )
    
    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role},
        expires_delta=access_token_expires
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.access_token_expire_minutes * 60,
        user_id=user.id,
        role=user.role
    )


@router.post("/login", response_model=TokenResponse)
async def login_user(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Legacy login endpoint with phone number and password.
    
    DEPRECATED: Use the new authentication methods instead:
    - Phone + OTP: POST /auth/phone/request-otp → POST /auth/phone/verify-otp
    - Email + Password: POST /auth/email/login
    - Google OAuth: GET /auth/google/url → POST /auth/google/callback
    """
    # Find user by phone number
    user = db.query(User).filter(User.phone_number == user_data.phone_number).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid phone number or password"
        )
    
    # Verify password (if user has one)
    if user.password_hash and user_data.password:
        if not verify_password(user_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid phone number or password"
            )
    elif user.password_hash and not user_data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Password required for this account"
        )
    elif not user.password_hash:
        # For users without password (OAuth only), we'd need OTP verification
        # This is a simplified version - you might want to implement OTP here
        pass
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role},
        expires_delta=access_token_expires
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.access_token_expire_minutes * 60,
        user_id=user.id,
        role=user.role
    )


@router.get("/google/url")
async def get_google_auth_url():
    """Get Google OAuth authorization URL."""
    try:
        auth_url = google_oauth.get_authorization_url()
        return {"auth_url": auth_url}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate Google auth URL: {str(e)}"
        )


@router.post("/google/callback", response_model=TokenResponse)
async def google_auth_callback(
    auth_data: GoogleAuthRequest,
    db: Session = Depends(get_db)
):
    """Handle Google OAuth callback."""
    try:
        # Exchange code for token
        credentials = google_oauth.exchange_code_for_token(auth_data.code)
        
        # Get user info from Google
        user_info = google_oauth.get_user_info(credentials.token)
        
        # Find or create user
        user = db.query(User).filter(User.email == user_info.email).first()
        
        if not user:
            # Create new user from Google info
            user = User(
                email=user_info.email,
                full_name=user_info.name,
                avatar_url=user_info.picture,
                phone_number="",  # Will need to be filled later
                email_verified=user_info.verified_email,
                role="customer"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Update existing user info
            user.full_name = user_info.name or user.full_name
            user.avatar_url = user_info.picture or user.avatar_url
            user.email_verified = user_info.verified_email
            db.commit()
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            data={"sub": str(user.id), "role": user.role},
            expires_delta=access_token_expires
        )
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.access_token_expire_minutes * 60,
            user_id=user.id,
            role=user.role
        )
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google authentication failed: {str(e)}"
        )


@router.get("/me")
async def get_current_user(
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get current user information."""
    user = db.query(User).filter(User.id == current_user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "id": user.id,
        "phone_number": user.phone_number,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "avatar_url": user.avatar_url,
        "is_active": user.is_active,
        "phone_verified": user.phone_verified,
        "email_verified": user.email_verified,
        "establishment_id": user.establishment_id
    }
