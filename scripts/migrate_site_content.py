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
            "section_key": "ai-knowledge",
            "data": [
        {
                "id": "backend-tech",
                "questionPatterns": [
                        "backend",
                        "django",
                        "rest api",
                        "what technologies",
                        "python frameworks"
                ],
                "answer": "Kuldeep uses Python with Django and Django REST Framework for backend development, along with PostgreSQL, Docker, Git, and CI/CD. As Senior Software Developer (Lead) at Vidai Solutions, he builds and optimizes REST APIs and integrations across EMR, billing, and CRM systems.",
                "tags": [
                        "software",
                        "backend"
                ],
                "source": "resume:software"
        },
        {
                "id": "nlp-work",
                "questionPatterns": [
                        "nlp",
                        "natural language",
                        "ticket classification",
                        "multilingual"
                ],
                "answer": "Kuldeep has worked on NLP including automatic ticket classification (Scikit-learn), sentiment-based recommendations, and is researching explainability in low-resource and multilingual NLP applications for his MS thesis.",
                "tags": [
                        "ai",
                        "nlp"
                ],
                "source": "resume:ai_ml"
        },
        {
                "id": "data-engineering",
                "questionPatterns": [
                        "data engineering",
                        "etl",
                        "airflow",
                        "pipelines",
                        "dashboard"
                ],
                "answer": "Kuldeep has built ETL pipelines with Python and Apache Airflow, automated AVNI data ingestion, and deployed dashboards with Apache Superset and Metabase for 5+ program teams.",
                "tags": [
                        "data",
                        "etl"
                ],
                "source": "resume:data_analyst"
        },
        {
                "id": "research-thesis",
                "questionPatterns": [
                        "research",
                        "thesis",
                        "explainability",
                        "multilingual"
                ],
                "answer": "His research thesis is titled \"Explainability in Low-Resource and Multilingual NLP Applications\" as part of his MS in Machine Learning & Artificial Intelligence at Liverpool John Moores University & UpGrad.",
                "tags": [
                        "ai",
                        "research"
                ],
                "source": "resume:ai_ml"
        },
        {
                "id": "ml-projects",
                "questionPatterns": [
                        "machine learning",
                        "ml project",
                        "deep learning",
                        "gesture"
                ],
                "answer": "ML projects include Gesture Recognition (CNN/RNN with TensorFlow), Automatic Ticket Classification (NLP with Scikit-learn), and a Sentiment-Based Product Recommendation System capstone.",
                "tags": [
                        "ai",
                        "projects"
                ],
                "source": "resume:ai_ml"
        },
        {
                "id": "experience-years",
                "questionPatterns": [
                        "years of experience",
                        "how long",
                        "experience"
                ],
                "answer": "Kuldeep has 5+ years of software development experience. He is currently Senior Software Developer (Lead) at Vidai Solutions (Aug 2025 \u2013 Present), and previously worked at Shelter Associates and as a Software Developer Consultant at Swadhar IDWC.",
                "tags": [
                        "general"
                ],
                "source": "resume:all"
        },
        {
                "id": "education-details",
                "questionPatterns": [
                        "education",
                        "degree",
                        "study",
                        "university",
                        "college",
                        "gpa",
                        "cgpa",
                        "where did you study",
                        "where did he study"
                ],
                "answer": "Kuldeep holds an MS in Machine Learning & AI from Liverpool John Moores University (Jul '24), an Executive PG in Machine Learning & AI from IIIT Bangalore (Mar '23 \u2013 May '24, 3.58/4 GPA), and a B.Tech in Computer Science from Hitkarini College of Engineering & Technology (Aug '17 \u2013 Jul '21, 8.00 CGPA).",
                "tags": [
                        "education",
                        "general"
                ],
                "source": "resume:all"
        },
        {
                "id": "certifications-details",
                "questionPatterns": [
                        "certifications",
                        "certification",
                        "certificates",
                        "cert",
                        "certified"
                ],
                "answer": "Kuldeep's certifications include: Prompt Design in Vertex AI (Google Cloud Skills Boost), Data Analyst Associate (DataCamp), Docker Foundations Professional Certificate, Getting Started as an AWS Developer (LinkedIn), Building React and Django Apps (LinkedIn), Career Essentials in Software Development (Microsoft/LinkedIn), Excel Skills for Data Analytics and Visualization, SQL (Advanced) and Problem Solving (Intermediate) from HackerRank.",
                "tags": [
                        "certifications",
                        "general"
                ],
                "source": "resume:all"
        },
        {
                "id": "career-direction",
                "questionPatterns": [
                        "career",
                        "direction",
                        "goal",
                        "objective",
                        "summary",
                        "about",
                        "who is",
                        "passionate about"
                ],
                "answer": "Kuldeep is a Senior Software Developer (Lead) with 5+ years of experience building backend systems, APIs, and data workflows. His career has evolved from software engineering into data and, through an MS in Machine Learning & AI, into machine learning, NLP, and AI research.",
                "tags": [
                        "general",
                        "career"
                ],
                "source": "resume:all"
        }
]
        },
        {
            "section_key": "career-journey",
            "data": [
        {
                "period": "2021",
                "title": "Starting with Software",
                "description": "Began my professional software engineering journey, building backend applications, APIs, databases, and digital workflows."
        },
        {
                "period": "2021 \u2013 Jul 2025",
                "title": "Software + Data",
                "description": "Expanded into data engineering, ETL automation, analytics, dashboards, reporting, and operational systems while continuing backend development."
        },
        {
                "period": "2023 \u2013 2024",
                "title": "Machine Learning",
                "description": "Pursued advanced education in Machine Learning & Artificial Intelligence, developing practical experience across ML, deep learning, NLP, and MLOps."
        },
        {
                "period": "2024",
                "title": "AI Research",
                "description": "Completed an MS in Machine Learning & Artificial Intelligence with research focused on explainability in low-resource and multilingual NLP."
        },
        {
                "period": "Aug 2025 \u2013 Present",
                "title": "Engineering Leadership",
                "description": "Joined Vidai Solutions as a Senior Software Developer (Lead), taking responsibility for backend engineering, architecture, integrations, optimization, and team leadership."
        }
]
        },
        {
            "section_key": "currently-exploring",
            "data": {
        "title": "Currently Exploring",
        "items": [
                {
                        "title": "Generative AI",
                        "description": "Building practical applications around LLMs, AI agents, and intelligent workflows."
                },
                {
                        "title": "AI Engineering",
                        "description": "Exploring how strong software engineering practices can be applied to production AI systems."
                },
                {
                        "title": "NLP & Explainability",
                        "description": "Continuing to explore multilingual NLP, low-resource language challenges, and interpretable machine learning."
                },
                {
                        "title": "Developer Productivity",
                        "description": "Experimenting with AI-assisted development workflows and multi-agent engineering systems."
                }
        ]
}
        },
        {
            "section_key": "philosophy",
            "data": {
        "title": "How I approach engineering",
        "items": [
                {
                        "title": "Understand the system",
                        "description": "Before changing code, understand the problem, existing architecture, data flow, and constraints."
                },
                {
                        "title": "Design for the right complexity",
                        "description": "Good architecture is about choosing abstractions that make systems easier to understand, change, and operate."
                },
                {
                        "title": "Build with the future in mind",
                        "description": "Prefer modular, testable implementations that can evolve as requirements and system complexity grow."
                },
                {
                        "title": "Optimize what matters",
                        "description": "Performance improvements should come from understanding bottlenecks rather than premature optimization."
                },
                {
                        "title": "Measure the outcome",
                        "description": "Engineering success is reflected in reliability, performance, maintainability, developer productivity, and user impact."
                }
        ]
}
        },
        {
            "section_key": "ask-kuldeep",
            "data": {
        "title": "Ask Kuldeep",
        "description": "Curious about how I approach backend architecture, API optimization, data systems, machine learning, or AI? Ask me.",
        "suggestedQuestions": [
                "How would you design a scalable Django API?",
                "How do you approach API performance optimization?",
                "How would you design a multi-tenant backend?",
                "When would you use Django vs FastAPI?",
                "How do you approach machine learning projects?",
                "What did you research during your MS?",
                "How would you integrate AI into an existing software system?"
        ],
        "responseHeading": "Kuldeep's Engineering Note"
}
        },
        {
            "section_key": "resumes",
            "data": [
        {
                "variant": "software",
                "label": "Software Engineering Resume",
                "filename": "software-engineering.pdf",
                "path": "/resumes/software-engineering.pdf"
        },
        {
                "variant": "ai_ml",
                "label": "AI / ML Resume",
                "filename": "ai-ml.pdf",
                "path": "/resumes/ai-ml.pdf"
        },
        {
                "variant": "data_analyst",
                "label": "Data Analyst Resume",
                "filename": "data-analyst.pdf",
                "path": "/resumes/data-analyst.pdf"
        }
]
        },
        {
            "section_key": "experience",
            "data": [
        {
                "id": "shelter-associates",
                "organization": "Shelter Associates",
                "role": "Software Developer",
                "period": "Jul '21 \u2013 Present",
                "location": "Pune, IN",
                "responsibilities": [
                        "Backend development with Django and REST APIs",
                        "Database query optimization and preprocessing",
                        "ETL pipeline design and orchestration",
                        "Dashboard deployment for program teams",
                        "Exploratory data analysis on field-collected data"
                ],
                "achievements": [
                        {
                                "id": "shelter-deployment",
                                "text": "Reduced feature deployment time by 30% through modular code design",
                                "sourceVariants": [
                                        "software",
                                        "ai_ml",
                                        "data_analyst"
                                ],
                                "relevantRoles": [
                                        "software",
                                        "system"
                                ]
                        },
                        {
                                "id": "shelter-api",
                                "text": "Reduced API response time by over 60% via query and preprocessing optimization",
                                "sourceVariants": [
                                        "software",
                                        "ai_ml",
                                        "data_analyst"
                                ],
                                "relevantRoles": [
                                        "software",
                                        "system"
                                ]
                        },
                        {
                                "id": "shelter-avni-ingestion",
                                "text": "Automated AVNI data ingestion, reducing manual data entry time by 75%",
                                "sourceVariants": [
                                        "software"
                                ],
                                "relevantRoles": [
                                        "software"
                                ]
                        },
                        {
                                "id": "shelter-latency",
                                "text": "Reduced data delivery latency by 40% and increased system uptime reliability by 25%",
                                "sourceVariants": [
                                        "software"
                                ],
                                "relevantRoles": [
                                        "software"
                                ]
                        },
                        {
                                "id": "shelter-airflow",
                                "text": "Configured Apache Airflow to orchestrate ETL workflows, replacing legacy cron jobs",
                                "sourceVariants": [
                                        "software",
                                        "ai_ml",
                                        "data_analyst"
                                ],
                                "relevantRoles": [
                                        "software",
                                        "data",
                                        "ai",
                                        "system"
                                ]
                        },
                        {
                                "id": "shelter-dashboards",
                                "text": "Deployed dashboards using Apache Superset and Metabase for 5+ program teams",
                                "sourceVariants": [
                                        "ai_ml",
                                        "data_analyst"
                                ],
                                "relevantRoles": [
                                        "data",
                                        "ai",
                                        "system"
                                ]
                        },
                        {
                                "id": "shelter-eda",
                                "text": "Conducted exploratory data analysis to identify anomalies and trends for strategic planning",
                                "sourceVariants": [
                                        "ai_ml",
                                        "data_analyst"
                                ],
                                "relevantRoles": [
                                        "data",
                                        "ai"
                                ]
                        }
                ],
                "technologies": [
                        "Python",
                        "Django",
                        "REST APIs",
                        "PostgreSQL",
                        "Apache Airflow",
                        "Apache Superset",
                        "Metabase",
                        "AVNI"
                ],
                "relevantRoles": [
                        "software",
                        "data",
                        "ai",
                        "system"
                ]
        },
        {
                "id": "swadhar-idwc",
                "organization": "Swadhar IDWC",
                "role": "Software Developer Consultant",
                "period": "Apr '23 \u2013 Present",
                "location": "Pune, IN",
                "responsibilities": [
                        "Digital transformation from manual data entry to AVNI-based systems",
                        "Custom survey forms and workflow deployment",
                        "SQL reporting automation",
                        "KPI dashboard design and stakeholder training"
                ],
                "achievements": [
                        {
                                "id": "swadhar-accuracy",
                                "text": "Improved data accuracy by 30% and reduced reporting time by 50%",
                                "sourceVariants": [
                                        "software",
                                        "ai_ml",
                                        "data_analyst"
                                ],
                                "relevantRoles": [
                                        "data",
                                        "software",
                                        "system"
                                ]
                        },
                        {
                                "id": "swadhar-forms",
                                "text": "Created and deployed 30+ custom survey forms and workflows",
                                "sourceVariants": [
                                        "software",
                                        "ai_ml",
                                        "data_analyst"
                                ],
                                "relevantRoles": [
                                        "data",
                                        "software",
                                        "system"
                                ]
                        },
                        {
                                "id": "swadhar-collection",
                                "text": "Increased field data collection speed by 40% across community programs",
                                "sourceVariants": [
                                        "software",
                                        "ai_ml",
                                        "data_analyst"
                                ],
                                "relevantRoles": [
                                        "data",
                                        "system"
                                ]
                        },
                        {
                                "id": "swadhar-reporting",
                                "text": "Reduced report generation time by 60%, enabling real-time decisions for 5+ program teams",
                                "sourceVariants": [
                                        "software",
                                        "ai_ml",
                                        "data_analyst"
                                ],
                                "relevantRoles": [
                                        "data",
                                        "software",
                                        "system"
                                ]
                        },
                        {
                                "id": "swadhar-training",
                                "text": "Facilitated training sessions to promote data literacy among NGO staff",
                                "sourceVariants": [
                                        "ai_ml",
                                        "data_analyst"
                                ],
                                "relevantRoles": [
                                        "data"
                                ]
                        }
                ],
                "technologies": [
                        "AVNI",
                        "SQL",
                        "Data Visualization",
                        "Workflow Automation"
                ],
                "relevantRoles": [
                        "software",
                        "data",
                        "ai",
                        "system"
                ]
        }
]
        },
        {
            "section_key": "education",
            "data": [
        {
                "id": "ms-ml-ai",
                "degree": "MS in Machine Learning & Artificial Intelligence",
                "institution": "Liverpool John Moores University & UpGrad",
                "period": "Jul '24",
                "location": "Liverpool, England",
                "gpa": "3.58 / 4.0",
                "research": "Explainability in Low-Resource and Multilingual NLP Applications",
                "focus": [
                        "Machine Learning",
                        "Artificial Intelligence",
                        "Natural Language Processing",
                        "Deep Learning",
                        "MLOps",
                        "Generative AI"
                ]
        },
        {
                "id": "exec-pg-ml",
                "degree": "Executive PG in Machine Learning & Artificial Intelligence",
                "institution": "IIIT Bangalore & UpGrad",
                "period": "Mar '23 \u2013 May '24",
                "location": "Bengaluru, IN",
                "focus": [
                        "Machine Learning",
                        "Deep Learning",
                        "NLP",
                        "MLOps",
                        "Generative AI",
                        "Data Science"
                ]
        },
        {
                "id": "btech-cs",
                "degree": "B.Tech in Computer Science",
                "institution": "Hitkarini College of Engineering & Technology",
                "period": "Aug '17 \u2013 Jul '21",
                "location": "Jabalpur, IN",
                "gpa": "8.00 CGPA"
        }
]
        },
        {
            "section_key": "skills",
            "data": [
        {
                "id": "programming",
                "name": "Programming",
                "relevantRoles": [
                        "software",
                        "ai",
                        "data",
                        "system"
                ],
                "skills": [
                        {
                                "id": "python",
                                "name": "Python",
                                "relatedIds": [
                                        "django",
                                        "pandas",
                                        "machine-learning"
                                ]
                        },
                        {
                                "id": "java",
                                "name": "Java"
                        },
                        {
                                "id": "sql",
                                "name": "SQL",
                                "relatedIds": [
                                        "postgresql",
                                        "mysql"
                                ]
                        }
                ]
        },
        {
                "id": "web",
                "name": "Web Development",
                "relevantRoles": [
                        "software",
                        "system"
                ],
                "skills": [
                        {
                                "id": "django",
                                "name": "Django",
                                "relatedIds": [
                                        "python",
                                        "rest"
                                ]
                        },
                        {
                                "id": "flask",
                                "name": "Flask"
                        },
                        {
                                "id": "react",
                                "name": "React"
                        },
                        {
                                "id": "rest",
                                "name": "REST APIs"
                        },
                        {
                                "id": "docker",
                                "name": "Docker"
                        },
                        {
                                "id": "git",
                                "name": "Git"
                        }
                ]
        },
        {
                "id": "data-engineering",
                "name": "Data Engineering",
                "relevantRoles": [
                        "data",
                        "software",
                        "system"
                ],
                "skills": [
                        {
                                "id": "airflow",
                                "name": "Apache Airflow",
                                "relatedIds": [
                                        "etl",
                                        "python"
                                ]
                        },
                        {
                                "id": "etl",
                                "name": "ETL"
                        },
                        {
                                "id": "pandas",
                                "name": "Pandas",
                                "relatedIds": [
                                        "python",
                                        "sql"
                                ]
                        },
                        {
                                "id": "excel",
                                "name": "MS Excel"
                        }
                ]
        },
        {
                "id": "databases",
                "name": "Databases",
                "relevantRoles": [
                        "software",
                        "data",
                        "system"
                ],
                "skills": [
                        {
                                "id": "postgresql",
                                "name": "PostgreSQL"
                        },
                        {
                                "id": "mysql",
                                "name": "MySQL"
                        },
                        {
                                "id": "mongodb",
                                "name": "MongoDB"
                        }
                ]
        },
        {
                "id": "ml",
                "name": "Machine Learning",
                "relevantRoles": [
                        "ai",
                        "system"
                ],
                "skills": [
                        {
                                "id": "machine-learning",
                                "name": "Machine Learning",
                                "relatedIds": [
                                        "python"
                                ]
                        },
                        {
                                "id": "pytorch",
                                "name": "PyTorch"
                        },
                        {
                                "id": "scikit-learn",
                                "name": "Scikit-learn"
                        }
                ]
        },
        {
                "id": "deep-learning",
                "name": "Deep Learning & NLP",
                "relevantRoles": [
                        "ai",
                        "system"
                ],
                "skills": [
                        {
                                "id": "deep-learning",
                                "name": "Deep Learning"
                        },
                        {
                                "id": "nlp",
                                "name": "NLP",
                                "relatedIds": [
                                        "llm"
                                ]
                        },
                        {
                                "id": "llm",
                                "name": "LLM / Generative AI"
                        },
                        {
                                "id": "mlops",
                                "name": "MLOps",
                                "relatedIds": [
                                        "airflow"
                                ]
                        }
                ]
        },
        {
                "id": "visualization",
                "name": "Visualization",
                "relevantRoles": [
                        "data",
                        "system"
                ],
                "skills": [
                        {
                                "id": "superset",
                                "name": "Apache Superset"
                        },
                        {
                                "id": "metabase",
                                "name": "Metabase"
                        },
                        {
                                "id": "power-bi",
                                "name": "Power BI"
                        },
                        {
                                "id": "tableau",
                                "name": "Tableau"
                        }
                ]
        }
]
        },
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
