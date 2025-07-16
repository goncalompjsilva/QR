"""
OTP (One-Time Password) service for phone number verification.
"""

import random
import string
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from app.models.otp import OTP


class OTPService:
    """Service for handling OTP generation and verification."""
    
    @staticmethod
    def generate_otp_code() -> str:
        """Generate a 6-digit OTP code."""
        return ''.join(random.choices(string.digits, k=6))
    
    @staticmethod
    def create_otp(db: Session, phone_number: str) -> str:
        """
        Create a new OTP for the given phone number.
        Invalidates any existing unused OTPs for the same phone number.
        """
        # Invalidate existing unused OTPs for this phone number
        existing_otps = db.query(OTP).filter(
            OTP.phone_number == phone_number,
            OTP.is_used == False,
            OTP.expires_at > datetime.utcnow()
        ).all()
        
        for otp in existing_otps:
            otp.is_used = True
        
        # Generate new OTP
        code = OTPService.generate_otp_code()
        expires_at = datetime.utcnow() + timedelta(minutes=10)  # Valid for 10 minutes
        
        new_otp = OTP(
            phone_number=phone_number,
            code=code,
            expires_at=expires_at
        )
        
        db.add(new_otp)
        db.commit()
        db.refresh(new_otp)
        
        return code
    
    @staticmethod
    def verify_otp(db: Session, phone_number: str, code: str) -> bool:
        """
        Verify an OTP code for the given phone number.
        Returns True if valid, False otherwise.
        """
        otp = db.query(OTP).filter(
            OTP.phone_number == phone_number,
            OTP.code == code,
            OTP.is_used == False,
            OTP.expires_at > datetime.utcnow()
        ).first()
        
        if not otp:
            return False
        
        # Increment attempts
        otp.attempts += 1
        
        # Check if max attempts exceeded
        if otp.attempts > otp.max_attempts:
            otp.is_used = True
            db.commit()
            return False
        
        # Mark as used and return success
        otp.is_used = True
        db.commit()
        
        return True
    
    @staticmethod
    def send_otp_sms(phone_number: str, code: str) -> bool:
        """
        Send OTP code via SMS.
        This is a placeholder implementation.
        In production, integrate with SMS service like Twilio, AWS SNS, etc.
        """
        # TODO: Implement actual SMS sending
        print(f"SMS to {phone_number}: Your verification code is {code}")
        return True
    
    @staticmethod
    def cleanup_expired_otps(db: Session) -> int:
        """
        Clean up expired OTPs from the database.
        Returns the number of deleted records.
        """
        expired_otps = db.query(OTP).filter(
            OTP.expires_at < datetime.utcnow()
        ).all()
        
        count = len(expired_otps)
        
        for otp in expired_otps:
            db.delete(otp)
        
        db.commit()
        return count
