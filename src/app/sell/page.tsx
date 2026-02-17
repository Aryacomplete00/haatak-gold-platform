'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { GoldPrice } from '@/types';
import { goldDataService, mockUser } from '@/services/mock-data.service';
import { analyticsService } from '@/services/analytics.service';

export default function SellGoldPage() {
    const router = useRouter();
    const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null);
    const [sellMode, setSellMode] = useState<'grams' | 'rupees'>('grams');
    const [inputValue, setInputValue] = useState<string>('');
    const [gramsToSell, setGramsToSell] = useState<number>(0);
    const [rupeesReceive, setRupeesReceive] = useState<number>(0);
    const [isProcessing, setIsProcessing] = useState(false);

    // User's current holdings
    const userHoldings = {
        totalGrams: mockUser.totalGoldHoldings,
        totalInvestment: mockUser.totalInvestment,
        averageBuyPrice: mockUser.totalInvestment / mockUser.totalGoldHoldings
    };

    useEffect(() => {
        // Check if user is logged in
        if (typeof window !== 'undefined') {
            const user = localStorage.getItem('haatak_user');
            if (!user) {
                router.push('/');
                return;
            }
        }

        loadGoldPrice();
        analyticsService.trackPageView(mockUser.id, '/sell');

        // Auto-refresh price every 30 seconds
        const interval = setInterval(loadGoldPrice, 30000);
        return () => clearInterval(interval);
    }, [router]);

    const loadGoldPrice = async () => {
        const price = await goldDataService.fetchLivePrice();
        setGoldPrice(price);

        // Recalculate based on current input
        if (sellMode === 'grams' && inputValue) {
            const grams = parseFloat(inputValue);
            if (!isNaN(grams) && price) {
                setRupeesReceive(grams * price.pricePerGram);
            }
        } else if (sellMode === 'rupees' && inputValue) {
            const amount = parseFloat(inputValue);
            if (!isNaN(amount) && price) {
                setGramsToSell(amount / price.pricePerGram);
            }
        }
    };

    const handleInputChange = (value: string) => {
        setInputValue(value);
        const numValue = parseFloat(value);

        if (isNaN(numValue) || !goldPrice) {
            setGramsToSell(0);
            setRupeesReceive(0);
            return;
        }

        if (sellMode === 'grams') {
            const grams = Math.min(numValue, userHoldings.totalGrams);
            setGramsToSell(grams);
            setRupeesReceive(grams * goldPrice.pricePerGram);
        } else {
            const maxRupees = userHoldings.totalGrams * goldPrice.pricePerGram;
            const rupees = Math.min(numValue, maxRupees);
            setRupeesReceive(rupees);
            setGramsToSell(rupees / goldPrice.pricePerGram);
        }
    };

    const handleQuickPercent = (percent: number) => {
        setSellMode('grams');
        const grams = (userHoldings.totalGrams * percent) / 100;
        setInputValue(grams.toFixed(3));
        handleInputChange(grams.toFixed(3));
    };

    const handleSellGold = async () => {
        if (!goldPrice || gramsToSell <= 0 || gramsToSell > userHoldings.totalGrams) return;

        setIsProcessing(true);

        // Track the transaction
        analyticsService.trackTransaction(mockUser.id, 'sell', rupeesReceive, gramsToSell);

        // Simulate API call
        setTimeout(() => {
            setIsProcessing(false);

            // Show success message
            alert(`✅ Success! You've sold ${gramsToSell.toFixed(3)} grams of gold for ₹${Math.round(rupeesReceive).toLocaleString()}. Amount will be credited to your account in 1-2 business days.`);

            // Redirect to home
            router.push('/home');
        }, 2000);
    };

    if (!goldPrice) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    const currentValue = userHoldings.totalGrams * goldPrice.pricePerGram;
    const profitLoss = currentValue - userHoldings.totalInvestment;
    const profitLossPercent = (profitLoss / userHoldings.totalInvestment) * 100;

    return (
        <div className="min-h-screen">
            <Header goldPrice={goldPrice} />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Page Header */}
                <div className="text-center mb-8 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-bold mb-3 gold-gradient-text" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Sell Digital Gold
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Instant liquidity at current market rates
                    </p>
                </div>

                {/* Portfolio Summary */}
                <div className="premium-card p-6 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <h2 className="text-lg font-semibold text-white mb-4">Your Gold Holdings</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Total Gold</p>
                            <p className="text-2xl font-bold text-amber-400">{userHoldings.totalGrams.toFixed(3)}g</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Current Value</p>
                            <p className="text-2xl font-bold text-white">₹{Math.round(currentValue).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Investment</p>
                            <p className="text-2xl font-bold text-gray-300">₹{userHoldings.totalInvestment.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Profit/Loss</p>
                            <p className={`text-2xl font-bold ${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {profitLoss >= 0 ? '+' : ''}₹{Math.round(profitLoss).toLocaleString()}
                            </p>
                            <p className={`text-sm ${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                ({profitLoss >= 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Educational Profit Projection - Hold Strategy Awareness */}
                {gramsToSell > 0 && (
                    <div className="bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10 border border-purple-500/20 rounded-lg p-8 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-start gap-4 mb-6">
                            <span className="text-5xl">📊</span>
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-purple-300 mb-2">
                                    💡 Worth Considering: Your Gold's Future Value
                                </h3>
                                <p className="text-purple-100 text-sm">
                                    Before you sell, here's what your <strong>{gramsToSell.toFixed(3)} grams</strong> (worth ₹{Math.round(rupeesReceive).toLocaleString()} today)
                                    could potentially grow to if you hold it longer. Based on historical gold performance.
                                </p>
                            </div>
                        </div>

                        {/* Growth Projection Graph */}
                        <div className="space-y-6">
                            {/* Today's Value */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-300 font-medium">Today (Selling Now)</span>
                                    <span className="text-white font-bold">₹{Math.round(rupeesReceive).toLocaleString()}</span>
                                </div>
                                <div className="relative h-12 bg-black/30 rounded-lg overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-gray-600 to-gray-500 flex items-center justify-end pr-4"
                                        style={{ width: '100%' }}
                                    >
                                        <span className="text-white font-bold text-sm">Baseline</span>
                                    </div>
                                </div>
                            </div>

                            {/* 6 Month Projection */}
                            {(() => {
                                const sixMonthReturn = 0.0495; // 4.95% for 6 months
                                const sixMonthValue = Math.round(rupeesReceive * (1 + sixMonthReturn));
                                const sixMonthProfit = sixMonthValue - Math.round(rupeesReceive);
                                const sixMonthWidth = ((sixMonthValue / rupeesReceive) * 100);

                                return (
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-blue-300 font-medium flex items-center gap-2">
                                                <span>📅</span>
                                                <span>If You Hold for 6 Months</span>
                                            </span>
                                            <span className="text-blue-300 font-bold">₹{sixMonthValue.toLocaleString()}</span>
                                        </div>
                                        <div className="relative h-12 bg-black/30 rounded-lg overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-end pr-4 transition-all duration-1000"
                                                style={{ width: `${Math.min(sixMonthWidth, 100)}%` }}
                                            >
                                                <span className="text-white font-bold text-sm">+₹{sixMonthProfit.toLocaleString()} gain</span>
                                            </div>
                                        </div>
                                        <p className="text-blue-200 text-xs mt-1">
                                            ✨ Estimated growth: {(sixMonthReturn * 100).toFixed(2)}% based on historical performance
                                        </p>
                                    </div>
                                );
                            })()}

                            {/* 1 Year Projection */}
                            {(() => {
                                const oneYearReturn = 0.099; // 9.9% for 1 year
                                const oneYearValue = Math.round(rupeesReceive * (1 + oneYearReturn));
                                const oneYearProfit = oneYearValue - Math.round(rupeesReceive);
                                const oneYearWidth = ((oneYearValue / rupeesReceive) * 100);

                                return (
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-green-300 font-medium flex items-center gap-2">
                                                <span>🎯</span>
                                                <span>If You Hold for 1 Year</span>
                                            </span>
                                            <span className="text-green-300 font-bold">₹{oneYearValue.toLocaleString()}</span>
                                        </div>
                                        <div className="relative h-12 bg-black/30 rounded-lg overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-green-600 to-emerald-500 flex items-center justify-end pr-4 transition-all duration-1000"
                                                style={{ width: `${Math.min(oneYearWidth, 100)}%` }}
                                            >
                                                <span className="text-white font-bold text-sm">+₹{oneYearProfit.toLocaleString()} gain</span>
                                            </div>
                                        </div>
                                        <p className="text-green-200 text-xs mt-1">
                                            ✨ Estimated growth: {(oneYearReturn * 100).toFixed(2)}% based on historical performance
                                        </p>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Educational Message */}
                        <div className="mt-6 bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                            <p className="text-amber-200 text-sm flex items-start gap-2">
                                <span className="text-lg">💎</span>
                                <span>
                                    <strong>This is just information to help you decide.</strong> Many successful investors hold gold for longer periods
                                    to maximize returns. However, the final decision is always yours. Past performance doesn't guarantee future results.
                                </span>
                            </p>
                        </div>

                        {/* Benefits of Holding */}
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="bg-black/20 rounded-lg p-3 text-center border border-white/10">
                                <div className="text-2xl mb-1">🛡️</div>
                                <p className="text-purple-200 font-semibold text-sm">Inflation Protection</p>
                            </div>
                            <div className="bg-black/20 rounded-lg p-3 text-center border border-white/10">
                                <div className="text-2xl mb-1">📈</div>
                                <p className="text-blue-200 font-semibold text-sm">Long-term Wealth</p>
                            </div>
                            <div className="bg-black/20 rounded-lg p-3 text-center border border-white/10">
                                <div className="text-2xl mb-1">💪</div>
                                <p className="text-green-200 font-semibold text-sm">Market Stability</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* AI Hold Recommendation */}
                {profitLoss > 0 && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <div className="flex items-start gap-4">
                            <span className="text-4xl">💎</span>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-blue-300 mb-2">
                                    💡 AI Suggestion: Consider Holding
                                </h3>
                                <p className="text-blue-100 mb-3">
                                    You're currently in profit by {profitLossPercent.toFixed(2)}%. Historical trends suggest that holding gold longer
                                    often yields better returns. Gold is a long-term wealth preservation asset.
                                </p>
                                <ul className="text-sm text-blue-200 space-y-1">
                                    <li>✓ Expected annual return: ~9.9%</li>
                                    <li>✓ Your SIP targets are {((mockUser.sipTargets?.[0]?.currentProgress || 0) / (mockUser.sipTargets?.[0]?.targetAmount || 1) * 100).toFixed(0)}% complete</li>
                                    <li>✓ Holding protects against inflation and market volatility</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Live Price */}
                <div className="premium-card p-6 mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Sell Price (Today)</p>
                            <p className="text-3xl font-bold text-amber-400">
                                ₹{goldPrice.pricePerGram.toLocaleString()}<span className="text-lg text-gray-400">/gram</span>
                            </p>
                        </div>
                        <div className={`text-right ${goldPrice.changePercent24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            <p className="text-sm text-gray-400 mb-1">24h Change</p>
                            <p className="text-2xl font-bold">
                                {goldPrice.changePercent24h >= 0 ? '↑' : '↓'} {Math.abs(goldPrice.changePercent24h).toFixed(2)}%
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Percentage Selection */}
                <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <p className="text-white font-semibold mb-3">Quick Sell Options</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[25, 50, 75, 100].map((percent) => (
                            <button
                                key={percent}
                                onClick={() => handleQuickPercent(percent)}
                                className="premium-card p-4 text-center transition-all hover:border-amber-500"
                            >
                                <p className="text-gray-400 text-xs mb-1">Sell</p>
                                <p className="text-white font-bold">{percent}%</p>
                                <p className="text-amber-400 text-xs mt-1">
                                    {((userHoldings.totalGrams * percent) / 100).toFixed(3)}g
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom Amount Input */}
                <div className="premium-card p-8 mb-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                    <h2 className="text-2xl font-bold text-white mb-6">Enter Amount to Sell</h2>

                    {/* Toggle Sell Mode */}
                    <div className="flex gap-3 mb-6">
                        <button
                            onClick={() => setSellMode('grams')}
                            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${sellMode === 'grams'
                                ? 'bg-amber-500 text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            Grams (g)
                        </button>
                        <button
                            onClick={() => setSellMode('rupees')}
                            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${sellMode === 'rupees'
                                ? 'bg-amber-500 text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            Amount (₹)
                        </button>
                    </div>

                    {/* Input Field */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            {sellMode === 'grams' ? 'Enter Grams to Sell' : 'Enter Amount to Receive'}
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-amber-400">
                                {sellMode === 'grams' ? 'g' : '₹'}
                            </span>
                            <input
                                type="number"
                                value={inputValue}
                                onChange={(e) => handleInputChange(e.target.value)}
                                className="input-gold pl-12 text-xl"
                                placeholder={sellMode === 'grams' ? '1.0' : '5000'}
                                min="0"
                                max={sellMode === 'grams' ? userHoldings.totalGrams : currentValue}
                                step={sellMode === 'grams' ? '0.1' : '100'}
                            />
                        </div>
                        <p className="text-gray-500 text-sm mt-2">
                            Available: {userHoldings.totalGrams.toFixed(3)} grams (₹{Math.round(currentValue).toLocaleString()})
                        </p>
                    </div>

                    {/* Calculation Summary */}
                    <div className="bg-black/20 rounded-lg p-6 border border-amber-500/20">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-gray-400 text-sm mb-1">You'll Sell</p>
                                <p className="text-2xl font-bold text-amber-400">{gramsToSell.toFixed(3)} grams</p>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-400 text-sm mb-1">You'll Receive</p>
                                <p className="text-2xl font-bold text-white">₹{Math.round(rupeesReceive).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="border-t border-white/10 pt-4">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">Sell rate per gram</span>
                                <span className="text-white">₹{goldPrice.pricePerGram.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">Deduction</span>
                                <span className="text-green-400">₹0 (No charges)</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Settlement</span>
                                <span className="text-white">1-2 business days</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sell Button */}
                <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                    <button
                        onClick={handleSellGold}
                        disabled={isProcessing || gramsToSell <= 0 || gramsToSell > userHoldings.totalGrams || rupeesReceive < 100}
                        className="btn-gold w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <span className="flex items-center justify-center gap-3">
                                <div className="spinner w-5 h-5 border-2"></div>
                                Processing Sale...
                            </span>
                        ) : (
                            `Sell ${gramsToSell.toFixed(3)}g Gold for ₹${Math.round(rupeesReceive).toLocaleString()}`
                        )}
                    </button>

                    {gramsToSell > userHoldings.totalGrams && (
                        <p className="text-red-400 text-sm text-center mt-3">
                            You don't have enough gold to sell this amount
                        </p>
                    )}

                    {rupeesReceive > 0 && rupeesReceive < 100 && gramsToSell <= userHoldings.totalGrams && (
                        <p className="text-red-400 text-sm text-center mt-3">
                            Minimum sell amount is ₹100
                        </p>
                    )}

                    <p className="text-gray-500 text-sm text-center mt-3">
                        🔒 Instant price lock • Settlement in 1-2 days • Zero selling charges
                    </p>
                </div>

                {/* Benefits */}
                <div className="grid md:grid-cols-3 gap-4 mt-8">
                    <div className="text-center">
                        <div className="text-3xl mb-2">⚡</div>
                        <p className="text-white font-semibold mb-1">Instant Liquidity</p>
                        <p className="text-gray-400 text-sm">Sell anytime at live rates</p>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl mb-2">💰</div>
                        <p className="text-white font-semibold mb-1">Zero Charges</p>
                        <p className="text-gray-400 text-sm">No deduction on selling</p>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl mb-2">🏦</div>
                        <p className="text-white font-semibold mb-1">Quick Settlement</p>
                        <p className="text-gray-400 text-sm">Money in 1-2 business days</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
