import json
import math
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from database import get_db
from auth import get_current_admin
from models import BlogPost

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
async def get_blogs(response: Response, page: int = Query(1, ge=1), limit: int = Query(10, ge=1, le=50)):
    response.headers["Cache-Control"] = "s-maxage=300, stale-while-revalidate"
    client = get_db()
    count_res = await client.execute("SELECT COUNT(*) FROM blog_posts WHERE status = 'published'")
    total = count_res.rows[0][0]
    total_pages = math.ceil(total / limit) if total > 0 else 1
    offset = (page - 1) * limit
    result = await client.execute("SELECT * FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC LIMIT ? OFFSET ?", [limit, offset])
    return {
        "items": [row_to_dict(row) for row in result.rows],
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages,
        "has_more": page < total_pages
    }

@router.get("/admin/blogs")
async def get_admin_blogs(admin: dict = Depends(get_current_admin), page: int = Query(1, ge=1), limit: int = Query(10, ge=1, le=50)):
    client = get_db()
    count_res = await client.execute("SELECT COUNT(*) FROM blog_posts")
    total = count_res.rows[0][0]
    total_pages = math.ceil(total / limit) if total > 0 else 1
    offset = (page - 1) * limit
    result = await client.execute("SELECT * FROM blog_posts ORDER BY created_at DESC LIMIT ? OFFSET ?", [limit, offset])
    return {
        "items": [row_to_dict(row) for row in result.rows],
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages,
        "has_more": page < total_pages
    }

@router.post("/admin/blogs")
async def create_blog(blog: BlogPost, admin: dict = Depends(get_current_admin)):
    client = get_db()
    await client.execute(
        "INSERT INTO blog_posts (id, slug, title, excerpt, body, status, published_at, created_at, updated_at, tags, relevant_roles, reading_time_minutes, featured_media_url, media_urls) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [blog.id, blog.slug, blog.title, blog.excerpt, blog.body, blog.status, blog.published_at, blog.created_at, blog.updated_at, json.dumps(blog.tags), json.dumps(blog.relevant_roles), blog.reading_time_minutes, blog.featured_media_url, json.dumps(blog.media_urls)]
    )
    return blog

@router.get("/blogs/{slug}")
async def get_blog_by_slug(slug: str, response: Response):
    response.headers["Cache-Control"] = "s-maxage=300, stale-while-revalidate"
    client = get_db()
    result = await client.execute("SELECT * FROM blog_posts WHERE slug = ? AND status = 'published'", [slug])
    if not result.rows:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return row_to_dict(result.rows[0])

@router.put("/admin/blogs/{id}")
async def update_blog(id: str, blog: BlogPost, admin: dict = Depends(get_current_admin)):
    client = get_db()
    check = await client.execute("SELECT id FROM blog_posts WHERE id = ?", [id])
    if not check.rows:
            raise HTTPException(status_code=404, detail="Blog post not found")
    
    await client.execute(
        """UPDATE blog_posts SET 
        slug = ?, title = ?, excerpt = ?, body = ?, status = ?, published_at = ?, updated_at = ?, tags = ?, relevant_roles = ?, reading_time_minutes = ?, featured_media_url = ?, media_urls = ?
        WHERE id = ?""",
        [blog.slug, blog.title, blog.excerpt, blog.body, blog.status, blog.published_at, blog.updated_at, json.dumps(blog.tags), json.dumps(blog.relevant_roles), blog.reading_time_minutes, blog.featured_media_url, json.dumps(blog.media_urls), id]
    )
    return blog

@router.delete("/admin/blogs/{id}")
async def delete_blog(id: str, admin: dict = Depends(get_current_admin)):
    client = get_db()
    check = await client.execute("SELECT id FROM blog_posts WHERE id = ?", [id])
    if not check.rows:
            raise HTTPException(status_code=404, detail="Blog post not found")
        
    await client.execute("DELETE FROM blog_posts WHERE id = ?", [id])
    return {"status": "deleted"}
