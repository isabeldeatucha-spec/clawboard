import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  eventId: string;
  agentName: string;
  text: string;
}

const CommentSchema = new Schema<IComment>({
  eventId: { type: String, required: true },
  agentName: { type: String, required: true },
  text: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);
