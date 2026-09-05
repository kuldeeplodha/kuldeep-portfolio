import type { EngineeringStackCategory } from '../types'

// Verbatim from the human-provided V2 content model (content.skills, 10
// categories). No proficiency percentages or progress bars — just the real
// technologies, grouped.
export const engineeringStack: EngineeringStackCategory[] = [
  { id: 'backend', label: 'Backend', technologies: ['Python', 'Django', 'Django REST Framework', 'Flask', 'REST APIs'] },
  { id: 'programming', label: 'Programming', technologies: ['Python', 'Java', 'JavaScript', 'SQL', 'Data Structures'] },
  { id: 'frontend', label: 'Frontend', technologies: ['React', 'JavaScript', 'HTML', 'CSS', 'Bootstrap', 'Jinja'] },
  { id: 'databases', label: 'Databases', technologies: ['PostgreSQL', 'MySQL', 'SQLite', 'MongoDB'] },
  {
    id: 'dataEngineering',
    label: 'Data Engineering',
    technologies: ['Pandas', 'Apache Airflow', 'ETL', 'Data Pipelines', 'Data Modeling', 'Advanced SQL', 'PySpark'],
  },
  {
    id: 'machineLearning',
    label: 'Machine Learning',
    technologies: ['Scikit-learn', 'TensorFlow', 'Keras', 'PyTorch', 'Regression', 'Classification', 'Clustering', 'PCA'],
  },
  {
    id: 'aiNlp',
    label: 'AI & NLP',
    technologies: ['Natural Language Processing', 'Deep Learning', 'CNN', 'RNN', 'LLMs', 'Generative AI', 'Explainable AI'],
  },
  {
    id: 'mlopsCloud',
    label: 'MLOps & Cloud',
    technologies: ['MLflow', 'Apache Airflow', 'AWS SageMaker', 'AWS Cloud', 'CI/CD', 'Docker'],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    technologies: ['Power BI', 'Apache Superset', 'Metabase', 'MS Excel', 'Matplotlib', 'Seaborn'],
  },
  { id: 'engineeringTools', label: 'Engineering Tools', technologies: ['Git', 'GitHub', 'Linux', 'Nginx', 'Unit Testing'] },
]
