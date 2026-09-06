from flask import Blueprint
from app.services.campaign_service import CampaignService
from app.services.prize_service import PrizeService
from app.utils.response import api_response

prize_bp = Blueprint("prizes", __name__, url_prefix="/api/prizes")

@prize_bp.route("", methods=["GET"])
def get_public_prizes():
    campaign = CampaignService.get_or_create_default_campaign()
    prizes = PrizeService.get_campaign_prizes(campaign.id, public_only=True)
    return api_response(
        data=[p.to_dict() for p in prizes],
        message="Active prizes retrieved."
    )
