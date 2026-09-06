import pytest
from datetime import datetime, timedelta
from app import create_app
from app.extensions import db
from app.models.admin import Admin
from app.models.customer import Customer
from app.models.campaign import Campaign
from app.models.prize import Prize
from app.models.spin import Spin, SpinStatus
from app.models.otp import OTP

@pytest.fixture
def app():
    app = create_app("testing")
    with app.app_context():
        db.create_all()

        # Seed test admin
        admin = Admin(name="Test Admin", email="admin@test.com")
        admin.set_password("Admin@123")
        db.session.add(admin)

        # Seed test active campaign
        campaign = Campaign(
            name="Test Campaign 2026",
            description="Test campaign for unit tests",
            active=True,
            start_date=datetime.utcnow() - timedelta(days=1),
            end_date=datetime.utcnow() + timedelta(days=10),
            max_spins_per_mobile=1,
            instagram_url="https://instagram.com/test",
            facebook_url="https://facebook.com/test",
            whatsapp_url="https://whatsapp.com/test",
            store_name="Mobile Hub Test Store",
            store_address="123 Test Street",
            store_phone="+91 99999 88888"
        )
        db.session.add(campaign)
        db.session.commit()

        # Seed test prizes
        p1 = Prize(
            campaign_id=campaign.id,
            name="₹100 Voucher",
            quantity=10,
            remaining_quantity=10,
            weight=50,
            active=True
        )
        p2 = Prize(
            campaign_id=campaign.id,
            name="Power Bank",
            quantity=5,
            remaining_quantity=5,
            weight=20,
            active=True
        )
        p3 = Prize(
            campaign_id=campaign.id,
            name="Rare Smartphone",
            quantity=1,
            remaining_quantity=1,
            weight=5,
            active=True
        )
        db.session.add_all([p1, p2, p3])
        db.session.commit()

        yield app

        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def admin_token(client):
    res = client.post("/api/admin/login", json={
        "email": "admin@test.com",
        "password": "Admin@123"
    })
    return res.json["data"]["token"]
