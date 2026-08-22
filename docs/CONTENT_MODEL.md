# Content Model

## Resume sources

Three resume variants extracted to `../resume-extracts/`:

| Variant | File | Focus |
|---------|------|-------|
| `software` | Software Engineering.pdf | Backend, APIs, Docker, CI/CD |
| `ai_ml` | AI ML.pdf | ML, NLP, DL, MLOps, PyTorch |
| `data_analyst` | Data Analyst.pdf | ETL, dashboards, SQL, analytics |

## Conflict handling

Some metrics appear in only one variant:

| Metric | Variants | Notes |
|--------|----------|-------|
| 75% manual data entry reduction | software only | AVNI ingestion automation |
| 40% latency + 25% uptime | software only | Pipeline reliability |
| Dashboards for 5+ teams | ai_ml, data_analyst | Superset/Metabase |
| Training sessions | ai_ml, data_analyst | Data literacy |
| Excel certification details | software, ai_ml | Software says Coursera, Mar 2024; AI/ML says Macquarie University, Sep 2024. Not listed in Data Analyst. |
| ETL pipelines | ai_ml, data_analyst | Airflow ETL pipeline for AVNI ingestion listed in AI/ML & Data Analyst, but Software has a "75% manual data entry reduction" scripting metric instead. |

Achievements store `sourceVariants[]` and `relevantRoles[]` so the UI shows the right claim per perspective.


## Placeholders (not invented)

- LinkedIn URL
- GitHub URL
- Project GitHub links (resume says "Github" but no URLs)
- Resume PDF files in `public/resumes/`

## Certification variance

- **software**: Docker, React+Django certs
- **ai_ml**: Vertex AI, PySpark
- **data_analyst**: DataCamp Data Analyst Associate

Each cert has `sourceVariants` for filtering.
