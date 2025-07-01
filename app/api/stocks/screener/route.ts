import { NextRequest, NextResponse } from 'next/server';
import { stockAnalytics, AdvancedFilters } from '@/lib/advanced-analytics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      filters = {},
      sortBy = 'changePercent',
      sortOrder = 'desc',
      page = 1,
      pageSize = 20
    } = body;

    const result = await stockAnalytics.screenStocks(
      filters as AdvancedFilters,
      sortBy,
      sortOrder,
      page,
      pageSize
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in stock screener:', error);
    return NextResponse.json(
      { error: 'Failed to screen stocks' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const filters: AdvancedFilters = {};
    
    // Price range
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice || maxPrice) {
      filters.priceRange = {
        min: minPrice ? parseFloat(minPrice) : 0,
        max: maxPrice ? parseFloat(maxPrice) : Infinity
      };
    }

    // Market cap range
    const minMarketCap = searchParams.get('minMarketCap');
    const maxMarketCap = searchParams.get('maxMarketCap');
    if (minMarketCap || maxMarketCap) {
      filters.marketCapRange = {
        min: minMarketCap ? parseFloat(minMarketCap) : 0,
        max: maxMarketCap ? parseFloat(maxMarketCap) : Infinity
      };
    }

    // Sectors
    const sectors = searchParams.get('sectors');
    if (sectors) {
      filters.sectors = sectors.split(',');
    }

    // Sentiment
    const sentiment = searchParams.get('sentiment');
    if (sentiment) {
      filters.sentiment = sentiment.split(',') as ('positive' | 'negative' | 'neutral')[];
    }

    const sortBy = searchParams.get('sortBy') || 'changePercent';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const result = await stockAnalytics.screenStocks(
      filters,
      sortBy,
      sortOrder,
      page,
      pageSize
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in stock screener:', error);
    return NextResponse.json(
      { error: 'Failed to screen stocks' },
      { status: 500 }
    );
  }
}