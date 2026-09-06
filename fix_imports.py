import os
import glob

def replace_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # main.py
    content = content.replace("from .routers", "from routers")
    content = content.replace("from .database", "from database")
    
    # routers/*.py
    content = content.replace("from ..database", "from database")
    content = content.replace("from ..auth", "from auth")
    content = content.replace("from ..models", "from models")
    
    # tests/test_main.py
    content = content.replace("from backend.main", "from main")
    
    with open(filepath, 'w') as f:
        f.write(content)

for filepath in glob.glob("backend/**/*.py", recursive=True):
    replace_in_file(filepath)

print("Done")
