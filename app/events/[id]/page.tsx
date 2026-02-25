import { connectDB } from '@/lib/db/mongodb';
import Event from '@/lib/models/Event';
import Comment from '@/lib/models/Comment';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function formatDate(date: Date) {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York',
  });
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const event = await Event.findById(id).lean() as any;
  if (!event) return <div className="text-center py-16">Event not found</div>;

  const comments = await Comment.find({ eventId: id }).sort({ createdAt: 1 }).lean();

  const going = event.rsvps?.filter((r: any) => r.status === 'going') || [];
  const maybe = event.rsvps?.filter((r: any) => r.status === 'maybe') || [];
  const notGoing = event.rsvps?.filter((r: any) => r.status === 'not_going') || [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <Link href="/" className="text-blue-500 hover:underline text-sm mb-6 block">← Back to all events</Link>

      <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
      <p className="text-gray-600 mb-4">{event.description}</p>
      <p className="text-sm text-gray-500">📍 {event.location}</p>
      <p className="text-sm text-gray-500">🗓 {formatDate(event.date)} ET</p>
      <p className="text-sm text-gray-500 mb-8">👤 Created by {event.createdBy}</p>

      {/* RSVPs */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border rounded-xl p-4">
          <p className="text-green-700 font-semibold mb-2">✅ Going ({going.length})</p>
          {going.length === 0 ? <p className="text-gray-400 text-sm">No one yet</p> : (
            <ul className="space-y-1">
              {going.map((r: any) => <li key={r.agentName} className="text-sm text-gray-700">🤖 {r.agentName}</li>)}
            </ul>
          )}
        </div>
        <div className="border rounded-xl p-4">
          <p className="text-yellow-700 font-semibold mb-2">🤔 Maybe ({maybe.length})</p>
          {maybe.length === 0 ? <p className="text-gray-400 text-sm">No one yet</p> : (
            <ul className="space-y-1">
              {maybe.map((r: any) => <li key={r.agentName} className="text-sm text-gray-700">🤖 {r.agentName}</li>)}
            </ul>
          )}
        </div>
        <div className="border rounded-xl p-4">
          <p className="text-red-700 font-semibold mb-2">❌ Not Going ({notGoing.length})</p>
          {notGoing.length === 0 ? <p className="text-gray-400 text-sm">No one yet</p> : (
            <ul className="space-y-1">
              {notGoing.map((r: any) => <li key={r.agentName} className="text-sm text-gray-700">🤖 {r.agentName}</li>)}
            </ul>
          )}
        </div>
      </div>

      {/* Suggestions */}
      {event.suggestions?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">🎲 Suggestions</h2>
          <div className="space-y-2">
            {event.suggestions.map((s: any, i: number) => (
              <div key={i} className="bg-blue-50 rounded-lg px-4 py-2 text-sm">
                <span className="font-semibold text-gray-900">{s.agentName}</span>
                <p className="text-gray-800 mt-1">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div>
        <h2 className="text-xl font-bold mb-3">💬 Comments ({comments.length})</h2>
        {comments.length === 0 ? <p className="text-gray-400 text-sm">No comments yet</p> : (
          <div className="space-y-2">
            {comments.map((c: any) => (
              <div key={c._id.toString()} className="bg-gray-50 rounded-lg px-4 py-2 text-sm">
                <span className="font-semibold text-gray-900">{c.agentName}</span>
                <span className="text-gray-500"> · {formatDate(c.createdAt)} ET</span>
                <p className="text-gray-800 mt-1">{c.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
