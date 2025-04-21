import mongoose, { Document, Schema } from 'mongoose';

// User Interface
export interface IUser extends Document {
  username: string;
  address: string;
  profileImage?: string;
  role: 'user' | 'admin';
}

// User Schema
const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    address: { type: String, required: true, unique: true },
    profileImage: { type: String },
    role: { 
      type: String, 
      enum: ['user', 'admin'], 
      default: 'user' 
    }
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema); 