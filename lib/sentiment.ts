import Sentiment from 'sentiment';

const sentiment = new Sentiment();

// Enhanced financial sentiment keywords
const FINANCIAL_POSITIVE_WORDS = [
  'profit', 'growth', 'surge', 'rally', 'bullish', 'outperform', 'beat', 'exceed',
  'strong', 'robust', 'solid', 'gain', 'rise', 'boom', 'expansion', 'recovery',
  'upgrade', 'optimistic', 'positive', 'buy', 'momentum', 'breakthrough', 'success',
  'earnings', 'revenue', 'dividend', 'buyback', 'acquisition', 'partnership'
];

const FINANCIAL_NEGATIVE_WORDS = [
  'loss', 'decline', 'fall', 'drop', 'crash', 'bearish', 'underperform', 'miss',
  'weak', 'poor', 'disappointing', 'concern', 'risk', 'uncertainty', 'volatility',
  'downgrade', 'pessimistic', 'negative', 'sell', 'pressure', 'challenge', 'crisis',
  'debt', 'default', 'bankruptcy', 'restructuring', 'layoff', 'closure'
];

const FINANCIAL_NEUTRAL_WORDS = [
  'stable', 'steady', 'maintain', 'hold', 'sideways', 'consolidation', 'mixed',
  'unchanged', 'flat', 'neutral', 'cautious', 'watchful', 'review', 'analysis'
];

// Add financial terms to sentiment analyzer
FINANCIAL_POSITIVE_WORDS.forEach(word => {
  sentiment.registerLanguage('en', {
    labels: { [word]: 2 }
  });
});

FINANCIAL_NEGATIVE_WORDS.forEach(word => {
  sentiment.registerLanguage('en', {
    labels: { [word]: -2 }
  });
});

export interface SentimentResult {
  score: number;
  comparative: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  magnitude: number;
  keywords: string[];
}

export interface StockSentimentData {
  priceSentiment: number;      // Based on price movement
  volumeSentiment: number;     // Based on volume analysis
  volatilitySentiment: number; // Based on price volatility
  momentumSentiment: number;   // Based on price momentum
  overallSentiment: number;    // Combined weighted sentiment
  confidence: number;          // Confidence in the sentiment
  trend: 'bullish' | 'bearish' | 'sideways';
  strength: 'strong' | 'moderate' | 'weak';
}

// Enhanced sentiment analysis with financial context
export const analyzeSentiment = (text: string): SentimentResult => {
  const lowerText = text.toLowerCase();
  const result = sentiment.analyze(text);

  // Enhanced scoring with financial context
  let enhancedScore = result.score;
  const keywords: string[] = [];

  // Check for financial keywords
  FINANCIAL_POSITIVE_WORDS.forEach(word => {
    if (lowerText.includes(word)) {
      enhancedScore += 1.5;
      keywords.push(word);
    }
  });

  FINANCIAL_NEGATIVE_WORDS.forEach(word => {
    if (lowerText.includes(word)) {
      enhancedScore -= 1.5;
      keywords.push(word);
    }
  });

  FINANCIAL_NEUTRAL_WORDS.forEach(word => {
    if (lowerText.includes(word)) {
      keywords.push(word);
    }
  });

  // Calculate magnitude (strength of sentiment)
  const magnitude = Math.abs(enhancedScore);

  let sentimentLabel: 'positive' | 'negative' | 'neutral';
  let confidence: number;

  // More nuanced sentiment classification
  if (enhancedScore > 1) {
    sentimentLabel = 'positive';
    confidence = Math.min(enhancedScore / 8, 1); // Normalize to 0-1
  } else if (enhancedScore < -1) {
    sentimentLabel = 'negative';
    confidence = Math.min(Math.abs(enhancedScore) / 8, 1); // Normalize to 0-1
  } else {
    sentimentLabel = 'neutral';
    confidence = 0.3 + (magnitude * 0.2); // Base confidence for neutral
  }

  // Boost confidence if financial keywords are present
  if (keywords.length > 0) {
    confidence = Math.min(confidence * 1.3, 1);
  }

  return {
    score: enhancedScore,
    comparative: result.comparative,
    sentiment: sentimentLabel,
    confidence: Math.max(0.1, confidence), // Minimum confidence
    magnitude,
    keywords
  };
};

