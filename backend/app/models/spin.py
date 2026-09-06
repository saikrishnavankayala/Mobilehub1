from datetime import datetime
from app.extensions import db

class SpinStatus:
    GENERATED = "GENERATED"
    CLAIMED = "CLAIMED"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"

class Spin(db.Model):
    __tablename__ = "spins"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    customer_id = db.Column(db.Integer, db.ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False, index=True)
    prize_id = db.Column(db.Integer, db.ForeignKey("prizes.id", ondelete="RESTRICT"), nullable=False, index=True)
    claim_code = db.Column(db.String(32), unique=True, nullable=False, index=True)
    mobile_number = db.Column(db.String(15), nullable=True, index=True)
    status = db.Column(db.String(20), default=SpinStatus.GENERATED, nullable=False, index=True)
    claimed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        db.UniqueConstraint("customer_id", "campaign_id", name="uq_customer_campaign_spin"),
        db.UniqueConstraint("mobile_number", "campaign_id", name="uq_spins_mobile_campaign"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "customer_id": self.customer_id,
            "campaign_id": self.campaign_id,
            "prize_id": self.prize_id,
            "claim_code": self.claim_code,
            "mobile_number": self.mobile_number,
            "status": self.status,
            "claimed_at": self.claimed_at.isoformat() if self.claimed_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "customer": self.customer.to_dict() if self.customer else None,
            "prize": self.prize.to_dict() if self.prize else None,
        }
