import os
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import auth, blogs, case_studies, media
from database import get_db

load_dotenv()

app = FastAPI(title="Portfolio V2.2 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://kuldeeplodha.github.io", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Initialize DB schema if running locally
    db = get_db()
    try:
        migrations_dir = os.path.join(os.path.dirname(__file__), "migrations")
        if os.path.exists(migrations_dir):
            files = sorted([f for f in os.listdir(migrations_dir) if f.endswith('.sql')])
            for f_name in files:
                schema_path = os.path.join(migrations_dir, f_name)
                with open(schema_path) as f:
                    schema = f.read()
                    statements = [s.strip() for s in schema.split(';') if s.strip()]
                    for statement in statements:
                        await db.execute(statement)
    except Exception as e:
        print(f"Schema initialization error: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    from database import _client
    if _client is not None:
        await _client.close()

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(blogs.router, prefix="/api", tags=["Blogs"])
app.include_router(case_studies.router, prefix="/api", tags=["Case Studies"])
app.include_router(media.router, prefix="/api/admin/media", tags=["Media"])
