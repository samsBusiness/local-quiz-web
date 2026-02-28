import { User } from './User';
import { Quiz } from './Quiz';

export interface Attendee {
  name: string;
  score: string;
}

export interface Session {
  id: string;
  quizMaster: User;
  quiz: Quiz;
  date: Date;
  attendees: Attendee[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
