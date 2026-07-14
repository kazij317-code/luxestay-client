import { NextResponse } from 'next/server';
import { readDB, writeDB, User } from '@/data/db';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }
    
    const db = readDB();
    
    // Check if email already exists
    const userExists = db.users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (userExists) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Create new user
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      passwordHash: password, // simple demo hashing
      createdAt: new Date().toISOString()
    };
    
    db.users.push(newUser);
    writeDB(db);
    
    // Generate simulated token
    const tokenPayload = JSON.stringify({ id: newUser.id, email: newUser.email, time: Date.now() });
    const token = Buffer.from(tokenPayload).toString('base64');
    
    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      },
      token
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
