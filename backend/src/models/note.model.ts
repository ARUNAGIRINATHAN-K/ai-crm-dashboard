import { Schema, model, Document, Types } from 'mongoose';

export interface INote {
  content: string;
  leadId: Types.ObjectId;
  ownerId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INoteDocument extends INote, Document {}

const noteSchema = new Schema<INoteDocument>(
  {
    content: {
      type: String,
      required: [true, 'Please provide the note content.'],
      trim: true,
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'A note must belong to a lead.'],
      index: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A note must belong to an owner.'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Note = model<INoteDocument>('Note', noteSchema);
