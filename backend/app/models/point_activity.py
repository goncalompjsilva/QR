"""
Point Activity model for tracking all loyalty point transactions.
"""

from sqlalchemy import Column, String, Integer, ForeignKey, TIMESTAMP, Numeric, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class PointActivity(BaseModel):
    """
    Point Activity model for logging all point-related activities.
    Tracks earning, redeeming, expiring, and adjusting points.
    """
    __tablename__ = "point_activities"

    # Remove the default id, created_at, updated_at from BaseModel
    # because this table only needs created_at
    id = Column(Integer, primary_key=True, autoincrement=True)
    created_at = Column(TIMESTAMP, nullable=False, default="CURRENT_TIMESTAMP")

    # Relationships
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    establishment_id = Column(Integer, ForeignKey("establishments.id", ondelete="CASCADE"), nullable=False, index=True)
    program_id = Column(Integer, ForeignKey("loyalty_programs.id", ondelete="SET NULL"), nullable=True)
    
    # Activity details
    activity_type = Column(String(20), nullable=False, index=True)  # 'earned', 'redeemed', 'expired', 'adjusted'
    points_change = Column(Integer, nullable=False)  # positive for earned, negative for redeemed
    description = Column(Text, nullable=False)  # "Purchased 40€", "Redeemed Free Pizza"
    
    # Context
    qr_code_id = Column(Integer, ForeignKey("qr_codes.id", ondelete="SET NULL"), nullable=True)
    processed_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)  # which worker/admin processed
    
    # Additional data
    amount_spent = Column(Numeric(10,2), nullable=True)  # original purchase amount
    extra_data = Column(JSONB, nullable=True)  # any additional context

    # Relationships
    user = relationship("User", back_populates="point_activities", foreign_keys=[user_id])
    establishment = relationship("Establishment", back_populates="point_activities")
    program = relationship("LoyaltyProgram", back_populates="point_activities")
    qr_code = relationship("QRCode", back_populates="point_activities")
    processed_by = relationship("User", foreign_keys=[processed_by_user_id])

    def __str__(self):
        return f"PointActivity(id={self.id}, type={self.activity_type}, points={self.points_change}, user_id={self.user_id})"
