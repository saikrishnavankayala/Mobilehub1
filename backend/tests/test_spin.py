from app.extensions import db
from app.models.customer import Customer
from app.models.prize import Prize
from app.models.spin import Spin
from app.services.spin_service import SpinService

def test_full_spin_flow(client):
    # 1. Register
    reg_res = client.post("/api/customers/register", json={
        "name": "Suresh Raina",
        "mobile": "9988776655",
        "address": "Jayanagar 4th Block"
    })
    dev_otp = reg_res.json["data"]["dev_otp"]

    # 2. Verify OTP
    v_res = client.post("/api/auth/verify-otp", json={
        "mobile": "9988776655",
        "otp": dev_otp
    })
    customer_token = v_res.json["data"]["token"]
    auth_headers = {"Authorization": f"Bearer {customer_token}"}

    # 3. Check eligibility before social tasks -> not eligible
    elig1 = client.get("/api/campaign/eligibility", headers=auth_headers)
    assert elig1.status_code == 200
    assert elig1.json["data"]["eligible"] is False

    # 4. Complete social verification
    soc_res = client.post("/api/customers/social-verify", headers=auth_headers)
    assert soc_res.status_code == 200

    # 5. Check eligibility after social tasks -> eligible
    elig2 = client.get("/api/campaign/eligibility", headers=auth_headers)
    assert elig2.status_code == 200
    assert elig2.json["data"]["eligible"] is True

    # 6. Execute FIRST SPIN -> MUST SUCCEED
    spin_res = client.post("/api/spin", headers=auth_headers)
    assert spin_res.status_code == 200
    spin_data = spin_res.json["data"]
    assert "claim_code" in spin_data
    assert spin_data["claim_code"].startswith("MH-")
    assert "prize" in spin_data
    assert "segment_index" in spin_data

    # 7. Execute SECOND SPIN -> MUST BE REJECTED!
    second_spin_res = client.post("/api/spin", headers=auth_headers)
    assert second_spin_res.status_code in [400, 409]
    assert "already used" in second_spin_res.json["message"].lower()

def test_inventory_decrements_and_stockout(client, app):
    with app.app_context():
        # Set smartphone quantity to 1, others to 0 to force winning this item
        prizes = Prize.query.all()
        for p in prizes:
            if p.name == "Rare Smartphone":
                p.remaining_quantity = 1
                p.quantity = 1
                p.weight = 100
            else:
                p.remaining_quantity = 0
                p.weight = 0
        db.session.commit()

    # User 1 registers and spins
    reg1 = client.post("/api/customers/register", json={
        "name": "Winner 1",
        "mobile": "9911223344",
        "address": "Indiranagar"
    })
    otp1 = reg1.json["data"]["dev_otp"]
    v1 = client.post("/api/auth/verify-otp", json={"mobile": "9911223344", "otp": otp1})
    token1 = v1.json["data"]["token"]
    h1 = {"Authorization": f"Bearer {token1}"}
    client.post("/api/customers/social-verify", headers=h1)

    spin1 = client.post("/api/spin", headers=h1)
    assert spin1.status_code == 200
    assert spin1.json["data"]["prize"]["name"] == "Rare Smartphone"

    with app.app_context():
        smartphone = Prize.query.filter_by(name="Rare Smartphone").first()
        assert smartphone.remaining_quantity == 0

    # User 2 registers and attempts to spin -> No prizes left
    reg2 = client.post("/api/customers/register", json={
        "name": "User 2",
        "mobile": "9955667788",
        "address": "MG Road"
    })
    otp2 = reg2.json["data"]["dev_otp"]
    v2 = client.post("/api/auth/verify-otp", json={"mobile": "9955667788", "otp": otp2})
    token2 = v2.json["data"]["token"]
    h2 = {"Authorization": f"Bearer {token2}"}
    client.post("/api/customers/social-verify", headers=h2)

    spin2 = client.post("/api/spin", headers=h2)
    assert spin2.status_code == 400
    assert "out of stock" in spin2.json["message"].lower()
