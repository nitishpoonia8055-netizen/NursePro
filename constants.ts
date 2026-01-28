
import { Question, AdpiePhase } from './types.ts';

export const SUBJECTS = [
  { id: 'fon', name: 'Fundamentals of Nursing', icon: 'BookOpen', color: 'bg-blue-500', gradient: 'from-blue-500 to-indigo-600' },
  { id: 'msn', name: 'Medical-Surgical Nursing', icon: 'Activity', color: 'bg-emerald-500', gradient: 'from-emerald-500 to-teal-600' },
  { id: 'pharma', name: 'Pharmacology', icon: 'Pill', color: 'bg-rose-500', gradient: 'from-rose-500 to-pink-600' },
  { id: 'obg', name: 'OB-GYN & Midwifery', icon: 'Baby', color: 'bg-purple-500', gradient: 'from-purple-500 to-violet-600' },
  { id: 'peds', name: 'Pediatric Nursing', icon: 'HeartPulse', color: 'bg-orange-500', gradient: 'from-orange-500 to-amber-600' },
  { id: 'psych', name: 'Psychiatric Nursing', icon: 'Brain', color: 'bg-indigo-500', gradient: 'from-indigo-500 to-blue-700' },
];

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'init-1',
    chapter: "Cardiovascular System",
    text: "A 65-year-old client with chronic heart failure is prescribed digoxin. Which assessment finding is most important for the nurse to report to the healthcare provider prior to administration?",
    options: [
      "Potassium level of 3.2 mEq/L",
      "Apical pulse of 68 beats per minute",
      "Blood pressure of 132/84 mmHg",
      "Sodium level of 138 mEq/L"
    ],
    correctIndex: 0,
    explanation: "Hypokalemia (potassium < 3.5 mEq/L) significantly increases the risk of digoxin toxicity. The nurse must assess electrolyte levels before administration. An apical pulse of 68 is within normal range for administration (usually >60).",
    subject: 'Medical-Surgical Nursing',
    difficulty: 'Intermediate',
    adpiePhase: AdpiePhase.ASSESSMENT,
    practicedCount: 0
  },
  {
    id: 'init-2',
    chapter: "Respiratory System",
    text: "An adolescent client with acute asthma is experiencing severe wheezing and dyspnea. After administering a nebulized albuterol treatment, which finding indicates the intervention was effective?",
    options: [
      "Increased productive cough",
      "Decreased respiratory rate and ease of breathing",
      "Increased heart rate to 110 bpm",
      "Presence of fine crackles in lung bases"
    ],
    correctIndex: 1,
    explanation: "Albuterol is a bronchodilator. Effectiveness is demonstrated by improved gas exchange, decreased work of breathing, and stabilization of respiratory rate. Tachycardia is a common side effect, not an indicator of therapeutic efficacy.",
    subject: 'Pediatric Nursing',
    difficulty: 'Beginner',
    adpiePhase: AdpiePhase.EVALUATION,
    practicedCount: 0
  }
];
