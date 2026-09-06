import pytest
from app.models.customer import Customer
from app.models.spin import Spin
from app.models.prize import Prize

def test_complete_customer_identification_and_login_flow(client):
    """
    Test End-to-End:
    1. Check non-existent mobile -> returns exists: False (New Customer)
    2. Register new customer -> success, unique DB record created
    3. Verify OTP -> success, JWT token returned, has_spun: False
    4. Complete spin -> allocated authentic prize, recorded in DB
    5. Check same mobile again -> returns exists: True (Existing Customer) with exact spin & prize data
    6. Verify no duplicate Customer rows created
    7. Check another brand new mobile -> returns exists: False, clean slate (no previous data bleed)
    """
    test_mobile_1 = "9876543211"
    
    # 1. Non-existent mobile check
    check_res = client.post("/api/auth/check-mobile", json={"mobile": test_mobile_1})
    assert check_res.status_code == 200
    check_data = check_res.json["data"]
    assert check_data["exists"] is False
    assert check_data["is_new"] is True
    assert check_data["has_spun"] is False
    assert check_data["customer"] is None

    # 2. Register New Customer
    reg_res = client.post("/api/customers/register", json={
        "name": "Arjun Varma",
        "mobile": test_mobile_1,
        "address": "Bhimavaram Road, Tadepalligudem"
    })
    assert reg_res.status_code == 201
    cust_data = reg_res.json["data"]["customer"]
    assert cust_data["name"] == "Arjun Varma"
    assert cust_data["mobile"] == test_mobile_1
    dev_otp = reg_res.json["data"].get("dev_otp", "123456")

    # 3. Verify OTP
    otp_res = client.post("/api/auth/verify-otp", json={
        "mobile": test_mobile_1,
        "otp": dev_otp
    })
    assert otp_res.status_code == 200
    otp_data = otp_res.json["data"]
    assert "token" in otp_data
    assert otp_data["has_spun"] is False
    customer_token = otp_data["token"]

    # 4. Complete Spin
    spin_res = client.post("/api/spin", json={"mobileNumber": test_mobile_1}, headers={
        "Authorization": f"Bearer {customer_token}"
    })
    assert spin_res.status_code == 200
    spin_data = spin_res.json["data"]
    assert "claim_code" in spin_data
    assert "prize" in spin_data
    allocated_prize_name = spin_data["prize"]["name"]
    allocated_claim_code = spin_data["claim_code"]

    # 5. Check same mobile again -> MUST return Existing Customer with exact spin history
    check_again = client.post("/api/auth/check-mobile", json={"mobile": test_mobile_1})
    assert check_again.status_code == 200
    again_data = check_again.json["data"]
    assert again_data["exists"] is True
    assert again_data["is_new"] is False
    assert again_data["has_spun"] is True
    assert again_data["customer"]["name"] == "Arjun Varma"
    assert again_data["spin"]["claim_code"] == allocated_claim_code
    assert again_data["spin"]["prize"]["name"] == allocated_prize_name

    # 6. Verify duplicate check: customer table only has 1 record for this mobile
    matching_customers = Customer.query.filter_by(mobile=test_mobile_1).all()
    assert len(matching_customers) == 1

    # 7. Check another brand new mobile -> MUST be clean new customer
    test_mobile_2 = "9876543222"
    check_new = client.post("/api/auth/check-mobile", json={"mobile": test_mobile_2})
    assert check_new.status_code == 200
    new_data = check_new.json["data"]
    assert new_data["exists"] is False
    assert new_data["is_new"] is True
    assert new_data["has_spun"] is False
    assert new_data["customer"] is None
    assert new_data["spin"] is None
