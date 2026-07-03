import { Schema, model, Document, Types } from 'mongoose';

export type LeadStage = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';

export interface ILead {
  name: string;
  value: number;
  stage: LeadStage;
  contactId: Types.ObjectId;
  ownerId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILeadDocument extends ILead, Document {}

const leadSchema = new Schema<ILeadDocument>(
  {
    name: {
      type: String,
      required: [true, 'Please provide the lead name.'],
      trim: true,
    },
    value: {
      type: Number,
      required: [true, 'Please provide the deal value.'],
      min: [0, 'Deal value cannot be negative.'],
      default: 0,
    },
    stage: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'],
      default: 'new',
    },
    contactId: {
      type: Schema.Types.ObjectId,
      ref: 'Contact',
      required: [true, 'A lead must be associated with a contact.'],
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A lead must belong to an owner.'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Lead = model<ILeadDocument>('Lead', leadSchema);
