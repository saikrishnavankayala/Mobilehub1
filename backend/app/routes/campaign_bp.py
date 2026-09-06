from flask import Blueprint
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.services.campaign_service import CampaignService
from app.services.eligibility_service import EligibilityService
from app.services.prize_service import PrizeService
from app.utils.response import api_response, error_response

campaign_bp = Blueprint("campaign", __name__, url_prefix="/api/campaign")

@campaign_bp.route("/active", methods=["GET"])
def get_active_campaign():
    campaign = CampaignService.get_or_create_default_campaign()
    prizes = PrizeService.get_campaign_prizes(campaign.id, public_only=True)

    data = campaign.to_dict()
    data["prizes"] = [p.to_dict() for p in prizes]
    return api_response(data=data, message="Active campaign loaded.")

@campaign_bp.route("/eligibility", methods=["GET"])
def check_eligibility():
    try:
        verify_jwt_in_request()
        customer_id = int(get_jwt_identity())
    except Exception:
        return error_response("Authentication required to check eligibility.", 401)

    campaign = CampaignService.get_or_create_default_campaign()
    result = EligibilityService.check_customer_eligibility(customer_id, campaign.id)
    return api_response(data=result, message="Eligibility status retrieved.")
