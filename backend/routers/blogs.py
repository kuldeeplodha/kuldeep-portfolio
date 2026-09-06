import json
from fastapi import APIRouter, Depends, HTTPException
from ..database import get_db
from ..auth import get_current_admin
from ..models import BlogPost

router = APIRouter()

def row_to_dict(row):
    return {
        "id": row[0],
        "slug": row[1],
        "title": row[2],
        "excerpt": row[3],
        "body": row[4],
        "status": row[5],
        "published_at": row[6],
        "created_at": row[7],
        "updated_at": row[8],
        "tags": json.loads(row[9]),
        "relevant_roles": json.loads(row[10]),
        "reading_time_minutes": row[11],
        "featured_media_url": row[12],
        "media_urls": json.loads(row[13])
    }

@router.get("/blogs")
async def get_blogs():
    client = get_db()
    result = await client.execute("SELECT * FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC")
    await client.close()
    return [row_to_dict(row) for row in result.rows]

@router.get("/admin/blogs")
async def get_admin_blogs(admin: dict = Depends(get_current_admin)):
    client = get_db()
    result = await client.execute("SELECT * FROM blog_posts ORDER BY created_at DESC")
    await client.close()
    return [row_to_dict(row) for row in result.rows]

@router.post("/admin/blogs")
async def create_blog(blog: BlogPost, admin: dict = Depends(get_current_admin)):
    client = get_db()
    await client.execute(
        "INSERT INTO blog_posts (id, slug, title, excerpt, body, status, published_at, created_at, updated_at, tags, relevant_roles, reading_time_minutes, featured_media_url, media_urls) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [blog.id, blog.slug, blog.title, blog.excerpt, blog.body, blog.status, blog.published_at, blog.created_at, blog.updated_at, json.dumps(blog.tags), json.dumps(blog.relevant_roles), blog.reading_time_minutes, blog.featured_media_url, json.dumps(blog.media_urls)]
    )
    await client.close()
    return blog
