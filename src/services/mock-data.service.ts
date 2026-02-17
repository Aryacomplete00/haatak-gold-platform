import { User, GoldPrice, GoldPriceTrend, EconomicData } from '@/types';

/**
 * Mock Data Service
 * Provides realistic data for demo purposes
 * In production, this would connect to real APIs
 */

export const mockUser: User = {
    id: 'user_123',
    email: 'investor@example.com',
    name: 'Arya Anand',
    phone: '+91 98765 43210',
    totalGoldHoldings: 45.5, // grams
    totalInvestment: 285000, // INR
    averagePurchaseFrequency: 30, // days
    sipTargets: [
        {
            id: 'sip_1',
            amount: 5000,
            frequency: 'monthly',
            startDate: '2025-01-01',
            targetAmount: 60000,
            currentProgress: 25000
        }
    ],
    wealthTargets: [
        {
            id: 'wealth_1',
            targetGoldGrams: 100,
            targetDate: '2027-12-31',
            currentGrams: 45.5,
            purpose: 'Wealth Preservation'
        }
    ]
};

export const getCurrentGoldPrice = (): GoldPrice => {
    // Simulated live price with realistic variations
    const basePrice = 6250; // INR per gram
    const variation = (Math.random() - 0.5) * 100;
    const currentPrice = basePrice + variation;
    const change24h = (Math.random() - 0.4) * 200; // Slight bias towards increase

    return {
        pricePerGram: Math.round(currentPrice),
        currency: 'INR',
        timestamp: new Date().toISOString(),
        change24h: Math.round(change24h),
        changePercent24h: parseFloat((change24h / currentPrice * 100).toFixed(2))
    };
};

export const getGoldPriceTrends = (): GoldPriceTrend[] => {
    const generateTrend = (days: number, period: '1m' | '5m' | '6m' | '1y'): GoldPriceTrend => {
        const data = [];
        const basePrice = 6000;
        let currentPrice = basePrice;

        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            // Add realistic price movement with upward trend
            const dailyChange = (Math.random() - 0.45) * 50; // Slight upward bias
            currentPrice += dailyChange;

            data.push({
                date: date.toISOString().split('T')[0],
                price: Math.round(currentPrice)
            });
        }

        return { period, data };
    };

    return [
        generateTrend(30, '1m'),
        generateTrend(150, '5m'),
        generateTrend(180, '6m'),
        generateTrend(365, '1y')
    ];
};

export const getEconomicData = (): EconomicData => {
    return {
        gdp: {
            current: 7.2, // India's GDP growth
            trend: 0.3, // positive trend
            forecast: 7.5
        },
        inflation: {
            current: 5.4,
            trend: 0.2 // rising
        },
        interestRate: {
            current: 6.5,
            trend: 0 // stable
        },
        geopoliticalRisk: {
            level: 45, // moderate risk
            factors: [
                'Regional tensions in Middle East',
                'Trade negotiations ongoing',
                'Currency fluctuations'
            ]
        },
        marketSentiment: {
            score: -15, // slightly negative (good for gold)
            indicators: [
                'Stock market volatility increased',
                'Safe haven demand rising',
                'Dollar weakening'
            ]
        }
    };
};

// Historical price trends for AI analysis
export const getHistoricalPriceChanges = (): number[] => {
    // Last 30 days of percentage changes
    const changes: number[] = [];
    for (let i = 0; i < 30; i++) {
        changes.push((Math.random() - 0.45) * 3); // Slight upward bias
    }
    return changes;
};

// Simulate API delay
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get live gold price with simulated API call
export const fetchLiveGoldPrice = async (): Promise<GoldPrice> => {
    await delay(500);
    return getCurrentGoldPrice();
};

// In production, these would be real API calls to SafeGold or similar services
export const goldDataService = {
    getCurrentPrice: getCurrentGoldPrice,
    getPriceTrends: getGoldPriceTrends,
    getEconomicData,
    getHistoricalChanges: getHistoricalPriceChanges,
    fetchLivePrice: fetchLiveGoldPrice
};
