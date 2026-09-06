import hashlib
from datetime import datetime
from app.extensions import db

class OTP(db.Model):
    __tablename__ = "otps"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    mobile = db.Column(db.String(15), nullable=False, index=True)
    otp_hash = db.Column(db.String(128), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    attempts = db.Column(db.Integer, default=0, nullable=False)
    verified = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    @staticmethod
    def hash_otp(otp: str) -> str:
        return hashlib.sha256(otp.encode("utf-8")).hexdigest()

    def check_otp(self, entered_otp: str) -> bool:
        return self.otp_hash == self.hash_otp(entered_otp)

    def is_expired(self) -> bool:
        return datetime.utcnow() > self.expires_at

    def to_dict(self):
        return {
            "id": self.id,
            "mobile": self.mobile,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "attempts": self.attempts,
            "verified": self.verified,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
