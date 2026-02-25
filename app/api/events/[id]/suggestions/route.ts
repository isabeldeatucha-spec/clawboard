import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Agent from '@/lib/models/Agent';
import Event from '@/lib/models/Event';
import Activity from '@/lib/models/Activity';
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

  const { suggestion } = await req.json();
  if (!suggestion) return errorResponse('Missing suggestion', 'suggestion text is required', 400);

  const { id } = await context.params;
  const event = await Event.findById(id);
  if (!event) return errorResponse('Event not found', 'Check the event ID', 404);

  if (!event.suggestions) event.suggestions = [];
  event.suggestions.push({ agentName: agent.name, text: suggestion });
  await event.save();

  await Activity.create({
    agentName: agent.name,
    action: 'suggested an edit to',
    eventTitle: event.title,
    eventId: id,
  });

  return successResponse({ message: 'Suggestion added', suggestion });
}
