"""
QR Code model for one-time use loyalty codes.
"""

from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, TIMESTAMP, Text, Numeric
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class QRCode(BaseModel):
    """
    QR Code model for one-time use codes.
    Used for earning points and redeeming rewards.
    """
    __tablename__ = "qr_codes"

    # Relationships
    establishment_id = Column(Integer, ForeignKey("establishments.id", ondelete="CASCADE"), nullable=False, index=True)
    program_id = Column(Integer, ForeignKey("loyalty_programs.id", ondelete="SET NULL"), nullable=True)
    
    # QR code data
    qr_code_hash = Column(String(255), unique=True, nullable=False, index=True)
    qr_code_url = Column(String(500), nullable=True)  # full URL that opens the app
    
    # Code purpose
    code_type = Column(String(20), nullable=False)  # 'earn_points' or 'redeem_reward'
    points_value = Column(Integer, nullable=False)  # points to award or redeem
    amount_spent = Column(Numeric(10,2), nullable=True)  # original purchase amount (for earn_points)
    
    # Usage tracking
    is_used = Column(Boolean, nullable=False, default=False, index=True)
    used_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    used_at = Column(TIMESTAMP, nullable=True)
    
    # Security and expiration
    expires_at = Column(TIMESTAMP, nullable=False, index=True)
    
    # Who created this code
    created_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Additional data
    description = Column(Text, nullable=True)  # "Purchase of 40€", "Free Pizza Redemption"
    extra_data = Column(JSONB, nullable=True)  # any additional data needed

    # Relationships
    establishment = relationship("Establishment", back_populates="qr_codes")
    program = relationship("LoyaltyProgram", back_populates="qr_codes")
    used_by = relationship("User", back_populates="used_qr_codes", foreign_keys=[used_by_user_id])
    created_by = relationship("User", back_populates="created_qr_codes", foreign_keys=[created_by_user_id])
    point_activities = relationship("PointActivity", back_populates="qr_code")

    def __str__(self):
        return f"QRCode(id={self.id}, type={self.code_type}, points={self.points_value}, used={self.is_used})"
