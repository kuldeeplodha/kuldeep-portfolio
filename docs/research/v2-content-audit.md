# Portfolio V2 — Content Audit & Gap List

**Author:** Kelly (Research Lead, `kelly-mt5wqij5`) · **Date:** 2026-09-06 · **Task:** V2-CONTENT-AUDIT  
**Repository:** `/Users/kuldeeplodha/Desktop/Kuldeep Guided Projects/kuldeep-portfolio`  
**Audit basis:** V2 spec sections (Engineering Signal, Experience, Selected Work, Research Lab, Engineering Stack) vs actual config/content

---

## 0. Executive Summary

**Current state:** Portfolio has REAL, DEFENSIBLE content for: 2 work experiences, 3 projects, 3 education entries, 7 skill categories, 1 MS research thesis.

**Fabrication risk:** LOW — all current content is verifiable. However, **V2 spec requires deeper content** (case studies with architecture, research experiments, detailed experience breakdown, leadership stories) **that does NOT yet exist**.

**Gap severity:** MEDIUM-HIGH. V2 sections can launch with existing content, but several sections will be thin unless the human provides additional material.

**Recommendation:** Launch V2.0 with what exists (conservative approach), then backfill gaps in V2.1–V2.2 as new content becomes available (new projects, experiments, case study deep-dives).

---

## 1. ENGINEERING SIGNAL SECTION

### 1.1 Current state

No dedicated "Engineering Signal" data structure exists. Current portfolio has generic skill categories + role-based filtering.

**What exists (can be inferred):**
- Backend Systems (Django, REST APIs, ETL, Airflow)
- Database Optimization (PostgreSQL, query optimization, indexing)
- Data Pipelines (ETL, Apache Airflow, AVNI data ingestion)
- APIs & Services (REST APIs, Django)
- Visualization (Apache Superset, Metabase, dashboards)

**Source:** Extracted from experience entries (Shelter Associates) and skills.ts.

### 1.2 V2 requirement

V2 spec calls for high-signal engineering categories (Backend Systems, APIs & Services, System Architecture, Healthcare Platforms, Integrations, Performance, Technical Leadership).

### 1.3 Gap analysis

| Category | Current content | Status | Notes |
|----------|---|---|---|
| Backend Systems | ✅ Real (Django, REST APIs) | Can use | Has real project work (Shelter APIs, AVNI ingestion) |
| Database Optimization | ✅ Real (query optimization) | Can use | 60% API response time reduction (verified in Shelter entry) |
| APIs & Services | ✅ Real (REST APIs) | Can use | Shelter Associates, Django experience |
| System Architecture | ⚠️ Minimal | Needs human input | No documented architecture decisions, system design stories, or scalability patterns |
| Healthcare Platforms | ✅ Real | Can use | Shelter Associates is healthcare-focused (field data collection) |
| Integrations | ⚠️ Minimal | Needs human input | AVNI integration exists, but no detailed integration architecture story |
| Performance | ✅ Real | Can use | 60% API response, 40% latency reduction, 25% uptime (Shelter) |
| Technical Leadership | ⚠️ Minimal | Needs human input | No mentoring, code review, or team-building stories currently documented |
| MLOps | ✅ Real | Can use | Airflow, MLflow (MS thesis context) |

### 1.4 Recommendation

**Launch V2.0:** Use Backend, Database, APIs, Healthcare, Performance categories (verified content).

**Backfill by V2.1:** Collect stories for System Architecture, Integrations, Technical Leadership from human (interviews/notes).

---

## 2. EXPERIENCE SECTION

### 2.1 Current state

**2 real work entries:**

