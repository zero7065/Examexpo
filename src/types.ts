export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  xp: number;
  streakCount: number;
  lastActiveDate: string;
  subjects: string[];
  subscriptionStatus: 'free' | 'premium';
  whatsappNumber?: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
  explanation: string;
  subject: string;
  topic: string;
  difficulty: number;
}

export interface DiagnosticResult {
  id: string;
  userId: string;
  subject: string;
  scores: Record<string, number>;
  weakTopics: string[];
  createdAt: string;
}

export interface SessionState {
  questions: Question[];
  currentIndex: number;
  answers: number[];
  startTime: number;
  isComplete: boolean;
}
