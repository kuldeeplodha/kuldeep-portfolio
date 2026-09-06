# Portfolio V2.2 FastAPI Backend

This is the Python FastAPI backend for the V2.2 portfolio, providing CMS capabilities via Turso (libSQL) and Cloudinary.

## Local Development (No Deploy Needed)

1. Create a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
4. Run the development server (automatically creates local `local.db` with the schema):
   ```bash
   uvicorn backend.main:app --reload
   ```
5. Run tests:
   ```bash
   pytest backend/tests/
   ```

## Vercel Deployment Steps (For Later)

1. Create a Vercel project linked to this repository.
2. Ensure Vercel is configured to build using `@vercel/python` (this is automatically detected if you use `api/index.py` or a `vercel.json`).
3. Add the production environment variables in the Vercel dashboard:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `JWT_SECRET`
   - `ADMIN_PASSWORD_HASH`
4. Deploy the project. Vercel will map the FastAPI routes to serverless functions automatically.
