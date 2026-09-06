from datetime import datetime, timedelta
from app.extensions import db
from app.models.otp import OTP
from app.models.customer import Customer
from app.services.otp_service import OTPService

def test_otp_send_and_verify(client):
    # 1. Register customer
    reg_res = client.post("/api/customers/register", json={
        "name": "Priya Singh",
        "mobile": "9812345678",
        "address": "MG Road"
    })
    assert reg_res.status_code == 201

    # In test/mock mode, dev_otp is provided
    dev_otp = reg_res.json["data"].get("dev_otp")
    assert dev_otp is not None
    assert len(dev_otp) == 6

    # 2. Verify with wrong OTP
    bad_res = client.post("/api/auth/verify-otp", json={
        "mobile": "9812345678",
        "otp": "000000"
    })
    assert bad_res.status_code == 400
    assert "Invalid OTP" in bad_res.json["message"]

    # 3. Verify with correct OTP
    good_res = client.post("/api/auth/verify-otp", json={
        "mobile": "9812345678",
        "otp": dev_otp
    })
    assert good_res.status_code == 200
    assert good_res.json["data"]["customer"]["otp_verified"] is True
    assert "token" in good_res.json["data"]

def test_otp_max_attempts(client):
    client.post("/api/customers/register", json={
        "name": "Arjun Das",
        "mobile": "9876500001",
        "address": "Whitefield"
    })

    # 3 bad attempts
    client.post("/api/auth/verify-otp", json={"mobile": "9876500001", "otp": "111111"})
    client.post("/api/auth/verify-otp", json={"mobile": "9876500001", "otp": "222222"})
    third = client.post("/api/auth/verify-otp", json={"mobile": "9876500001", "otp": "333333"})
    assert third.status_code == 400
    assert "Maximum attempts" in third.json["message"] or "Invalid OTP" in third.json["message"]

    # Fourth attempt should be rejected
    fourth = client.post("/api/auth/verify-otp", json={"mobile": "9876500001", "otp": "444444"})
    assert fourth.status_code == 400

def test_otp_expiration(client, app):
    with app.app_context():
        customer = Customer(name="Exp User", mobile="9876500002", address="Koramangala")
        db.session.add(customer)
        db.session.commit()

        # Insert expired OTP directly
        expired_otp = OTP(
            mobile="9876500002",
            otp_hash=OTP.hash_otp("123456"),
            expires_at=datetime.utcnow() - timedelta(minutes=5),
            attempts=0,
            verified=False,
            created_at=datetime.utcnow() - timedelta(minutes=6)
        )
        db.session.add(expired_otp)
        db.session.commit()

    res = client.post("/api/auth/verify-otp", json={"mobile": "9876500002", "otp": "123456"})
    assert res.status_code == 400
    assert "expired" in res.json["message"].lower()
