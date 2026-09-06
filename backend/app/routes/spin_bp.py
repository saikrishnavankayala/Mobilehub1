from flask import Blueprint, request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.services.campaign_service import CampaignService
from app.services.spin_service import SpinService
from app.utils.response import api_response
from app.utils.phone import normalize_phone

spin_bp = Blueprint("spin", __name__, url_prefix="/api/spin")

@spin_bp.route("", methods=["POST"])
def spin_wheel():
    """
    POST /api/spin
    Executes a promotional spin strictly enforcing ONE MOBILE NUMBER = ONE SPIN ONLY.
    Supports JWT auth header or request body { "mobileNumber": "..." }.
    """
    customer_id = None
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        if identity:
            customer_id = int(identity)
    except Exception:
        customer_id = None

    req_data = request.get_json(silent=True) or {}
    mobile_number = req_data.get("mobileNumber") or req_data.get("mobile")

    campaign = CampaignService.get_or_create_default_campaign()

    success, data, message, status_code, error_code = SpinService.execute_spin(
        customer_id=customer_id,
        campaign_id=campaign.id,
        mobile_number=mobile_number
    )

    if not success:
        return jsonify({
            "success": False,
            "code": error_code or "SPIN_FAILED",
            "message": message,
            "data": data
        }), status_code

    return api_response(data=data, message=message, status_code=status_code)

@spin_bp.route("/status", methods=["GET", "POST"])
def check_status():
    """
    GET or POST /api/spin/status?mobileNumber=...
    Checks if a mobile number or authenticated customer has already spun.
    """
    customer_id = None
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        if identity:
            customer_id = int(identity)
    except Exception:
        customer_id = None

    mobile_number = request.args.get("mobileNumber") or request.args.get("mobile")
    if not mobile_number:
        req_data = request.get_json(silent=True) or {}
        mobile_number = req_data.get("mobileNumber") or req_data.get("mobile")

    campaign = CampaignService.get_or_create_default_campaign()

    has_spun, spin_data = SpinService.check_spin_status(
        mobile_number=mobile_number,
        customer_id=customer_id,
        campaign_id=campaign.id
    )

    return jsonify({
        "success": True,
        "has_spun": has_spun,
        "code": "SPIN_ALREADY_USED" if has_spun else "ELIGIBLE",
        "message": "This mobile number has already participated in the MobileHub reward campaign. Only one spin is allowed per mobile number." if has_spun else "Eligible to spin.",
        "spin": spin_data
    }), 200

@spin_bp.route("/result", methods=["GET"])
def get_spin_result():
    customer_id = None
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        if identity:
            customer_id = int(identity)
    except Exception:
        customer_id = None

    campaign = CampaignService.get_or_create_default_campaign()

    mobile_number = request.args.get("mobileNumber") or request.args.get("mobile")

    if mobile_number or customer_id:
        has_spun, spin_data = SpinService.check_spin_status(
            mobile_number=mobile_number,
            customer_id=customer_id,
            campaign_id=campaign.id
        )
        if has_spun and spin_data:
            return api_response(data=spin_data, message="Spin record retrieved.")

    return jsonify({"success": False, "message": "No spin record found.", "code": "NOT_FOUND"}), 404
