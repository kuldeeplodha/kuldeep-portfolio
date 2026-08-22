import type { Project } from '../types'

export const projects: Project[] = [
  {
    id: 'gesture-recognition',
    title: 'Gesture Recognition Using Neural Networks',
    period: "Oct '23 – Nov '23",
    overview:
      'Deep learning model for hand gesture recognition using CNNs and RNNs with TensorFlow and Keras.',
    problem: 'Classify hand gestures from time-series and image-based data.',
    approach:
      'Data preprocessing, model training, and evaluation pipeline for gesture classification.',
    technologies: ['Python', 'TensorFlow', 'Keras', 'CNN', 'RNN'],
    pipeline: [
      'Data',
      'Preprocessing',
      'Feature Representation',
      'CNN/RNN',
      'Training',
      'Evaluation',
      'Prediction',
    ],
    result: 'Gained expertise in time-series data and image-based classification.',
    githubUrl: undefined,
    relevantRoles: ['ai', 'system'],
  },
  {
    id: 'ticket-classification',
    title: 'Automatic Ticket Classification Using NLP',
    period: "Dec '23 – Jan '24",
    overview:
      'NLP model to automatically classify support tickets based on text data.',
    problem: 'Manual ticket categorization is slow and inconsistent.',
    approach:
      'Text preprocessing, feature extraction, and ML model training with Scikit-learn.',
    technologies: ['Python', 'Scikit-learn', 'NLP'],
    pipeline: [
      'Raw Ticket',
      'Text Preprocessing',
      'Feature Extraction',
      'ML Model',
      'Classification',
      'Ticket Category',
    ],
    githubUrl: undefined,
    relevantRoles: ['ai', 'system'],
  },
  {
    id: 'sentiment-recommendation',
    title: 'Sentiment-Based Product Recommendation System',
    period: "Apr '24 – May '24",
    overview:
      'Capstone project using sentiment analysis to personalize product recommendations from customer reviews.',
    approach:
      'NLP and machine learning with Python, Scikit-learn, and TensorFlow to analyze review sentiment.',
    technologies: ['Python', 'Scikit-learn', 'TensorFlow', 'NLP', 'Machine Learning'],
    pipeline: [
      'Customer Review',
      'Sentiment Analysis',
      'Preference Signal',
      'Recommendation',
      'Personalized Product Suggestion',
    ],
    githubUrl: undefined,
    relevantRoles: ['ai', 'system'],
  },
]
