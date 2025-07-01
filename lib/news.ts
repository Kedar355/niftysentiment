import { analyzeSentiment } from './sentiment';

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
  category?: string;
  sentiment?: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
    confidence: number;
  };
  tags?: string[];
  stockSymbols?: string[];
}

// Cache for news data
const newsCache = new Map<string, { data: NewsItem[]; timestamp: number }>();
const NEWS_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Real Indian financial news sources
const INDIAN_NEWS_SOURCES = [
  'Economic Times',
  'Business Standard',
  'LiveMint',
  'MoneyControl',
  'NDTV Business',
  'CNBC TV18',
  'Zee Business',
  'Financial Express',
  'The Hindu BusinessLine',
  'Financial Express Online'
];

// Nifty 50 stock keywords for better news filtering
const NIFTY_50_KEYWORDS = {
  'RELIANCE': ['reliance', 'ril', 'reliance industries', 'mukesh ambani'],
  'TCS': ['tcs', 'tata consultancy services', 'tata consultancy'],
  'HDFCBANK': ['hdfc bank', 'hdfc', 'housing development finance'],
  'ICICIBANK': ['icici bank', 'icici'],
  'INFY': ['infosys', 'infy'],
  'ITC': ['itc', 'itc ltd'],
  'SBIN': ['sbi', 'state bank of india', 'state bank'],
  'BHARTIARTL': ['bharti airtel', 'airtel', 'bharti'],
  'KOTAKBANK': ['kotak bank', 'kotak mahindra'],
  'AXISBANK': ['axis bank'],
  'ASIANPAINT': ['asian paints', 'asian paint'],
  'MARUTI': ['maruti suzuki', 'maruti'],
  'HINDUNILVR': ['hindustan unilever', 'hul', 'hindustan unilever ltd'],
  'ULTRACEMCO': ['ultratech cement', 'ultratech'],
  'TITAN': ['titan company', 'titan'],
  'WIPRO': ['wipro'],
  'BAJFINANCE': ['bajaj finance'],
  'NESTLEIND': ['nestle india', 'nestle'],
  'POWERGRID': ['power grid', 'powergrid'],
  'NTPC': ['ntpc'],
  'TATASTEEL': ['tata steel'],
  'HCLTECH': ['hcl technologies', 'hcl tech'],
  'BAJAJFINSV': ['bajaj finserv'],
  'SUNPHARMA': ['sun pharmaceutical', 'sun pharma'],
  'TECHM': ['tech mahindra'],
  'JSWSTEEL': ['jsw steel'],
  'ONGC': ['ongc', 'oil and natural gas'],
  'COALINDIA': ['coal india'],
  'DRREDDY': ['dr reddy', 'dr reddys'],
  'HINDALCO': ['hindalco'],
  'TATAMOTORS': ['tata motors'],
  'BRITANNIA': ['britannia'],
  'EICHERMOT': ['eicher motors', 'eicher'],
  'SHREECEM': ['shree cement'],
  'ADANIENT': ['adani enterprises', 'adani'],
  'ADANIPORTS': ['adani ports'],
  'HEROMOTOCO': ['hero motocorp', 'hero'],
  'INDUSINDBK': ['indusind bank'],
  'SBILIFE': ['sbi life', 'sbi life insurance'],
  'HDFCLIFE': ['hdfc life', 'hdfc life insurance'],
  'ICICIPRULI': ['icici prudential', 'icici pru'],
  'IOC': ['indian oil', 'ioc'],
  'BPCL': ['bharat petroleum', 'bpcl'],
  'M&M': ['mahindra', 'mahindra & mahindra'],
  'LT': ['l&t', 'larsen & toubro', 'larsen and toubro'],
  'IDEA': ['vodafone idea', 'idea cellular'],
  'LTIM': ['l&t technology', 'ltim'],
  'PERSISTENT': ['persistent systems']
};

