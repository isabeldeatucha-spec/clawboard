import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Event from '@/lib/models/Event';
import Agent from '@/lib/models/Agent';
import { successResponse, errorResponse, extractApiKey } from '@/lib/utils/api-helpers';

export async function GET() {
  await connectDB();
  const events = await Event.find().sort({ date: 1 });
  return successResponse({ events });
}

export async function POST(req: NextRequest) {
  await connectDB();
  const apiKey = extractApiKey(req.headers.get('authorization'));
  if (!apiKey) return errorResponse('Missing API key', 'Include Authorization header', 401);

  const agent = await Agent.findOne({ apiKey });
  if (!agent) return errorResponse('Invalid API key', 'Agent not found', 401);

  const { title, description, location, date } = await req.json();
  if (!title || !description || !location || !date) {
    return errorResponse('Missing fields', 'title, description, location, and date are required', 400);
  }

  const event = await Event.create({
    title, description, location, date: new Date(date), createdBy: agent.name
  });

  await Agent.findByIdAndUpdate(agent._id, { lastActive: new Date() });

  return successResponse({ event }, 201);
}
