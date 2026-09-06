def test_claim_lookup_and_redemption(client, admin_token):
    # 1. Register, verify, spin to get claim code
    reg = client.post("/api/customers/register", json={
        "name": "Kavita Rao",
        "mobile": "9933445566",
        "address": "Malleshwaram"
    })
    otp = reg.json["data"]["dev_otp"]
    v = client.post("/api/auth/verify-otp", json={"mobile": "9933445566", "otp": otp})
    token = v.json["data"]["token"]
    h = {"Authorization": f"Bearer {token}"}
    client.post("/api/customers/social-verify", headers=h)
    spin_res = client.post("/api/spin", headers=h)
    claim_code = spin_res.json["data"]["claim_code"]

    # 2. Public claim verification
    pub_res = client.get(f"/api/claims/verify/{claim_code}")
    assert pub_res.status_code == 200
    assert pub_res.json["data"]["status"] == "GENERATED"
    assert pub_res.json["data"]["claim_code"] == claim_code

    # 3. Admin redeem claim code
    admin_h = {"Authorization": f"Bearer {admin_token}"}
    redeem_res = client.post(f"/api/claims/admin/{claim_code}/redeem", headers=admin_h)
    assert redeem_res.status_code == 200
    assert redeem_res.json["data"]["status"] == "CLAIMED"
    assert redeem_res.json["data"]["claimed_at"] is not None

    # 4. Attempt second redemption -> MUST BE REJECTED!
    dup_res = client.post(f"/api/claims/admin/{claim_code}/redeem", headers=admin_h)
    assert dup_res.status_code == 400
    assert "already claimed" in dup_res.json["message"].lower()

def test_invalid_claim_code(client, admin_token):
    admin_h = {"Authorization": f"Bearer {admin_token}"}
    res = client.get("/api/claims/verify/MH-INVALID")
    assert res.status_code == 404

    res2 = client.post("/api/claims/admin/MH-INVALID/redeem", headers=admin_h)
    assert res2.status_code == 400 or res2.status_code == 404
