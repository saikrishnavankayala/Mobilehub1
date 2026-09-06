from flask import Blueprint, request
from marshmallow import ValidationError
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.schemas import CustomerRegistrationSchema
from app.services.customer_service import CustomerService
from app.services.otp_service import OTPService
from app.auth import customer_required
from app.utils.response import api_response, error_response

customer_bp = Blueprint("customers", __name__, url_prefix="/api/customers")

@customer_bp.route("/register", methods=["POST"])
def register():
    schema = CustomerRegistrationSchema()
    try:
        data = schema.load(request.get_json(silent=True) or {})
    except ValidationError as err:
        return error_response("Validation error", 400, err.messages)

    success, message, customer = CustomerService.register_customer(
        name=data["name"],
        mobile=data["mobile"],
        address=data["address"]
    )

    if not success:
        return error_response(message, 400)

    # Automatically dispatch OTP to registered mobile
    otp_success, otp_msg, dev_otp = OTPService.send_verification_otp(customer.mobile)

    res_data = {
        "customer": customer.to_dict(),
        "otp_sent": otp_success,
        "otp_message": otp_msg
    }
    if dev_otp:
        res_data["dev_otp"] = dev_otp

    return api_response(
        data=res_data,
        message="Registration successful. Please verify your mobile number with the OTP sent.",
        status_code=201
    )

@customer_bp.route("/social-verify", methods=["POST"])
def social_verify():
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
    except Exception:
        identity = None

    if identity:
        customer_id = int(identity)
        success, message = CustomerService.set_social_verified(customer_id, True)
        if not success:
            return error_response(message, 400)
        customer = CustomerService.get_by_id(customer_id)
        return api_response(data={"customer": customer.to_dict(), "verified": True}, message=message)

    return api_response(data={"verified": True}, message="Social media participation confirmed.")

@customer_bp.route("/me", methods=["GET"])
@customer_required()
def get_current_customer():
    customer_id = int(get_jwt_identity())
    customer = CustomerService.get_by_id(customer_id)
    if not customer:
        return error_response("Customer not found", 404)
    return api_response(data={"customer": customer.to_dict()})
