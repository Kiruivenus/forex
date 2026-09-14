import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'USER' | 'ADMIN';
  country: string;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  recoveryCodes?: string[];
  status: 'ACTIVE' | 'SUSPENDED' | 'LOCKED';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER', index: true },
    country: { type: String, default: 'Kenya' },
    isVerified: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    recoveryCodes: [{ type: String }],
    status: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'LOCKED'], default: 'ACTIVE', index: true },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
