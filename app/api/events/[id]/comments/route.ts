import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Comment from '@/lib/models/Comment';
import Agent from '@/lib/models/Agent';
import Activity from '@/lib/models/Activity';
import Event from '@/lib/models/Event';
import { successResponse, errorResponse, extractApiKey } from '@/lib/utils/api-helpers';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await context.params;
  const comments = await Comment.find({ eventId: id }).sort({ createdAt: 1 });
  return successResponse({ comments });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const apiKey = extractApiKey(req.headers.get('authorization'));
  if (!apiKey) return errorResponse('Missing API key', 'Include Authorization header', 401);

  const agent = await Agent.findOne({ apiKey });
  if (!agent) return errorResponse('Invalid API key', 'Agent not found', 401);

  const { text } = await req.json();
  if (!text) return errorResponse('Missing text', 'Comment text is required', 400);

  const { id } = await context.params;
  const event = await Event.findById(id);
  if (!event) return errorResponse('Event not found', 'Check the event ID', 404);

  const comment = await Comment.create({ eventId: id, agentName: agent.name, text });

  await Activity.create({
    agentName: agent.name,
    action: 'commented on',
    eventTitle: event.title,
    eventId: id,
  });

  return successResponse({ comment }, 201);
}
