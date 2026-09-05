import type { AIKnowledgeEntry } from '../types'

export const aiKnowledge: AIKnowledgeEntry[] = [
  {
    id: 'backend-tech',
    questionPatterns: [
      'backend',
      'django',
      'rest api',
      'what technologies',
      'python frameworks',
    ],
    answer:
      'Kuldeep uses Python with Django and Django REST Framework for backend development, along with PostgreSQL, Docker, Git, and CI/CD. As Senior Software Developer (Lead) at Vidai Solutions, he builds and optimizes REST APIs and integrations across EMR, billing, and CRM systems.',
    tags: ['software', 'backend'],
    source: 'resume:software',
  },
  {
    id: 'nlp-work',
    questionPatterns: ['nlp', 'natural language', 'ticket classification', 'multilingual'],
    answer:
      'Kuldeep has worked on NLP including automatic ticket classification (Scikit-learn), sentiment-based recommendations, and is researching explainability in low-resource and multilingual NLP applications for his MS thesis.',
    tags: ['ai', 'nlp'],
    source: 'resume:ai_ml',
  },
  {
    id: 'data-engineering',
    questionPatterns: ['data engineering', 'etl', 'airflow', 'pipelines', 'dashboard'],
    answer:
      'Kuldeep has built ETL pipelines with Python and Apache Airflow, automated AVNI data ingestion, and deployed dashboards with Apache Superset and Metabase for 5+ program teams.',
    tags: ['data', 'etl'],
    source: 'resume:data_analyst',
  },
  {
    id: 'research-thesis',
    questionPatterns: ['research', 'thesis', 'explainability', 'multilingual'],
    answer:
      'His research thesis is titled "Explainability in Low-Resource and Multilingual NLP Applications" as part of his MS in Machine Learning & Artificial Intelligence at Liverpool John Moores University & UpGrad.',
    tags: ['ai', 'research'],
    source: 'resume:ai_ml',
  },
  {
    id: 'ml-projects',
    questionPatterns: ['machine learning', 'ml project', 'deep learning', 'gesture'],
    answer:
      'ML projects include Gesture Recognition (CNN/RNN with TensorFlow), Automatic Ticket Classification (NLP with Scikit-learn), and a Sentiment-Based Product Recommendation System capstone.',
    tags: ['ai', 'projects'],
    source: 'resume:ai_ml',
  },
  {
    id: 'experience-years',
    questionPatterns: ['years of experience', 'how long', 'experience'],
    answer:
      'Kuldeep has 5+ years of software development experience. He is currently Senior Software Developer (Lead) at Vidai Solutions (Aug 2025 – Present), and previously worked at Shelter Associates and as a Software Developer Consultant at Swadhar IDWC.',
    tags: ['general'],
    source: 'resume:all',
  },
  {
    id: 'education-details',
    questionPatterns: ['education', 'degree', 'study', 'university', 'college', 'gpa', 'cgpa', 'where did you study', 'where did he study'],
    answer:
      'Kuldeep holds an MS in Machine Learning & AI from Liverpool John Moores University (Jul \'24), an Executive PG in Machine Learning & AI from IIIT Bangalore (Mar \'23 – May \'24, 3.58/4 GPA), and a B.Tech in Computer Science from Hitkarini College of Engineering & Technology (Aug \'17 – Jul \'21, 8.00 CGPA).',
    tags: ['education', 'general'],
    source: 'resume:all',
  },
  {
    id: 'certifications-details',
    questionPatterns: ['certifications', 'certification', 'certificates', 'cert', 'certified'],
    answer:
      'Kuldeep\'s certifications include: Prompt Design in Vertex AI (Google Cloud Skills Boost), Data Analyst Associate (DataCamp), Docker Foundations Professional Certificate, Getting Started as an AWS Developer (LinkedIn), Building React and Django Apps (LinkedIn), Career Essentials in Software Development (Microsoft/LinkedIn), Excel Skills for Data Analytics and Visualization, SQL (Advanced) and Problem Solving (Intermediate) from HackerRank.',
    tags: ['certifications', 'general'],
    source: 'resume:all',
  },
  {
    id: 'career-direction',
    questionPatterns: ['career', 'direction', 'goal', 'objective', 'summary', 'about', 'who is', 'passionate about'],
    answer:
      'Kuldeep is a Senior Software Developer (Lead) with 5+ years of experience building backend systems, APIs, and data workflows. His career has evolved from software engineering into data and, through an MS in Machine Learning & AI, into machine learning, NLP, and AI research.',
    tags: ['general', 'career'],
    source: 'resume:all',
  },
]

