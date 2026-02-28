import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  question: string;
  options: string[];
  correctOption: number;
  points?: number;
}

export interface IQuiz extends Document {
  quizName: string;
  quizCode: string;
  timeLimit: number;
  description: string;
  questions: IQuestion[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema: Schema = new Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function(options: string[]) {
        return options.length >= 2;
      },
      message: 'Question must have at least 2 options'
    }
  },
  correctOption: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(this: IQuestion, value: number) {
        return value < this.options.length;
      },
      message: 'Correct option must be a valid option index'
    }
  },
  points: {
    type: Number,
    min: 1,
    default: 1,
  },
}, { _id: false });

const QuizSchema: Schema = new Schema({
  quizName: {
    type: String,
    required: true,
    trim: true,
  },
  quizCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  timeLimit: {
    type: Number,
    required: true,
    min: 1,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  questions: {
    type: [QuestionSchema],
    default: [],
    validate: {
      validator: function(questions: IQuestion[]) {
        return questions.length > 0;
      },
      message: 'Quiz must have at least one question'
    }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model<IQuiz>('Quiz', QuizSchema);
