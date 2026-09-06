from datetime import datetime
from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.spin import Spin, SpinStatus
from app.models.customer import Customer
from app.services.claim_service import ClaimService
from app.auth import admin_required
from app.utils.response import api_response, error_response
from app.utils.phone import normalize_phone

claim_bp = Blueprint("claims", __name__, url_prefix="/api/claims")

@claim_bp.route("/verify/<claim_code>", methods=["GET"])
def verify_claim_code(claim_code: str):
    success, message, spin = ClaimService.get_claim_by_code(claim_code)
    if not success:
        return error_response(message, 404)
    return api_response(data=spin.to_dict(), message=message)

@claim_bp.route("/submit", methods=["POST"])
def submit_claim():
    """
    POST /api/claims/submit
    User submits claim details (Name, Mobile, Address, Pincode) for their assigned reward.
    Saves details and marks claim status.
    """
    data = request.get_json(silent=True) or {}
    claim_code = data.get("claimCode") or data.get("claim_code")
    mobile = data.get("mobile") or data.get("mobileNumber")
    name = data.get("name") or data.get("fullName")
    address = data.get("address")
    pincode = data.get("pincode") or data.get("pinCode")

    clean_mobile = normalize_phone(mobile) if mobile else None

    spin = None
    if claim_code:
        spin = Spin.query.filter_by(claim_code=claim_code.strip()).first()

    if not spin and clean_mobile:
        spin = Spin.query.filter_by(mobile_number=clean_mobile).first()

    if not spin and clean_mobile:
        cust = Customer.query.filter_by(mobile=clean_mobile).first()
        if cust:
            spin = Spin.query.filter_by(customer_id=cust.id).first()

    if not spin:
        return error_response("No reward spin found for the provided claim code or mobile number.", 404)

    # Update customer record if details provided
    if spin.customer:
        if name and name.strip():
            spin.customer.name = name.strip()
        if address and address.strip():
            full_addr = address.strip()
            if pincode and str(pincode).strip():
                full_addr += f" - {str(pincode).strip()}"
            spin.customer.address = full_addr

    spin.status = SpinStatus.CLAIMED
    spin.claimed_at = datetime.utcnow()
    db.session.commit()

    reference_id = f"MHUB-CLAIM-{spin.id:04d}-{spin.claim_code[-4:]}"

    return api_response(
        data={
            "referenceId": reference_id,
            "claimCode": spin.claim_code,
            "status": "CONFIRMED",
            "prize": spin.prize.to_dict() if spin.prize else None,
            "prizeName": spin.prize.name if spin.prize else "Reward",
            "customer": {
                "name": spin.customer.name if spin.customer else (name or "Valued Customer"),
                "mobile": spin.customer.mobile if spin.customer else clean_mobile,
                "address": spin.customer.address if spin.customer else address,
                "pincode": pincode or "500001",
            },
            "claimed_at": spin.claimed_at.isoformat() if spin.claimed_at else None
        },
        message="Reward claimed successfully!"
    )

@claim_bp.route("/admin/list", methods=["GET"])
@admin_required()
def list_admin_claims():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    status_filter = request.args.get("status", None)
    search = request.args.get("search", None)

    result = ClaimService.list_claims(page=page, per_page=per_page, status_filter=status_filter, search=search)
    return api_response(data=result, message="Claims retrieved.")

@claim_bp.route("/admin/search/<claim_code>", methods=["GET"])
@admin_required()
def search_claim_admin(claim_code: str):
    success, message, spin = ClaimService.get_claim_by_code(claim_code)
    if not success:
        return error_response(message, 404)
    return api_response(data=spin.to_dict(), message=message)

@claim_bp.route("/admin/<claim_code>/redeem", methods=["POST"])
@admin_required()
def redeem_claim(claim_code: str):
    success, message, spin = ClaimService.redeem_claim(claim_code)
    if not success:
        return error_response(message, 400)
    return api_response(data=spin.to_dict(), message=message)
