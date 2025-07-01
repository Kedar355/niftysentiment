import { NextRequest, NextResponse } from 'next/server';
import { getAllNifty50Stocks, getStockHistory } from '@/lib/stocks';
import { analyzeStockSentiment } from '@/lib/sentiment';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const sector = searchParams.get('sector') || 'all';

    // Get all Nifty 50 stocks
    const stocksData = await getAllNifty50Stocks();

    // Apply filters
    let filteredStocks = stocksData;

    if (filter === 'gainers') {
      filteredStocks = stocksData.filter(stock => stock.change > 0);
    } else if (filter === 'losers') {
      filteredStocks = stocksData.filter(stock => stock.change < 0);
    } else if (filter === 'active') {
      filteredStocks = stocksData.sort((a, b) => b.volume - a.volume).slice(0, 20);
    }

    if (sector !== 'all') {
      filteredStocks = filteredStocks.filter(stock => stock.sector === sector);
    }

    // Add enhanced sentiment data based on advanced stock analysis
    const stocksWithSentiment = await Promise.all(
      filteredStocks.map(async (stock) => {
        try {
          // Get price history for momentum calculation
          const history = await getStockHistory(stock.symbol, '5d');
          const priceHistory = history.map(h => h.close);

          // Calculate average volume (if available)
          const avgVolume = history.length > 0
            ? history.reduce((sum, h) => sum + h.volume, 0) / history.length
            : undefined;

          // Analyze stock sentiment using advanced metrics
          const stockSentiment = analyzeStockSentiment(
            stock.price,
            stock.previousClose,
            stock.dayHigh,
            stock.dayLow,
            stock.volume,
            avgVolume,
            priceHistory
          );

          return {
            ...stock,
            sentiment: {
              label: stockSentiment.overallSentiment > 6.5 ? 'positive' :
                stockSentiment.overallSentiment < 3.5 ? 'negative' : 'neutral',
              score: stockSentiment.overallSentiment,
              confidence: stockSentiment.confidence,
              trend: stockSentiment.trend,
              strength: stockSentiment.strength,
              details: {
                priceSentiment: stockSentiment.priceSentiment,
                volumeSentiment: stockSentiment.volumeSentiment,
                volatilitySentiment: stockSentiment.volatilitySentiment,
                momentumSentiment: stockSentiment.momentumSentiment
              }
            }
          };
        } catch (error) {
          console.error(`Error analyzing sentiment for ${stock.symbol}:`, error);
          // Fallback to basic sentiment calculation
          const basicSentiment = {
            label: stock.changePercent > 2 ? 'positive' :
              stock.changePercent < -2 ? 'negative' : 'neutral',
            score: Math.max(0, Math.min(10, 5 + stock.changePercent * 0.5)),
            confidence: 0.6,
            trend: stock.changePercent > 1 ? 'bullish' :
              stock.changePercent < -1 ? 'bearish' : 'sideways',
            strength: Math.abs(stock.changePercent) > 5 ? 'strong' :
              Math.abs(stock.changePercent) > 2 ? 'moderate' : 'weak'
          };

          return {
            ...stock,
            sentiment: basicSentiment
          };
        }
      })
    );

    // Sort by sentiment score if requested
    if (searchParams.get('sort') === 'sentiment') {
      stocksWithSentiment.sort((a, b) => (b.sentiment?.score || 0) - (a.sentiment?.score || 0));
    }

    return NextResponse.json({
      stocks: stocksWithSentiment,
      total: stocksWithSentiment.length,
      filter,
      sector,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching stocks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stocks data' },
      { status: 500 }
    );
  }
}