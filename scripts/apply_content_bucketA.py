"""CONTENT-APPLY-BUCKETA: targeted, key-scoped upsert for the 4
site_content keys Kuldeep approved in Emma's Bucket A content-polish
proposal (agents/andy-mt5yxkzy/notes/CONTENT-POLISH-proposal-bucketA.md).

Unlike scripts/migrate_site_content.py (which blindly overwrites ALL 20
keys and would clobber the human's live admin edits to profile,
certifications, etc.), this script:
  - touches ONLY experience, ai-knowledge, engineering-signal, career-journey
  - reads each key's CURRENT row at execution time and applies a
    precise, idempotent transform (date fix / single-field edit /
    one-time insert keyed by id) rather than overwriting with a
    pre-baked full array
  - never writes the `status` column, so published/draft state for
    these (or any other) keys is never touched
  - is safe to re-run: each transform first checks whether its change
    is already applied and skips if so

Run via .github/workflows/apply-content-bucketA.yml (workflow_dispatch),
which supplies TURSO_DATABASE_URL / TURSO_AUTH_TOKEN the same way
migrate-content.yml does.
"""
import os
import json
import datetime
import asyncio
from libsql_client import create_client

VIDAI_ENTRY = {
    "id": "vidai-solutions",
    "organization": "Vidai Solutions",
    "role": "Senior Software Developer (Lead)",
    "period": "Aug 2025 – Present",
    "location": "Pune, IN",
    "responsibilities": [
        "Currently leading a backend development team while remaining hands-on with engineering and architecture.",
        "Building and maintaining systems across EMR, billing, and CRM domains.",
        "Working with external provider APIs including LinkedIn and Google integrations.",
        "Optimizing APIs and database operations to improve application performance.",
        "Participating in architecture, code reviews, debugging, production support, and delivery.",
    ],
    "achievements": [],
    "technologies": [
        "Python", "Django", "Django REST Framework", "PostgreSQL", "SQL",
        "REST APIs", "Git", "Docker", "CI/CD",
    ],
    "relevantRoles": ["software", "system", "ai"],
}

CERTIFICATIONS_DETAILS_ANSWER = (
    "Kuldeep's certifications include: Career Essentials in Software Development "
    "(Microsoft & LinkedIn), Getting Started as an AWS Developer (LinkedIn), "
    "Prompt Design in Vertex AI (Google Cloud Skills Boost), Apache PySpark by "
    "Example (LinkedIn), Excel Skills for Data Analytics and Visualization "
    "(Macquarie University / Coursera), SQL Advanced (HackerRank), and Problem "
    "Solving — Intermediate (HackerRank)."
)

BACKEND_SYSTEMS_DESCRIPTION = (
    "Production backend applications, APIs, and business logic across EMR, "
    "billing, and CRM systems, plus data-driven workflows."
)

CAREER_JOURNEY_DESCRIPTIONS = {
    # matched by (period, title) pair -- stable identifiers in this array,
    # safer than index if a human has ever reordered/edited steps.
    ("2021", "Starting with Software"): (
        "Began my professional software engineering journey, building Django "
        "and REST API backend applications, databases, and digital workflows."
    ),
    ("2021 – Jul 2025", "Software + Data"): (
        "Expanded into data engineering, Apache Airflow ETL automation, "
        "Superset/Metabase dashboards, reporting, and operational systems "
        "while continuing backend development."
    ),
    ("Aug 2025 – Present", "Engineering Leadership"): (
        "Joined Vidai Solutions as a Senior Software Developer (Lead), taking "
        "responsibility for backend engineering across EMR, billing, and CRM, "
        "integrations, optimization, and team leadership."
    ),
}


def transform_experience(data):
    changed = False
    for entry in data:
        if entry.get("id") == "shelter-associates" and entry.get("period") != "Jul '21 – Jul 2025":
            entry["period"] = "Jul '21 – Jul 2025"
            changed = True
        if entry.get("id") == "swadhar-idwc" and entry.get("period") != "Apr '23 – Jul 2025":
            entry["period"] = "Apr '23 – Jul 2025"
            changed = True
    if not any(e.get("id") == "vidai-solutions" for e in data):
        data.insert(0, VIDAI_ENTRY)
        changed = True
    return data, changed


def transform_ai_knowledge(data):
    changed = False
    for entry in data:
        if entry.get("id") == "certifications-details" and entry.get("answer") != CERTIFICATIONS_DETAILS_ANSWER:
            entry["answer"] = CERTIFICATIONS_DETAILS_ANSWER
            changed = True
    return data, changed


def transform_engineering_signal(data):
    changed = False
    for item in data:
        if item.get("title") == "Backend Systems" and item.get("description") != BACKEND_SYSTEMS_DESCRIPTION:
            item["description"] = BACKEND_SYSTEMS_DESCRIPTION
            changed = True
    return data, changed


def transform_career_journey(data):
    changed = False
    for step in data:
        key = (step.get("period"), step.get("title"))
        new_desc = CAREER_JOURNEY_DESCRIPTIONS.get(key)
        if new_desc is not None and step.get("description") != new_desc:
            step["description"] = new_desc
            changed = True
    return data, changed


TRANSFORMS = {
    "experience": transform_experience,
    "ai-knowledge": transform_ai_knowledge,
    "engineering-signal": transform_engineering_signal,
    "career-journey": transform_career_journey,
}


async def main():
    print("CONTENT-APPLY-BUCKETA: targeted 4-key upsert")
    url = os.getenv("TURSO_DATABASE_URL", "")
    token = os.getenv("TURSO_AUTH_TOKEN", "")

    if not url:
        print("Error: TURSO_DATABASE_URL is required.")
        return

    if url.startswith("libsql://"):
        url = url.replace("libsql://", "https://", 1)
    elif url.startswith("wss://"):
        url = url.replace("wss://", "https://", 1)

    client = create_client(url, auth_token=token)
    date_str = datetime.datetime.utcnow().isoformat() + "Z"

    for key, transform in TRANSFORMS.items():
        res = await client.execute("SELECT data FROM site_content WHERE section_key = ?", [key])
        if not res.rows:
            print(f"SKIP {key}: no existing row (never seeded -- refusing to create one out-of-band).")
            continue

        data = json.loads(res.rows[0][0])
        new_data, changed = transform(data)

        if not changed:
            print(f"NOOP {key}: already matches the approved Bucket A text.")
            continue

        # Deliberately NOT writing `status` -- preserves whatever
        # published/draft state this key currently has.
        await client.execute(
            "UPDATE site_content SET data = ?, updated_at = ? WHERE section_key = ?",
            [json.dumps(new_data), date_str, key],
        )
        print(f"APPLIED {key}")

    await client.close()
    print("Done.")


if __name__ == "__main__":
    asyncio.run(main())
