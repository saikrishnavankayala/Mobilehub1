import os
import secrets
import logging
from datetime import datetime, timedelta
from app.extensions import db
from app.models.otp import OTP

logger = logging.getLogger(__name__)

class OTPProvider:
    """Abstract OTP Provider Interface"""
    def send_otp(self, mobile: str, otp: str) -> bool:
        raise NotImplementedError("Subclasses must implement send_otp")

class MockOTPProvider(OTPProvider):
    """Mock OTP provider for local development and testing"""
    def __init__(self):
        self.sent_otps = {}  # In-memory store for testing inspection

    def send_otp(self, mobile: str, otp: str) -> bool:
        logger.info(f"[MOCK OTP] Sending OTP to {mobile}: {otp}")
        print(f"\n========================================\n[MOCK SMS] To: {mobile} | OTP: {otp}\n========================================\n")
        self.sent_otps[mobile] = otp
        return True

class ProductionOTPProvider(OTPProvider):
    """Production OTP provider integrating with SMS Gateway (e.g., Twilio, Fast2SMS, MSG91)"""
    def __init__(self, api_key: str, sender_id: str):
        self.api_key = api_key
        self.sender_id = sender_id

    def send_otp(self, mobile: str, otp: str) -> bool:
        # In real production, calls external REST API with credentials
        logger.info(f"[PRODUCTION OTP] Dispatching SMS to {mobile} via SMS Gateway")
        # Example HTTP request would be dispatched here
        return True

def get_otp_provider() -> OTPProvider:
    provider_type = os.getenv("OTP_PROVIDER", "mock").lower()
    if provider_type == "production":
        api_key = os.getenv("OTP_API_KEY", "")
        sender_id = os.getenv("OTP_SENDER_ID", "MOBHUB")
        return ProductionOTPProvider(api_key, sender_id)
    return MockOTPProvider()

class OTPService:
    @staticmethod
    def generate_otp() -> str:
        """Generate cryptographically secure 6-digit numeric OTP"""
        return f"{secrets.randbelow(900000) + 100000}"

    @classmethod
    def send_verification_otp(cls, mobile: str, expiry_seconds: int = 120, cooldown_seconds: int = 60):
        """
        Create or update OTP record and send OTP to mobile.
        Returns: (success: bool, message: str, dev_otp: str | None)
        """
        now = datetime.utcnow()

        # Check existing active OTP for cooldown
        latest_otp = OTP.query.filter_by(mobile=mobile).order_by(OTP.created_at.desc()).first()
        if latest_otp and not latest_otp.verified and (now - latest_otp.created_at).total_seconds() < cooldown_seconds:
            remaining = int(cooldown_seconds - (now - latest_otp.created_at).total_seconds())
            return False, f"Please wait {remaining} seconds before requesting a new OTP.", None

        # Invalidate / delete old unverified OTPs for this mobile
        OTP.query.filter_by(mobile=mobile, verified=False).delete()

        otp_plain = cls.generate_otp()
        otp_hash = OTP.hash_otp(otp_plain)
        expires_at = now + timedelta(seconds=expiry_seconds)

        new_otp = OTP(
            mobile=mobile,
            otp_hash=otp_hash,
            expires_at=expires_at,
            attempts=0,
            verified=False,
            created_at=now
        )
        db.session.add(new_otp)
        db.session.commit()

        provider = get_otp_provider()
        sent = provider.send_otp(mobile, otp_plain)
        if not sent:
            return False, "Failed to deliver SMS. Please try again.", None

        is_dev = os.getenv("FLASK_ENV", "development") == "development" or os.getenv("OTP_PROVIDER") == "mock"
        dev_otp = otp_plain if is_dev else None

        return True, "OTP sent successfully to your mobile number.", dev_otp

    @classmethod
    def verify_otp(cls, mobile: str, entered_otp: str, max_attempts: int = 3):
        """
        Verify submitted OTP against stored hash.
        Returns: (success: bool, message: str)
        """
        now = datetime.utcnow()
        otp_record = OTP.query.filter_by(mobile=mobile, verified=False).order_by(OTP.created_at.desc()).first()

        if not otp_record:
            return False, "No active OTP found. Please request a new OTP."

        if otp_record.attempts >= max_attempts:
            db.session.delete(otp_record)
            db.session.commit()
            return False, "Maximum verification attempts exceeded. Please request a new OTP."

        if otp_record.is_expired():
            db.session.delete(otp_record)
            db.session.commit()
            return False, "OTP has expired. Please request a new OTP."

        otp_record.attempts += 1

        if not otp_record.check_otp(entered_otp.strip()):
            remaining = max_attempts - otp_record.attempts
            db.session.commit()
            if remaining > 0:
                return False, f"Invalid OTP. {remaining} attempt(s) remaining."
            else:
                db.session.delete(otp_record)
                db.session.commit()
                return False, "Invalid OTP. Maximum attempts exceeded. Please request a new OTP."

        # Mark as verified
        otp_record.verified = True
        db.session.commit()
        return True, "Mobile number verified successfully."
