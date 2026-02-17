# HAATAK - Digital Gold Investment Platform

A premium AI-powered digital gold investment platform built with Next.js, TypeScript, and Tailwind CSS.

## 🌟 Features

### Core Features
- ✨ **Premium UI/UX** - Glassmorphism design, gold-themed colors, smooth animations
- 🔐 **Authentication** - Login page with session management
- 💰 **Live Gold Prices** - Real-time gold price updates every 30 seconds
- 📊 **Price Trends** - Interactive charts for 1M, 5M, 6M, and 1Y periods
- 🤖 **AI Recommendations** - Intelligent buy/sell/hold suggestions
- 📈 **Portfolio Tracking** - Monitor holdings, returns, and investment progress
- 📚 **Educational Content** - Learn about digital gold vs physical gold

### AI Recommendation System

The platform features a sophisticated AI recommendation engine that analyzes multiple factors:

#### Factors Analyzed
1. **Economic Indicators**
   - GDP trends
   - Inflation rates
   - Interest rates

2. **Geopolitical Factors**
   - War and conflict situations
   - Political stability
   - Regional tensions

3. **Market Factors**
   - Current gold price trends
   - Market sentiment
   - Historical price patterns

4. **User Behavior**
   - Purchase frequency
   - SIP (Systematic Investment Plan) targets
   - Wealth goals and progress

#### Recommendation Logic
- **Buy Signal**: When economic uncertainty is high, prices are favorable, and user goals need progress
- **Hold Signal**: When market is stable and long-term holding benefits outweigh short-term gains
- **Sell Signal**: When prices peak and profit booking is optimal (rarely recommended due to platform strategy)

### Microservices Architecture

The platform is built with three separate microservices:

#### 1. Analytics Service (`src/services/analytics.service.ts`)
- **Purpose**: Track user behavior and system events
- **Capabilities**:
  - Page view tracking
  - Transaction tracking
  - Recommendation interaction tracking
  - Event batching and persistence
  - User analytics summaries

#### 2. Rule Evaluation Engine (`src/services/rule-engine.service.ts`)
- **Purpose**: Generate AI-powered investment recommendations
- **Capabilities**:
  - Multi-factor analysis (economic, geopolitical, user behavior)
  - Weighted scoring system
  - Confidence level calculation
  - Risk assessment
  - Expected return estimation
  - Human-readable reasoning generation

#### 3. Caption Generation Service (`src/services/caption.service.ts`)
- **Purpose**: Convert AI data into user-friendly UI messages
- **Capabilities**:
  - Action-specific captions
  - Buy/hold nudges
  - Risk warnings
  - Confidence badges
  - Factor insights visualization
  - CTA button generation

## 🏗️ Project Structure

```
src/
├── app/
│   ├── page.tsx              # Login page
│   ├── home/page.tsx         # Main dashboard
│   ├── about/page.tsx        # About page
│   ├── how-it-works/page.tsx # How it works page
│   ├── blog/page.tsx         # Blog page
│   ├── contact/page.tsx      # Contact page
│   └── globals.css           # Global styles & design system
├── components/
│   ├── Header.tsx            # Navigation header with live price
│   ├── AIRecommendationCard.tsx   # AI recommendation display
│   └── PriceChart.tsx        # Interactive price chart
├── services/
│   ├── analytics.service.ts   # Analytics microservice
│   ├── rule-engine.service.ts # AI rule evaluation microservice
│   ├── caption.service.ts     # UI caption generation microservice
│   └── mock-data.service.ts   # Demo data provider
└── types/
    └── index.ts              # TypeScript type definitions
```

## 🎨 Design System

### Color Palette
- **Gold Theme**: 10 shades from `gold-50` to `gold-900`
- **Dark Palette**: Premium dark backgrounds with subtle gradients
- **Accent Colors**: Green (positive), Red (negative), Blue (neutral)

### Components
- **Glass Cards**: `.premium-card` with glassmorphism effect
- **Buttons**: `.btn-gold` and `.btn-outline-gold`
- **Inputs**: `.input-gold` with focus states
- **Text**: `.gold-gradient-text` for premium headings

### Animations
- `fadeInUp` - Smooth entry animations
- `shimmer` - Shimmer loading effect
- `pulse-glow` - Pulsing glow for emphasis
- `spin` - Loading spinner

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 📊 Data Flow

1. **User visits login page** → Authenticates → Redirected to home
2. **Home page loads** → Fetches live gold price, trends, and economic data
3. **AI analyzes data** → Rule engine evaluates all factors
4. **Recommendation generated** → Caption service creates UI message
5. **User sees personalized nudge** → Can act on recommendation
6. **Analytics tracks interaction** → Improves future recommendations

## 🔒 Strategic Outcomes

### Platform Goals
- ✅ **Higher repeat buy conversions** through strategic AI nudges
- ✅ **Lower weekend/holiday churn** with engaging content
- ✅ **Strong compliance protection** via disclaimers and education
- ✅ **Investor confidence** through transparent AI logic
- ✅ **Long-term wealth creation** by encouraging "hold" mentality

### Compliance Features
- Clear disclaimers on all recommendations
- "Suggestion, not financial advice" messaging
- User education about risks
- Transparent factor display
- No forced selling

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Data**: Mock services (ready for API integration)
- **State**: React hooks
- **Routing**: Next.js App Router

## 📈 Future Enhancements

- [ ] Real API integration with SafeGold or similar
- [ ] User authentication backend
- [ ] Payment gateway integration
- [ ] Physical gold delivery option
- [ ] Mobile app (React Native)
- [ ] Advanced charting with technical indicators
- [ ] Social features (share achievements)
- [ ] Referral program
- [ ] Multi-language support
- [ ] Voice-based trading

## 📄 License

This is a demo project for educational purposes.

## 👤 Contact

For questions or support, visit the Contact page or email support@haatak.com

---

**Built with ❤️ for smarter gold investment**
