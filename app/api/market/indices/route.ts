import { NextResponse } from 'next/server';
import { indianMarketAPI, economicCalendarAPI } from '@/lib/external-apis';

export async function GET() {
  try {
    const [indices, economicEvents] = await Promise.all([
      indianMarketAPI.getMarketIndices(),
      economicCalendarAPI.getUpcomingEvents()
    ]);

    return NextResponse.json({
      indices,
      economicEvents,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching market indices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market indices' },
      { status: 500 }
    );
  }
}