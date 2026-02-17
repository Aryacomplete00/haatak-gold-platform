// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  totalGoldHoldings: number; // in grams
  totalInvestment: number; // in currency
  averagePurchaseFrequency: number; // days
  sipTargets?: SIPTarget[];
  wealthTargets?: WealthTarget[];
}

export interface SIPTarget {
  id: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  targetAmount: number;
  currentProgress: number;
}

export interface WealthTarget {
  id: string;
  targetGoldGrams: number;
  targetDate: string;
  currentGrams: number;
  purpose: string;
}

// Gold Price Types
export interface GoldPrice {
  pricePerGram: number;
  currency: string;
  timestamp: string;
  change24h: number;
  changePercent24h: number;
}

export interface GoldPriceTrend {
  period: '1m' | '5m' | '6m' | '1y';
  data: Array<{
    date: string;
    price: number;
  }>;
}

// AI Recommendation Types
export interface AIRecommendation {
  action: 'buy' | 'hold' | 'sell';
  confidence: number; // 0-100
  reasoning: string;
  factors: RecommendationFactors;
  suggestedAmount?: number;
  expectedReturn?: number;
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: string;
}

export interface RecommendationFactors {
  economicScore: number; // -100 to 100
  geopoliticalScore: number; // -100 to 100
  gdpTrend: number; // -100 to 100
  warFactors: number; // 0-100
  politicalStability: number; // 0-100
  currentAffairsImpact: number; // -100 to 100
  priceMovement: number; // percentage
  userBehaviorScore: number; // 0-100
  goalProgressScore: number; // 0-100
}

// Analytics Types
export interface AnalyticsEvent {
  eventType: 'page_view' | 'transaction' | 'recommendation_shown' | 'recommendation_clicked' | 'user_action';
  userId: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface Portfolio {
  totalGoldGrams: number;
  totalInvestment: number;
  currentValue: number;
  absoluteReturn: number;
  percentageReturn: number;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  goldGrams: number;
  pricePerGram: number;
  totalAmount: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

// Economic Data Types
export interface EconomicData {
  gdp: {
    current: number;
    trend: number; // percentage change
    forecast: number;
  };
  inflation: {
    current: number;
    trend: number;
  };
  interestRate: {
    current: number;
    trend: number;
  };
  geopoliticalRisk: {
    level: number; // 0-100
    factors: string[];
  };
  marketSentiment: {
    score: number; // -100 to 100
    indicators: string[];
  };
}
