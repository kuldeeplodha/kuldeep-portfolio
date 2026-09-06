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
        schema_path = os.path.join(os.path.dirname(__file__), "migrations/0001_initial_schema.sql")
        if os.path.exists(schema_path):
            with open(schema_path) as f:
                schema = f.read()
                statements = [s.strip() for s in schema.split(';') if s.strip()]
                for statement in statements:
                    await db.execute(statement)
    except Exception as e:
        print(f"Schema initialization error: {e}")
    finally:
        await db.close()

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(blogs.router, prefix="/api", tags=["Blogs"])
app.include_router(case_studies.router, prefix="/api", tags=["Case Studies"])
app.include_router(media.router, prefix="/api/admin/media", tags=["Media"])
