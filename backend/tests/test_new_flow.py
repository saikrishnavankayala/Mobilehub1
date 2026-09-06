def test_one_spin_per_mobile_and_claim_submit(client):
    # 1. Test fresh mobile spin
    mobile = "9876543299"
    res1 = client.post("/api/spin", json={"mobileNumber": mobile})
    assert res1.status_code == 200
    data = res1.json["data"]
    assert "claim_code" in data
    claim_code = data["claim_code"]

    # 2. Check spin status -> must report has_spun = True
    status_res = client.get(f"/api/spin/status?mobileNumber={mobile}")
    assert status_res.status_code == 200
    assert status_res.json["has_spun"] is True
    assert status_res.json["code"] == "SPIN_ALREADY_USED"

    # 3. Test DUPLICATE spin with different formats: +91, 0, spaces
    dup_res1 = client.post("/api/spin", json={"mobileNumber": f"+91 {mobile}"})
    assert dup_res1.status_code == 409
    assert dup_res1.json["code"] == "SPIN_ALREADY_USED"

    dup_res2 = client.post("/api/spin", json={"mobileNumber": f"0{mobile}"})
    assert dup_res2.status_code == 409
    assert dup_res2.json["code"] == "SPIN_ALREADY_USED"

    # 4. Test Claim Submit
    claim_res = client.post("/api/claims/submit", json={
        "claimCode": claim_code,
        "mobile": mobile,
        "name": "Sai Krishna",
        "address": "Main Road, Tadepalligudem",
        "pincode": "534101"
    })
    assert claim_res.status_code == 200
    claim_data = claim_res.json["data"]
    assert claim_data["status"] == "CONFIRMED"
    assert "referenceId" in claim_data
    assert claim_data["claimCode"] == claim_code
