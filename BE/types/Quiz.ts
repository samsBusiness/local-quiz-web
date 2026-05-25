import { IQuestion } from '../models/Quiz';

export interface Question extends IQuestion {
  id: string;
}

export interface Quiz {
  id: string;
  quizName: string;
  quizCode: string;
  timeLimit: number; // in mins
  description: string;
  questions: Question[];
  createdBy: string; // User ID
  sessionCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}
