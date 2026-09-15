import os
from libsql_client import create_client

_client = None

def get_db():
    global _client
    if _client is not None and not _client.closed:
        return _client

    url = os.getenv("TURSO_DATABASE_URL", "file:local.db")
    if url.startswith("libsql://"):
        url = url.replace("libsql://", "https://", 1)
    elif url.startswith("wss://"):
        url = url.replace("wss://", "https://", 1)
    token = os.getenv("TURSO_AUTH_TOKEN", "")
    _client = create_client(url, auth_token=token)
    return _client
