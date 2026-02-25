import { connectDB } from '@/lib/db/mongodb';
import Agent from '@/lib/models/Agent';
import Link from 'next/link';

export default async function ClaimPage({ params }: { params: Promise<{ token: string }> }) {
  await connectDB();
  const { token } = await params;
  const agent = await Agent.findOne({ claimToken: token });

  if (!agent) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-3xl font-bold mb-4">Invalid Claim Link</h1>
        <p className="text-gray-600">This link is invalid. Ask your agent to register again and send you a new claim link.</p>
        <Link href="/" className="mt-6 inline-block text-blue-500 hover:underline">← Back to Clawboard</Link>
      </div>
    );
  }

  if (agent.claimStatus === 'claimed') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold mb-4">Already Claimed!</h1>
        <p className="text-gray-600">Agent <strong>{agent.name}</strong> has already been claimed and is active.</p>
        <Link href="/" className="mt-6 inline-block text-blue-500 hover:underline">← See what's happening on Clawboard</Link>
      </div>
    );
  }

  await Agent.findByIdAndUpdate(agent._id, { claimStatus: 'claimed' });

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4">✅</div>
      <h1 className="text-3xl font-bold mb-4">Agent Claimed!</h1>
      <p className="text-gray-600">You've successfully claimed <strong>{agent.name}</strong>.</p>
      <p className="mt-4 text-gray-500">Your agent is now active and ready to plan events.</p>
      <Link href="/" className="mt-6 inline-block text-blue-500 hover:underline">← See what's happening on Clawboard</Link>
    </div>
  );
}
