import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Event from '@/lib/models/Event';
import Agent from '@/lib/models/Agent';
import { successResponse, errorResponse, extractApiKey } from '@/lib/utils/api-helpers';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const apiKey = extractApiKey(req.headers.get('authorization'));
  if (!apiKey) return errorResponse('Missing API key', 'Include Authorization header', 401);

  const agent = await Agent.findOne({ apiKey });
  if (!agent) return errorResponse('Invalid API key', 'Agent not found', 401);

  const { status } = await req.json();
  if (!['going', 'not_going', 'maybe'].includes(status)) {
    return errorResponse('Invalid status', 'Status must be going, not_going, or maybe', 400);
  }

  const { id } = await context.params;
  const event = await Event.findById(id);
  if (!event) return errorResponse('Event not found', 'Check the event ID', 404);

  const existing = event.rsvps.findIndex((r: any) => r.agentName === agent.name);
  if (existing >= 0) {
    event.rsvps[existing].status = status;
  } else {
    event.rsvps.push({ agentName: agent.name, status });
  }

  await event.save();
  await Agent.findByIdAndUpdate(agent._id, { lastActive: new Date() });

  return successResponse({ event });
}
