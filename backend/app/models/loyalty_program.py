"""
Loyalty Program model for flexible reward programs.
"""

from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, Text, TIMESTAMP
from sqlalchemy.dialects.postgresql import DECIMAL
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class LoyaltyProgram(BaseModel):
    """
    Loyalty Program model for establishment reward programs.
    Each establishment can have multiple programs with different rules.
    """
    __tablename__ = "loyalty_programs"

    # Establishment relationship
    establishment_id = Column(Integer, ForeignKey("establishments.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Program details
    program_name = Column(String(255), nullable=False)
    program_description = Column(Text, nullable=True)
    reward_description = Column(String(500), nullable=False)  # "Free Pizza", "Free Coffee", "20% Discount"
    
    # Point rules
    points_required = Column(Integer, nullable=False)  # points needed for reward
    points_per_euro = Column(DECIMAL(5,2), default=1.0)  # how many points per euro spent
    max_redemptions_per_user = Column(Integer, nullable=True)  # limit per customer (NULL = unlimited)
    
    # Program settings
    point_expiry_days = Column(Integer, nullable=True)  # NULL = points never expire
    is_active = Column(Boolean, nullable=False, default=True, index=True)
    start_date = Column(TIMESTAMP, nullable=True)
    end_date = Column(TIMESTAMP, nullable=True)
    
    # Display settings
    program_color = Column(String(7), nullable=True)  # hex color for UI
    program_icon = Column(String(100), nullable=True)  # icon name for UI

    # Relationships
    establishment = relationship("Establishment", back_populates="loyalty_programs")
    qr_codes = relationship("QRCode", back_populates="program")
    point_activities = relationship("PointActivity", back_populates="program")

    def __str__(self):
        return f"LoyaltyProgram(id={self.id}, name={self.program_name}, points_required={self.points_required})"
