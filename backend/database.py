import os
from libsql_client import create_client

def get_db():
    url = os.getenv("TURSO_DATABASE_URL", "file:local.db")
    token = os.getenv("TURSO_AUTH_TOKEN", "")
    return create_client(url, auth_token=token)
