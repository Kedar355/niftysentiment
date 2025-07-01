import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { hashPassword, generateToken } from '@/lib/auth';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('niftysentiment');
    const users = db.collection('users');

    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const newUser = {
      name,
      email,
      password: hashedPassword,
      watchlist: [],
      preferences: {
        emailNotifications: true,
        dailySummary: true
      },
      createdAt: new Date()
    };

    const result = await users.insertOne(newUser);
    const token = generateToken({ _id: result.insertedId.toString(), email });

    const userWithoutPassword = {
      _id: result.insertedId.toString(),
      email: newUser.email,
      name: newUser.name,
      watchlist: newUser.watchlist,
      preferences: newUser.preferences
    };

    return NextResponse.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}