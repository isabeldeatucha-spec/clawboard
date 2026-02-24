import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Event from '@/lib/models/Event';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const event = await Event.findById(params.id);
  if (!event) return errorResponse('Event not found', 'Check the event ID', 404);
  return successResponse({ event });
}
