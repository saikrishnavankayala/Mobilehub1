from datetime import datetime
from app.extensions import db

class Prize(db.Model):
    __tablename__ = "prizes"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False, index=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    quantity = db.Column(db.Integer, nullable=False, default=0)
    remaining_quantity = db.Column(db.Integer, nullable=False, default=0)
    weight = db.Column(db.Integer, nullable=False, default=10)  # Probability weight
    active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    spins = db.relationship("Spin", backref="prize", lazy=True)

    __table_args__ = (
        db.CheckConstraint("quantity >= 0", name="chk_prize_quantity_non_negative"),
        db.CheckConstraint("remaining_quantity >= 0", name="chk_prize_remaining_non_negative"),
        db.CheckConstraint("weight >= 0", name="chk_prize_weight_non_negative"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "campaign_id": self.campaign_id,
            "name": self.name,
            "description": self.description,
            "image_url": self.image_url,
            "quantity": self.quantity,
            "remaining_quantity": self.remaining_quantity,
            "weight": self.weight,
            "active": self.active,
            "is_in_stock": self.remaining_quantity > 0,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
