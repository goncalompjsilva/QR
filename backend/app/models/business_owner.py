"""
Business Owner model for franchise and chain management.
"""

from sqlalchemy import Column, String, Boolean, TIMESTAMP, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class BusinessOwner(BaseModel):
    """
    Business Owner model for managing multiple establishments.
    Supports franchise owners and chain restaurant operators.
    """
    __tablename__ = "business_owners"

    # Owner information
    owner_name = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=True)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(20), nullable=True)
    
    # Address information
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    
    # Branding
    avatar_url = Column(String(500), nullable=True)
    
    # Business status
    is_active = Column(Boolean, nullable=False, default=True)
    partnership_status = Column(String(50), default='active')  # active, suspended, terminated
    pricing_model = Column(String(50), default='per_customer')  # per_customer, per_redemption, revenue_share
    joined_date = Column(TIMESTAMP, default="CURRENT_TIMESTAMP")

    # Relationships
    establishments = relationship("Establishment", back_populates="business_owner")

    def __str__(self):
        return f"BusinessOwner(id={self.id}, name={self.owner_name}, company={self.company_name})"
