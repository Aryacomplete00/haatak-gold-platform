'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { GoldPrice } from '@/types';
import { goldDataService, mockUser } from '@/services/mock-data.service';
import { analyticsService } from '@/services/analytics.service';

export default function BuyGoldPage() {
    const router = useRouter();
    const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null);
    const [inputMode, setInputMode] = useState<'grams' | 'rupees'>('rupees');
    const [inputValue, setInputValue] = useState<string>('5000');
    const [grams, setGrams] = useState<number>(0);
    const [rupees, setRupees] = useState<number>(5000);
    const [isProcessing, setIsProcessing] = useState(false);

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
        analyticsService.trackPageView(mockUser.id, '/buy');

        // Auto-refresh price every 30 seconds
        const interval = setInterval(loadGoldPrice, 30000);
        return () => clearInterval(interval);
    }, [router]);

    const loadGoldPrice = async () => {
        const price = await goldDataService.fetchLivePrice();
        setGoldPrice(price);

        // Recalculate based on current input
        if (inputMode === 'rupees' && inputValue) {
            const amount = parseFloat(inputValue);
            if (!isNaN(amount) && price) {
                setGrams(amount / price.pricePerGram);
            }
        } else if (inputMode === 'grams' && inputValue) {
            const gramAmount = parseFloat(inputValue);
            if (!isNaN(gramAmount) && price) {
                setRupees(gramAmount * price.pricePerGram);
            }
        }
    };

    const handleInputChange = (value: string) => {
        setInputValue(value);
        const numValue = parseFloat(value);

        if (isNaN(numValue) || !goldPrice) {
            setGrams(0);
            setRupees(0);
            return;
        }

        if (inputMode === 'rupees') {
            setRupees(numValue);
            setGrams(numValue / goldPrice.pricePerGram);
        } else {
            setGrams(numValue);
            setRupees(numValue * goldPrice.pricePerGram);
        }
    };

    const handleQuickAmount = (amount: number) => {
        setInputMode('rupees');
        setInputValue(amount.toString());
        handleInputChange(amount.toString());
    };

    // Smart suggestion system
    const getSmartSuggestion = () => {
        if (rupees < 10) return null;

        if (rupees < 50) return 50;
        if (rupees < 100) return 100;
        if (rupees < 500) return 500;
        if (rupees < 1000) return 1000;
        if (rupees < 5000) return 5000;
        if (rupees < 10000) return 10000;
        if (rupees < 25000) return 25000;
        if (rupees < 50000) return 50000;

        // For amounts >= 50000, suggest double
        return Math.round(rupees * 2);
    };

    // Calculate 6-month profit projection
    const calculate6MonthProfit = () => {
        if (rupees < 10) return null;

        // Historical gold returns: ~9.9% annually = ~4.95% for 6 months
        const sixMonthReturnRate = 0.0495; // 4.95%
        const estimatedValue = rupees * (1 + sixMonthReturnRate);
        const estimatedProfit = estimatedValue - rupees;

        return {
            currentInvestment: rupees,
            estimatedValue: Math.round(estimatedValue),
            estimatedProfit: Math.round(estimatedProfit),
            returnPercent: (sixMonthReturnRate * 100).toFixed(2)
        };
    };

    const handleBuyGold = async () => {
        if (!goldPrice || rupees < 10) return;

        setIsProcessing(true);

        // Track the transaction
        analyticsService.trackTransaction(mockUser.id, 'buy', rupees, grams);

        // Simulate API call
        setTimeout(() => {
            setIsProcessing(false);

            // Show success message
            alert(`✅ Success! You've purchased ${grams.toFixed(3)} grams of gold for ₹${rupees.toLocaleString()}`);

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

    const smartSuggestion = getSmartSuggestion();
    const profitProjection = calculate6MonthProfit();

    return (
        <div className="min-h-screen">
            <Header goldPrice={goldPrice} />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Page Header */}
                <div className="text-center mb-8 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-bold mb-3 gold-gradient-text" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Buy Digital Gold
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Invest in 99.9% pure digital gold starting from just ₹10
                    </p>
                </div>

                {/* Live Price Banner */}
                <div className="premium-card p-6 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Current Gold Price</p>
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

                {/* Quick Amount Selection */}
                <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <p className="text-white font-semibold mb-3">Quick Select Amount</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[1000, 5000, 10000, 25000].map((amount) => (
                            <button
                                key={amount}
                                onClick={() => handleQuickAmount(amount)}
                                className={`premium-card p-4 text-center transition-all hover:border-amber-500 ${rupees === amount ? 'border-amber-500 bg-amber-500/10' : ''
                                    }`}
                            >
                                <p className="text-gray-400 text-xs mb-1">Invest</p>
                                <p className="text-white font-bold">₹{amount.toLocaleString()}</p>
                                <p className="text-amber-400 text-xs mt-1">
                                    ~{(amount / goldPrice.pricePerGram).toFixed(2)}g
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom Amount Input */}
                <div className="premium-card p-8 mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <h2 className="text-2xl font-bold text-white mb-6">Enter Custom Amount</h2>

                    {/* Toggle Input Mode */}
                    <div className="flex gap-3 mb-6">
                        <button
                            onClick={() => setInputMode('rupees')}
                            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${inputMode === 'rupees'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            Amount (₹)
                        </button>
                        <button
                            onClick={() => setInputMode('grams')}
                            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${inputMode === 'grams'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            Grams (g)
                        </button>
                    </div>

                    {/* Input Field */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            {inputMode === 'rupees' ? 'Enter Amount in Rupees' : 'Enter Weight in Grams'}
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-amber-400">
                                {inputMode === 'rupees' ? '₹' : 'g'}
                            </span>
                            <input
                                type="number"
                                value={inputValue}
                                onChange={(e) => handleInputChange(e.target.value)}
                                className="input-gold pl-12 text-xl"
                                placeholder={inputMode === 'rupees' ? '10' : '0.001'}
                                min="0"
                                step={inputMode === 'rupees' ? '10' : '0.001'}
                            />
                        </div>
                    </div>

                    {/* Smart Suggestion */}
                    {smartSuggestion && rupees >= 10 && (
                        <div className="mb-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">💡</span>
                                <div className="flex-1">
                                    <h4 className="text-blue-300 font-semibold mb-1">Smart Investment Tip</h4>
                                    <p className="text-blue-100 text-sm mb-3">
                                        Investing more helps you reach your wealth goals faster! Consider increasing your investment to:
                                    </p>
                                    <button
                                        onClick={() => handleQuickAmount(smartSuggestion)}
                                        className="btn-outline-gold text-sm px-4 py-2"
                                    >
                                        Invest ₹{smartSuggestion.toLocaleString()} instead →
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 6-Month Profit Projection */}
                    {profitProjection && (
                        <div className="mb-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-6">
                            <div className="flex items-start gap-3 mb-4">
                                <span className="text-3xl">📈</span>
                                <div className="flex-1">
                                    <h4 className="text-green-300 font-semibold text-lg mb-1">
                                        6-Month Profit Projection (Hold Strategy)
                                    </h4>
                                    <p className="text-green-100 text-sm">
                                        Based on historical gold performance of ~{profitProjection.returnPercent}% over 6 months
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-black/20 rounded-lg p-4 text-center">
                                    <p className="text-gray-400 text-xs mb-1">Today's Investment</p>
                                    <p className="text-white font-bold text-lg">
                                        ₹{profitProjection.currentInvestment.toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-black/20 rounded-lg p-4 text-center">
                                    <p className="text-gray-400 text-xs mb-1">Value After 6 Months</p>
                                    <p className="text-green-400 font-bold text-lg">
                                        ₹{profitProjection.estimatedValue.toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-black/20 rounded-lg p-4 text-center">
                                    <p className="text-gray-400 text-xs mb-1">Estimated Profit</p>
                                    <p className="text-emerald-400 font-bold text-lg">
                                        +₹{profitProjection.estimatedProfit.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                                <p className="text-amber-200 text-xs flex items-start gap-2">
                                    <span className="text-base">💎</span>
                                    <span>
                                        <strong>Hold for better returns!</strong> Historical data shows gold investors who hold for longer periods
                                        typically earn higher returns. This projection is based on past performance and actual returns may vary.
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Calculation Summary */}
                    <div className="bg-black/20 rounded-lg p-6 border border-amber-500/20">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-gray-400 text-sm mb-1">You'll Get</p>
                                <p className="text-2xl font-bold text-amber-400">{grams.toFixed(3)} grams</p>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-400 text-sm mb-1">You'll Pay</p>
                                <p className="text-2xl font-bold text-white">₹{Math.round(rupees).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="border-t border-white/10 pt-4">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">Rate per gram</span>
                                <span className="text-white">₹{goldPrice.pricePerGram.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">GST</span>
                                <span className="text-green-400">₹0 (No GST on purchase)</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Making Charges</span>
                                <span className="text-green-400">₹0</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="premium-card p-6 mb-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <h3 className="text-lg font-semibold text-white mb-4">Payment Methods</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['UPI', 'Net Banking', 'Debit Card', 'Wallet'].map((method) => (
                            <div key={method} className="bg-black/20 rounded-lg p-4 text-center border border-white/5">
                                <p className="text-white text-sm">{method}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Buy Button */}
                <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                    <button
                        onClick={handleBuyGold}
                        disabled={isProcessing || rupees < 10}
                        className="btn-gold w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <span className="flex items-center justify-center gap-3">
                                <div className="spinner w-5 h-5 border-2"></div>
                                Processing Purchase...
                            </span>
                        ) : (
                            `Buy ${grams.toFixed(3)}g Gold for ₹${Math.round(rupees).toLocaleString()}`
                        )}
                    </button>

                    {rupees < 10 && rupees > 0 && (
                        <p className="text-red-400 text-sm text-center mt-3">
                            Minimum purchase amount is ₹10
                        </p>
                    )}

                    <p className="text-gray-500 text-sm text-center mt-3">
                        🔒 100% secure payment • Instant gold credit • Insured storage
                    </p>
                </div>

                {/* Benefits */}
                <div className="grid md:grid-cols-3 gap-4 mt-8">
                    <div className="text-center">
                        <div className="text-3xl mb-2">⚡</div>
                        <p className="text-white font-semibold mb-1">Instant Purchase</p>
                        <p className="text-gray-400 text-sm">Gold credited immediately</p>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl mb-2">🏆</div>
                        <p className="text-white font-semibold mb-1">99.9% Pure</p>
                        <p className="text-gray-400 text-sm">Certified hallmark gold</p>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl mb-2">🔒</div>
                        <p className="text-white font-semibold mb-1">Secure Vaults</p>
                        <p className="text-gray-400 text-sm">Fully insured storage</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
