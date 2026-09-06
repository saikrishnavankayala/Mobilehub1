from datetime import datetime
from sqlalchemy.exc import IntegrityError
from app.extensions import db
from app.models.customer import Customer
from app.models.spin import Spin
from app.utils.phone import normalize_phone

class CustomerService:
    @staticmethod
    def check_mobile_status(mobile: str):
        clean_mobile = normalize_phone(mobile)
        customer = Customer.query.filter_by(mobile=clean_mobile).first()
        if not customer:
            return {
                "exists": False,
                "is_new": True,
                "mobile": clean_mobile,
                "customer": None,
                "has_spun": False,
                "spin": None
            }

        spin = Spin.query.filter(
            (Spin.customer_id == customer.id) | (Spin.mobile_number == clean_mobile)
        ).order_by(Spin.created_at.desc()).first()

        return {
            "exists": True,
            "is_new": False,
            "mobile": clean_mobile,
            "customer": customer.to_dict(),
            "has_spun": spin is not None,
            "spin": spin.to_dict() if spin else None
        }

    @staticmethod
    def register_customer(name: str, mobile: str, address: str):
        clean_mobile = normalize_phone(mobile)
        
        customer = Customer.query.filter_by(mobile=clean_mobile).first()
        if customer:
            # If customer already spun, return their existing record
            has_spun = Spin.query.filter(
                (Spin.customer_id == customer.id) | (Spin.mobile_number == clean_mobile)
            ).first() is not None
            if has_spun:
                return True, "Customer record found. Retrieving your reward history.", customer

            # If registered without spin, update details
            customer.name = name.strip()
            customer.address = address.strip()
            db.session.commit()
            return True, "Customer record updated. Proceed to verification.", customer

        new_customer = Customer(
            name=name.strip(),
            mobile=clean_mobile,
            address=address.strip(),
            otp_verified=False,
            social_verified=False,
            created_at=datetime.utcnow()
        )
        db.session.add(new_customer)
        try:
            db.session.commit()
            return True, "Customer registered successfully.", new_customer
        except IntegrityError:
            # PostgreSQL enforces the unique mobile index if two registrations
            # race. Return the single persisted customer instead of a 500.
            db.session.rollback()
            customer = Customer.query.filter_by(mobile=clean_mobile).first()
            if customer:
                return True, "Customer record found. Proceed to verification.", customer
            raise

    @staticmethod
    def get_by_mobile(mobile: str) -> Customer:
        clean_mobile = normalize_phone(mobile)
        return Customer.query.filter_by(mobile=clean_mobile).first()

    @staticmethod
    def get_by_id(customer_id: int) -> Customer:
        return db.session.get(Customer, customer_id)

    @staticmethod
    def set_social_verified(customer_id: int, verified: bool = True):
        customer = db.session.get(Customer, customer_id)
        if not customer:
            return False, "Customer not found."
        customer.social_verified = verified
        db.session.commit()
        return True, "Social media participation confirmed."
