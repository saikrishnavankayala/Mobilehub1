from flask import Blueprint, request
from marshmallow import ValidationError
from app.schemas import AdminLoginSchema, PrizeSchema, CampaignUpdateSchema
from app.services.admin_service import AdminService
from app.services.campaign_service import CampaignService
from app.services.prize_service import PrizeService
from app.auth import admin_required
from app.utils.response import api_response, error_response

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

@admin_bp.route("/login", methods=["POST"])
def login():
    schema = AdminLoginSchema()
    try:
        data = schema.load(request.get_json(silent=True) or {})
    except ValidationError as err:
        return error_response("Validation error", 400, err.messages)

    success, message, result = AdminService.authenticate(data["email"], data["password"])
    if not success:
        return error_response(message, 401)

    return api_response(data=result, message=message)

@admin_bp.route("/dashboard", methods=["GET"])
@admin_required()
def dashboard():
    stats = AdminService.get_dashboard_stats()
    return api_response(data=stats, message="Dashboard stats retrieved.")

@admin_bp.route("/customers", methods=["GET"])
@admin_required()
def get_customers():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    search = request.args.get("search", None)
    otp_status = request.args.get("otp_status", None)
    spin_status = request.args.get("spin_status", None)

    customers_data = AdminService.get_customers(
        page=page,
        per_page=per_page,
        search=search,
        otp_status=otp_status,
        spin_status=spin_status
    )
    return api_response(data=customers_data, message="Customers retrieved.")

@admin_bp.route("/prizes", methods=["GET"])
@admin_required()
def get_prizes():
    campaign = CampaignService.get_or_create_default_campaign()
    prizes = PrizeService.get_campaign_prizes(campaign.id, public_only=False)
    return api_response(data=[p.to_dict() for p in prizes], message="Prizes retrieved.")

@admin_bp.route("/prizes", methods=["POST"])
@admin_required()
def add_prize():
    schema = PrizeSchema()
    try:
        data = schema.load(request.get_json(silent=True) or {})
    except ValidationError as err:
        return error_response("Validation error", 400, err.messages)

    campaign = CampaignService.get_or_create_default_campaign()
    prize = PrizeService.create_prize(campaign.id, data)
    return api_response(data=prize.to_dict(), message="Prize created successfully.", status_code=201)

@admin_bp.route("/prizes/<int:prize_id>", methods=["PUT"])
@admin_required()
def update_prize(prize_id: int):
    schema = PrizeSchema(partial=True)
    try:
        data = schema.load(request.get_json(silent=True) or {})
    except ValidationError as err:
        return error_response("Validation error", 400, err.messages)

    success, message, prize = PrizeService.update_prize(prize_id, data)
    if not success:
        return error_response(message, 404)
    return api_response(data=prize.to_dict(), message=message)

@admin_bp.route("/prizes/<int:prize_id>", methods=["DELETE"])
@admin_required()
def delete_prize(prize_id: int):
    success, message = PrizeService.delete_prize(prize_id)
    if not success:
        return error_response(message, 404)
    return api_response(message=message)

@admin_bp.route("/campaign", methods=["GET"])
@admin_required()
def get_campaign_settings():
    campaign = CampaignService.get_or_create_default_campaign()
    return api_response(data=campaign.to_dict(), message="Campaign settings retrieved.")

@admin_bp.route("/campaign", methods=["PUT"])
@admin_required()
def update_campaign_settings():
    schema = CampaignUpdateSchema(partial=True)
    try:
        data = schema.load(request.get_json(silent=True) or {})
    except ValidationError as err:
        return error_response("Validation error", 400, err.messages)

    campaign = CampaignService.get_or_create_default_campaign()
    success, message, updated_campaign = CampaignService.update_campaign(campaign.id, data)
    if not success:
        return error_response(message, 400)
    return api_response(data=updated_campaign.to_dict(), message=message)
