"""
OTP (One-Time Password) model for phone verification.
"""

from sqlalchemy import Column, String, Integer, TIMESTAMP, Boolean
from sqlalchemy.sql import func
from app.models.base import BaseModel


class OTP(BaseModel):
    """
    OTP model for storing one-time passwords for phone verification.
    """
    __tablename__ = "otps"

    phone_number = Column(String(20), nullable=False, index=True)
    code = Column(String(6), nullable=False)
    is_used = Column(Boolean, nullable=False, default=False)
    expires_at = Column(TIMESTAMP, nullable=False)
    attempts = Column(Integer, nullable=False, default=0)
    max_attempts = Column(Integer, nullable=False, default=3)
    
    def __str__(self):
        return f"OTP(id={self.id}, phone={self.phone_number}, used={self.is_used})"
