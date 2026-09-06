from pydantic import BaseModel
from typing import List, Optional

class LoginRequest(BaseModel):
    password: str

class BlogPost(BaseModel):
    id: str
    slug: str
    title: str
    excerpt: str
    body: str
    status: str
    published_at: Optional[str] = None
    created_at: str
    updated_at: str
    tags: List[str]
    relevant_roles: List[str]
    reading_time_minutes: int
    featured_media_url: Optional[str] = None
    media_urls: List[str]

class CaseStudy(BaseModel):
    id: str
    slug: str
    title: str
    subtitle: str
    summary: str
    client_or_org: str
    period: str
    category: str
    status: str
    featured: int
    published_at: Optional[str] = None
    created_at: str
    updated_at: str
    technologies: List[str]
    relevant_roles: List[str]
    problem: str
    context: str
    architecture: str
    outcome: str
    future_improvements: Optional[str] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    featured_media_url: Optional[str] = None
    media_urls: List[str]
