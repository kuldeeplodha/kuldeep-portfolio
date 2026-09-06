import json
from fastapi import APIRouter, Depends, HTTPException
from ..database import get_db
from ..auth import get_current_admin
from ..models import CaseStudy

router = APIRouter()

def cs_row_to_dict(row):
    return {
        "id": row[0],
        "slug": row[1],
        "title": row[2],
        "subtitle": row[3],
        "summary": row[4],
        "client_or_org": row[5],
        "period": row[6],
        "category": row[7],
        "status": row[8],
        "featured": row[9],
        "published_at": row[10],
        "created_at": row[11],
        "updated_at": row[12],
        "technologies": json.loads(row[13]),
        "relevant_roles": json.loads(row[14]),
        "problem": row[15],
        "context": row[16],
        "architecture": row[17],
        "outcome": row[18],
        "future_improvements": row[19],
        "github_url": row[20],
        "live_url": row[21],
        "featured_media_url": row[22],
        "media_urls": json.loads(row[23])
    }

@router.get("/case-studies")
async def get_case_studies():
    client = get_db()
    result = await client.execute("SELECT * FROM case_studies WHERE status = 'published' ORDER BY published_at DESC")
    await client.close()
    return [cs_row_to_dict(row) for row in result.rows]

@router.get("/admin/case-studies")
async def get_admin_case_studies(admin: dict = Depends(get_current_admin)):
    client = get_db()
    result = await client.execute("SELECT * FROM case_studies ORDER BY created_at DESC")
    await client.close()
    return [cs_row_to_dict(row) for row in result.rows]

@router.post("/admin/case-studies")
async def create_case_study(cs: CaseStudy, admin: dict = Depends(get_current_admin)):
    client = get_db()
    await client.execute(
        """INSERT INTO case_studies 
        (id, slug, title, subtitle, summary, client_or_org, period, category, status, featured, published_at, created_at, updated_at, technologies, relevant_roles, problem, context, architecture, outcome, future_improvements, github_url, live_url, featured_media_url, media_urls) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        [cs.id, cs.slug, cs.title, cs.subtitle, cs.summary, cs.client_or_org, cs.period, cs.category, cs.status, cs.featured, cs.published_at, cs.created_at, cs.updated_at, json.dumps(cs.technologies), json.dumps(cs.relevant_roles), cs.problem, cs.context, cs.architecture, cs.outcome, cs.future_improvements, cs.github_url, cs.live_url, cs.featured_media_url, json.dumps(cs.media_urls)]
    )
    await client.close()
    return cs