// Advanced stock sentiment analysis based on price fluctuations
export const analyzeStockSentiment = (
  currentPrice: number,
  previousClose: number,
  dayHigh: number,
  dayLow: number,
  volume: number,
  avgVolume?: number,
  priceHistory?: number[]
): StockSentimentData => {

  // 1. Price Movement Sentiment (40% weight)
  const priceChange = currentPrice - previousClose;
  const priceChangePercent = (priceChange / previousClose) * 100;

  let priceSentiment: number;
  if (priceChangePercent > 5) {
    priceSentiment = 9.0 + (priceChangePercent - 5) * 0.1; // Strong positive
  } else if (priceChangePercent > 2) {
    priceSentiment = 7.0 + (priceChangePercent - 2) * 0.5; // Positive
  } else if (priceChangePercent > 0) {
    priceSentiment = 5.5 + priceChangePercent * 0.5; // Slightly positive
  } else if (priceChangePercent > -2) {
    priceSentiment = 4.5 + (priceChangePercent + 2) * 0.5; // Slightly negative
  } else if (priceChangePercent > -5) {
    priceSentiment = 3.0 + (priceChangePercent + 2) * 0.5; // Negative
  } else {
    priceSentiment = 1.0 + (priceChangePercent + 5) * 0.1; // Strong negative
  }

  // 2. Volume Sentiment (20% weight)
  let volumeSentiment: number;
  if (avgVolume) {
    const volumeRatio = volume / avgVolume;
    if (volumeRatio > 2) {
      volumeSentiment = priceChangePercent > 0 ? 8.0 : 2.0; // High volume confirms direction
    } else if (volumeRatio > 1.5) {
      volumeSentiment = priceChangePercent > 0 ? 7.0 : 3.0;
    } else if (volumeRatio > 1) {
      volumeSentiment = 5.0; // Normal volume
    } else {
      volumeSentiment = 4.0; // Low volume - less conviction
    }
  } else {
    volumeSentiment = 5.0; // Default neutral
  }

  // 3. Volatility Sentiment (15% weight)
  const dayRange = ((dayHigh - dayLow) / previousClose) * 100;
  let volatilitySentiment: number;
  if (dayRange > 10) {
    volatilitySentiment = 3.0; // High volatility - negative
  } else if (dayRange > 5) {
    volatilitySentiment = 4.0; // Moderate volatility
  } else {
    volatilitySentiment = 6.0; // Low volatility - positive
  }

  // 4. Momentum Sentiment (25% weight)
  let momentumSentiment: number;
  if (priceHistory && priceHistory.length >= 5) {
    const recentPrices = priceHistory.slice(-5);
    const momentum = (recentPrices[recentPrices.length - 1] - recentPrices[0]) / recentPrices[0] * 100;

    if (momentum > 3) {
      momentumSentiment = 8.0 + momentum * 0.2;
    } else if (momentum > 1) {
      momentumSentiment = 6.5 + momentum * 0.5;
    } else if (momentum > -1) {
      momentumSentiment = 4.5 + momentum * 1.0;
    } else if (momentum > -3) {
      momentumSentiment = 2.5 + (momentum + 1) * 1.0;
    } else {
      momentumSentiment = 1.0 + (momentum + 3) * 0.2;
    }
  } else {
    // Use current price change as momentum proxy
    momentumSentiment = priceSentiment;
  }

  // Calculate weighted overall sentiment
  const overallSentiment = (
    priceSentiment * 0.4 +
    volumeSentiment * 0.2 +
    volatilitySentiment * 0.15 +
    momentumSentiment * 0.25
  );

  // Determine trend
  let trend: 'bullish' | 'bearish' | 'sideways';
  if (overallSentiment > 6.5) {
    trend = 'bullish';
  } else if (overallSentiment < 3.5) {
    trend = 'bearish';
  } else {
    trend = 'sideways';
  }

  // Determine strength
  let strength: 'strong' | 'moderate' | 'weak';
  if (Math.abs(priceChangePercent) > 5 || (avgVolume && volume / avgVolume > 2)) {
    strength = 'strong';
  } else if (Math.abs(priceChangePercent) > 2 || (avgVolume && volume / avgVolume > 1.5)) {
    strength = 'moderate';
  } else {
    strength = 'weak';
  }

  // Calculate confidence based on consistency of signals
  const signals = [priceSentiment, volumeSentiment, volatilitySentiment, momentumSentiment];
  const avgSignal = signals.reduce((sum, signal) => sum + signal, 0) / signals.length;
  const variance = signals.reduce((sum, signal) => sum + Math.pow(signal - avgSignal, 2), 0) / signals.length;
  const confidence = Math.max(0.3, Math.min(1, 1 - (variance / 25))); // Lower variance = higher confidence

  return {
    priceSentiment: Math.max(0, Math.min(10, priceSentiment)),
    volumeSentiment: Math.max(0, Math.min(10, volumeSentiment)),
    volatilitySentiment: Math.max(0, Math.min(10, volatilitySentiment)),
    momentumSentiment: Math.max(0, Math.min(10, momentumSentiment)),
    overallSentiment: Math.max(0, Math.min(10, overallSentiment)),
    confidence: Math.max(0.1, Math.min(1, confidence)),
    trend,
    strength
  };
};

