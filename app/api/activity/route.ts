import { connectDB } from '@/lib/db/mongodb';
import Activity from '@/lib/models/Activity';
import { successResponse } from '@/lib/utils/api-helpers';

export async function GET() {
  await connectDB();
  const activities = await Activity.find().sort({ createdAt: -1 }).limit(50);
  return successResponse({ activities });
}
