import os
import json
import datetime
import asyncio
from libsql_client import create_client

async def init_schema(client):
    schema_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend", "migrations", "0003_site_content.sql")
    if os.path.exists(schema_path):
        with open(schema_path) as f:
            schema = f.read()
            statements = [s.strip() for s in schema.split(';') if s.strip()]
            for statement in statements:
                await client.execute(statement)
        print("Schema initialized.")
    else:
        print("Warning: schema file not found.")

async def main():
    print("Kuldeep Portfolio - Generic Site Content Migration Script")
    url = os.getenv("TURSO_DATABASE_URL", "")
    token = os.getenv("TURSO_AUTH_TOKEN", "")
    
    if not url:
        print("Error: TURSO_DATABASE_URL is required.")
        return
        
    if url.startswith("libsql://"):
        url = url.replace("libsql://", "https://", 1)
    elif url.startswith("wss://"):
        url = url.replace("wss://", "https://", 1)
        
    client = create_client(url, auth_token=token)
    
    await init_schema(client)

    # Hardcoding profile data parsed from src/config/profile.ts
    profile_data = {
        "name": "Kuldeep Lodha",
        "navDisplayName": "K. Lodha",
        "title": "Senior Software Developer (Lead)",
        "location": "Pune, India",
        "email": "kuldeeplodha04@gmail.com",
        "phone": "+917987507342",
        "showPhone": False,
        "summary": "Senior Software Developer and backend engineering lead with 5+ years of experience building backend systems, APIs, databases, integrations, data workflows, and production applications.",
        "links": {
            "linkedin": "https://www.linkedin.com/in/kuldeeplodha",
            "github": "https://github.com/kuldeeplodha"
        }
    }
    
    content_items = [
        {
            "section_key": "profile",
            "data": profile_data
        }
    ]
    
    created = 0
    updated = 0
    
    date_str = datetime.datetime.utcnow().isoformat() + "Z"
    
    for item in content_items:
        key = item["section_key"]
        
        # Check if exists
        res = await client.execute("SELECT section_key FROM site_content WHERE section_key = ?", [key])
        if res.rows:
            try:
                await client.execute(
                    """UPDATE site_content SET 
                    data = ?, status = ?, updated_at = ?
                    WHERE section_key = ?""",
                    [json.dumps(item["data"]), "published", date_str, key]
                )
                print(f"Successfully updated: {key}")
                updated += 1
            except Exception as e:
                print(f"Failed to update {key}: {e}")
        else:
            try:
                await client.execute(
                    """INSERT INTO site_content 
                    (section_key, data, status, published_at, updated_at) 
                    VALUES (?, ?, ?, ?, ?)""",
                    [key, json.dumps(item["data"]), "published", date_str, date_str]
                )
                print(f"Successfully migrated: {key}")
                created += 1
            except Exception as e:
                print(f"Failed to migrate {key}: {e}")
            
    await client.close()
    print(f"\nMigration complete. Created: {created}, Updated: {updated}")

if __name__ == "__main__":
    asyncio.run(main())
