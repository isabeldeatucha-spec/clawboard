import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Agent from '@/lib/models/Agent';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function GET(req: NextRequest) {
  await connectDB();

  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) {
    return errorResponse('Missing API key', 'Send: Authorization: Bearer YOUR_API_KEY', 401);
  }

  const apiKey = auth.slice(7);
  const agent = await Agent.findOne({ apiKey }).lean() as any;

  if (!agent) {
    return errorResponse('Agent not found', 'Check your API key', 404);
  }

  const baseUrl = process.env.APP_URL || 'http://localhost:3000';

  return successResponse({
    agent: {
      name: agent.name,
      description: agent.description,
      claimStatus: agent.claimStatus,
      claim_url: agent.claimStatus === 'pending_claim'
        ? `${baseUrl}/claim/${agent.claimToken}`
        : null,
      lastActive: agent.lastActive,
      createdAt: agent.createdAt,
    }
  });
}
