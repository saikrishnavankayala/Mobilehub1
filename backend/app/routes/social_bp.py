from flask import Blueprint, jsonify, current_app
from app.services.campaign_service import CampaignService

social_bp = Blueprint("social", __name__, url_prefix="/api/social-links")

def get_official_social_data():
    campaign = CampaignService.get_or_create_default_campaign()
    
    instagram_url = campaign.instagram_url or current_app.config.get(
        "INSTAGRAM_URL",
        "https://www.instagram.com/mobilehub_tadepalligudem_?utm_source=qr&igsh=MW4yMHdydmIydXBxYQ%3D%3D"
    )
    facebook_url = campaign.facebook_url or current_app.config.get(
        "FACEBOOK_URL",
        "https://www.facebook.com/profile.php?id=61555352783316&rdid=PLVaZVHjrUIfF1SU&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1DdCNNnopH%2F#"
    )
    whatsapp_url = campaign.whatsapp_url or current_app.config.get(
        "WHATSAPP_URL",
        "https://whatsapp.com/channel/0029VajCJxRADTOB8x4ocV2t"
    )

    links_list = [
        {
            "platform": "instagram",
            "name": "Instagram",
            "url": instagram_url,
            "displayText": "Follow MobileHub on Instagram",
            "cta": "Follow"
        },
        {
            "platform": "facebook",
            "name": "Facebook",
            "url": facebook_url,
            "displayText": "Follow MobileHub on Facebook",
            "cta": "Follow"
        },
        {
            "platform": "whatsapp",
            "name": "WhatsApp Channel",
            "url": whatsapp_url,
            "displayText": "Join the MobileHub WhatsApp Channel",
            "cta": "Join Channel"
        }
    ]

    links_map = {
        "instagram": {
            "name": "Instagram",
            "url": instagram_url,
            "displayText": "Follow MobileHub on Instagram",
            "cta": "Follow"
        },
        "facebook": {
            "name": "Facebook",
            "url": facebook_url,
            "displayText": "Follow MobileHub on Facebook",
            "cta": "Follow"
        },
        "whatsapp": {
            "name": "WhatsApp Channel",
            "url": whatsapp_url,
            "displayText": "Join the MobileHub WhatsApp Channel",
            "cta": "Join Channel"
        }
    }

    return links_list, links_map

@social_bp.route("", methods=["GET"])
def get_social_links():
    """
    Returns official MobileHub social-media platforms configuration.
    Contains exactly 3 platforms: Instagram, Facebook, and WhatsApp Channel.
    """
    links_list, links_map = get_official_social_data()

    return jsonify({
        "success": True,
        "message": "Social media links retrieved successfully.",
        "socialLinks": links_list,
        "socialMap": links_map,
        "data": {
            "socialLinks": links_list,
            "socialMap": links_map
        }
    }), 200
