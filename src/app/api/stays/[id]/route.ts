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

// GET single stay details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = readDB();
    const stay = db.stays.find(s => s.id === id);
    
    if (!stay) {
      return NextResponse.json({ success: false, error: 'Stay not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: stay });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to retrieve stay details' }, { status: 500 });
  }
}

// DELETE a stay listing
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    const db = readDB();
    const stayIndex = db.stays.findIndex(s => s.id === id);
    
    if (stayIndex === -1) {
      return NextResponse.json({ success: false, error: 'Stay not found' }, { status: 404 });
    }
    
    const stay = db.stays[stayIndex];
    
    // Ensure user owns this listing
    if (stay.hostId !== user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden: You do not own this listing' }, { status: 403 });
    }
    
    db.stays.splice(stayIndex, 1);
    writeDB(db);
    
    return NextResponse.json({ success: true, message: 'Stay deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
