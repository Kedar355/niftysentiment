import { NextRequest, NextResponse } from 'next/server';
import { fetchStockNews } from '@/lib/news';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '100');
    const page = parseInt(searchParams.get('page') || '1');
    const sortBy = searchParams.get('sortBy') || 'publishedAt';

    // Fetch news with enhanced parameters
    const allNews = await fetchStockNews(symbol || undefined);

    // Apply filters
    let filteredNews = allNews;

    // Filter by category if specified
    if (category && category !== 'all') {
      filteredNews = filteredNews.filter(item =>
        item.category === category ||
        item.tags?.includes(category.toLowerCase())
      );
    }

    // Sort news
    switch (sortBy) {
      case 'sentiment':
        filteredNews.sort((a, b) => (b.sentiment?.score || 0) - (a.sentiment?.score || 0));
        break;
      case 'relevance':
        filteredNews.sort((a, b) => {
          const aRelevance = (a.stockSymbols?.length || 0) + (a.tags?.length || 0);
          const bRelevance = (b.stockSymbols?.length || 0) + (b.tags?.length || 0);
          return bRelevance - aRelevance;
        });
        break;
      case 'publishedAt':
      default:
        filteredNews.sort((a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
        break;
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNews = filteredNews.slice(startIndex, endIndex);

    // Calculate sentiment statistics
    const sentimentStats = {
      positive: filteredNews.filter(item => item.sentiment?.label === 'positive').length,
      negative: filteredNews.filter(item => item.sentiment?.label === 'negative').length,
      neutral: filteredNews.filter(item => item.sentiment?.label === 'neutral').length,
      averageScore: filteredNews.reduce((sum, item) => sum + (item.sentiment?.score || 0), 0) / filteredNews.length
    };

    // Get unique categories and sources
    const categories = Array.from(new Set(filteredNews.map(item => item.category).filter(Boolean)));
    const sources = Array.from(new Set(filteredNews.map(item => item.source)));

    return NextResponse.json({
      news: paginatedNews,
      pagination: {
        page,
        limit,
        total: filteredNews.length,
        totalPages: Math.ceil(filteredNews.length / limit),
        hasNext: endIndex < filteredNews.length,
        hasPrev: page > 1
      },
      filters: {
        symbol: symbol || null,
        category: category || null,
        sortBy
      },
      statistics: {
        sentiment: sentimentStats,
        categories,
        sources,
        totalArticles: filteredNews.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news data' },
      { status: 500 }
    );
  }
}