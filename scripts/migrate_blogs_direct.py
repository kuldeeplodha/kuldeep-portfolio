import os
import glob
import json
import uuid
import datetime
import asyncio
from libsql_client import create_client

DEFAULT_ROLES = ["software", "ai", "data", "system"]

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

async def init_schema(client):
    schema_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend", "migrations", "0001_initial_schema.sql")
    if os.path.exists(schema_path):
        with open(schema_path) as f:
            schema = f.read()
            statements = [s.strip() for s in schema.split(';') if s.strip()]
            for statement in statements:
                await client.execute(statement)
        print("Schema initialized.")
    else:
        print("Warning: initial schema file not found.")

async def main():
    print("Kuldeep Portfolio - Direct Blog Migration Script (idempotent upsert-by-slug)")
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

    blogs_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "src", "content", "blog")
    files = glob.glob(os.path.join(blogs_dir, "*.md"))

    print(f"Found {len(files)} blog posts to migrate.")

    created = 0
    updated = 0
    failed = 0

    now_str = datetime.datetime.utcnow().isoformat() + "Z"

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

        # Honor frontmatter `roles` (maps to relevant_roles); fall back to
        # all four roles only when the field is absent, matching the schema
        # default and preserving the older posts' visibility.
        roles = meta.get("roles")
        if isinstance(roles, list) and roles:
            relevant_roles = roles
        else:
            relevant_roles = DEFAULT_ROLES

        # Preserve the frontmatter-authored publish date (not the migration
        # run time) so re-running this script doesn't shuffle post ordering.
        date_str = meta.get("date", now_str)
        if not date_str.endswith("Z") and "T" not in date_str:
            date_str = date_str + "T12:00:00Z"

        reading_time = int(meta.get("readingTimeMinutes", 3))

        # Idempotent upsert-by-slug: an existing post is updated in place
        # (safe to re-run after an article edit), a new slug is inserted.
        res = await client.execute("SELECT id FROM blog_posts WHERE slug = ?", [slug])
        if res.rows:
            post_id = res.rows[0][0]
            try:
                await client.execute(
                    """UPDATE blog_posts SET
                    title = ?, excerpt = ?, body = ?, status = ?, published_at = ?, updated_at = ?, tags = ?, relevant_roles = ?, reading_time_minutes = ?
                    WHERE id = ?""",
                    [title, excerpt, body, "published", date_str, now_str, json.dumps(tags), json.dumps(relevant_roles), reading_time, post_id]
                )
                print(f"Successfully updated: {slug}")
                updated += 1
            except Exception as e:
                print(f"Failed to update {slug}: {e}")
                failed += 1
        else:
            post_id = str(uuid.uuid4())
            try:
                await client.execute(
                    "INSERT INTO blog_posts (id, slug, title, excerpt, body, status, published_at, created_at, updated_at, tags, relevant_roles, reading_time_minutes, featured_media_url, media_urls) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [post_id, slug, title, excerpt, body, "published", date_str, date_str, date_str, json.dumps(tags), json.dumps(relevant_roles), reading_time, None, json.dumps([])]
                )
                print(f"Successfully migrated: {slug}")
                created += 1
            except Exception as e:
                print(f"Failed to migrate {slug}: {e}")
                failed += 1

    await client.close()
    print(f"\nMigration complete. Created: {created}, Updated: {updated}, Failed: {failed}")

if __name__ == "__main__":
    asyncio.run(main())
