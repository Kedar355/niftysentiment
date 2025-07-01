# Nifty 50 Stock Market Dashboard

A comprehensive real-time stock market dashboard focused on Nifty 50 stocks with AI-powered sentiment analysis and news integration.

## Features

### 🚀 Core Features
- **Nifty 50 Stocks**: Complete coverage of all 50 stocks in the Nifty 50 index
- **Real-time Data**: Live stock prices, changes, and market data
- **AI Sentiment Analysis**: Advanced sentiment analysis for stocks and news
- **Sector Analysis**: Detailed sector-wise performance and analysis
- **News Integration**: Real Indian stock market news with sentiment scoring
- **Watchlist Management**: Personal stock watchlist with real-time updates
- **Auto-refresh**: Configurable automatic data refresh

### 📊 Analytics & Insights
- **Market Overview**: Comprehensive market statistics and sentiment
- **Top Performers**: Gainers, losers, and most active stocks
- **Sector Performance**: Sector-wise analysis with weightage
- **News Sentiment**: AI-powered news sentiment analysis
- **Cache Management**: Intelligent caching for better performance

### 🎨 User Interface
- **Modern UI**: Clean, responsive design with dark/light themes
- **Interactive Charts**: Stock price charts and performance graphs
- **Real-time Updates**: Live data updates with visual indicators
- **Mobile Responsive**: Optimized for all device sizes
- **Accessibility**: WCAG compliant design

## Technology Stack

- **Frontend**: Next.js 13, React 18, TypeScript
- **UI Components**: Radix UI, Tailwind CSS, Lucide Icons
- **Backend**: Next.js API Routes, MongoDB
- **Stock Data**: Yahoo Finance API
- **News API**: NewsAPI.org integration
- **Sentiment Analysis**: Custom AI sentiment engine
- **Authentication**: NextAuth.js
- **Caching**: In-memory caching with TTL

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- MongoDB database
- NewsAPI.org account (for real news)
- Yahoo Finance API access

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nifty-sentiment
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the project root:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/nifty-sentiment

   # Authentication
   NEXTAUTH_SECRET=your-nextauth-secret-key
   NEXTAUTH_URL=http://localhost:3000

   # JWT Configuration
   JWT_SECRET=your-jwt-secret-key

   # News API Configuration
   NEWS_API_KEY=your-news-api-key
   ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key

   # Email Configuration (for notifications)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password

   # Application Configuration
   NODE_ENV=development
   ```

4. **API Keys Setup**
   - **NewsAPI.org**: Sign up at [newsapi.org](https://newsapi.org) and get your API key
   - **Yahoo Finance**: No API key required (using yahoo-finance2 package)

5. **Database Setup**
   - Install and start MongoDB
   - Create a database named `nifty-sentiment`

6. **Run the application**
   ```bash
   npm run dev
   ```

7. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## API Endpoints

### Stocks
- `GET /api/stocks/all` - Get all Nifty 50 stocks
- `GET /api/stocks/all?filter=gainers` - Get top gainers
- `GET /api/stocks/all?filter=losers` - Get top losers
- `GET /api/stocks/all?filter=active` - Get most active stocks
- `GET /api/stocks/all?sector=Banking` - Get stocks by sector
- `GET /api/stocks/[symbol]` - Get specific stock data
- `GET /api/stocks/[symbol]/history` - Get stock price history

### Market Analysis
- `GET /api/market/overview` - Get comprehensive market overview
- `GET /api/stocks/sectors` - Get sector-wise analysis

### News
- `GET /api/news` - Get market news
- `GET /api/news?symbol=RELIANCE` - Get stock-specific news
- `GET /api/news?category=earnings` - Get news by category

### User Management
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/watchlist` - Get user watchlist
- `POST /api/watchlist` - Add stock to watchlist
- `DELETE /api/watchlist` - Remove stock from watchlist

## Nifty 50 Stocks Coverage

The application covers all 50 stocks in the Nifty 50 index:

### Banking & Financial Services (12 stocks)
- HDFC Bank, ICICI Bank, SBI, Kotak Bank, Axis Bank, IndusInd Bank
- Bajaj Finance, Bajaj Finserv, SBI Life, HDFC Life, ICICI Prudential
- Power Grid

### IT Sector (7 stocks)
- TCS, Infosys, Wipro, HCL Tech, Tech Mahindra, L&T Technology, Persistent

### Oil & Gas (4 stocks)
- Reliance Industries, ONGC, Indian Oil, BPCL

### Automotive (4 stocks)
- Maruti Suzuki, Tata Motors, M&M, Eicher Motors

### FMCG (4 stocks)
- Hindustan Unilever, ITC, Nestle India, Britannia

### Metals & Mining (4 stocks)
- Tata Steel, JSW Steel, Hindalco, Coal India

### Other Sectors
- Telecom: Bharti Airtel, Vodafone Idea
- Infrastructure: L&T, NTPC
- Consumer Goods: Titan, Asian Paints
- Pharma: Sun Pharma, Dr Reddy's
- Cement: UltraTech, Shree Cement
- And more...

## Performance Optimizations

### Caching Strategy
- **Stock Data**: 5-minute cache for individual stocks
- **All Stocks**: 2-minute cache for bulk data
- **News Data**: 10-minute cache for news articles
- **Market Overview**: Real-time calculation with cached components

### Rate Limiting
- Batch processing for multiple stock requests
- Intelligent delays between API calls
- Fallback to cached data on API failures

### Data Updates
- Real-time stock price updates
- Automatic news refresh
- Configurable auto-refresh intervals
- Manual refresh capability

## Sentiment Analysis

The application uses a custom AI sentiment analysis engine that:

### Stock Sentiment
- Analyzes price movements and volume
- Considers technical indicators
- Provides confidence scores
- Updates in real-time

### News Sentiment
- Analyzes news headlines and content
- Uses financial keyword recognition
- Provides sentiment scores (0-10)
- Categorizes as positive/negative/neutral

### Sentiment Features
- Financial keyword detection
- Context-aware analysis
- Confidence scoring
- Historical sentiment tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## Roadmap

### Upcoming Features
- [ ] Real-time WebSocket connections
- [ ] Advanced charting with TradingView
- [ ] Portfolio tracking and P&L
- [ ] Push notifications
- [ ] Mobile app
- [ ] Social features and sharing
- [ ] Advanced technical analysis
- [ ] Options and derivatives data

### Performance Improvements
- [ ] Redis caching
- [ ] CDN integration
- [ ] Database optimization
- [ ] Image optimization
- [ ] Bundle size reduction

---

**Note**: This application is for educational and informational purposes only. It does not provide financial advice. Always consult with a qualified financial advisor before making investment decisions. 