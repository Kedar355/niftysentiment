import { NextRequest, NextResponse } from 'next/server';
import { stockAnalytics } from '@/lib/advanced-analytics';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function POST(request: NextRequest) {
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

    const { holdings } = await request.json();

    if (!holdings || !Array.isArray(holdings)) {
      return NextResponse.json(
        { error: 'Invalid holdings data' },
        { status: 400 }
      );
    }

    const optimization = await stockAnalytics.getPortfolioOptimization(holdings);

    // Get correlations for the portfolio stocks
    const symbols = holdings.map(h => h.symbol);
    const correlations = await stockAnalytics.getStockCorrelations(symbols);

    return NextResponse.json({
      optimization,
      correlations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error optimizing portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to optimize portfolio' },
      { status: 500 }
    );
  }
}