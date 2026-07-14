import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/data/db';

function getAuthenticatedUser(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.split(' ')[1];
    const decodedPayload = Buffer.from(token, 'base64').toString('utf-8');
    const payload = JSON.parse(decodedPayload);
    if (payload && payload.id && payload.email) {
      const db = readDB();
      return db.users.find(u => u.id === payload.id) || null;
    }
    return null;
  } catch (e) {
    return null;
  }
}

// GET authenticated user's watchlist
export async function GET(request: Request) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const db = readDB();
    const dbUser = db.users.find(u => u.id === user.id);
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, watchlist: dbUser.watchlist || [] });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// POST toggle a stay in the authenticated user's watchlist
export async function POST(request: Request) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { stayId } = await request.json();
    if (!stayId) {
      return NextResponse.json({ success: false, error: 'stayId is required' }, { status: 400 });
    }

    const db = readDB();
    const dbUser = db.users.find(u => u.id === user.id);
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (!dbUser.watchlist) {
      dbUser.watchlist = [];
    }

    const isWatchlisted = dbUser.watchlist.includes(stayId);
    if (isWatchlisted) {
      dbUser.watchlist = dbUser.watchlist.filter(id => id !== stayId);
    } else {
      dbUser.watchlist.push(stayId);
    }

    writeDB(db);

    return NextResponse.json({
      success: true,
      watchlist: dbUser.watchlist,
      isWatchlisted: !isWatchlisted
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
