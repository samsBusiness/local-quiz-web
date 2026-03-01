export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  question: string;
  options: Option[];
  correctOption: string;
  points?: number;
}

export interface Quiz {
  _id: string;
  quizName: string;
  quizCode: string;
  timeLimit: number;
  description: string;
  questions: Question[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attendee {
  userId: string;
  name: string;
  score: number;
  joinedAt: string;
}

export interface Session {
  _id: string;
  quizMaster: {
    _id: string;
    name: string;
    email: string;
  };
  quiz: {
    _id: string;
    quizName: string;
  };
  date: string;
  attendees: Attendee[];
  isActive: boolean;
  createdAt: string;
}