// Generate comprehensive dummy news data
const generateDummyNews = (symbol?: string): NewsItem[] => {
  const now = new Date();
  const newsItems: NewsItem[] = [];

  // Market-wide news (when no specific symbol)
  if (!symbol) {
    const marketNews = [
      {
        title: "Nifty 50 Surges to New Highs Amid Strong Corporate Earnings",
        description: "The Nifty 50 index reached new record levels today, driven by strong quarterly results from major companies. Banking and IT sectors led the rally with significant gains.",
        category: "market",
        sentiment: { score: 7.5, label: 'positive' as const, confidence: 0.8 }
      },
      {
        title: "RBI Maintains Repo Rate at 6.5% in Latest Policy Meeting",
        description: "The Reserve Bank of India kept the repo rate unchanged at 6.5% in its latest monetary policy committee meeting, signaling stability in interest rates.",
        category: "policy",
        sentiment: { score: 6.0, label: 'positive' as const, confidence: 0.7 }
      },
      {
        title: "Indian Economy Shows Strong Growth Momentum in Q3",
        description: "India's GDP growth for the third quarter exceeded expectations, indicating robust economic recovery and positive outlook for the financial markets.",
        category: "economy",
        sentiment: { score: 8.0, label: 'positive' as const, confidence: 0.9 }
      },
      {
        title: "Foreign Investors Continue to Pour Money into Indian Markets",
        description: "Foreign institutional investors (FIIs) have been net buyers in Indian equity markets for the third consecutive month, showing confidence in India's growth story.",
        category: "investment",
        sentiment: { score: 7.0, label: 'positive' as const, confidence: 0.8 }
      },
      {
        title: "Sensex Crosses 75,000 Mark for the First Time",
        description: "The BSE Sensex achieved a historic milestone by crossing the 75,000 mark, reflecting strong investor confidence and positive market sentiment.",
        category: "market",
        sentiment: { score: 8.5, label: 'positive' as const, confidence: 0.9 }
      },
      {
        title: "Indian Rupee Strengthens Against US Dollar",
        description: "The Indian rupee gained strength against the US dollar, supported by strong foreign inflows and positive economic indicators.",
        category: "currency",
        sentiment: { score: 6.5, label: 'positive' as const, confidence: 0.7 }
      },
      {
        title: "SEBI Introduces New Regulations for Better Market Transparency",
        description: "The Securities and Exchange Board of India announced new regulations aimed at improving market transparency and protecting investor interests.",
        category: "regulation",
        sentiment: { score: 5.5, label: 'neutral' as const, confidence: 0.6 }
      },
      {
        title: "Indian Banking Sector Shows Strong Recovery Post-Pandemic",
        description: "Major Indian banks reported improved asset quality and strong credit growth, indicating a robust recovery in the banking sector.",
        category: "banking",
        sentiment: { score: 7.0, label: 'positive' as const, confidence: 0.8 }
      },
      {
        title: "IT Sector Continues to Drive Market Gains",
        description: "Information technology companies led the market rally with strong quarterly performances and positive guidance for future growth.",
        category: "technology",
        sentiment: { score: 7.5, label: 'positive' as const, confidence: 0.8 }
      },
      {
        title: "Oil Prices Stabilize, Positive for Indian Economy",
        description: "Global oil prices have stabilized at comfortable levels, providing relief to India's import bill and supporting economic growth.",
        category: "commodities",
        sentiment: { score: 6.0, label: 'positive' as const, confidence: 0.7 }
      }
    ];

    marketNews.forEach((news, index) => {
      newsItems.push({
        id: `market_news_${Date.now()}_${index}`,
        title: news.title,
        description: news.description,
        url: `https://example.com/news/${index}`,
        source: INDIAN_NEWS_SOURCES[index % INDIAN_NEWS_SOURCES.length],
        publishedAt: new Date(now.getTime() - (index * 2 * 60 * 60 * 1000)).toISOString(),
        category: news.category,
        sentiment: news.sentiment,
        tags: ['nifty', 'sensex', 'indian market', 'stocks'],
        stockSymbols: []
      });
    });
  } else {
    // Stock-specific news
    const stockKeywords = NIFTY_50_KEYWORDS[symbol as keyof typeof NIFTY_50_KEYWORDS] || [symbol.toLowerCase()];
    const companyName = symbol === 'RELIANCE' ? 'Reliance Industries' :
      symbol === 'TCS' ? 'Tata Consultancy Services' :
        symbol === 'HDFCBANK' ? 'HDFC Bank' :
          symbol === 'ICICIBANK' ? 'ICICI Bank' :
            symbol === 'INFY' ? 'Infosys' :
              symbol === 'ITC' ? 'ITC Limited' :
                symbol === 'SBIN' ? 'State Bank of India' :
                  symbol === 'BHARTIARTL' ? 'Bharti Airtel' :
                    symbol === 'KOTAKBANK' ? 'Kotak Mahindra Bank' :
                      symbol === 'AXISBANK' ? 'Axis Bank' :
                        symbol === 'ASIANPAINT' ? 'Asian Paints' :
                          symbol === 'MARUTI' ? 'Maruti Suzuki' :
                            symbol === 'HINDUNILVR' ? 'Hindustan Unilever' :
                              symbol === 'ULTRACEMCO' ? 'UltraTech Cement' :
                                symbol === 'TITAN' ? 'Titan Company' :
                                  symbol === 'WIPRO' ? 'Wipro' :
                                    symbol === 'BAJFINANCE' ? 'Bajaj Finance' :
                                      symbol === 'NESTLEIND' ? 'Nestle India' :
                                        symbol === 'POWERGRID' ? 'Power Grid Corporation' :
                                          symbol === 'NTPC' ? 'NTPC' :
                                            symbol === 'TATASTEEL' ? 'Tata Steel' :
                                              symbol === 'HCLTECH' ? 'HCL Technologies' :
                                                symbol === 'BAJAJFINSV' ? 'Bajaj Finserv' :
                                                  symbol === 'SUNPHARMA' ? 'Sun Pharmaceutical' :
                                                    symbol === 'TECHM' ? 'Tech Mahindra' :
                                                      symbol === 'JSWSTEEL' ? 'JSW Steel' :
                                                        symbol === 'ONGC' ? 'Oil and Natural Gas Corporation' :
                                                          symbol === 'COALINDIA' ? 'Coal India' :
                                                            symbol === 'DRREDDY' ? 'Dr Reddy\'s Laboratories' :
                                                              symbol === 'HINDALCO' ? 'Hindalco Industries' :
                                                                symbol === 'TATAMOTORS' ? 'Tata Motors' :
                                                                  symbol === 'BRITANNIA' ? 'Britannia Industries' :
                                                                    symbol === 'EICHERMOT' ? 'Eicher Motors' :
                                                                      symbol === 'SHREECEM' ? 'Shree Cement' :
                                                                        symbol === 'ADANIENT' ? 'Adani Enterprises' :
                                                                          symbol === 'ADANIPORTS' ? 'Adani Ports' :
                                                                            symbol === 'HEROMOTOCO' ? 'Hero MotoCorp' :
                                                                              symbol === 'INDUSINDBK' ? 'IndusInd Bank' :
                                                                                symbol === 'SBILIFE' ? 'SBI Life Insurance' :
                                                                                  symbol === 'HDFCLIFE' ? 'HDFC Life Insurance' :
                                                                                    symbol === 'ICICIPRULI' ? 'ICICI Prudential Life Insurance' :
                                                                                      symbol === 'IOC' ? 'Indian Oil Corporation' :
                                                                                        symbol === 'BPCL' ? 'Bharat Petroleum Corporation' :
                                                                                          symbol === 'M&M' ? 'Mahindra & Mahindra' :
                                                                                            symbol === 'LT' ? 'Larsen & Toubro' :
                                                                                              symbol === 'IDEA' ? 'Vodafone Idea' :
                                                                                                symbol === 'LTIM' ? 'L&T Technology Services' :
                                                                                                  symbol === 'PERSISTENT' ? 'Persistent Systems' : symbol;

    const stockNews = [
      {
        title: `${companyName} Reports Strong Q3 Results, Beats Estimates`,
        description: `${companyName} announced better-than-expected quarterly results with strong revenue growth and improved margins. The company's performance exceeded analyst expectations.`,
        category: "earnings",
        sentiment: { score: 7.5, label: 'positive' as const, confidence: 0.8 }
      },
      {
        title: `${companyName} Announces New Strategic Initiatives`,
        description: `${companyName} revealed new strategic plans including expansion into new markets and product diversification, signaling strong growth prospects.`,
        category: "business",
        sentiment: { score: 7.0, label: 'positive' as const, confidence: 0.7 }
      },
      {
        title: `${companyName} Stock Gains on Positive Brokerage Ratings`,
        description: "Leading brokerage firms have upgraded their ratings on the stock, citing strong fundamentals and growth potential.",
        category: "analysis",
        sentiment: { score: 6.5, label: 'positive' as const, confidence: 0.7 }
      },
      {
        title: `${companyName} Expands Operations in Key Markets`,
        description: "The company announced expansion plans in key domestic and international markets, strengthening its market position.",
        category: "expansion",
        sentiment: { score: 6.0, label: 'positive' as const, confidence: 0.6 }
      },
      {
        title: `${companyName} Partners with Global Technology Leaders`,
        description: "Strategic partnerships with global technology companies will enhance the company's digital capabilities and market reach.",
        category: "partnership",
        sentiment: { score: 6.5, label: 'positive' as const, confidence: 0.7 }
      },
      {
        title: `${companyName} Receives Industry Recognition for Innovation`,
        description: "The company has been recognized for its innovative products and services, highlighting its commitment to excellence.",
        category: "recognition",
        sentiment: { score: 5.5, label: 'neutral' as const, confidence: 0.6 }
      },
      {
        title: `${companyName} Announces Dividend Distribution`,
        description: "Shareholders will receive a dividend payout, reflecting the company's strong financial position and commitment to shareholder value.",
        category: "dividend",
        sentiment: { score: 6.0, label: 'positive' as const, confidence: 0.6 }
      },
      {
        title: `${companyName} Implements Cost Optimization Measures`,
        description: "New cost optimization initiatives are expected to improve operational efficiency and boost profitability in the coming quarters.",
        category: "operations",
        sentiment: { score: 5.5, label: 'neutral' as const, confidence: 0.6 }
      }
    ];

    stockNews.forEach((news, index) => {
      newsItems.push({
        id: `stock_news_${symbol}_${Date.now()}_${index}`,
        title: news.title,
        description: news.description,
        url: `https://example.com/news/${symbol}/${index}`,
        source: INDIAN_NEWS_SOURCES[index % INDIAN_NEWS_SOURCES.length],
        publishedAt: new Date(now.getTime() - (index * 3 * 60 * 60 * 1000)).toISOString(),
        category: news.category,
        sentiment: news.sentiment,
        tags: stockKeywords,
        stockSymbols: [symbol]
      });
    });
  }

  return newsItems;
};

