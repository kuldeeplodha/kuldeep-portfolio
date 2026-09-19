from pydantic import BaseModel, Field
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

from typing import Any, Dict, List, Union

class SiteContent(BaseModel):
    section_key: str = Field(..., pattern=r'^[a-z0-9_-]{1,64}$')
    # CMS-BUG-PUT-DATA-DICT-422: `data` must accept either shape a
    # section actually stores (11 of the 20 site_content keys are
    # JSON arrays: experience/projects/metrics/skills/education/
    # certifications/ai-knowledge/engineering-signal/experience-story/
    # career-journey/resumes). Union keeps scalars/None rejected (422)
    # while both real container shapes round-trip via json.dumps.
    data: Union[Dict[str, Any], List[Any]]
    status: str
    published_at: Optional[str] = None
    updated_at: str
