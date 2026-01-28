
export enum AdpiePhase {
  ASSESSMENT = 'Assessment',
  DIAGNOSIS = 'Diagnosis',
  PLANNING = 'Planning',
  IMPLEMENTATION = 'Implementation',
  EVALUATION = 'Evaluation'
}

export type Difficulty = 'Beginner' | 'Intermediate' | 'Expert';

export interface Question {
  id: string | number;
  chapter: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  subject: string; 
  difficulty: Difficulty;
  adpiePhase: AdpiePhase;
  practicedCount: number;
  lastResult?: 'correct' | 'incorrect';
}

export interface UserStats {
  totalQuestionsAnswered: number;
  correctAnswers: number;
  masteryPoints: number;
  subjectPerformance: Record<string, { correct: number; total: number }>;
  adpiePerformance: Record<string, { correct: number; total: number }>;
  streak: number;
  lastActive: string;
}

export type AppView = 'DASHBOARD' | 'SUBJECT_BANK' | 'PRACTICE' | 'MOCK_TEST' | 'FORGE' | 'ANALYTICS' | 'SETTINGS';

export interface AppState {
  view: AppView;
  currentSubject?: string;
  questions: Question[];
  stats: UserStats;
  darkMode: boolean;
}
