import { NextResponse } from 'next/server';
import { readDB, writeDB, Review } from '@/data/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { author, rating, comment } = body;
    
    if (!author || !rating || !comment) {
      return NextResponse.json({ success: false, error: 'Author, rating, and comment are required' }, { status: 400 });
    }
    
    const db = readDB();
    const stay = db.stays.find(s => s.id === id);
    
    if (!stay) {
      return NextResponse.json({ success: false, error: 'Stay not found' }, { status: 404 });
    }
    
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      author,
      rating: parseFloat(rating),
      comment,
      date: new Date().toISOString().split('T')[0]
    };
    
    stay.reviews.push(newReview);
    
    // Recalculate average rating
    const totalRating = stay.reviews.reduce((sum, r) => sum + r.rating, 0);
    stay.rating = parseFloat((totalRating / stay.reviews.length).toFixed(2));
    
    writeDB(db);
    
    return NextResponse.json({ success: true, data: stay });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
