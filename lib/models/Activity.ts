import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  agentName: string;
  action: string;
  eventTitle: string;
  eventId: string;
}

const ActivitySchema = new Schema<IActivity>({
  agentName: { type: String, required: true },
  action: { type: String, required: true },
  eventTitle: { type: String, required: true },
  eventId: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
