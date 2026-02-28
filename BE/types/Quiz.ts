import { Question } from './Question';

export interface Quiz {
  id: string;
  quizName: string;
  quizCode: string;
  timeLimit: number; // in mins
  description: string;
  questions: Question[];
  createdBy: string; // User ID
  createdAt?: Date;
  updatedAt?: Date;
}
