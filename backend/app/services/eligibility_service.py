from app.extensions import db
from app.models.customer import Customer
from app.models.campaign import Campaign
from app.models.spin import Spin

class EligibilityService:
    @staticmethod
    def check_customer_eligibility(customer_id: int, campaign_id: int):
        customer = db.session.get(Customer, customer_id)
        if not customer:
            return {
                "eligible": False,
                "reason": "Customer record not found.",
                "details": {
                    "registered": False,
                    "otp_verified": False,
                    "social_verified": False,
                    "campaign_active": False,
                    "already_spun": False
                }
            }

        campaign = db.session.get(Campaign, campaign_id)
        if not campaign or not campaign.is_active_now():
            return {
                "eligible": False,
                "reason": "This promotional campaign is currently not active.",
                "details": {
                    "registered": True,
                    "otp_verified": customer.otp_verified,
                    "social_verified": customer.social_verified,
                    "campaign_active": False,
                    "already_spun": False
                }
            }

        # Check existing spin by customer_id or mobile_number
        existing_spin = Spin.query.filter(
            (Spin.customer_id == customer.id) | (Spin.mobile_number == customer.mobile),
            Spin.campaign_id == campaign.id
        ).first()
        if existing_spin:
            return {
                "eligible": False,
                "reason": "You have already used your Spin & Win chance.",
                "details": {
                    "registered": True,
                    "otp_verified": customer.otp_verified,
                    "social_verified": customer.social_verified,
                    "campaign_active": True,
                    "already_spun": True
                },
                "existing_spin": existing_spin.to_dict()
            }

        if not customer.otp_verified:
            return {
                "eligible": False,
                "reason": "Mobile number is not verified yet. Please complete OTP verification.",
                "details": {
                    "registered": True,
                    "otp_verified": False,
                    "social_verified": customer.social_verified,
                    "campaign_active": True,
                    "already_spun": False
                }
            }

        if not customer.social_verified:
            return {
                "eligible": False,
                "reason": "Please complete social media engagement to unlock your spin.",
                "details": {
                    "registered": True,
                    "otp_verified": True,
                    "social_verified": False,
                    "campaign_active": True,
                    "already_spun": False
                }
            }

        return {
            "eligible": True,
            "reason": "You are fully eligible to spin!",
            "details": {
                "registered": True,
                "otp_verified": True,
                "social_verified": True,
                "campaign_active": True,
                "already_spun": False
            }
        }
