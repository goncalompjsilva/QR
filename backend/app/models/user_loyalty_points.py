"""
User Loyalty Points model for tracking customer points per establishment.
"""

from sqlalchemy import Column, Integer, ForeignKey, TIMESTAMP, UniqueConstraint
from sqlalchemy.dialects.postgresql import DECIMAL, JSONB
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class UserLoyaltyPoints(BaseModel):
    """
    User Loyalty Points model for tracking customer points per establishment.
    One record per customer per establishment.
    """
    __tablename__ = "user_loyalty_points"

    # Relationships
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    establishment_id = Column(Integer, ForeignKey("establishments.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Point tracking per establishment (across all programs)
    total_points_earned = Column(Integer, nullable=False, default=0)
    total_points_redeemed = Column(Integer, nullable=False, default=0)
    current_balance = Column(Integer, nullable=False, default=0, index=True)
    
    # Activity tracking
    total_visits = Column(Integer, nullable=False, default=0)
    last_activity_date = Column(TIMESTAMP, nullable=True)
    first_visit_date = Column(TIMESTAMP, default="CURRENT_TIMESTAMP")
    
    # Customer insights
    favorite_programs = Column(JSONB, nullable=True)  # track which programs user uses most
    lifetime_value = Column(DECIMAL(10,2), default=0)  # estimated customer value

    # Relationships
    user = relationship("User", back_populates="loyalty_points")
    establishment = relationship("Establishment", back_populates="user_loyalty_points")

    # Constraints
    __table_args__ = (
        UniqueConstraint('user_id', 'establishment_id', name='uq_user_establishment'),
    )

    def __str__(self):
        return f"UserLoyaltyPoints(user_id={self.user_id}, establishment_id={self.establishment_id}, balance={self.current_balance})"
