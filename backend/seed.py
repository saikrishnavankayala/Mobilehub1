import os
from datetime import datetime, timedelta
from app import create_app
from app.extensions import db
from app.models.admin import Admin
from app.models.campaign import Campaign
from app.models.prize import Prize

app = create_app(os.getenv("FLASK_ENV", "development"))

def seed():
    with app.app_context():
        # Schema changes are owned by Flask-Migrate. Run `flask db upgrade`
        # before this script in every environment.

        # 1. Seed Admin
        admin_email = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@mobilehub.com")
        admin_password = os.getenv("DEFAULT_ADMIN_PASSWORD")
        admin = Admin.query.filter_by(email=admin_email).first()
        if not admin:
            if not admin_password:
                if os.getenv("FLASK_ENV") == "production":
                    raise RuntimeError(
                        "DEFAULT_ADMIN_PASSWORD must be configured before creating the first production admin."
                    )
                # Preserve the existing local-development seed behavior.
                admin_password = "Admin@123"
            admin = Admin(
                name=os.getenv("DEFAULT_ADMIN_NAME", "Mobile Hub Super Admin"),
                email=admin_email,
                created_at=datetime.utcnow()
            )
            admin.set_password(admin_password)
            db.session.add(admin)
            print("-> Initial admin created.")
        else:
            print("Default admin already exists.")

        # 2. Seed Campaign
        campaign = Campaign.query.first()
        if not campaign:
            print("Creating default Campaign...")
            campaign = Campaign(
                name="Mobile Hub Grand Spin & Win Fest 2026",
                description="Celebrate with Mobile Hub! Complete quick verification, follow our socials, and get 1 exclusive guaranteed spin to win instant store vouchers, power banks, and audio gear.",
                start_date=datetime.utcnow() - timedelta(days=1),
                end_date=datetime.utcnow() + timedelta(days=30),
                instagram_url=os.getenv("INSTAGRAM_URL", "https://www.instagram.com/mobilehub_tadepalligudem_?utm_source=qr&igsh=MW4yMHdydmIydXBxYQ%3D%3D"),
                facebook_url=os.getenv("FACEBOOK_URL", "https://www.facebook.com/profile.php?id=61555352783316&rdid=PLVaZVHjrUIfF1SU&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1DdCNNnopH%2F#"),
                whatsapp_url=os.getenv("WHATSAPP_URL", "https://whatsapp.com/channel/0029VajCJxRADTOB8x4ocV2t"),
                store_name="Mobile Hub",
                store_address="MobileHub Opp. Prabhata Talkies,Bhimavaram Road,Tadepalligudem - 534102",
                store_phone="+91 90145 67567",
                terms_conditions=(
                    "1. Only Indian mobile numbers with valid OTP verification are eligible.\n"
                    "2. Exactly ONE spin per verified customer.\n"
                    "3. Prizes must be redeemed at the Mobile Hub flagship store within 7 days of spin.\n"
                    "4. Winning claim code (format MH-XXXXXX) must be presented during billing.\n"
                    "5. Management reserves the right to verify customer identity."
                ),
                privacy_policy=(
                    "Mobile Hub respects customer privacy. Data collected is strictly used for promotional authentication, "
                    "claim validation, and store communication. We do not share customer data with third parties."
                ),
                active=True,
                max_spins_per_mobile=1,
                created_at=datetime.utcnow()
            )
            db.session.add(campaign)
            db.session.commit()
            print(f"-> Campaign created: {campaign.name}")
        else:
            print("Campaign already exists.")

        # 3. Seed Prizes
        existing_prizes = Prize.query.filter_by(campaign_id=campaign.id).count()
        if existing_prizes == 0:
            print("Seeding promotional prizes...")
            sample_prizes = [
                {
                    "name": "50% Discount on Accessories",
                    "description": "Get flat 50% discount on all premium mobile accessories.",
                    "image_url": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80",
                    "quantity": 500,
                    "weight": 100,
                    "active": True
                },
                {
                    "name": "5% Discount on Mobiles",
                    "description": "Get flat 5% discount on latest 5G smartphones.",
                    "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80",
                    "quantity": 500,
                    "weight": 100,
                    "active": True
                },
                {
                    "name": "Buy @ ₹149/- Neck Band",
                    "description": "Special promotional pricing: Wireless Bluetooth Neck Band at just ₹149/-.",
                    "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80",
                    "quantity": 500,
                    "weight": 100,
                    "active": True
                },
                {
                    "name": "Buy @ ₹399/- TWS Buds",
                    "description": "True Wireless Stereo (TWS) Earbuds with fast charging case at ₹399/-.",
                    "image_url": "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=400&q=80",
                    "quantity": 500,
                    "weight": 100,
                    "active": True
                },
                {
                    "name": "Buy @ ₹799/- Smart Watch",
                    "description": "Full touch HD AMOLED display Smart Watch with health sensors at ₹799/-.",
                    "image_url": "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=400&q=80",
                    "quantity": 500,
                    "weight": 100,
                    "active": True
                },
                {
                    "name": "Buy @ ₹49/- Glass Protection",
                    "description": "Premium 9H hardness edge-to-edge tempered glass screen protection at ₹49/-.",
                    "image_url": "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=400&q=80",
                    "quantity": 500,
                    "weight": 100,
                    "active": True
                },
            ]

            for p_data in sample_prizes:
                prize = Prize(
                    campaign_id=campaign.id,
                    name=p_data["name"],
                    description=p_data["description"],
                    image_url=p_data["image_url"],
                    quantity=p_data["quantity"],
                    remaining_quantity=p_data["quantity"],
                    weight=p_data["weight"],
                    active=p_data["active"]
                )
                db.session.add(prize)
            db.session.commit()
            print(f"-> Seeded {len(sample_prizes)} prizes successfully.")
        else:
            print(f"Prizes already present ({existing_prizes} found).")

        print("\n==========================================")
        print("SEEDING COMPLETE!")
        print("==========================================")

if __name__ == "__main__":
    seed()
