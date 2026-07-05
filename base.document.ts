import { Document, Types } from 'mongoose';

/**
 * Base interface for all Mongoose documents that are multi-tenant.
 * Ensures every document has an ownerId.
 */
export interface IBaseDocument extends Document {
  ownerId: Types.ObjectId;
}