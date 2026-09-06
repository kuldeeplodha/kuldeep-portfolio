from fastapi.testclient import TestClient
from main import app

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

def test_blogs_crud():
    with TestClient(app) as client:
        # Auth
        login_res = client.post("/api/auth/login", json={"password": "password123"})
        token = login_res.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create
        blog_data = {
            "id": "b1", "slug": "my-blog", "title": "T", "excerpt": "E", "body": "B",
            "status": "published", "created_at": "now", "updated_at": "now",
            "tags": [], "relevant_roles": [], "reading_time_minutes": 5, "media_urls": []
        }
        res = client.post("/api/admin/blogs", json=blog_data, headers=headers)
        assert res.status_code == 200
        
        # Get by slug
        res = client.get("/api/blogs/my-blog")
        assert res.status_code == 200
        assert res.json()["slug"] == "my-blog"
        
        # Update
        blog_data["title"] = "T2"
        res = client.put("/api/admin/blogs/b1", json=blog_data, headers=headers)
        assert res.status_code == 200
        
        # Delete
        res = client.delete("/api/admin/blogs/b1", headers=headers)
        assert res.status_code == 200
        
        # Check deleted
        res = client.get("/api/blogs/my-blog")
        assert res.status_code == 404

def test_case_studies_crud():
    with TestClient(app) as client:
        login_res = client.post("/api/auth/login", json={"password": "password123"})
        token = login_res.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        cs_data = {
            "id": "c1", "slug": "my-cs", "title": "T", "subtitle": "S", "summary": "Sum",
            "client_or_org": "C", "period": "P", "category": "Cat", "status": "published",
            "featured": 1, "created_at": "now", "updated_at": "now", "technologies": [],
            "relevant_roles": [], "problem": "P", "context": "C", "architecture": "A",
            "outcome": "O", "media_urls": []
        }
        res = client.post("/api/admin/case-studies", json=cs_data, headers=headers)
        assert res.status_code == 200
        
        res = client.get("/api/case-studies/my-cs")
        assert res.status_code == 200
        
        res = client.put("/api/admin/case-studies/c1", json=cs_data, headers=headers)
        assert res.status_code == 200
        
        res = client.delete("/api/admin/case-studies/c1", headers=headers)
        assert res.status_code == 200

def test_auth_unset_jwt():
    import os
    os.environ["JWT_SECRET"] = ""
    with TestClient(app) as client:
        res = client.post("/api/auth/login", json={"password": "password123"})
        assert res.status_code == 500
    os.environ["JWT_SECRET"] = "supersecret_for_local_dev"

def test_media_unset_cloudinary():
    import os
    os.environ["CLOUDINARY_API_SECRET"] = ""
    with TestClient(app) as client:
        login_res = client.post("/api/auth/login", json={"password": "password123"})
        token = login_res.json()["token"]
        res = client.get("/api/admin/media/sign", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 500
    os.environ["CLOUDINARY_API_SECRET"] = "your_api_secret"

