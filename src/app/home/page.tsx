'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import AIRecommendationCard from '@/components/AIRecommendationCard';
import PriceChart from '@/components/PriceChart';
import { GoldPrice, GoldPriceTrend, AIRecommendation } from '@/types';
import { mockUser, goldDataService } from '@/services/mock-data.service';
import { ruleEngine } from '@/services/rule-engine.service';
import { analyticsService } from '@/services/analytics.service';

export default function HomePage() {
    const router = useRouter();
    const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null);
    const [trends, setTrends] = useState<GoldPriceTrend[]>([]);
    const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        if (typeof window !== 'undefined') {
            const user = localStorage.getItem('haatak_user');
            if (!user) {
                router.push('/');
                return;
            }
        }

        loadData();

        // Track page view
        analyticsService.trackPageView(mockUser.id, '/home');

        // Auto-refresh gold price every 30 seconds
        const interval = setInterval(() => {
            refreshGoldPrice();
        }, 30000);

        return () => clearInterval(interval);
    }, [router]);

    const loadData = async () => {
        try {
            // Load all data
            const currentPrice = await goldDataService.fetchLivePrice();
            const priceTrends = goldDataService.getPriceTrends();
            const economicData = goldDataService.getEconomicData();
            const historicalChanges = goldDataService.getHistoricalChanges();

            // Generate AI recommendation
            const aiRec = ruleEngine.evaluateRecommendation(
                mockUser,
                currentPrice,
                economicData,
                historicalChanges
            );

            setGoldPrice(currentPrice);
            setTrends(priceTrends);
            setRecommendation(aiRec);

            // Track recommendation shown
            analyticsService.trackRecommendationShown(mockUser.id, aiRec);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshGoldPrice = async () => {
        const currentPrice = await goldDataService.fetchLivePrice();
        setGoldPrice(currentPrice);
    };

    const handleRecommendationAction = (action: string) => {
        analyticsService.trackRecommendationClicked(mockUser.id, action);

        if (action === 'buy') {
            // Navigate to buy page or show buy modal
            alert('Redirecting to buy gold...');
        } else if (action === 'sell') {
            // Navigate to portfolio
            alert('Opening your portfolio...');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading your investment dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Header goldPrice={goldPrice || undefined} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Hero Section */}
                <section className="text-center py-12 animate-fade-in-up">
                    <h1 className="text-5xl md:text-6xl font-bold mb-4 gold-gradient-text" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Welcome to Digital Gold Investment
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        Invest in 99.9% pure digital gold with AI-powered recommendations.
                        Secure, transparent, and accessible wealth creation.
                    </p>
                </section>

                {/* Info Cards */}
                <section className="grid md:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="premium-card p-6 text-center">
                        <div className="text-4xl mb-3">🏆</div>
                        <h3 className="text-lg font-semibold text-white mb-2">99.9% Pure Gold</h3>
                        <p className="text-gray-400 text-sm">
                            Invest in hallmark certified digital gold stored in secure vaults
                        </p>
                    </div>
                    <div className="premium-card p-6 text-center">
                        <div className="text-4xl mb-3">⚡</div>
                        <h3 className="text-lg font-semibold text-white mb-2">Instant Liquidity</h3>
                        <p className="text-gray-400 text-sm">
                            Buy or sell anytime with real-time pricing and instant settlements
                        </p>
                    </div>
                    <div className="premium-card p-6 text-center">
                        <div className="text-4xl mb-3">🔒</div>
                        <h3 className="text-lg font-semibold text-white mb-2">100% Secure</h3>
                        <p className="text-gray-400 text-sm">
                            Bank-grade security with insurance coverage on all holdings
                        </p>
                    </div>
                </section>

                {/* Digital Gold Information */}
                <section className="premium-card p-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <h2 className="text-3xl font-bold mb-4 gold-gradient-text">What is Digital Gold?</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <p className="text-gray-300 leading-relaxed mb-4">
                                Digital gold allows you to invest in physical gold in electronic form.
                                Every gram you purchase is backed by real 99.9% pure gold stored in
                                secure, insured vaults. You get all the benefits of gold investment
                                without the hassles of storage, security, or purity concerns.
                            </p>
                            <ul className="space-y-2 text-gray-400">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>Start with as little as ₹100</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>No making charges or GST on purchase</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>Convert to physical gold anytime</span>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-3">Why Digital Gold vs Physical Gold?</h3>
                            <div className="space-y-3">
                                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                    <p className="text-green-400 font-semibold mb-1">💰 Lower Costs</p>
                                    <p className="text-sm text-gray-300">No making charges, storage fees, or purity testing costs</p>
                                </div>
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                    <p className="text-blue-400 font-semibold mb-1">🛡️ Better Security</p>
                                    <p className="text-sm text-gray-300">Professionally secured vaults with full insurance coverage</p>
                                </div>
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                                    <p className="text-amber-400 font-semibold mb-1">⚡ Higher Liquidity</p>
                                    <p className="text-sm text-gray-300">Sell instantly at market price, no waiting or negotiation</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Price Chart */}
                <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <PriceChart trends={trends} />
                </section>

                {/* AI Recommendation */}
                {recommendation && (
                    <section className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                        <AIRecommendationCard
                            recommendation={recommendation}
                            onAction={handleRecommendationAction}
                        />
                    </section>
                )}

                {/* User Portfolio Summary */}
                <section className="premium-card p-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                    <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                        <span>💼</span>
                        Your Portfolio
                    </h2>
                    <div className="grid md:grid-cols-4 gap-6">
                        <div className="bg-black/20 rounded-lg p-6 border border-white/5">
                            <p className="text-sm text-gray-400 mb-2">Total Gold Holdings</p>
                            <p className="text-3xl font-bold gold-gradient-text">{mockUser.totalGoldHoldings}g</p>
                        </div>
                        <div className="bg-black/20 rounded-lg p-6 border border-white/5">
                            <p className="text-sm text-gray-400 mb-2">Total Investment</p>
                            <p className="text-3xl font-bold text-white">₹{mockUser.totalInvestment.toLocaleString()}</p>
                        </div>
                        <div className="bg-black/20 rounded-lg p-6 border border-white/5">
                            <p className="text-sm text-gray-400 mb-2">Current Value</p>
                            <p className="text-3xl font-bold text-green-400">
                                ₹{goldPrice ? (mockUser.totalGoldHoldings * goldPrice.pricePerGram).toLocaleString() : '-'}
                            </p>
                        </div>
                        <div className="bg-black/20 rounded-lg p-6 border border-white/5">
                            <p className="text-sm text-gray-400 mb-2">Returns</p>
                            {goldPrice && (
                                <>
                                    <p className="text-3xl font-bold text-green-400">
                                        +{((mockUser.totalGoldHoldings * goldPrice.pricePerGram - mockUser.totalInvestment) / mockUser.totalInvestment * 100).toFixed(2)}%
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
