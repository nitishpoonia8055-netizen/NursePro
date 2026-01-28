
import { Question } from './types';

export const SUBJECTS = [
  { id: 'fon', name: 'Fundamentals of Nursing', icon: 'BookOpen', color: 'bg-indigo-500' },
  { id: 'msn', name: 'Medical-Surgical Nursing', icon: 'Stethoscope', color: 'bg-blue-600' },
  { id: 'pharma', name: 'Pharmacology', icon: 'Pill', color: 'bg-rose-500' },
  { id: 'obg', name: 'OB-GYN & Midwifery', icon: 'Baby', color: 'bg-pink-500' },
  { id: 'peds', name: 'Pediatric Nursing', icon: 'Activity', color: 'bg-orange-500' },
  { id: 'chn', name: 'Community Health', icon: 'Users', color: 'bg-emerald-500' },
  { id: 'psych', name: 'Psychiatric Nursing', icon: 'Brain', color: 'bg-purple-500' },
];

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 1,
    chapter: "Medical-Surgical Nursing",
    text: "A client is admitted with deep vein thrombosis (DVT). Which nursing intervention is the priority according to the implementation phase of the nursing process?",
    options: [
      "Assess for Homans' sign daily",
      "Elevate the affected extremity above the heart level",
      "Encourage the client to ambulate 4 times daily",
      "Apply ice packs to the affected area every 4 hours"
    ],
    correctIndex: 1,
    explanation: "Elevating the extremity promotes venous return and reduces edema. Assessment for Homans' sign is no longer recommended as it may dislodge a clot. Ambulation is usually restricted during the acute phase of DVT, and ice causes vasoconstriction which is counterproductive.",
    subject: 'Medical-Surgical Nursing',
    difficulty: 'Moderate',
    practicedCount: 0
  },
  {
    id: 2,
    chapter: "Pediatric Nursing",
    text: "A 5-year-old child is scheduled for a tonsillectomy. Which assessment finding should the nurse report to the surgeon immediately?",
    options: [
      "Loss of a primary tooth",
      "Pulse rate of 100 beats/min",
      "Hemoglobin of 12.5 g/dL",
      "Crying when separated from parents"
    ],
    correctIndex: 0,
    explanation: "Loose teeth are a significant risk during intubation as they can be aspirated. A pulse of 100 and hemoglobin of 12.5 are normal for a child of this age. Separation anxiety is expected.",
    subject: 'Pediatric Nursing',
    difficulty: 'Moderate',
    practicedCount: 0
  }
];
