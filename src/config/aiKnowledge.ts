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
      'Kuldeep uses Python with Django and REST APIs for backend development, along with PostgreSQL, Docker, Git, and CI/CD. He has built ETL pipelines with Apache Airflow.',
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
      'Kuldeep has 4+ years of software development experience, currently working as Software Developer at Shelter Associates and Software Developer Consultant at Swadhar IDWC.',
    tags: ['general'],
    source: 'resume:all',
  },
]