1. **Shelter Associates** (Jul '21 – Present)
   - Role: Software Developer
   - Location: Pune, IN
   - Responsibilities: ✅ 5 detailed (Backend, DB optimization, ETL, Dashboard, EDA)
   - Achievements: ✅ 7 real, metric-backed achievements
   - Technologies: ✅ 8 specific (Python, Django, PostgreSQL, Airflow, Superset, Metabase, AVNI)

2. **Swadhar IDWC** (Apr '23 – Present)
   - Role: Software Developer Consultant
   - Location: Pune, IN
   - Responsibilities: ✅ 4 detailed (Digital transformation, forms, SQL reporting, KPI dashboards)
   - Achievements: ✅ 5 real achievements (accuracy, forms deployment, data collection, reporting, training)
   - Technologies: ✅ 4 specific (AVNI, SQL, Data Visualization, Workflow Automation)

### 2.2 V2 requirements (per §16 Experience Content Structure)

Each role should contain:
- Company ✅ Exists
- Position ✅ Exists
- Date range ✅ Exists
- Location ✅ Exists
- Short overview (2–3 sentence context) ⚠️ MISSING
- Major responsibilities ✅ Exists (list format)
- Major systems/features ⚠️ PARTIAL (implied, not explicit)
- Technologies ✅ Exists
- Leadership responsibilities ⚠️ MISSING (no mentoring, code reviews, planning details)
- Significant engineering outcomes ✅ Exists (as achievements with metrics)

### 2.3 Gap analysis

| Requirement | Shelter | Swadhar | Notes |
|---|---|---|---|
| Company/Role/Dates/Location | ✅ | ✅ | Complete |
| Context overview (2–3 sentences) | ❌ | ❌ | **GAP:** No contextual narrative. E.g., "Shelter is an NGO building affordable housing for low-income families in India. I led the backend architecture to transition their field teams from manual data entry to a unified digital platform." |
| Responsibilities | ✅ | ✅ | Complete (5 and 4 items) |
| Major systems/features | ⚠️ Implied | ⚠️ Implied | Mentioned in achievements but not as explicit system names. Examples: EMR system (not in current data), Billing system (not in current data), CRM features (not explicit) |
| Technologies | ✅ | ✅ | Complete |
| Leadership | ❌ | ❌ | **GAP:** No mentoring stories, code review practices, architectural decisions, team size managed, or planning involvement |
| Outcomes/Metrics | ✅ | ✅ | 7 and 5 achievements with quantified impact |

### 2.4 Recommendation

**Launch V2.0:** Use existing content (responsibilities, technologies, metrics). Frame as "contributions" rather than full "experience" section.

**Required for full V2.1:** Human must provide:
1. Context narrative for each role (2–3 sentences on org mission + role)
2. Explicit system/feature names (EMR, Billing, CRM, etc.)
3. Leadership stories (mentoring, code reviews, architectural decisions, team dynamics)
4. Specific examples of technical decisions and their outcomes

**Fabrication risk:** MEDIUM — tempting to invent "mentored 3 engineers" or "led code review culture" if not provided. Flag any such assumptions.

---

## 3. SELECTED WORK / CASE STUDIES

### 3.1 Current state

**3 real projects:**

1. **Gesture Recognition Using Neural Networks** (Oct '23 – Nov '23)
   - Problem: ✅ Classify hand gestures
   - Approach: ✅ CNN/RNN, TensorFlow, Keras, data preprocessing
   - Technologies: ✅ Python, TensorFlow, Keras, CNN, RNN
   - Pipeline: ✅ Data → Preprocessing → Feature Representation → CNN/RNN → Training → Evaluation → Prediction
   - Result: ✅ "Gained expertise in time-series data and image-based classification"
   - Future improvements: ✅ Noted (real-time inference, transfer learning)

2. **Automatic Ticket Classification Using NLP** (Dec '23 – Jan '24)
   - Problem: ✅ Manual categorization is slow/inconsistent
   - Approach: ✅ Text preprocessing, feature extraction, Scikit-learn
   - Technologies: ✅ Python, Scikit-learn, NLP
   - Pipeline: ✅ Raw Ticket → Text Preprocessing → Feature Extraction → ML Model → Classification → Ticket Category

3. **Sentiment-Based Product Recommendation System** (Apr '24 – May '24)
   - Problem: ✅ Personalize recommendations from reviews
   - Approach: ✅ NLP + ML (Python, Scikit-learn, TensorFlow)
   - Technologies: ✅ Python, Scikit-learn, TensorFlow, NLP, Machine Learning
   - Pipeline: ✅ Customer Review → Sentiment Analysis → Preference Signal → Recommendation → Personalized Product

### 3.2 V2 requirements (per §18 Project Card Design)

Each project should communicate:
1. What problem it solves ✅ Exists
2. Domain ⚠️ Exists (implied as ML/NLP, not as business domain)
3. Engineering complexity ⚠️ Partial (technologies listed, but no "this was hard because...")
4. Technologies ✅ Exists
5. Kuldeep's contribution ⚠️ Partial (implied by project, no explicit "I did X")
6. Link to detailed case study ❌ MISSING (no case study docs exist)

### 3.3 Gap analysis

| Aspect | Gesture Recog | Ticket Class | Sentiment Rec | Notes |
|---|---|---|---|---|
| Problem statement | ✅ | ✅ | ✅ | Clear, specific |
| Business domain | ❌ | ❌ | ❌ | **GAP:** Projects appear academic/capstone. No business context (e.g., "Used by X company" or "Deployed in production") |
| Engineering challenge | ⚠️ | ⚠️ | ⚠️ | **GAP:** "Why was this hard?" E.g., "Gesture recognition required real-time processing with <50ms latency" or "Ticket classification needed 95%+ accuracy to avoid miscategorization costs" |
| Contribution clarity | ⚠️ | ⚠️ | ⚠️ | **GAP:** "I did X" is implied. No explicit authorship or solo/team context |
| Impact/result | ⚠️ | ⚠️ | ⚠️ | **GAP:** Results are learning outcomes ("Gained expertise") rather than business metrics or deployments |
| GitHub links | ❌ | ❌ | ❌ | All have `githubUrl: undefined` — no source code access |
| Case study depth | ❌ | ❌ | ❌ | No detailed writeups (architecture diagrams, failed approaches, lessons learned) |

### 3.4 Recommendation

**Launch V2.0:** Use projects as-is (problem → approach → tech → pipeline), framed as "ML Projects / Learning Work" rather than "Selected Engineering Work" (V2 spec term implies business impact).

**GAP SEVERITY: HIGH.** V2 spec calls projects "case studies" with business context and engineering challenge. Current projects are academic.

**Required for full V2.1 "Selected Work":** Human must provide:
1. Real-world projects (production systems, shipped features, or deployed solutions)
2. Business context (what problem did it solve for whom)
3. Engineering complexity narrative (why it was non-trivial)
4. Measurable outcomes (users served, revenue, latency, uptime, etc.)
5. Kuldeep's specific contribution (solo built? Led team? Optimized?)
6. GitHub repos or case study writeups (depth)

**Fabrication risk:** VERY HIGH — tempting to invent business context or impact metrics. Instead, either:
- Keep projects as "ML Learning Projects" (honest, low risk)
- Or find real work projects to replace/supplement (Shelter Associates projects, Swadhar implementations)

---

## 4. RESEARCH LAB SECTION

### 4.1 Current state

**No dedicated research lab data structure exists.**

What exists (scattered):
- MS thesis: "Explainability in Low-Resource and Multilingual NLP Applications" (Jul '24)
- Source: education.ts + aiKnowledge.ts

### 4.2 V2 requirements (per §22–23 Research Lab)

V2 spec calls for:
- Experiment cards with: number, date, status, topic, stack, observation, result
- Example topics: database optimization, API performance, caching, system design, integration architecture
- Visual: technical notebook aesthetic (modern engineering research workspace, not hacker terminal)

### 4.3 Gap analysis

| Element | Current | Status |
|---|---|---|
| Experiment entries | 0 | ❌ MISSING |
| Experiment numbering | N/A | ❌ MISSING |
| Date/status tracking | Thesis only | ⚠️ Partial (only education date) |
| Topic diversity | 1 (NLP explainability) | ❌ MISSING |
| Stack documentation | 1 (NLP tools) | ❌ MISSING |
| Observations/results | 1 (thesis title only) | ⚠️ Minimal |

### 4.4 Recommendation

**Launch V2.0:** Either skip Research Lab section or include MS thesis as a single "featured research" entry (low-risk, no fabrication).

**GAP SEVERITY: HIGH.** V2 spec positions Research Lab as a "signature feature."

**Required for full V2.1:** Human must provide a list of:
1. Real experiments/research activities (not hypothetical)
2. Specific topics (database optimization, API performance, caching, NLP, system design, etc.)
3. Dates and status (completed, in-progress, paused)
4. Technology stack used
5. Key observations and measurable results
6. Any blog posts, GitHub repos, or writeups

**Fabrication risk:** VERY HIGH — tempting to invent experiments ("Explored rate-limiting strategies," "Investigated connection pooling"). Instead:
- Use MS thesis + projects as the research foundation
- Add 1–2 real side experiments if they exist (e.g., "Benchmarked Airflow DAG execution patterns," "Analyzed PostgreSQL query plans")
- Alternatively, reposition section as "Learning & Exploration" (softer, more honest)

**Alternative:** Consider converting high-impact Shelter/Swadhar work into "Engineering Research" — frame technical decisions as experiments (e.g., "Query Optimization Research (2021–2023): Reduced API latency by 60% through index design and query planning optimization").

---

## 5. ENGINEERING STACK SECTION

### 5.1 Current state

**7 real skill categories with 40+ specific technologies:**

1. **Programming:** Python, Java, SQL
2. **Web Development:** Django, Flask, React, REST APIs, Docker, Git
3. **Data Engineering:** Apache Airflow, ETL, Pandas, MS Excel
4. **Databases:** PostgreSQL, MySQL, MongoDB
5. **Machine Learning:** Machine Learning, PyTorch, Scikit-learn
6. **Deep Learning & NLP:** Deep Learning, NLP, LLM/Generative AI, MLOps
7. **Visualization:** Apache Superset, Metabase, Power BI, Tableau

### 5.2 V2 requirements (per §24–25 Engineering Stack)

V2 spec calls for:
- Grouping by domain: Backend, Data, Architecture, Infrastructure, Integrations
- NO percentages or progress bars
- Visualization: grouped matrix, constellation, dependency graph
- Real technologies only (no invented tools)

### 5.3 Gap analysis

**Current structure (by skill category) vs V2 structure (by domain):**

| V2 Domain | Current tech | Real? | Notes |
|---|---|---|---|
| **Backend** | Python, Django, Flask, REST APIs | ✅ | Complete; well-sourced from Shelter/Swadhar |
| **Data** | PostgreSQL, Redis(?), SQL, ETL | ⚠️ | PostgreSQL/MySQL/MongoDB exist; **Redis NOT in current config** — would be fabrication if added |
| **Architecture** | System Design(?), API Architecture(?), Scalability(?), Performance | ❌ | **NOT EXPLICITLY documented.** Tech stack doesn't list these. Could infer from experience (query optimization = performance), but no architecture design tools (no Kafka, gRPC, etc.) |
| **Infrastructure** | Docker, AWS(?), CI/CD(?) | ⚠️ | Docker mentioned in skills; **AWS not explicitly in config** — AVNI is field platform, unclear if AWS used; **CI/CD not in config** |
| **Integrations** | AVNI, Twilio(?), Google APIs(?), Stripe(?) | ⚠️ | AVNI verified; **Twilio, Google APIs, Stripe NOT in current config** — V2 spec examples only |

### 5.4 Recommendation

**Launch V2.0:** Use current skill categories (conservative). Organize as:

```
ENGINEERING STACK

Backend
  Python
  Django
  Flask
  REST APIs

Data
  PostgreSQL
  MySQL
  MongoDB
  SQL
  ETL

Data Science & ML
  Python
  Scikit-learn
  TensorFlow
  PyTorch
  NLP

Tooling
  Docker
  Apache Airflow
  Git

Visualization
  Apache Superset
  Metabase
  Power BI
  Tableau
```

**Do NOT add** (fabrication risk):
- Redis (not documented)
- AWS (not verified)
- CI/CD (not verified)
- Kafka, gRPC, Microservices (not in stack)
- Twilio, Google APIs, Stripe (only in V2 spec as examples)

**GAP SEVERITY: LOW.** Current stack is honest and complete.

**Optional for V2.1:** If human wants to highlight additional technologies, provide explicit list:
- Is AWS used? (EC2, RDS, Lambda, SageMaker)
- Is CI/CD used? (GitHub Actions, Jenkins, GitLab CI)
- Any observability tools? (DataDog, Prometheus, ELK)
- Any messaging/queues? (Kafka, RabbitMQ, Celery)

---

## 6. ASK KULDEEP SECTION

### 6.1 Current state

**AI knowledge base exists:** aiKnowledge.ts with 10+ Q&A entries covering:
- Backend tech, NLP work, Data engineering, Research thesis, ML projects, etc.
- Question patterns + answers already authored
- Real, defensible content sourced from config

### 6.2 V2 requirements

V2 spec does not detail this section extensively, but implies conversational interface to explore Kuldeep's expertise.

### 6.3 Gap analysis

| Aspect | Current | Status |
|---|---|---|
| Q&A entries | 10+ | ✅ Complete |
| Coverage breadth | Backend, ML, Data, Research | ✅ Good |
| Answer quality | Detailed, sourced | ✅ Good |
| Fabrication risk | Low | ✅ All sourced from real config |

### 6.4 Recommendation

**Launch V2.0:** Use existing Ask Kuldeep system (no changes needed).

**Optional for V2.1:** Expand with additional Q&A on:
- Leadership experiences (mentoring, code reviews, architectural decisions)
- Case study deep-dives (system design decisions, failed approaches, lessons learned)
- Research findings (thesis insights, experiments)

---

## 7. EDUCATION & CERTIFICATIONS

### 7.1 Current state

**Real, defensible content:**

**Education (3 entries):**
- MS in ML/AI (Liverpool John Moores + UpGrad, Jul '24) — with thesis title
- Executive PG in ML/AI (IIIT Bangalore + UpGrad, Mar '23 – May '24) — GPA 3.58/4, highlights
- B.Tech in CS (Hitkarini, Aug '17 – Jul '21) — GPA 8.00 CGPA

**Certifications (2+ entries):**
- Career Essentials in Software Development (Microsoft + LinkedIn, Feb 2025)
- Getting Started as an AWS Developer (LinkedIn, Mar 2025)

### 7.2 V2 positioning

V2 spec lists Education/Certifications as "secondary content" (should not compete with engineering story).

### 7.3 Recommendation

**Launch V2.0:** Include as-is (low-priority secondary section).

**No gaps:** All content is real and verifiable. No fabrication risk.

---

## 8. BLOG SECTION

### 8.1 Current state

**Blog infrastructure exists:** /blog routes (V1.5), BlogListPage (50 lines), BlogDetailPage (68 lines).

**Blog content:** /src/content/blog/ would contain .md files (V1.5 spec), but no posts created yet.

### 8.2 V2 positioning

V2 spec does not emphasize blog. It's secondary content (low priority).

### 8.3 Gap analysis

| Element | Current | Status |
|---|---|---|
| Blog infrastructure | ✅ Built | V1.5 complete |
| Blog posts | 0 | ❌ None written |
| Case study writeups | 0 | ❌ None written |
| Research findings | 0 | ❌ None written |

### 8.4 Recommendation

**Launch V2.0:** Link blog in footer/navigation, but do NOT highlight (secondary content).

**Optional for V2.1:** Encourage human to write:
1. Case study deep-dives (Shelter work, Swadhar work, project learnings)
2. Research findings (thesis summary, NLP explainability insights)
3. Technical articles (system design, API optimization, ETL patterns)

---

## 9. FABRICATION RISK SUMMARY

| Section | Content | Risk | Mitigation |
|---|---|---|---|
| **Engineering Signal** | Mostly real; leadership gaps | MEDIUM | Use existing categories; backfill leadership stories later |
| **Experience** | Real; missing context/leadership | MEDIUM | Provide brief overview + leadership stories |
| **Selected Work** | Academic projects; no business case | VERY HIGH | Reposition as "ML Projects" or add real-world work |
| **Research Lab** | Only MS thesis; no experiments | VERY HIGH | Backfill with documented experiments OR reposition as "Learning & Exploration" |
| **Engineering Stack** | All real; avoid adding unverified tech | LOW | Do NOT add Redis/AWS/CI-CD unless human confirms |
| **Ask Kuldeep** | All sourced; real content | LOW | Safe to launch; expand later |
| **Education** | Real, verifiable | VERY LOW | Safe |
| **Blog** | Infrastructure ready; no content | N/A | Optional; backfill later |

---

## 10. PRIORITY GAP LIST FOR HUMAN

### Critical (block V2.0 launch if strict on depth)

1. **Experience context narratives** (2–3 sentences per role explaining org mission + role impact)
2. **Leadership stories** (mentoring, code reviews, architectural decisions, team size)
3. **Research Lab experiments** (at least 3–5 documented experiments with topics, stacks, results)

### High (strongly recommended for V2.0)

4. **System/feature names** (Explicit names: EMR, Billing, CRM, Integrations)
5. **Selected work case studies** (Real-world projects or deep-dive writeups for ML projects)
6. **Engineering complexity narratives** (Why each project/system was technically challenging)

### Medium (can backfill in V2.1)

7. **Technical decision stories** (Architecture choices, trade-offs, lessons learned)
8. **Blog post drafts** (Case studies, research findings, technical articles)
9. **Additional integrations** (Twilio, Google APIs, payment systems if used)

### Low (nice-to-have)

10. **Additional projects** (More case studies to round out portfolio)
11. **Speaking/conference talks** (If applicable)
12. **Open-source contributions** (If significant)

---

## 11. RECOMMENDED V2.0 LAUNCH APPROACH

### Conservative (low fabrication risk)

**Sections to include:**
- ✅ Hero (existing)
- ✅ Engineering Signal (6 categories: Backend, Database, APIs, Healthcare, Performance, MLOps)
- ✅ Experience (2 roles with responsibilities + achievements, no leadership details yet)
- ⚠️ Selected Work (3 ML projects labeled as "Learning Projects," not case studies)
- ❌ Research Lab (SKIP or single entry: MS thesis)
- ✅ Engineering Stack (current 7 categories)
- ✅ Ask Kuldeep (existing)
- ✅ Education (3 entries)
- ✅ Certifications (2+ entries)
- ⚠️ Blog (link, but empty or 0 posts)

**Rationale:** Launch with honest, defensible content. Avoid inventing case studies, leadership stories, or experiments.

### Aggressive (requires human input)

**Additions to conservative approach:**
- Add 2–3 research experiments (backfilled from human)
- Expand experience with context + leadership stories (provided by human)
- Reposition ML projects as case studies with engineering complexity narratives (human writes)
- Populate Research Lab with 5+ documented experiments (human provides)

---

## 12. CONCLUSION

**Current portfolio has real, strong foundational content:** 2 work experiences, 3 projects, 3 education entries, 40+ technologies, 1 MS research thesis, all verifiable.

**V2 spec ambition exceeds current content in:** depth of case studies, research lab experiments, leadership stories, architecture narratives.

**Recommendation:** Launch V2.0 conservatively using existing content (low fabrication risk). Backfill gaps in V2.1–V2.2 as human provides additional material. Explicitly label sections by content maturity (e.g., "Learning Projects" vs "Case Studies") to manage recruiter/manager expectations.

**No fabrication needed if:** we're honest about content depth and position portfolio as "work in progress" (actively building, adding new content). Better to under-promise and over-deliver than to invent case studies.

**Next step:** Route this gap list to the human (Kuldeep) with a prioritized form: "Which gaps would you like to fill for V2.0? Which can wait for V2.1?"
