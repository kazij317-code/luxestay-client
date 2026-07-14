import { NextResponse } from 'next/server';
import { readDB, writeDB, Stay } from '@/data/db';

// Verify token helper
function getAuthenticatedUser(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.split(' ')[1];
    const decodedPayload = Buffer.from(token, 'base64').toString('utf-8');
    const payload = JSON.parse(decodedPayload);
    
    // Check if token is expired (e.g. within 24 hours, but for demo we just verify schema)
    if (payload && payload.id && payload.email) {
      const db = readDB();
      const user = db.users.find(u => u.id === payload.id);
      return user || null;
    }
    return null;
  } catch (e) {
    return null;
  }
}

// GET all stays with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '10000');
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const sort = searchParams.get('sort') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '8');
    
    const db = readDB();
    let stays = [...db.stays];
    
    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      stays = stays.filter(s => 
        s.title.toLowerCase().includes(searchLower) ||
        s.location.toLowerCase().includes(searchLower) ||
        s.shortDescription.toLowerCase().includes(searchLower)
      );
    }
    
    if (category && category !== 'All') {
      stays = stays.filter(s => s.category.toLowerCase() === category.toLowerCase());
    }
    
    stays = stays.filter(s => s.price >= minPrice && s.price <= maxPrice);
    stays = stays.filter(s => s.rating >= minRating);
    
    // Apply sorting
    if (sort === 'price_asc') {
      stays.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      stays.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating_desc') {
      stays.sort((a, b) => b.rating - a.rating);
    }
    
    // Pagination
    const totalCount = stays.length;
    const startIndex = (page - 1) * limit;
    const paginatedStays = stays.slice(startIndex, startIndex + limit);
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      success: true,
      data: paginatedStays,
      totalCount,
      page,
      totalPages
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch stays' }, { status: 500 });
  }
}

// POST create stay
export async function POST(request: Request) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const {
      title,
      shortDescription,
      fullDescription,
      price,
      location,
      category,
      image,
      beds,
      guests,
      bathrooms,
      wifi,
      pool,
      kitchen
    } = body;
    
    if (!title || !shortDescription || !fullDescription || !price || !location || !category) {
      return NextResponse.json({ success: false, error: 'Required fields missing' }, { status: 400 });
    }
    
    const db = readDB();
    
    // Fallback image if none provided
    const mainImage = image || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80";
    
    const newStay: Stay = {
      id: `stay-${Date.now()}`,
      title,
      shortDescription,
      fullDescription,
      price: Number(price),
      rating: 5.0, // initial default rating for a new listing
      location,
      category,
      date: "Available Now",
      image: mainImage,
      images: [mainImage],
      beds: Number(beds || 1),
      guests: Number(guests || 1),
      bathrooms: Number(bathrooms || 1),
      wifi: Boolean(wifi),
      pool: Boolean(pool),
      kitchen: Boolean(kitchen),
      hostId: user.id,
      hostName: user.name,
      reviews: []
    };
    
    db.stays.unshift(newStay); // add to top
    writeDB(db);
    
    return NextResponse.json({ success: true, data: newStay });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
