import os
import glob
import json
import getpass
import requests
import uuid
import datetime

API_BASE = "https://kuldeep-portfolio-kuldeep-b93a.vercel.app"

def parse_md(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    parts = content.split('---')
    if len(parts) >= 3:
        frontmatter = parts[1]
        body = '---'.join(parts[2:]).strip()
    else:
        return None, None
        
    meta = {}
    for line in frontmatter.split('\n'):
        if ':' in line:
            k, v = line.split(':', 1)
            k = k.strip()
            v = v.strip()
            if v.startswith('[') and v.endswith(']'):
                items = v[1:-1].split(',')
                v = [i.strip() for i in items if i.strip()]
            meta[k] = v
    return meta, body

def main():
    print("Kuldeep Portfolio - Blog Migration Script")
    password = os.getenv("ADMIN_PASSWORD")
    if not password:
        password = getpass.getpass("Enter Admin Password: ")
    
    # Login
    resp = requests.post(f"{API_BASE}/api/auth/login", json={"password": password})
    if resp.status_code != 200:
        print(f"Login failed: {resp.status_code} {resp.text}")
        return
    token = resp.json().get("token")
    headers = {"Authorization": f"Bearer {token}"}
    
    blogs_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "src", "content", "blog")
    files = glob.glob(os.path.join(blogs_dir, "*.md"))
    
    print(f"Found {len(files)} blog posts to migrate.")
    
    for filepath in files:
        meta, body = parse_md(filepath)
        if not meta:
            continue
            
        slug = meta.get("slug", os.path.basename(filepath).replace(".md", ""))
        title = meta.get("title", slug)
        excerpt = meta.get("excerpt", "")
        tags = meta.get("tags", [])
        if not isinstance(tags, list):
            tags = [tags]
            
        date_str = meta.get("date", datetime.datetime.utcnow().isoformat() + "Z")
        if not date_str.endswith("Z") and "T" not in date_str:
            date_str = date_str + "T12:00:00Z"
            
        post_data = {
            "id": str(uuid.uuid4()),
            "slug": slug,
            "title": title,
            "excerpt": excerpt,
            "body": body,
            "status": "published",
            "published_at": date_str,
            "created_at": date_str,
            "updated_at": date_str,
            "tags": tags,
            "relevant_roles": ["software", "ai", "data", "system"],
            "reading_time_minutes": int(meta.get("readingTimeMinutes", 3)),
            "featured_media_url": None,
            "media_urls": []
        }
        
        create_resp = requests.post(f"{API_BASE}/api/admin/blogs", json=post_data, headers=headers)
        if create_resp.status_code in [200, 201]:
            print(f"Successfully migrated: {slug}")
        else:
            print(f"Failed to migrate {slug}: {create_resp.status_code} {create_resp.text}")

if __name__ == "__main__":
    main()
