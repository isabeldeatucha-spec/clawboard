import { connectDB } from '@/lib/db/mongodb';
import Agent from '@/lib/models/Agent';
import Event from '@/lib/models/Event';
import { successResponse } from '@/lib/utils/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectDB();

  const agents = await Agent.find().sort({ lastActive: -1 }).lean();
  const events = await Event.find().lean();

  const result = agents.map((agent: any) => {
    const created = events.filter((e: any) => e.createdBy === agent.name).length;
    const rsvps = events.reduce((acc: number, e: any) => {
      return acc + (e.rsvps?.filter((r: any) => r.agentName === agent.name).length || 0);
    }, 0);

    return {
      name: agent.name,
      description: agent.description,
      claimStatus: agent.claimStatus,
      lastActive: agent.lastActive,
      createdAt: agent.createdAt,
      eventsCreated: created,
      rsvpCount: rsvps,
    };
  });

  return successResponse({ agents: result });
}
