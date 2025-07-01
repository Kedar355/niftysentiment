import { NextResponse } from 'next/server';
import { getAllNifty50Stocks, getTopGainers, getTopLosers, getMostActive, getCacheStats } from '@/lib/stocks';
import { fetchStockNews, getNewsCacheStats } from '@/lib/news';

export async function GET() {
  try {
    // Fetch all required data in parallel
    const [allStocks, topGainers, topLosers, mostActive, marketNews] = await Promise.all([
      getAllNifty50Stocks(),
      getTopGainers(5),
      getTopLosers(5),
      getMostActive(5),
      fetchStockNews()
    ]);

    // Calculate market statistics
    const totalStocks = allStocks.length;
    const gainers = allStocks.filter(stock => stock.change > 0).length;
    const losers = allStocks.filter(stock => stock.change < 0).length;
    const unchanged = totalStocks - gainers - losers;

    // Calculate average change and total market cap
    const avgChange = allStocks.reduce((sum, stock) => sum + stock.changePercent, 0) / totalStocks;
    const totalMarketCap = allStocks.reduce((sum, stock) => sum + (stock.marketCap || 0), 0);
    const totalVolume = allStocks.reduce((sum, stock) => sum + stock.volume, 0);

    // Calculate overall market sentiment
    let marketSentiment: 'positive' | 'negative' | 'neutral';
    let sentimentScore: number;
    let confidence: number;

    // More deterministic sentiment calculation based on actual market data
    const positiveStocks = allStocks.filter(stock => stock.change > 0).length;
    const negativeStocks = allStocks.filter(stock => stock.change < 0).length;

    const positiveRatio = positiveStocks / totalStocks;
    const negativeRatio = negativeStocks / totalStocks;

    // Calculate sentiment based on market performance
    if (avgChange > 0.5 && positiveRatio > 0.6) {
      marketSentiment = 'positive';
      sentimentScore = 7.5 + (avgChange * 0.5); // Base 7.5 + bonus for positive change
      confidence = 0.8 + (positiveRatio * 0.2); // Higher confidence with more positive stocks
    } else if (avgChange < -0.5 && negativeRatio > 0.6) {
      marketSentiment = 'negative';
      sentimentScore = 2.5 - (Math.abs(avgChange) * 0.5); // Base 2.5 - penalty for negative change
      confidence = 0.8 + (negativeRatio * 0.2); // Higher confidence with more negative stocks
    } else {
      marketSentiment = 'neutral';
      sentimentScore = 5.0 + (avgChange * 0.3); // Base 5.0 with small adjustment
      confidence = 0.6 + (Math.abs(avgChange) * 0.2); // Moderate confidence
    }

    // Ensure scores are within bounds
    sentimentScore = Math.max(0, Math.min(10, sentimentScore));
    confidence = Math.max(0.1, Math.min(1, confidence));

    // Calculate sector performance
    const sectorPerformance = new Map<string, { count: number; avgChange: number; totalWeightage: number }>();

    allStocks.forEach(stock => {
      if (stock.sector) {
        const existing = sectorPerformance.get(stock.sector) || { count: 0, avgChange: 0, totalWeightage: 0 };
        existing.count++;
        existing.avgChange += stock.changePercent;
        existing.totalWeightage += stock.weightage || 0;
        sectorPerformance.set(stock.sector, existing);
      }
    });

    // Convert to array and calculate averages
    const sectorAnalysis = Array.from(sectorPerformance.entries()).map(([sector, data]) => ({
      sector,
      stockCount: data.count,
      avgChange: parseFloat((data.avgChange / data.count).toFixed(2)),
      totalWeightage: data.totalWeightage
    })).sort((a, b) => b.totalWeightage - a.totalWeightage);

    // Get news sentiment
    const newsSentiment = marketNews.reduce((acc, news) => {
      if (news.sentiment) {
        acc.totalScore += news.sentiment.score;
        acc.count++;
        if (news.sentiment.label === 'positive') acc.positive++;
        else if (news.sentiment.label === 'negative') acc.negative++;
        else acc.neutral++;
      }
      return acc;
    }, { totalScore: 0, count: 0, positive: 0, negative: 0, neutral: 0 });

    const avgNewsSentiment = newsSentiment.count > 0 ? newsSentiment.totalScore / newsSentiment.count : 5;

    // Get cache statistics
    const stockCacheStats = getCacheStats();
    const newsCacheStats = getNewsCacheStats();

    return NextResponse.json({
      marketOverview: {
        totalStocks,
        gainers,
        losers,
        unchanged,
        avgChange: parseFloat(avgChange.toFixed(2)),
        totalMarketCap: parseFloat((totalMarketCap / 100000).toFixed(2)), // In lakhs
        totalVolume: parseFloat((totalVolume / 1000000).toFixed(2)), // In millions
        marketSentiment: {
          label: marketSentiment,
          score: parseFloat(sentimentScore.toFixed(2)),
          confidence: parseFloat(confidence.toFixed(2))
        }
      },
      topPerformers: {
        gainers: topGainers.map(stock => ({
          symbol: stock.symbol,
          name: stock.name,
          changePercent: stock.changePercent,
          price: stock.price,
          volume: stock.volume
        })),
        losers: topLosers.map(stock => ({
          symbol: stock.symbol,
          name: stock.name,
          changePercent: stock.changePercent,
          price: stock.price,
          volume: stock.volume
        })),
        mostActive: mostActive.map(stock => ({
          symbol: stock.symbol,
          name: stock.name,
          volume: stock.volume,
          changePercent: stock.changePercent,
          price: stock.price
        }))
      },
      sectorAnalysis,
      newsAnalysis: {
        totalNews: marketNews.length,
        avgSentiment: parseFloat(avgNewsSentiment.toFixed(2)),
        sentimentBreakdown: {
          positive: newsSentiment.positive,
          negative: newsSentiment.negative,
          neutral: newsSentiment.neutral
        }
      },
      cacheStats: {
        stocks: stockCacheStats,
        news: newsCacheStats
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching market overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market overview' },
      { status: 500 }
    );
  }
} 