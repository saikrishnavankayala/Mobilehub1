from datetime import datetime, timedelta
from sqlalchemy import func
from flask_jwt_extended import create_access_token
from app.extensions import db
from app.models.admin import Admin
from app.models.customer import Customer
from app.models.prize import Prize
from app.models.spin import Spin, SpinStatus
from app.models.campaign import Campaign

class AdminService:
    @staticmethod
    def authenticate(email: str, password: str):
        admin = Admin.query.filter_by(email=email.strip().lower()).first()
        if not admin or not admin.check_password(password):
            return False, "Invalid email or password.", None

        # Create JWT token with identity as admin id and additional claims
        token = create_access_token(
            identity=str(admin.id),
            additional_claims={"role": "admin", "email": admin.email, "name": admin.name}
        )
        return True, "Login successful.", {
            "token": token,
            "admin": admin.to_dict()
        }

    @staticmethod
    def get_dashboard_stats(campaign_id: int = None):
        total_customers = Customer.query.count()
        otp_verified = Customer.query.filter_by(otp_verified=True).count()
        
        # Eligible: verified OTP, social verified, no spin
        spun_customer_ids = db.session.query(Spin.customer_id)
        eligible_customers = Customer.query.filter(
            Customer.otp_verified == True,
            Customer.social_verified == True,
            Customer.id.not_in(spun_customer_ids)
        ).count()

        total_spins = Spin.query.count()
        
        # Try again exclusion for winners
        try_again_prize_ids = [p.id for p in Prize.query.filter(Prize.name.ilike("%try again%")).all()]
        if try_again_prize_ids:
            total_winners = Spin.query.filter(~Spin.prize_id.in_(try_again_prize_ids)).count()
        else:
            total_winners = total_spins

        unclaimed_prizes = Spin.query.filter_by(status=SpinStatus.GENERATED).count()
        claimed_prizes = Spin.query.filter_by(status=SpinStatus.CLAIMED).count()

        total_remaining_inventory = db.session.query(func.sum(Prize.remaining_quantity)).scalar() or 0
        total_initial_inventory = db.session.query(func.sum(Prize.quantity)).scalar() or 0

        # Prize breakdown
        prize_stats = []
        prizes = Prize.query.all()
        for p in prizes:
            spins_count = Spin.query.filter_by(prize_id=p.id).count()
            prize_stats.append({
                "id": p.id,
                "name": p.name,
                "total_quantity": p.quantity,
                "remaining_quantity": p.remaining_quantity,
                "spins_won": spins_count,
                "weight": p.weight,
                "active": p.active
            })

        # Trend data: Last 7 days
        today = datetime.utcnow().date()
        trend_dates = [(today - timedelta(days=i)) for i in range(6, -1, -1)]
        registration_trend = []
        spin_trend = []

        for d in trend_dates:
            day_str = d.strftime("%b %d")
            day_start = datetime.combine(d, datetime.min.time())
            day_end = datetime.combine(d, datetime.max.time())

            c_count = Customer.query.filter(Customer.created_at.between(day_start, day_end)).count()
            s_count = Spin.query.filter(Spin.created_at.between(day_start, day_end)).count()

            registration_trend.append({"date": day_str, "count": c_count})
            spin_trend.append({"date": day_str, "count": s_count})

        return {
            "summary": {
                "total_customers": total_customers,
                "otp_verified": otp_verified,
                "eligible_customers": eligible_customers,
                "total_spins": total_spins,
                "total_winners": total_winners,
                "unclaimed_prizes": unclaimed_prizes,
                "claimed_prizes": claimed_prizes,
                "remaining_inventory": total_remaining_inventory,
                "total_initial_inventory": total_initial_inventory
            },
            "prize_distribution": prize_stats,
            "trends": {
                "registration_trend": registration_trend,
                "spin_trend": spin_trend
            }
        }

    @staticmethod
    def get_customers(page: int = 1, per_page: int = 20, search: str = None, otp_status: str = None, spin_status: str = None):
        query = Customer.query.order_by(Customer.created_at.desc())

        if search:
            term = f"%{search.strip()}%"
            query = query.filter(
                (Customer.name.ilike(term)) |
                (Customer.mobile.ilike(term)) |
                (Customer.address.ilike(term))
            )

        if otp_status is not None and otp_status != "":
            if otp_status.lower() == "verified":
                query = query.filter(Customer.otp_verified == True)
            elif otp_status.lower() == "unverified":
                query = query.filter(Customer.otp_verified == False)

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        items = []
        for customer in pagination.items:
            c_dict = customer.to_dict()
            # Attach spin details if present
            spin = Spin.query.filter_by(customer_id=customer.id).first()
            if spin:
                c_dict["spin"] = {
                    "id": spin.id,
                    "prize_name": spin.prize.name if spin.prize else "Unknown",
                    "claim_code": spin.claim_code,
                    "status": spin.status,
                    "claimed_at": spin.claimed_at.isoformat() if spin.claimed_at else None,
                    "spin_date": spin.created_at.isoformat()
                }
            else:
                c_dict["spin"] = None
            items.append(c_dict)

        return {
            "items": items,
            "total": pagination.total,
            "page": pagination.page,
            "pages": pagination.pages,
            "has_next": pagination.has_next,
            "has_prev": pagination.has_prev
        }
