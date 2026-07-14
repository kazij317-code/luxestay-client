import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND_URL}/api/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to submit inquiry' }, { status: 500 });
  }
}
