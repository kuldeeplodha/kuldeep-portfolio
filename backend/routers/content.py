import json
from fastapi import APIRouter, Depends, HTTPException, Response, Path
from database import get_db
from auth import get_current_admin
from models import SiteContent

router = APIRouter()

def row_to_dict(row):
    return {
        "section_key": row[0],
        "data": json.loads(row[1]) if row[1] else {},
        "status": row[2],
        "published_at": row[3],
        "updated_at": row[4]
    }

@router.get("/content")
async def get_all_content(response: Response):
    response.headers["Cache-Control"] = "s-maxage=60, stale-while-revalidate"
    client = get_db()
    result = await client.execute("SELECT * FROM site_content WHERE status = 'published'")
    return [row_to_dict(row) for row in result.rows]

@router.get("/content/{section_key}")
async def get_content_by_key(response: Response, section_key: str = Path(..., pattern=r'^[a-z0-9_-]{1,64}$')):
    response.headers["Cache-Control"] = "s-maxage=60, stale-while-revalidate"
    client = get_db()
    result = await client.execute("SELECT * FROM site_content WHERE section_key = ? AND status = 'published'", [section_key])
    if not result.rows:
        raise HTTPException(status_code=404, detail="Content not found")
    return row_to_dict(result.rows[0])

@router.get("/admin/content/{section_key}")
async def get_admin_content(section_key: str = Path(..., pattern=r'^[a-z0-9_-]{1,64}$'), admin: dict = Depends(get_current_admin)):
    client = get_db()
    result = await client.execute("SELECT * FROM site_content WHERE section_key = ?", [section_key])
    if not result.rows:
        raise HTTPException(status_code=404, detail="Content not found")
    return row_to_dict(result.rows[0])

@router.put("/admin/content/{section_key}")
async def update_content(content: SiteContent, section_key: str = Path(..., pattern=r'^[a-z0-9_-]{1,64}$'), admin: dict = Depends(get_current_admin)):
    client = get_db()
    # Check if exists to decide insert vs update
    check = await client.execute("SELECT section_key FROM site_content WHERE section_key = ?", [section_key])
    data_str = json.dumps(content.data)
    
    if check.rows:
        await client.execute(
            """UPDATE site_content SET 
            data = ?, status = ?, published_at = ?, updated_at = ?
            WHERE section_key = ?""",
            [data_str, content.status, content.published_at, content.updated_at, section_key]
        )
    else:
        await client.execute(
            """INSERT INTO site_content (section_key, data, status, published_at, updated_at) 
            VALUES (?, ?, ?, ?, ?)""",
            [section_key, data_str, content.status, content.published_at, content.updated_at]
        )
        
    return content
