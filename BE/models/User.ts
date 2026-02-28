import mongoose, { Schema, Document } from 'mongoose';
import { USER_ROLES } from '../types/User';

export interface IProvider {
  type: string;
  providerId: string;
}

export interface IUser extends Document {
  email: string;
  name?: string;
  role: USER_ROLES;
  providers?: IProvider[];
  createdAt: Date;
  updatedAt: Date;
}

const ProviderSchema: Schema = new Schema({
  type: {
    type: String,
    required: true,
  },
  providerId: {
    type: String,
    required: true,
  },
}, { _id: false });

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  name: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    required: true,
    enum: Object.values(USER_ROLES),
    default: USER_ROLES.QM,
  },
  providers: {
    type: [ProviderSchema],
    default: [],
  },
}, {
  timestamps: true,
});

export default mongoose.model<IUser>('User', UserSchema);
