import os
from libsql_client import create_client

def get_db():
    url = os.getenv("TURSO_DATABASE_URL", "file:local.db")
    if url.startswith("libsql://"):
        url = url.replace("libsql://", "https://", 1)
    elif url.startswith("wss://"):
        url = url.replace("wss://", "https://", 1)
    token = os.getenv("TURSO_AUTH_TOKEN", "")
    return create_client(url, auth_token=token)
