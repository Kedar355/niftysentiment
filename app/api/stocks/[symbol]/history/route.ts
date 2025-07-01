import { NextRequest, NextResponse } from 'next/server';
import { getStockHistory } from '@/lib/stocks';

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '1mo';

    const historyData = await getStockHistory(params.symbol, period);

    return NextResponse.json(historyData);
  } catch (error) {
    console.error('Error fetching stock history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock history' },
      { status: 500 }
    );
  }
}