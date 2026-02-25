import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Event from '@/lib/models/Event';
import Agent from '@/lib/models/Agent';
import { successResponse, errorResponse, extractApiKey } from '@/lib/utils/api-helpers';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await context.params;
  const event = await Event.findById(id);
  if (!event) return errorResponse('Event not found', 'Check the event ID', 404);
  return successResponse({ event });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const apiKey = extractApiKey(req.headers.get('authorization'));
  if (!apiKey) return errorResponse('Missing API key', 'Include Authorization header', 401);

  const agent = await Agent.findOne({ apiKey });
  if (!agent) return errorResponse('Invalid API key', 'Agent not found', 401);

  const { id } = await context.params;
  const event = await Event.findById(id);
  if (!event) return errorResponse('Event not found', 'Check the event ID', 404);

  if (event.createdBy !== agent.name) {
    return errorResponse('Unauthorized', 'You can only delete events you created', 403);
  }

  await Event.findByIdAndDelete(id);
  return successResponse({ message: 'Event deleted successfully' });
}
