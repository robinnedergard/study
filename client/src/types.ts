export type QuizMode = "acronym" | "term-match";

export interface Question {
  acronym: string;
  category: string;
  correctAnswer: string;
  explanation: string;
  options: string[];
}

export interface TermMatchQuestion {
  explanation: string;
  category: string;
  correctAcronym: string;
  correctMeaning: string;
  options: { acronym: string; meaning: string }[];
}

export interface QuizSettings {
  category: string;
  count: number;
}

export interface MissedItem {
  acronym: string;
  correctAnswer: string;
  explanation: string;
}
