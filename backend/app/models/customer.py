from datetime import datetime
from app.extensions import db

class Customer(db.Model):
    __tablename__ = "customers"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    mobile = db.Column(db.String(15), unique=True, nullable=False, index=True)
    address = db.Column(db.Text, nullable=False)
    otp_verified = db.Column(db.Boolean, default=False, nullable=False)
    social_verified = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    spins = db.relationship("Spin", backref="customer", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "mobile": self.mobile,
            "address": self.address,
            "otp_verified": self.otp_verified,
            "social_verified": self.social_verified,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
