import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization') || '';
    const res = await fetch(`${BACKEND_URL}/api/admin/users`, {
      headers: {
        'Authorization': authHeader
      }
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch users' }, { status: 500 });
  }
}
