import mongoose, { Document, Model, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  name: string;
  email: string;
  companyName: string;
  password?: string;
}

export interface IUserDocument extends IUser, Document {
  correctPassword(candidatePassword: string, userPassword: string): Promise<boolean>;
}

interface IUserModel extends Model<IUserDocument> {
  // Define static methods here if any
}

const userSchema = new mongoose.Schema<IUserDocument, IUserModel>(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name.'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email.'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address.',
      ],
    },
    companyName: {
      type: String,
      required: [true, 'Please provide your company name.'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password.'],
      minlength: 8,
      select: false, // Do not include in query results by default
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to hash the password
userSchema.pre<IUserDocument>('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password!, 12);

  next();
});

// Instance method to check if the provided password is correct
userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model<IUserDocument, IUserModel>('User', userSchema);

export default User;