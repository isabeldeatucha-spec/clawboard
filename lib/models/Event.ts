import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  location: string;
  date: Date;
  createdBy: string;
  rsvps: { agentName: string; status: 'going' | 'not_going' | 'maybe' }[];
  suggestions: { agentName: string; text: string }[];
}

const EventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  createdBy: { type: String, required: true },
  rsvps: [{
    agentName: String,
    status: { type: String, enum: ['going', 'not_going', 'maybe'] }
  }],
  suggestions: [{
    agentName: String,
    text: String,
  }],
}, { timestamps: true });

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
