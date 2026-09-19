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

def test_content_cache_control_no_long_stale_while_revalidate():
    """CMS-CACHE-REALTIME: the old header (s-maxage=60,
    stale-while-revalidate[=86400]) let browsers serve a day-old disk
    cache for up to 24h while revalidating in the background, so an
    edit could look "not live" far longer than the intended ~60s. The
    fix drops the long SWR and adds must-revalidate so the browser
    re-checks with the origin once s-maxage expires, on both the bulk
    and single-key public content endpoints."""
    with TestClient(app) as client:
        for path in ("/api/content", "/api/content/profile"):
            res = client.get(path)
            cache_control = res.headers.get("Cache-Control", "")
            assert "s-maxage=60" in cache_control, (path, cache_control)
            assert "must-revalidate" in cache_control, (path, cache_control)
            assert "stale-while-revalidate" not in cache_control, (
                f"{path} must not carry a long-lived stale-while-revalidate "
                f"that lets browsers serve day-stale cached edits: {cache_control!r}"
            )


def test_vercel_json_content_routes_have_no_long_stale_while_revalidate():
    """The FastAPI-set Cache-Control header above is what TestClient
    sees, but in production Vercel's route-level `headers` in
    vercel.json (backend/vercel.json) is what's actually served to the
    browser -- so it must carry the same fix, not just content.py."""
    import json
    from pathlib import Path

    vercel_config = json.loads((Path(__file__).parent.parent / "vercel.json").read_text())
    routes = vercel_config["routes"]

    content_route = next(r for r in routes if r["src"] == "/api/content(.*)")
    cache_control = content_route["headers"]["Cache-Control"]
    assert "s-maxage=60" in cache_control
    assert "must-revalidate" in cache_control
    assert "stale-while-revalidate" not in cache_control


def test_content_array_shaped_data_round_trips():
    """CMS-BUG-PUT-DATA-DICT-422: array-shaped sections (e.g.
    certifications) must save and round-trip through both the public
    and admin GET endpoints, not just dict-shaped ones."""
    with TestClient(app) as client:
        login_res = client.post("/api/auth/login", json={"password": "password123"})
        token = login_res.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        certifications_payload = [
            {"id": "c1", "name": "AWS Certified", "issuer": "AWS", "year": "2024"},
            {"id": "c2", "name": "CKA", "issuer": "CNCF", "year": "2023"},
        ]
        content_data = {
            "section_key": "certifications",
            "data": certifications_payload,
            "status": "published",
            "published_at": "now",
            "updated_at": "now",
        }
        res = client.put("/api/admin/content/certifications", json=content_data, headers=headers)
        assert res.status_code == 200

        # Public GET returns the array unchanged (not coerced to an object).
        res = client.get("/api/content/certifications")
        assert res.status_code == 200
        assert res.json()["data"] == certifications_payload
        assert isinstance(res.json()["data"], list)

        # Admin GET returns the array unchanged too.
        res = client.get("/api/admin/content/certifications", headers=headers)
        assert res.status_code == 200
        assert res.json()["data"] == certifications_payload

        # GET /content (bulk public listing) also carries the array intact.
        res = client.get("/api/content")
        assert res.status_code == 200
        cert_item = next(item for item in res.json() if item["section_key"] == "certifications")
        assert cert_item["data"] == certifications_payload


def test_content_dict_shaped_data_still_works():
    """Guard against a Union-typed fix regressing the still-common
    object-shaped sections (profile, roles, research, contact, ...)."""
    with TestClient(app) as client:
        login_res = client.post("/api/auth/login", json={"password": "password123"})
        token = login_res.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        profile_payload = {"name": "Kuldeep", "location": "Remote", "summary": "..."}
        content_data = {
            "section_key": "profile",
            "data": profile_payload,
            "status": "published",
            "published_at": "now",
            "updated_at": "now",
        }
        res = client.put("/api/admin/content/profile", json=content_data, headers=headers)
        assert res.status_code == 200

        res = client.get("/api/content/profile")
        assert res.status_code == 200
        assert res.json()["data"] == profile_payload
        assert isinstance(res.json()["data"], dict)


def test_content_invalid_scalar_data_still_rejected():
    """A `data` value that is neither a JSON object nor array (e.g. a
    bare string or number) must still 422 — the fix must not widen
    validation to `Any`."""
    with TestClient(app) as client:
        login_res = client.post("/api/auth/login", json={"password": "password123"})
        token = login_res.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        for bad_data in ("foo", 123, None, True):
            content_data = {
                "section_key": "profile",
                "data": bad_data,
                "status": "published",
                "published_at": "now",
                "updated_at": "now",
            }
            res = client.put("/api/admin/content/profile", json=content_data, headers=headers)
            assert res.status_code == 422, f"expected 422 for data={bad_data!r}, got {res.status_code}"


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
