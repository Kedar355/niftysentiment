import { NextRequest, NextResponse } from 'next/server';
import { stockAnalytics } from '@/lib/advanced-analytics';
import { alphaVantageAPI, finnhubAPI, indianMarketAPI } from '@/lib/external-apis';

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const symbol = params.symbol;

    // Fetch comprehensive analysis data in parallel
    const [
      technicalPatterns,
      fundamentalAnalysis,
      technicalIndicators,
      companyProfile,
      earnings,
      advancedStockData
    ] = await Promise.all([
      stockAnalytics.detectTechnicalPatterns(symbol),
      stockAnalytics.getFundamentalAnalysis(symbol),
      alphaVantageAPI.getTechnicalIndicators(symbol),
      finnhubAPI.getCompanyProfile(symbol),
      finnhubAPI.getEarnings(symbol),
      indianMarketAPI.getAdvancedStockData(symbol)
    ]);

    const analysis = {
      symbol,
      technicalPatterns,
      fundamentalAnalysis,
      technicalIndicators,
      companyProfile,
      earnings,
      advancedData: advancedStockData,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error fetching stock analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock analysis' },
      { status: 500 }
    );
  }
}