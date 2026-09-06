from datetime import datetime
from app.extensions import db
from app.models.spin import Spin, SpinStatus

class ClaimService:
    @staticmethod
    def get_claim_by_code(claim_code: str):
        clean_code = claim_code.strip().upper()
        spin = Spin.query.filter_by(claim_code=clean_code).first()
        if not spin:
            return False, "Claim code not found. Please verify the code entered.", None
        return True, "Claim details retrieved.", spin

    @staticmethod
    def redeem_claim(claim_code: str):
        clean_code = claim_code.strip().upper()
        spin = Spin.query.filter_by(claim_code=clean_code).first()
        if not spin:
            return False, "Claim code not found.", None

        if spin.status == SpinStatus.CLAIMED:
            return False, f"This prize was already claimed on {spin.claimed_at.strftime('%d-%b-%Y %I:%M %p') if spin.claimed_at else 'earlier'}.", spin

        if spin.status in [SpinStatus.CANCELLED, SpinStatus.EXPIRED]:
            return False, f"This claim code is {spin.status.lower()} and cannot be redeemed.", spin

        spin.status = SpinStatus.CLAIMED
        spin.claimed_at = datetime.utcnow()
        db.session.commit()

        return True, "Prize successfully claimed! Customer handed prize.", spin

    @staticmethod
    def list_claims(page: int = 1, per_page: int = 20, status_filter: str = None, search: str = None):
        query = Spin.query.join(Spin.customer).order_by(Spin.created_at.desc())

        if status_filter:
            query = query.filter(Spin.status == status_filter.upper())

        if search:
            search_term = f"%{search.strip()}%"
            from app.models.customer import Customer
            query = query.filter(
                (Spin.claim_code.ilike(search_term)) |
                (Customer.name.ilike(search_term)) |
                (Customer.mobile.ilike(search_term))
            )

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        return {
            "items": [spin.to_dict() for spin in pagination.items],
            "total": pagination.total,
            "page": pagination.page,
            "pages": pagination.pages,
            "has_next": pagination.has_next,
            "has_prev": pagination.has_prev
        }
