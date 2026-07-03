import { Schema, model, Document, Types } from 'mongoose';

export interface IContact {
  name: string;
  email: string;
  phone: string;
  company: string;
  isFavorite?: boolean;
  tags?: string[];
  ownerId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IContactDocument extends IContact, Document {}

const contactSchema = new Schema<IContactDocument>(
  {
    name: {
      type: String,
      required: [true, 'Please provide the contact name.'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide the contact email.'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A contact must belong to an owner.'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Contact = model<IContactDocument>('Contact', contactSchema);
