import type { Project } from '../types'

export const projects: Project[] = [
  {
    id: 'gesture-recognition',
    title: 'Gesture Recognition Using Neural Networks',
    category: 'Machine Learning · Deep Learning',
    period: "Oct '23 – Nov '23",
    overview:
      'Developed a deep learning system for recognizing hand gestures using convolutional and recurrent neural networks.',
    problem: 'Classify hand gestures from time-series and image-based data.',
    approach:
      'Built data preprocessing, model training, and evaluation workflows for image and sequential data.',
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
    result:
      'Explored how CNN and RNN architectures can be combined with appropriate data representations for gesture recognition.',
    futureImprovements:
      'Add real-time webcam inference and expand the gesture vocabulary with transfer learning.',
    githubUrl: undefined,
    relevantRoles: ['ai', 'system'],
  },
  {
    id: 'ticket-classification',
    title: 'Automatic Ticket Classification',
    category: 'NLP · Machine Learning',
    period: "Dec '23 – Jan '24",
    overview:
      'Built an NLP-based classification system to automatically categorize support tickets from their textual content.',
    problem: 'Manual ticket categorization is slow and inconsistent.',
    approach:
      'Applied text preprocessing, feature extraction, and supervised machine learning to transform unstructured support-ticket text into useful categories.',
    technologies: ['Python', 'Scikit-learn', 'NLP', 'Text Classification'],
    pipeline: [
      'Raw Ticket',
      'Text Preprocessing',
      'Feature Extraction',
      'ML Model',
      'Classification',
      'Ticket Category',
    ],
    result:
      'Demonstrated how NLP can automate repetitive ticket categorization and improve support workflow efficiency.',
    githubUrl: undefined,
    relevantRoles: ['ai', 'system'],
  },
  {
    id: 'sentiment-recommendation',
    title: 'Sentiment-Based Product Recommendation System',
    category: 'NLP · Recommendation Systems',
    period: "Apr '24 – May '24",
    overview:
      'Built a recommendation system that incorporates sentiment extracted from customer reviews to make product recommendations more personalized.',
    approach:
      'Developed sentiment-analysis and recommendation workflows using machine learning and NLP techniques.',
    technologies: ['Python', 'Scikit-learn', 'TensorFlow', 'NLP', 'Sentiment Analysis'],
    pipeline: [
      'Customer Review',
      'Sentiment Analysis',
      'Preference Signal',
      'Recommendation',
      'Personalized Product Suggestion',
    ],
    result: 'Explored how customer sentiment can become an additional signal for improving recommendation relevance.',
    githubUrl: undefined,
    relevantRoles: ['ai', 'system'],
  },
]
