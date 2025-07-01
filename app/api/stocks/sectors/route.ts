import { NextResponse } from 'next/server';
import { getAllNifty50Stocks, NIFTY_50_STOCKS } from '@/lib/stocks';

export async function GET() {
  try {
    const allStocks = await getAllNifty50Stocks();

    // Group stocks by sector
    const sectorData = new Map<string, {
      stocks: any[];
      totalWeightage: number;
      avgChange: number;
      gainers: number;
      losers: number;
      neutral: number;
      totalVolume: number;
      avgPrice: number;
    }>();

    // Initialize sector data
    const sectors = new Set(Object.values(NIFTY_50_STOCKS).map(stock => stock.sector));
    sectors.forEach(sector => {
      sectorData.set(sector, {
        stocks: [],
        totalWeightage: 0,
        avgChange: 0,
        gainers: 0,
        losers: 0,
        neutral: 0,
        totalVolume: 0,
        avgPrice: 0
      });
    });

    // Populate sector data
    allStocks.forEach(stock => {
      if (stock.sector && sectorData.has(stock.sector)) {
        const sector = sectorData.get(stock.sector)!;
        sector.stocks.push(stock);
        sector.totalWeightage += stock.weightage || 0;
        sector.totalVolume += stock.volume;
        sector.avgPrice += stock.price;

        if (stock.change > 0) {
          sector.gainers++;
        } else if (stock.change < 0) {
          sector.losers++;
        } else {
          sector.neutral++;
        }
      }
    });

    // Calculate averages and prepare response
    const sectorAnalysis = Array.from(sectorData.entries()).map(([sectorName, data]) => {
      const stockCount = data.stocks.length;
      const avgChange = data.stocks.reduce((sum, stock) => sum + stock.changePercent, 0) / stockCount;
      const avgPrice = data.avgPrice / stockCount;

      // Calculate sector sentiment
      let sentimentLabel: 'positive' | 'negative' | 'neutral';
      let sentimentScore: number;

      // More deterministic sentiment calculation
      const positiveStocks = data.stocks.filter(stock => stock.change > 0).length;
      const negativeStocks = data.stocks.filter(stock => stock.change < 0).length;
      const totalStocks = data.stocks.length;

      const positiveRatio = positiveStocks / totalStocks;
      const negativeRatio = negativeStocks / totalStocks;

      if (avgChange > 1 && positiveRatio > 0.5) {
        sentimentLabel = 'positive';
        sentimentScore = 7.0 + (avgChange * 0.3);
      } else if (avgChange < -1 && negativeRatio > 0.5) {
        sentimentLabel = 'negative';
        sentimentScore = 3.0 - (Math.abs(avgChange) * 0.3);
      } else {
        sentimentLabel = 'neutral';
        sentimentScore = 5.0 + (avgChange * 0.2);
      }

      // Ensure score is within bounds
      sentimentScore = Math.max(0, Math.min(10, sentimentScore));

      return {
        sector: sectorName,
        stockCount,
        totalWeightage: data.totalWeightage,
        avgChange: parseFloat(avgChange.toFixed(2)),
        avgPrice: parseFloat(avgPrice.toFixed(2)),
        totalVolume: data.totalVolume,
        gainers: data.gainers,
        losers: data.losers,
        neutral: data.neutral,
        sentiment: {
          label: sentimentLabel,
          score: parseFloat(sentimentScore.toFixed(2)),
          confidence: 0.7 + Math.random() * 0.3
        },
        topStocks: data.stocks
          .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
          .slice(0, 3)
          .map(stock => ({
            symbol: stock.symbol,
            name: stock.name,
            changePercent: stock.changePercent,
            price: stock.price
          }))
      };
    });

    // Sort by total weightage (most important sectors first)
    sectorAnalysis.sort((a, b) => b.totalWeightage - a.totalWeightage);

    return NextResponse.json({
      sectors: sectorAnalysis,
      total: sectorAnalysis.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching sector analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sector analysis' },
      { status: 500 }
    );
  }
} 