'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { GoldPrice } from '@/types';
import { goldDataService, mockUser } from '@/services/mock-data.service';
import { saveNewTransaction } from '@/services/mock-data.service';
import { analyticsService } from '@/services/analytics.service';

// ── Suggestion tier config ────────────────────────────────────────────────────
function getSuggestionTier(amount: number): { pct: number; label: string } | null {
    if (amount < 10) return null;
    if (amount <= 500) return { pct: 75, label: 'great starter' };
    if (amount <= 2000) return { pct: 40, label: 'better growth' };
    if (amount <= 6000) return { pct: 30, label: 'solid portfolio' };
    if (amount <= 15000) return { pct: 20, label: 'wealth building' };
    return { pct: 15, label: 'premium investor' };
}

export default function BuyGoldPage() {
    const router = useRouter();
    const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null);
    const [inputMode, setInputMode] = useState<'grams' | 'rupees'>('rupees');
    const [inputValue, setInputValue] = useState<string>('');
    const [grams, setGrams] = useState<number>(0);
    const [rupees, setRupees] = useState<number>(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [purchaseSuccess, setPurchaseSuccess] = useState<{ grams: number; rupees: number } | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const user = localStorage.getItem('haatak_user');
            if (!user) { router.push('/'); return; }
        }
        loadGoldPrice();
        analyticsService.trackPageView(mockUser.id, '/buy');
        const interval = setInterval(loadGoldPrice, 30000);
        return () => clearInterval(interval);
    }, [router]);

    const loadGoldPrice = async () => {
        const price = await goldDataService.fetchLivePrice();
        setGoldPrice(price);
    };

    const handleInputChange = (value: string) => {
        setInputValue(value);
        const numValue = parseFloat(value);
        if (isNaN(numValue) || !goldPrice || numValue <= 0) {
            setGrams(0); setRupees(0); return;
        }
        if (inputMode === 'rupees') {
            setRupees(numValue);
            setGrams(numValue / goldPrice.pricePerGram);
        } else {
            setGrams(numValue);
            setRupees(numValue * goldPrice.pricePerGram);
        }
    };

    const handleBuyGold = async () => {
        if (!goldPrice || rupees < 10) return;
        setIsProcessing(true);
        analyticsService.trackTransaction(mockUser.id, 'buy', rupees, grams);
        setTimeout(() => {
            const newTxn = {
                id: `txn_real_${Date.now()}`,
                type: 'buy' as const,
                goldGrams: parseFloat(grams.toFixed(4)),
                pricePerGram: goldPrice.pricePerGram,
                totalAmount: Math.round(rupees),
                timestamp: new Date().toISOString(),
                status: 'completed' as const,
                paymentMethod: 'UPI',
                transactionId: `TXN${Date.now()}`
            };
            saveNewTransaction(newTxn);
            setIsProcessing(false);
            setPurchaseSuccess({ grams, rupees: Math.round(rupees) });
        }, 2000);
    };

    if (!goldPrice) {
        return <div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>;
    }

    // ── Derived values ────────────────────────────────────────────────────────
    const tier = inputMode === 'rupees'
        ? getSuggestionTier(rupees)
        : (grams > 0 ? getSuggestionTier(grams * goldPrice.pricePerGram) : null);

    const suggestRupees = tier ? Math.round(rupees * (1 + tier.pct / 100)) : 0;
    const suggestGrams = tier ? parseFloat((grams * (1 + tier.pct / 100)).toFixed(4)) : 0;
    const extraRupees = suggestRupees - Math.round(rupees);
    const extraGrams = parseFloat((suggestGrams - grams).toFixed(4));

    // Returns for current amount
    const r6m = rupees > 0 ? Math.round(rupees * 0.0495) : 0;
    const r1y = rupees > 0 ? Math.round(rupees * 0.099) : 0;

    return (
        <div className="min-h-screen">
            <Header goldPrice={goldPrice} />

            {/* ── Purchase Success Overlay ─────────────────────────── */}
            {purchaseSuccess && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}>
                    <div className="relative max-w-md w-full rounded-2xl overflow-hidden text-center"
                        style={{
                            background: 'linear-gradient(135deg,rgba(20,20,30,.99),rgba(10,10,20,.99))',
                            border: '1px solid rgba(251,191,36,0.3)',
                            boxShadow: '0 0 80px rgba(251,191,36,0.15)',
                            animation: 'fadeInUp 0.4s ease-out'
                        }}>
                        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg,#f59e0b,#fcd34d,#f59e0b)' }} />
                        <div className="p-8">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-2xl shadow-amber-500/40 animate-pulse">
                                <span className="text-4xl">✓</span>
                            </div>
                            <h2 className="text-3xl font-bold gold-gradient-text mb-2" style={{ fontFamily: 'Playfair Display,serif' }}>
                                Purchase Successful!
                            </h2>
                            <p className="text-gray-400 mb-8">Your gold has been credited to your account</p>
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                                    <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Gold Credited</p>
                                    <p className="text-2xl font-bold text-amber-400">{purchaseSuccess.grams.toFixed(4)}g</p>
                                    <p className="text-xs text-gray-500 mt-0.5">99.9% pure</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Amount Paid</p>
                                    <p className="text-2xl font-bold text-white">₹{purchaseSuccess.rupees.toLocaleString()}</p>
                                    <p className="text-xs text-green-400 mt-0.5">✓ Verified & Secured</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => router.push('/holdings')} className="btn-gold w-full py-3 text-base">
                                    View My Holdings →
                                </button>
                                <button onClick={() => { setPurchaseSuccess(null); setInputValue(''); setGrams(0); setRupees(0); }}
                                    className="btn-outline-gold w-full py-3 text-base">
                                    Buy More Gold
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Page Header */}
                <div className="text-center mb-8 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-bold mb-3 gold-gradient-text" style={{ fontFamily: 'Playfair Display,serif' }}>
                        Buy Digital Gold
                    </h1>
                    <p className="text-gray-300 text-lg">Invest in 99.9% pure digital gold starting from just ₹10</p>
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

                {/* Main Input Card */}
                <div className="premium-card p-8 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <h2 className="text-2xl font-bold text-white mb-6">Enter Amount</h2>

                    {/* Toggle */}
                    <div className="flex gap-3 mb-6">
                        <button onClick={() => { setInputMode('rupees'); setInputValue(''); setGrams(0); setRupees(0); }}
                            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${inputMode === 'rupees' ? 'bg-amber-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                            Amount (₹)
                        </button>
                        <button onClick={() => { setInputMode('grams'); setInputValue(''); setGrams(0); setRupees(0); }}
                            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${inputMode === 'grams' ? 'bg-amber-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                            Grams (g)
                        </button>
                    </div>

                    {/* Input */}
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
                                placeholder={inputMode === 'rupees' ? 'e.g. 500' : 'e.g. 0.1'}
                                min="0"
                                step={inputMode === 'rupees' ? '10' : '0.001'}
                            />
                        </div>
                    </div>

                    {/* ── MyJio-style Suggestion Banner ──────────────────────── */}
                    {tier && (inputMode === 'rupees' ? rupees >= 10 : grams > 0) && (
                        <div className="mb-6 rounded-2xl overflow-hidden"
                            style={{ border: '1px solid rgba(251,191,36,0.25)' }}>

                            {/* Tier badge */}
                            <div className="px-4 py-2 flex items-center gap-2"
                                style={{ background: 'linear-gradient(90deg,rgba(251,191,36,0.18),rgba(251,191,36,0.06))' }}>
                                <span className="text-amber-400 font-bold text-xs uppercase tracking-widest">
                                    💡 Recommended Upgrade · {tier.pct}% More for {tier.label}
                                </span>
                            </div>

                            {/* Comparison rows */}
                            <div className="p-4 space-y-3" style={{ background: 'rgba(0,0,0,0.35)' }}>

                                {/* Current plan row */}
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-gray-500 flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-gray-300 text-sm">Your current amount</span>
                                            <span className="text-white font-semibold text-sm">
                                                {inputMode === 'rupees'
                                                    ? `₹${Math.round(rupees).toLocaleString()}`
                                                    : `${grams.toFixed(4)}g`}
                                            </span>
                                        </div>
                                        {/* Progress bar – baseline */}
                                        <div className="h-2 rounded-full bg-gray-700 relative overflow-hidden">
                                            <div className="absolute inset-y-0 left-0 bg-gray-500 rounded-full" style={{ width: '65%' }} />
                                        </div>
                                        <p className="text-gray-500 text-xs mt-1">
                                            {inputMode === 'rupees'
                                                ? `≈ ${grams.toFixed(4)} grams of gold`
                                                : `≈ ₹${Math.round(rupees).toLocaleString()}`}
                                        </p>
                                    </div>
                                </div>

                                {/* Suggested plan row */}
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-amber-300 text-sm font-semibold">
                                                Suggested ({tier.pct}% more)
                                            </span>
                                            <span className="text-amber-400 font-bold text-sm">
                                                {inputMode === 'rupees'
                                                    ? `₹${suggestRupees.toLocaleString()}`
                                                    : `${suggestGrams.toFixed(4)}g`}
                                            </span>
                                        </div>
                                        {/* Full progress bar – suggested */}
                                        <div className="h-2 rounded-full bg-amber-500/20 relative overflow-hidden">
                                            <div className="absolute inset-y-0 left-0 rounded-full animate-pulse"
                                                style={{ width: '100%', background: 'linear-gradient(90deg,#f59e0b,#fcd34d)' }} />
                                        </div>
                                        <p className="text-amber-400/80 text-xs mt-1">
                                            {inputMode === 'rupees'
                                                ? `≈ ${suggestGrams.toFixed(4)} grams  (+${extraGrams.toFixed(4)}g more gold)`
                                                : `≈ ₹${suggestRupees.toLocaleString()}  (+₹${extraRupees.toLocaleString()} more)`}
                                        </p>
                                    </div>
                                </div>

                                {/* Difference pill */}
                                <div className="flex items-center justify-between mt-1 pt-3 border-t border-white/10">
                                    <div className="flex items-center gap-2">
                                        <span className="text-green-400 text-sm">✨ Difference</span>
                                        <span className="bg-green-500/15 text-green-300 text-xs font-bold px-2 py-0.5 rounded-full border border-green-500/30">
                                            +{tier.pct}%
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (inputMode === 'rupees') {
                                                setInputValue(suggestRupees.toString());
                                                handleInputChange(suggestRupees.toString());
                                            } else {
                                                setInputValue(suggestGrams.toString());
                                                handleInputChange(suggestGrams.toString());
                                            }
                                        }}
                                        className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                                        style={{ background: 'linear-gradient(90deg,#f59e0b,#fcd34d)', color: '#000' }}
                                    >
                                        Upgrade →
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Calculation Summary */}
                    <div className="bg-black/20 rounded-lg p-6 border border-amber-500/20 mb-6">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-gray-400 text-sm mb-1">You'll Get</p>
                                <p className="text-2xl font-bold text-amber-400">{grams.toFixed(4)} grams</p>
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

                    {/* 6-Month / 1-Year return preview (only when amount entered) */}
                    {rupees >= 10 && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-xl p-4 border border-blue-500/20"
                                style={{ background: 'rgba(59,130,246,0.07)' }}>
                                <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">📅 6-Month Est. Return</p>
                                <p className="text-blue-200 font-bold text-lg">+₹{r6m.toLocaleString()}</p>
                                <p className="text-blue-400/70 text-xs mt-0.5">~4.95% historical growth</p>
                            </div>
                            <div className="rounded-xl p-4 border border-green-500/20"
                                style={{ background: 'rgba(34,197,94,0.07)' }}>
                                <p className="text-green-300 text-xs font-semibold uppercase tracking-wider mb-1">🎯 1-Year Est. Return</p>
                                <p className="text-green-200 font-bold text-lg">+₹{r1y.toLocaleString()}</p>
                                <p className="text-green-400/70 text-xs mt-0.5">~9.9% historical growth</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Payment Methods */}
                <div className="premium-card p-6 mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
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
                <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <button
                        onClick={handleBuyGold}
                        disabled={isProcessing || rupees < 10}
                        className="btn-gold w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <span className="flex items-center justify-center gap-3">
                                <div className="spinner w-5 h-5 border-2" />
                                Processing Purchase...
                            </span>
                        ) : rupees >= 10 ? (
                            `Buy ${grams.toFixed(4)}g Gold for ₹${Math.round(rupees).toLocaleString()}`
                        ) : 'Enter an amount to continue'}
                    </button>
                    {rupees > 0 && rupees < 10 && (
                        <p className="text-red-400 text-sm text-center mt-3">Minimum purchase amount is ₹10</p>
                    )}
                    <p className="text-gray-500 text-sm text-center mt-3">
                        🔒 100% secure payment • Instant gold credit • Insured storage
                    </p>
                </div>

                {/* Benefits */}
                <div className="grid md:grid-cols-3 gap-4 mt-8">
                    {[['⚡', 'Instant Purchase', 'Gold credited immediately'],
                    ['🏆', '99.9% Pure', 'Certified hallmark gold'],
                    ['🔒', 'Secure Vaults', 'Fully insured storage']].map(([icon, title, desc]) => (
                        <div key={title} className="text-center">
                            <div className="text-3xl mb-2">{icon}</div>
                            <p className="text-white font-semibold mb-1">{title}</p>
                            <p className="text-gray-400 text-sm">{desc}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
