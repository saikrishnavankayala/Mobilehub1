import random
import logging
from datetime import datetime
from sqlalchemy.exc import IntegrityError
from app.extensions import db
from app.models.customer import Customer
from app.models.campaign import Campaign
from app.models.prize import Prize
from app.models.spin import Spin, SpinStatus
from app.services.eligibility_service import EligibilityService
from app.utils.claim_code import generate_claim_code
from app.utils.phone import normalize_phone, is_valid_indian_mobile

logger = logging.getLogger(__name__)

class SpinService:
    @classmethod
    def check_spin_status(cls, mobile_number: str = None, customer_id: int = None, campaign_id: int = None):
        """
        Check if a mobile number or customer has already completed a spin.
        Returns: (has_spun: bool, spin_data: dict or None)
        """
        if not campaign_id:
            campaign = Campaign.query.filter_by(active=True).first() or Campaign.query.first()
            campaign_id = campaign.id if campaign else 1

        clean_mobile = normalize_phone(mobile_number) if mobile_number else None

        existing_spin = None
        if clean_mobile:
            existing_spin = Spin.query.filter_by(mobile_number=clean_mobile, campaign_id=campaign_id).first()
            if not existing_spin:
                # Also check customer record with this mobile
                cust = Customer.query.filter_by(mobile=clean_mobile).first()
                if cust:
                    existing_spin = Spin.query.filter_by(customer_id=cust.id, campaign_id=campaign_id).first()

        if not existing_spin and customer_id:
            cust = db.session.get(Customer, customer_id)
            if cust:
                clean_mobile = normalize_phone(cust.mobile)
                existing_spin = Spin.query.filter(
                    (Spin.customer_id == customer_id) | (Spin.mobile_number == clean_mobile)
                ).first()

        if existing_spin:
            return True, existing_spin.to_dict()
        return False, None

    @classmethod
    def execute_spin(cls, customer_id: int = None, campaign_id: int = None, mobile_number: str = None):
        """
        Execute secure, atomic spin strictly enforcing: ONE MOBILE NUMBER = ONE SPIN ONLY.
        Returns: (success: bool, data: dict, error_message: str, status_code: int, error_code: str or None)
        """
        if not campaign_id:
            campaign = Campaign.query.filter_by(active=True).first() or Campaign.query.first()
            if not campaign:
                return False, None, "Promotional campaign not found.", 404, "CAMPAIGN_NOT_FOUND"
            campaign_id = campaign.id
        else:
            campaign = db.session.get(Campaign, campaign_id)
            if not campaign:
                return False, None, "Invalid campaign.", 404, "CAMPAIGN_NOT_FOUND"

        # 1. Resolve and normalize mobile number
        clean_mobile = None
        customer = None

        if customer_id:
            customer = db.session.get(Customer, customer_id)
            if customer:
                clean_mobile = normalize_phone(customer.mobile)


        if not clean_mobile and mobile_number:
            clean_mobile = normalize_phone(mobile_number)
            if not customer:
                customer = Customer.query.filter_by(mobile=clean_mobile).first()

        if clean_mobile and not is_valid_indian_mobile(clean_mobile):
            return False, None, "Please enter a valid 10-digit Indian mobile number.", 400, "INVALID_MOBILE"

        if not clean_mobile:
            return False, None, "Mobile number is required to participate in the Spin & Win campaign.", 400, "MOBILE_REQUIRED"

        # 2. Strict check: Has this mobile number already completed a spin?
        has_spun, existing_data = cls.check_spin_status(
            mobile_number=clean_mobile,
            customer_id=customer.id if customer else None,
            campaign_id=campaign_id
        )

        if has_spun:
            return (
                False,
                {"existing_spin": existing_data},
                "Promotional spin already used. Only one spin is allowed per mobile number.",
                409,
                "SPIN_ALREADY_USED"
            )

        # 3. If customer record doesn't exist yet for this valid mobile number, create one
        if not customer:
            customer = Customer(
                name="MobileHub Participant",
                mobile=clean_mobile,
                address="Verified In-Store Participant",
                otp_verified=True,
                social_verified=True,
                created_at=datetime.utcnow()
            )
            db.session.add(customer)
            db.session.commit()

        # 4. Retrieve all active campaign prizes to determine wheel slices
        all_active_prizes = Prize.query.filter_by(campaign_id=campaign_id, active=True).order_by(Prize.id.asc()).all()
        if not all_active_prizes:
            return False, None, "No active prizes available in this campaign.", 400, "NO_PRIZES"

        try:
            # Re-verify inside transaction to eliminate race conditions
            existing_spin = Spin.query.filter(
                (Spin.mobile_number == clean_mobile) | (Spin.customer_id == customer.id),
                Spin.campaign_id == campaign_id
            ).first()

            if existing_spin:
                return (
                    False,
                    {"existing_spin": existing_spin.to_dict()},
                    "Promotional spin already used. Only one spin is allowed per mobile number.",
                    409,
                    "SPIN_ALREADY_USED"
                )

            # 5. Filter available prizes with inventory
            available_prizes = [p for p in all_active_prizes if p.remaining_quantity > 0 and p.weight > 0]

            if not available_prizes:
                return False, None, "Promotional prizes are currently out of stock.", 400, "OUT_OF_STOCK"

            # 6. Weighted random selection strictly on server
            weights = [max(p.weight, 1) for p in available_prizes]
            selected_prize = random.choices(available_prizes, weights=weights, k=1)[0]

            # 7. Atomic row lock and inventory decrement
            locked_prize = Prize.query.filter_by(id=selected_prize.id).with_for_update().first()
            if locked_prize and locked_prize.remaining_quantity > 0:
                locked_prize.remaining_quantity -= 1

            # 8. Generate unique claim code
            claim_code = generate_claim_code()
            for _ in range(5):
                if not Spin.query.filter_by(claim_code=claim_code).first():
                    break
                claim_code = generate_claim_code()

            # 9. Create spin record permanently marking mobile as SPIN_USED
            spin = Spin(
                customer_id=customer.id,
                campaign_id=campaign_id,
                prize_id=locked_prize.id,
                claim_code=claim_code,
                mobile_number=clean_mobile,
                status=SpinStatus.GENERATED,
                created_at=datetime.utcnow()
            )
            db.session.add(spin)
            db.session.commit()

            # 10. Determine slice index on the wheel for the client (0 to 5)
            prize_segment_index = 0
            for idx, p in enumerate(all_active_prizes):
                if p.id == locked_prize.id:
                    prize_segment_index = idx
                    break

            return True, {
                "spin_id": spin.id,
                "claim_code": spin.claim_code,
                "status": spin.status,
                "mobile_number": clean_mobile,
                "created_at": spin.created_at.isoformat(),
                "prize": locked_prize.to_dict(),
                "reward": {
                    "name": locked_prize.name,
                    "description": locked_prize.description,
                    "claim_code": spin.claim_code,
                },
                "segment_index": prize_segment_index,
                "total_segments": len(all_active_prizes),
                "customer": {
                    "id": customer.id,
                    "name": customer.name,
                    "mobile": customer.mobile
                },
                "store": {
                    "name": campaign.store_name,
                    "address": campaign.store_address,
                    "phone": campaign.store_phone
                }
            }, "Spin executed successfully!", 200, None

        except IntegrityError as ie:
            db.session.rollback()
            logger.warning(f"IntegrityError: duplicate spin attempt blocked for mobile {clean_mobile}: {str(ie)}")
            existing_spin = Spin.query.filter_by(mobile_number=clean_mobile, campaign_id=campaign_id).first()
            return (
                False,
                {"existing_spin": existing_spin.to_dict() if existing_spin else None},
                "This mobile number has already participated in the MobileHub reward campaign. Only one spin is allowed per mobile number.",
                409,
                "SPIN_ALREADY_USED"
            )
        except Exception as e:
            db.session.rollback()
            logger.error(f"Unexpected error in execute_spin: {str(e)}", exc_info=True)
            return False, None, "An error occurred while processing your spin. Please try again.", 500, "SERVER_ERROR"

    @staticmethod
    def get_spin_result(customer_id: int, campaign_id: int):
        spin = Spin.query.filter_by(customer_id=customer_id, campaign_id=campaign_id).first()
        if not spin:
            return False, None, "No spin record found for this customer.", 404, "NOT_FOUND"
        return True, spin.to_dict(), "Spin record retrieved.", 200, None