// Real-time sentiment tracking with enhanced features
export class SentimentTracker {
  private sentimentHistory: Array<{
    timestamp: number;
    sentiment: SentimentResult;
    stockSentiment?: StockSentimentData;
    text: string
  }> = [];
  private readonly maxHistorySize = 1000;

  addSentiment(text: string, sentiment: SentimentResult, stockSentiment?: StockSentimentData) {
    this.sentimentHistory.push({
      timestamp: Date.now(),
      sentiment,
      stockSentiment,
      text
    });

    // Keep only recent entries
    if (this.sentimentHistory.length > this.maxHistorySize) {
      this.sentimentHistory = this.sentimentHistory.slice(-this.maxHistorySize);
    }
  }

  getRecentSentiment(minutes: number = 60): SentimentResult {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    const recentEntries = this.sentimentHistory.filter(entry => entry.timestamp > cutoff);

    if (recentEntries.length === 0) {
      return {
        score: 0,
        comparative: 0,
        sentiment: 'neutral',
        confidence: 0.5,
        magnitude: 0,
        keywords: []
      };
    }

    const avgScore = recentEntries.reduce((sum, entry) => sum + entry.sentiment.score, 0) / recentEntries.length;
    const avgConfidence = recentEntries.reduce((sum, entry) => sum + entry.sentiment.confidence, 0) / recentEntries.length;
    const allKeywords = recentEntries.flatMap(entry => entry.sentiment.keywords);

    return {
      score: avgScore,
      comparative: avgScore / recentEntries.length,
      sentiment: avgScore > 0.5 ? 'positive' : avgScore < -0.5 ? 'negative' : 'neutral',
      confidence: avgConfidence,
      magnitude: Math.abs(avgScore),
      keywords: Array.from(new Set(allKeywords))
    };
  }

  getStockSentimentTrend(symbol: string, minutes: number = 60): StockSentimentData | null {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    const recentEntries = this.sentimentHistory
      .filter(entry => entry.timestamp > cutoff && entry.stockSentiment)
      .map(entry => entry.stockSentiment!);

    if (recentEntries.length === 0) return null;

    const avgOverall = recentEntries.reduce((sum, entry) => sum + entry.overallSentiment, 0) / recentEntries.length;
    const avgConfidence = recentEntries.reduce((sum, entry) => sum + entry.confidence, 0) / recentEntries.length;

    return {
      priceSentiment: recentEntries[recentEntries.length - 1]?.priceSentiment || 5.0,
      volumeSentiment: recentEntries[recentEntries.length - 1]?.volumeSentiment || 5.0,
      volatilitySentiment: recentEntries[recentEntries.length - 1]?.volatilitySentiment || 5.0,
      momentumSentiment: recentEntries[recentEntries.length - 1]?.momentumSentiment || 5.0,
      overallSentiment: avgOverall,
      confidence: avgConfidence,
      trend: avgOverall > 6.5 ? 'bullish' : avgOverall < 3.5 ? 'bearish' : 'sideways',
      strength: recentEntries[recentEntries.length - 1]?.strength || 'moderate'
    };
  }

  getTrendingSentiment(): 'improving' | 'declining' | 'stable' {
    if (this.sentimentHistory.length < 10) return 'stable';

    const recent = this.sentimentHistory.slice(-10);
    const older = this.sentimentHistory.slice(-20, -10);

    const recentAvg = recent.reduce((sum, entry) => sum + entry.sentiment.score, 0) / recent.length;
    const olderAvg = older.reduce((sum, entry) => sum + entry.sentiment.score, 0) / older.length;

    const difference = recentAvg - olderAvg;

    if (difference > 0.3) return 'improving';
    if (difference < -0.3) return 'declining';
    return 'stable';
  }
}

// Global sentiment tracker instance
export const globalSentimentTracker = new SentimentTracker();

export const getSentimentColor = (sentiment: string): string => {
  switch (sentiment) {
    case 'positive':
      return 'text-green-500';
    case 'negative':
      return 'text-red-500';
    default:
      return 'text-yellow-500';
  }
};

export const getSentimentIcon = (sentiment: string): string => {
  switch (sentiment) {
    case 'positive':
      return '📈';
    case 'negative':
      return '📉';
    default:
      return '📊';
  }
};

export const getTrendIcon = (trend: string): string => {
  switch (trend) {
    case 'bullish':
      return '🚀';
    case 'bearish':
      return '🐻';
    default:
      return '➡️';
  }
};

export const getStrengthColor = (strength: string): string => {
  switch (strength) {
    case 'strong':
      return 'text-green-600';
    case 'moderate':
      return 'text-yellow-600';
    default:
      return 'text-gray-600';
  }
};