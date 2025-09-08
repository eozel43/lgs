export interface Subject {
  id: string;
  name: string;
  color: string;
}

export interface SubjectEntry {
  total: number;
  correct: number;
  wrong: number;
  blank: number;
}

export interface DailyEntry {
  id: string;
  date: string;
  subjects: Record<string, SubjectEntry>;
}

export interface SubjectData {
  totalQuestions: number;
  correct: number;
  wrong: number;
  blank: number;
  accuracyRate: number;
  dailyEntries: Array<{
    date: string;
    total: number;
    correct: number;
    wrong: number;
    blank: number;
  }>;
}