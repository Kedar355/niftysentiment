import { NextResponse } from 'next/server';
import { getMultipleStocksData, INDIAN_STOCKS } from '@/lib/stocks';

export async function GET() {
  try {
    // Get popular stocks data
    const popularStocks = ['TCS', 'RELIANCE', 'INFY', 'HDFC', 'ICICI', 'WIPRO', 'LT', 'SBIN'];
    const stocksData = await getMultipleStocksData(popularStocks);

    // Add mock sentiment data
    const stocksWithSentiment = stocksData.map(stock => ({
      ...stock,
      sentiment: {
        label: Math.random() > 0.6 ? 'positive' : Math.random() > 0.3 ? 'negative' : 'neutral',
        score: Math.random() * 10,
        confidence: 0.6 + Math.random() * 0.4
      }
    }));

    return NextResponse.json(stocksWithSentiment);
  } catch (error) {
    console.error('Error fetching popular stocks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stocks data' },
      { status: 500 }
    );
  }
}