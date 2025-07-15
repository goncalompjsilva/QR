"""
User model for customers, workers, and establishment admins.
"""

from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, TIMESTAMP, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class User(BaseModel):
    """
    User model for the loyalty platform.
    Supports customers, establishment workers, and admins.
    """
    __tablename__ = "users"

    # Basic information
    phone_number = Column(String(20), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    full_name = Column(String(255), nullable=True)
    password_hash = Column(String(255), nullable=True)  # Optional for customers
    avatar_url = Column(String(500), nullable=True)
    
    # Role and permissions
    role = Column(String(20), nullable=False, default='customer', index=True)  # customer, worker, admin
    establishment_id = Column(Integer, ForeignKey("establishments.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Verification status
    is_active = Column(Boolean, nullable=False, default=True)
    phone_verified = Column(Boolean, nullable=False, default=False)
    email_verified = Column(Boolean, nullable=False, default=False)
    
    # App preferences
    notification_settings = Column(JSONB, default={"push": True, "sms": False, "email": False})
    app_language = Column(String(10), default='en')
    
    # Activity tracking
    last_login = Column(TIMESTAMP, nullable=True)

    # Relationships
    establishment = relationship("Establishment", back_populates="users")
    loyalty_points = relationship("UserLoyaltyPoints", back_populates="user")
    point_activities = relationship("PointActivity", back_populates="user", foreign_keys="PointActivity.user_id")
    created_qr_codes = relationship("QRCode", back_populates="created_by", foreign_keys="QRCode.created_by_user_id")
    used_qr_codes = relationship("QRCode", back_populates="used_by", foreign_keys="QRCode.used_by_user_id")

    def __str__(self):
        return f"User(id={self.id}, phone={self.phone_number}, role={self.role})"
