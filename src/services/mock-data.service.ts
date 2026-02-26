import { User, GoldPrice, GoldPriceTrend, EconomicData } from '@/types';
import { UserProfile, PurchaseHistory } from '@/types/user';

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

export const mockUserProfile: UserProfile = {
    ...mockUser,
    kycStatus: 'verified', // Change to 'not_started', 'pending', or 'rejected' to test different states
    kycDetails: {
        documentType: 'aadhaar',
        documentNumber: 'XXXX-XXXX-1234',
        submittedDate: '2025-12-15',
        verifiedDate: '2025-12-16'
    },
    joinedDate: '2025-11-01',
    lastLoginDate: new Date().toISOString(),
    profileImage: undefined
};

export const mockPurchaseHistory: PurchaseHistory[] = [
    {
        id: 'txn_001',
        type: 'buy',
        goldGrams: 10.5,
        pricePerGram: 6150,
        totalAmount: 64575,
        timestamp: '2025-12-15T10:30:00Z',
        status: 'completed',
        paymentMethod: 'UPI',
        transactionId: 'TXN20251215001'
    },
    {
        id: 'txn_002',
        type: 'buy',
        goldGrams: 5.0,
        pricePerGram: 6200,
        totalAmount: 31000,
        timestamp: '2025-12-20T14:45:00Z',
        status: 'completed',
        paymentMethod: 'Credit Card',
        transactionId: 'TXN20251220001'
    },
    {
        id: 'txn_003',
        type: 'buy',
        goldGrams: 15.0,
        pricePerGram: 6100,
        totalAmount: 91500,
        timestamp: '2026-01-05T09:15:00Z',
        status: 'completed',
        paymentMethod: 'Net Banking',
        transactionId: 'TXN20260105001'
    },
    {
        id: 'txn_004',
        type: 'sell',
        goldGrams: 3.0,
        pricePerGram: 6250,
        totalAmount: 18750,
        timestamp: '2026-01-10T16:20:00Z',
        status: 'completed',
        paymentMethod: 'Bank Transfer',
        transactionId: 'TXN20260110001'
    },
    {
        id: 'txn_005',
        type: 'buy',
        goldGrams: 8.0,
        pricePerGram: 6180,
        totalAmount: 49440,
        timestamp: '2026-01-15T11:00:00Z',
        status: 'completed',
        paymentMethod: 'UPI',
        transactionId: 'TXN20260115001'
    },
    {
        id: 'txn_006',
        type: 'buy',
        goldGrams: 10.0,
        pricePerGram: 6220,
        totalAmount: 62200,
        timestamp: '2026-02-01T13:30:00Z',
        status: 'completed',
        paymentMethod: 'Debit Card',
        transactionId: 'TXN20260201001'
    }
];

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

// Get user profile
export const getUserProfile = (): UserProfile => {
    return mockUserProfile;
};

// Get purchase history — merges localStorage purchases with mock data
export const getPurchaseHistory = (): PurchaseHistory[] => {
    if (typeof window === 'undefined') return mockPurchaseHistory;
    try {
        const stored = localStorage.getItem('haatak_transactions');
        const realTxns: PurchaseHistory[] = stored ? JSON.parse(stored) : [];
        // Real purchases first (newest), then mock history
        return [...realTxns, ...mockPurchaseHistory];
    } catch {
        return mockPurchaseHistory;
    }
};

// Save a new transaction to localStorage and notify all listeners
export const saveNewTransaction = (txn: PurchaseHistory): void => {
    if (typeof window === 'undefined') return;
    try {
        const stored = localStorage.getItem('haatak_transactions');
        const existing: PurchaseHistory[] = stored ? JSON.parse(stored) : [];
        existing.unshift(txn); // newest first
        localStorage.setItem('haatak_transactions', JSON.stringify(existing));

        // Notify Header / useHoldings hook immediately (same tab)
        window.dispatchEvent(new Event('haatak_holdings_updated'));
    } catch (e) {
        console.error('Failed to save transaction', e);
    }
};


// In production, these would be real API calls to SafeGold or similar services
export const goldDataService = {
    getCurrentPrice: getCurrentGoldPrice,
    getPriceTrends: getGoldPriceTrends,
    getEconomicData,
    getHistoricalChanges: getHistoricalPriceChanges,
    fetchLivePrice: fetchLiveGoldPrice,
    getUserProfile,
    getPurchaseHistory
};

