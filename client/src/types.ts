export interface Question {
  acronym: string;
  category: string;
  correctAnswer: string;
  explanation: string;
  options: string[];
}

export interface QuizSettings {
  category: string;
  count: number;
}

export interface MissedQuestion extends Question {
  userAnswer: string;
}
