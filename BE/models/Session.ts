import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendee {
  name: string;
  score: string;
}

export interface ISession extends Document {
  quizMaster: mongoose.Types.ObjectId;
  quiz: mongoose.Types.ObjectId;
  date: Date;
  attendees: IAttendee[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AttendeeSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  score: {
    type: String,
    required: true,
  },
}, { _id: false });

const SessionSchema: Schema = new Schema({
  quizMaster: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  quiz: {
    type: Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  attendees: {
    type: [AttendeeSchema],
    default: [],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export const Session =
  mongoose.models?.Session || mongoose.model<ISession>("Session", SessionSchema, "sessions");
