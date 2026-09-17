import os
import json
import datetime
import asyncio
from libsql_client import create_client

async def init_schema(client):
    schema_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend", "migrations", "0003_site_content.sql")
    if os.path.exists(schema_path):
        with open(schema_path) as f:
            schema = f.read()
            statements = [s.strip() for s in schema.split(';') if s.strip()]
            for statement in statements:
                await client.execute(statement)
        print("Schema initialized.")
    else:
        print("Warning: schema file not found.")

async def main():
    print("Kuldeep Portfolio - Generic Site Content Migration Script")
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
    
    await init_schema(client)

    # Hardcoding profile data parsed from src/config/profile.ts
    profile_data = {
        "name": "Kuldeep Lodha",
        "navDisplayName": "K. Lodha",
        "title": "Senior Software Developer (Lead)",
        "location": "Pune, India",
        "email": "kuldeeplodha04@gmail.com",
        "phone": "+917987507342",
        "showPhone": False,
        "summary": "Senior Software Developer and backend engineering lead with 5+ years of experience building backend systems, APIs, databases, integrations, data workflows, and production applications.",
        "links": {
            "linkedin": "https://www.linkedin.com/in/kuldeeplodha",
            "github": "https://github.com/kuldeeplodha"
        }
    }
    
    content_items = [
        {
            "section_key": "contact",
            "data": {
        "title": "Let's build something useful.",
        "description": "Have an interesting engineering problem, an AI idea, or an opportunity to collaborate? I'd be happy to connect."
}
        },
        {
            "section_key": "footer",
            "data": {
        "text": "Designed and built by Kuldeep Lodha.",
        "subtext": "Software \u00b7 Data \u00b7 Machine Learning \u00b7 AI",
        "copyright": "\u00a9 2026 Kuldeep Lodha"
}
        },
        {
            "section_key": "engineering-signal",
            "data": [
        {
                "title": "Backend Systems",
                "description": "Production backend applications, APIs, business logic, and data-driven workflows."
        },
        {
                "title": "API Engineering",
                "description": "Designing, integrating, and optimizing APIs that connect applications, users, and external platforms."
        },
        {
                "title": "System Thinking",
                "description": "Thinking beyond individual features to architecture, data flow, performance, reliability, and maintainability."
        },
        {
                "title": "Data Engineering",
                "description": "Building ETL workflows, automated pipelines, reporting systems, and operational data processes."
        },
        {
                "title": "AI & Machine Learning",
                "description": "Applying machine learning, NLP, deep learning, and modern AI techniques to practical problems."
        },
        {
                "title": "Technical Leadership",
                "description": "Leading backend developers, reviewing implementations, solving complex problems, and helping teams deliver quality software."
        }
]
        },
        {
            "section_key": "impact-metrics",
            "data": {
        "title": "Engineering with measurable outcomes.",
        "description": "A few examples of how software, automation, and data engineering translated into practical improvements.",
        "items": [
                {
                        "metric": "60%+",
                        "label": "API response improvement",
                        "context": "Database and backend optimization"
                },
                {
                        "metric": "75%",
                        "label": "Less manual data entry",
                        "context": "Workflow and data synchronization automation"
                },
                {
                        "metric": "40%",
                        "label": "Lower data delivery latency",
                        "context": "ETL and data pipeline improvements"
                },
                {
                        "metric": "30+",
                        "label": "Digital workflows",
                        "context": "Field-data and survey workflows"
                },
                {
                        "metric": "60%",
                        "label": "Report generation time reduction",
                        "context": "SQL and reporting automation"
                }
        ]
}
        },
        {
            "section_key": "experience-story",
            "data": [
        {
                "id": "vidai-solutions",
                "company": "Vidai Solutions",
                "role": "Senior Software Developer (Lead)",
                "period": "Aug 2025 \u2013 Present",
                "location": "Pune, India",
                "current": True,
                "summary": "Senior backend engineer and team lead working on production systems across EMR, billing, CRM, integrations, and business-critical application workflows. Alongside hands-on engineering, I lead a team of backend developers and contribute to technical design, code reviews, optimization, debugging, and delivery.",
                "selectedHighlights": [
                        "Currently leading a backend development team while remaining hands-on with engineering and architecture.",
                        "Building and maintaining systems across EMR, billing, and CRM domains.",
                        "Working with external provider APIs including LinkedIn and Google integrations.",
                        "Optimizing APIs and database operations to improve application performance.",
                        "Participating in architecture, code reviews, debugging, production support, and delivery."
                ],
                "domains": [
                        {
                                "name": "EMR",
                                "description": "Backend engineering for Electronic Medical Record workflows and healthcare-focused application functionality."
                        },
                        {
                                "name": "Billing",
                                "description": "Backend workflows supporting billing processes, business rules, data processing, and related APIs."
                        },
                        {
                                "name": "CRM",
                                "description": "Application and backend functionality supporting customer and business workflows."
                        }
                ],
                "integrations": [
                        "LinkedIn APIs",
                        "Google APIs",
                        "Third-party provider APIs"
                ],
                "leadership": [
                        "Team planning",
                        "Code reviews",
                        "Technical guidance",
                        "Architecture discussions",
                        "Production debugging",
                        "Delivery coordination"
                ],
                "technology": [
                        "Python",
                        "Django",
                        "Django REST Framework",
                        "PostgreSQL",
                        "SQL",
                        "REST APIs",
                        "Git",
                        "Docker",
                        "CI/CD"
                ]
        },
        {
                "id": "shelter-associates",
                "company": "Shelter Associates",
                "role": "Software Developer",
                "period": "2021 \u2013 July 2025",
                "location": "Pune, India",
                "current": False,
                "summary": "Worked across backend development, data engineering, automation, analytics, and internal digital systems, building solutions that improved application performance and reduced operational effort.",
                "highlights": [
                        "Engineered backend features for internal web applications using Django and REST APIs.",
                        "Optimized database queries and preprocessing logic to improve API performance.",
                        "Designed automated data ingestion workflows to synchronize data from the AVNI platform.",
                        "Built and maintained ETL workflows using Python and Apache Airflow.",
                        "Designed dashboards and reporting workflows using Apache Superset and Metabase."
                ],
                "impact": [
                        {
                                "value": "60%+",
                                "label": "API response improvement"
                        },
                        {
                                "value": "75%",
                                "label": "Reduction in manual data entry"
                        },
                        {
                                "value": "40%",
                                "label": "Lower data delivery latency"
                        }
                ],
                "technology": [
                        "Python",
                        "Django",
                        "Django REST Framework",
                        "PostgreSQL",
                        "Apache Airflow",
                        "Pandas",
                        "SQL",
                        "Apache Superset",
                        "Metabase",
                        "Docker"
                ]
        },
        {
                "id": "swadhar-idwc",
                "company": "Swadhar IDWC",
                "role": "Software Developer Consultant",
                "period": "2023 \u2013 July 2025",
                "location": "Pune, India",
                "current": False,
                "summary": "Worked as a technology consultant helping transition manual operational processes into digital data collection, reporting, and analytics workflows.",
                "highlights": [
                        "Helped transition manual data-entry processes to AVNI-based digital workflows.",
                        "Created and deployed more than 30 custom survey forms and workflows.",
                        "Developed SQL-based reporting workflows for faster operational reporting.",
                        "Designed interactive dashboards for program KPIs and operational performance.",
                        "Supported stakeholders with data-driven reporting and improved data accessibility."
                ],
                "impact": [
                        {
                                "value": "30+",
                                "label": "Digital workflows created"
                        },
                        {
                                "value": "50%+",
                                "label": "Reporting effort reduction"
                        },
                        {
                                "value": "5+",
                                "label": "Program teams supported"
                        }
                ],
                "technology": [
                        "SQL",
                        "Python",
                        "AVNI",
                        "Apache Superset",
                        "Metabase",
                        "Data Analysis",
                        "Reporting Automation"
                ]
        }
]
        },
        {
            "section_key": "profile",
            "data": profile_data
        }
    ]
    
    created = 0
    updated = 0
    
    date_str = datetime.datetime.utcnow().isoformat() + "Z"
    
    for item in content_items:
        key = item["section_key"]
        
        # Check if exists
        res = await client.execute("SELECT section_key FROM site_content WHERE section_key = ?", [key])
        if res.rows:
            try:
                await client.execute(
                    """UPDATE site_content SET 
                    data = ?, status = ?, updated_at = ?
                    WHERE section_key = ?""",
                    [json.dumps(item["data"]), "published", date_str, key]
                )
                print(f"Successfully updated: {key}")
                updated += 1
            except Exception as e:
                print(f"Failed to update {key}: {e}")
        else:
            try:
                await client.execute(
                    """INSERT INTO site_content 
                    (section_key, data, status, published_at, updated_at) 
                    VALUES (?, ?, ?, ?, ?)""",
                    [key, json.dumps(item["data"]), "published", date_str, date_str]
                )
                print(f"Successfully migrated: {key}")
                created += 1
            except Exception as e:
                print(f"Failed to migrate {key}: {e}")
            
    await client.close()
    print(f"\nMigration complete. Created: {created}, Updated: {updated}")

if __name__ == "__main__":
    asyncio.run(main())
