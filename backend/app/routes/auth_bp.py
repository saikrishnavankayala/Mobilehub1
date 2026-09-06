from flask import Blueprint, request
from marshmallow import ValidationError
from flask_jwt_extended import create_access_token
from app.extensions import db
from app.schemas import SendOTPSchema, VerifyOTPSchema
from app.services.otp_service import OTPService
from app.services.customer_service import CustomerService
from app.utils.response import api_response, error_response
from app.utils.phone import normalize_phone

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/check-mobile", methods=["POST"])
def check_mobile():
    """
    POST /api/auth/check-mobile
    Body: { "mobile": "9876543210" }
    Checks if mobile number exists in database.
    Returns customer details, spin history, and whether user is new or existing.
    """
    req_data = request.get_json(silent=True) or {}
    raw_mobile = req_data.get("mobile") or req_data.get("mobileNumber")
    if not raw_mobile:
        return error_response("Mobile number is required.", 400)

    clean_mobile = normalize_phone(raw_mobile)
    if len(clean_mobile) != 10 or not clean_mobile[0] in "6789":
        return error_response("Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.", 400)

    status_data = CustomerService.check_mobile_status(clean_mobile)
    return api_response(
        data=status_data,
        message="Existing customer found." if status_data["exists"] else "New customer. Please register.",
        status_code=200
    )

@auth_bp.route("/send-otp", methods=["POST"])
def send_otp():
    schema = SendOTPSchema()
    try:
        data = schema.load(request.get_json(silent=True) or {})
    except ValidationError as err:
        return error_response("Validation error", 400, err.messages)

    mobile = normalize_phone(data["mobile"])

    success, message, dev_otp = OTPService.send_verification_otp(mobile)
    if not success:
        return error_response(message, 429 if "wait" in message.lower() else 400)

    res_data = {}
    if dev_otp:
        res_data["dev_otp"] = dev_otp  # Sent in dev mode for convenient testing

    return api_response(data=res_data, message=message, status_code=200)


@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    schema = VerifyOTPSchema()
    try:
        data = schema.load(request.get_json(silent=True) or {})
    except ValidationError as err:
        return error_response("Validation error", 400, err.messages)

    mobile = normalize_phone(data["mobile"])
    entered_otp = data["otp"].strip()

    customer = CustomerService.get_by_mobile(mobile)
    if not customer:
        return error_response("Customer not found.", 404)

    success, message = OTPService.verify_otp(mobile, entered_otp)
    if not success:
        return error_response(message, 400)

    # Mark customer as verified
    customer.otp_verified = True
    db.session.commit()

    # Generate customer JWT token
    token = create_access_token(
        identity=str(customer.id),
        additional_claims={"role": "customer", "mobile": customer.mobile, "name": customer.name}
    )

    spin_status = CustomerService.check_mobile_status(customer.mobile)

    return api_response(
        data={
            "token": token,
            "customer": customer.to_dict(),
            "has_spun": spin_status["has_spun"],
            "spin": spin_status["spin"]
        },
        message="Mobile number verified successfully!",
        status_code=200
    )