// Enhanced news fetching with dummy data
export const fetchStockNews = async (symbol?: string): Promise<NewsItem[]> => {
  try {
    const cacheKey = symbol ? `stock_news_${symbol}` : 'market_news';
    const cached = newsCache.get(cacheKey);

    // Check cache first
    if (cached && Date.now() - cached.timestamp < NEWS_CACHE_DURATION) {
      return cached.data;
    }

    // Generate dummy news data
    const newsItems = generateDummyNews(symbol);

    // Cache the results
    newsCache.set(cacheKey, { data: newsItems, timestamp: Date.now() });

    return newsItems;

  } catch (error) {
    console.error('Error generating news:', error);
    return generateDummyNews(symbol);
  }
};

// Extract relevant tags from news content
const extractTags = (content: string): string[] => {
  const tags: string[] = [];
  const lowerContent = content.toLowerCase();

  // Extract sector tags
  const sectors = ['banking', 'it', 'automotive', 'pharma', 'fmcg', 'metals', 'cement', 'telecom', 'power', 'infrastructure', 'oil', 'gas'];
  sectors.forEach(sector => {
    if (lowerContent.includes(sector)) {
      tags.push(sector);
    }
  });

  // Extract market-related tags
  const marketTerms = ['nifty', 'sensex', 'bse', 'nse', 'market', 'trading', 'stocks', 'shares'];
  marketTerms.forEach(term => {
    if (lowerContent.includes(term)) {
      tags.push(term);
    }
  });

  return tags;
};

// Extract stock symbols from content
const extractStockSymbols = (content: string): string[] => {
  const symbols: string[] = [];
  const upperContent = content.toUpperCase();

  Object.keys(NIFTY_50_KEYWORDS).forEach(symbol => {
    if (upperContent.includes(symbol)) {
      symbols.push(symbol);
    }
  });

  return symbols;
};

export const getNewsForStock = async (symbol: string): Promise<NewsItem[]> => {
  return fetchStockNews(symbol);
};

export const getMarketNews = async (): Promise<NewsItem[]> => {
  return fetchStockNews();
};

export const clearNewsCache = () => {
  newsCache.clear();
};

export const getNewsCacheStats = () => {
  return {
    cacheSize: newsCache.size,
    entries: Array.from(newsCache.entries()).map(([key, value]) => ({
      key,
      timestamp: value.timestamp,
      dataLength: value.data.length
    }))
  };
};