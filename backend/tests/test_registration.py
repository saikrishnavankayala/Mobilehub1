def test_valid_registration(client):
    res = client.post("/api/customers/register", json={
        "name": "Rahul Sharma",
        "mobile": "9876543210",
        "address": "Flat 204, Tech Park Enclave, Bengaluru"
    })
    assert res.status_code == 201
    data = res.json
    assert data["success"] is True
    assert data["data"]["customer"]["name"] == "Rahul Sharma"
    assert data["data"]["customer"]["mobile"] == "9876543210"
    assert data["data"]["customer"]["otp_verified"] is False
    assert data["data"]["otp_sent"] is True

def test_invalid_mobile_digits(client):
    # Less than 10 digits
    res = client.post("/api/customers/register", json={
        "name": "Anil Kumar",
        "mobile": "987654321",
        "address": "Indira Nagar"
    })
    assert res.status_code == 400
    assert "mobile" in res.json.get("errors", {})

    # Starting with 1 (not 6, 7, 8, 9)
    res2 = client.post("/api/customers/register", json={
        "name": "Anil Kumar",
        "mobile": "1234567890",
        "address": "Indira Nagar"
    })
    assert res2.status_code == 400
    assert "mobile" in res2.json.get("errors", {})

def test_missing_name_or_address(client):
    res = client.post("/api/customers/register", json={
        "mobile": "9876543210"
    })
    assert res.status_code == 400
    assert "name" in res.json.get("errors", {})
    assert "address" in res.json.get("errors", {})
