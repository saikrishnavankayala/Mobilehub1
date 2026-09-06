def test_admin_auth_and_dashboard(client, admin_token):
    admin_h = {"Authorization": f"Bearer {admin_token}"}

    # 1. Access protected dashboard
    dash_res = client.get("/api/admin/dashboard", headers=admin_h)
    assert dash_res.status_code == 200
    stats = dash_res.json["data"]["summary"]
    assert "total_customers" in stats
    assert "total_spins" in stats
    assert "remaining_inventory" in stats

    # 2. Access dashboard without token -> 401
    unauth = client.get("/api/admin/dashboard")
    assert unauth.status_code == 401

def test_admin_prize_crud(client, admin_token):
    admin_h = {"Authorization": f"Bearer {admin_token}"}

    # Create new prize
    new_prize = client.post("/api/admin/prizes", headers=admin_h, json={
        "name": "Smart Watch Ultra",
        "description": "Fitness tracking smartwatch",
        "quantity": 10,
        "weight": 15,
        "active": True
    })
    assert new_prize.status_code == 201
    prize_id = new_prize.json["data"]["id"]

    # Update prize
    update_res = client.put(f"/api/admin/prizes/{prize_id}", headers=admin_h, json={
        "name": "Smart Watch Ultra 2",
        "weight": 25
    })
    assert update_res.status_code == 200
    assert update_res.json["data"]["name"] == "Smart Watch Ultra 2"
    assert update_res.json["data"]["weight"] == 25

    # Delete prize
    del_res = client.delete(f"/api/admin/prizes/{prize_id}", headers=admin_h)
    assert del_res.status_code == 200

def test_excel_export(client, admin_token):
    admin_h = {"Authorization": f"Bearer {admin_token}"}
    res = client.get("/api/admin/export/customers", headers=admin_h)
    assert res.status_code == 200
    assert "spreadsheetml" in res.headers.get("Content-Type", "")
    assert len(res.data) > 0
