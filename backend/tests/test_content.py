from fastapi.testclient import TestClient
from main import app

def test_content_crud():
    with TestClient(app) as client:
        # Auth
        login_res = client.post("/api/auth/login", json={"password": "password123"})
        token = login_res.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create (PUT)
        content_data = {
            "section_key": "profile",
            "data": {"name": "Kuldeep"},
            "status": "published",
            "published_at": "now",
            "updated_at": "now"
        }
        res = client.put("/api/admin/content/profile", json=content_data, headers=headers)
        assert res.status_code == 200
        
        # Get public (by key)
        res = client.get("/api/content/profile")
        assert res.status_code == 200
        assert res.json()["data"]["name"] == "Kuldeep"
        
        # Get all public
        res = client.get("/api/content")
        assert res.status_code == 200
        assert any(item["section_key"] == "profile" for item in res.json())
        
        # Admin Get
        res = client.get("/api/admin/content/profile", headers=headers)
        assert res.status_code == 200

def test_content_bad_key():
    with TestClient(app) as client:
        # Auth
        login_res = client.post("/api/auth/login", json={"password": "password123"})
        token = login_res.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test bad key in path
        res = client.get("/api/content/BAD_KEY!")
        assert res.status_code == 422
        
        # Test bad key in body
        content_data = {
            "section_key": "BAD_KEY!",
            "data": {},
            "status": "published",
            "published_at": "now",
            "updated_at": "now"
        }
        res = client.put("/api/admin/content/BAD_KEY!", json=content_data, headers=headers)
        assert res.status_code == 422
