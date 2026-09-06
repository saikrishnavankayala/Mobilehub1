import os
from datetime import datetime
from app.extensions import db
from app.models.campaign import Campaign

class CampaignService:
    @staticmethod
    def get_or_create_default_campaign() -> Campaign:
        campaign = Campaign.query.filter_by(active=True).first()
        if not campaign:
            campaign = Campaign.query.first()
        if not campaign:
            campaign = Campaign(
                name="Mobile Hub Mega Spin & Win 2026",
                description="Shop at Mobile Hub and stand a chance to win vouchers, power banks, earphones and premium accessories!",
                instagram_url=os.getenv("INSTAGRAM_URL", "https://instagram.com/mobilehub_store"),
                facebook_url=os.getenv("FACEBOOK_URL", "https://facebook.com/mobilehub_store"),
                whatsapp_url=os.getenv("WHATSAPP_URL", "https://wa.me/919876543210"),
                store_name=os.getenv("STORE_NAME", "Mobile Hub"),
                store_address=os.getenv("STORE_ADDRESS", "Plot 42, Metro Pillar 118, MG Road, Tech City"),
                store_phone=os.getenv("STORE_PHONE", "+91 98765 43210"),
                terms_conditions="1. Offer valid for registered customers only.\n2. One spin per verified mobile number.\n3. Claim code must be presented at the Mobile Hub counter within 7 days.\n4. Prizes are non-transferable and cannot be exchanged for cash.",
                privacy_policy="Mobile Hub values your privacy. Mobile numbers and personal information collected will only be used for campaign verification, prize redemption, and store updates.",
                active=True,
                max_spins_per_mobile=1,
                created_at=datetime.utcnow()
            )
            db.session.add(campaign)
            db.session.commit()
        return campaign

    @staticmethod
    def update_campaign(campaign_id: int, data: dict):
        campaign = db.session.get(Campaign, campaign_id)
        if not campaign:
            return False, "Campaign not found", None

        fields = [
            "name", "description", "start_date", "end_date",
            "instagram_url", "facebook_url", "whatsapp_url",
            "store_name", "store_address", "store_phone",
            "terms_conditions", "privacy_policy", "active",
            "max_spins_per_mobile"
        ]
        for field in fields:
            if field in data:
                setattr(campaign, field, data[field])

        db.session.commit()
        return True, "Campaign updated successfully", campaign
