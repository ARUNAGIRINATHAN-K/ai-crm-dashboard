import { Schema, model, Document, Types } from 'mongoose';

export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface ITask {
  title: string;
  description: string;
  dueDate: Date;
  status: TaskStatus;
  leadId?: Types.ObjectId;
  ownerId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITaskDocument extends ITask, Document {}

const taskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title for the task.'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    dueDate: {
      type: Date,
      required: [true, 'Please specify a due date for the task.'],
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
      default: null,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A task must belong to an owner.'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Task = model<ITaskDocument>('Task', taskSchema);
