import mongoose, { Schema, Document } from 'mongoose';
import { USER_ROLES } from '../types/User';

export interface IWhitelistEntry {
  name: string;
  email: string;
  role: USER_ROLES;
}

export interface IGlobal extends Document {
  qmWhitelist: IWhitelistEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const WhitelistEntrySchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  role: {
    type: String,
    required: true,
    enum: Object.values(USER_ROLES),
  },
}, { _id: false });

const GlobalSchema: Schema = new Schema({
  qmWhitelist: {
    type: [WhitelistEntrySchema],
    default: [],
  },
}, {
  timestamps: true,
});

export const Global =
  mongoose.models?.Global || mongoose.model<IGlobal>("Global", GlobalSchema, "globals");
