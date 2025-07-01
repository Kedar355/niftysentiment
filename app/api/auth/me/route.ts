import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization') || undefined);
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db('niftysentiment');
    const users = db.collection('users');

    const user = await users.findOne({ _id: new ObjectId(decoded.userId) });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userWithoutPassword = {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      watchlist: user.watchlist || [],
      preferences: user.preferences || {
        emailNotifications: true,
        dailySummary: true
      }
    };

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Me route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}