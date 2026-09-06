from datetime import datetime
from app.extensions import db

class Campaign(db.Model):
    __tablename__ = "campaigns"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)
    instagram_url = db.Column(db.String(255), default="https://instagram.com")
    facebook_url = db.Column(db.String(255), default="https://facebook.com")
    whatsapp_url = db.Column(db.String(255), default="https://whatsapp.com")
    store_name = db.Column(db.String(100), default="Mobile Hub")
    store_address = db.Column(db.Text, default="MG Road, Tech City")
    store_phone = db.Column(db.String(30), default="+91 98765 43210")
    terms_conditions = db.Column(db.Text, nullable=True)
    privacy_policy = db.Column(db.Text, nullable=True)
    active = db.Column(db.Boolean, default=True, nullable=False)
    max_spins_per_mobile = db.Column(db.Integer, default=1, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    prizes = db.relationship("Prize", backref="campaign", lazy=True, cascade="all, delete-orphan")
    spins = db.relationship("Spin", backref="campaign", lazy=True)

    def is_active_now(self) -> bool:
        if not self.active:
            return False
        now = datetime.utcnow()
        if self.start_date and now < self.start_date:
            return False
        if self.end_date and now > self.end_date:
            return False
        return True

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "instagram_url": self.instagram_url,
            "facebook_url": self.facebook_url,
            "whatsapp_url": self.whatsapp_url,
            "store_name": self.store_name,
            "store_address": self.store_address,
            "store_phone": self.store_phone,
            "terms_conditions": self.terms_conditions,
            "privacy_policy": self.privacy_policy,
            "active": self.active,
            "max_spins_per_mobile": self.max_spins_per_mobile,
            "is_active_now": self.is_active_now(),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
