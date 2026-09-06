from fastapi.testclient import TestClient
from backend.main import app

def test_login_invalid():
    with TestClient(app) as client:
        response = client.post("/api/auth/login", json={"password": "wrongpassword"})
        assert response.status_code == 401

def test_get_blogs_public():
    with TestClient(app) as client:
        response = client.get("/api/blogs")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

def test_get_case_studies_public():
    with TestClient(app) as client:
        response = client.get("/api/case-studies")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

def test_admin_blogs_unauthorized():
    with TestClient(app) as client:
        response = client.get("/api/admin/blogs")
        assert response.status_code in [401, 403]

def test_admin_case_studies_unauthorized():
    with TestClient(app) as client:
        response = client.get("/api/admin/case-studies")
        assert response.status_code in [401, 403]
