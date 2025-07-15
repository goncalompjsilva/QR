"""
Establishment model for individual business locations.
"""

from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB, POINT
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Establishment(BaseModel):
    """
    Establishment model for individual business locations.
    Each establishment belongs to a business owner and can have multiple loyalty programs.
    """
    __tablename__ = "establishments"

    # Owner relationship
    business_owner_id = Column(Integer, ForeignKey("business_owners.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Business information
    business_name = Column(String(255), nullable=False)
    business_type = Column(String(100), nullable=True, index=True)  # restaurant, cafe, bakery, shop, etc.
    description = Column(Text, nullable=True)
    
    # Branding
    avatar_url = Column(String(500), nullable=True)  # establishment logo
    background_image_url = Column(String(500), nullable=True)  # background for app
    
    # Contact information
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True, index=True)
    country = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    
    # Business settings
    business_hours = Column(JSONB, nullable=True)  # {"monday": "9:00-18:00", ...}
    settings = Column(JSONB, nullable=True)  # custom settings
    
    # Location and status
    is_active = Column(Boolean, nullable=False, default=True)
    location_coords = Column(POINT, nullable=True)  # for map discovery

    # Relationships
    business_owner = relationship("BusinessOwner", back_populates="establishments")
    users = relationship("User", back_populates="establishment")  # workers and admins
    loyalty_programs = relationship("LoyaltyProgram", back_populates="establishment")
    user_loyalty_points = relationship("UserLoyaltyPoints", back_populates="establishment")
    qr_codes = relationship("QRCode", back_populates="establishment")
    point_activities = relationship("PointActivity", back_populates="establishment")

    def __str__(self):
        return f"Establishment(id={self.id}, name={self.business_name}, type={self.business_type})"
