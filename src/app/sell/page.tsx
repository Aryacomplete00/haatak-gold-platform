'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { GoldPrice } from '@/types';
import { goldDataService, getPurchaseHistory } from '@/services/mock-data.service';
import { analyticsService as analytics } from '@/services/analytics.service';

type Step = 'input' | 'analysis';

export default function SellGoldPage() {
    const router = useRouter();
    const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null);
    const [sellMode, setSellMode] = useState<'grams' | 'rupees'>('rupees');
    const [inputValue, setInputValue] = useState<string>('');
    const [gramsToSell, setGramsToSell] = useState<number>(0);
    const [rupeesToGet, setRupeesToGet] = useState<number>(0);
    const [step, setStep] = useState<Step>('input');
    const [isProcessing, setIsProcessing] = useState(false);
    const [sellDone, setSellDone] = useState(false);

    // Live holdings from localStorage + mock
    const [holdings, setHoldings] = useState({ totalGrams: 0, netInvestment: 0, avgBuyPrice: 0 });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const user = localStorage.getItem('haatak_user');
            if (!user) { router.push('/'); return; }
        }
        loadGoldPrice();
        computeHoldings();
        analytics.trackPageView('user', '/sell');
        const interval = setInterval(loadGoldPrice, 30000);
        return () => clearInterval(interval);
    }, [router]);

    const computeHoldings = () => {
        try {
            const history = getPurchaseHistory();
            const bought = history.filter(t => t.type === 'buy').reduce((s, t) => s + t.goldGrams, 0);
            const sold = history.filter(t => t.type === 'sell').reduce((s, t) => s + t.goldGrams, 0);
            const totalGrams = Math.max(0, parseFloat((bought - sold).toFixed(4)));
            const totalInvested = history.filter(t => t.type === 'buy').reduce((s, t) => s + t.totalAmount, 0);
            const totalReceived = history.filter(t => t.type === 'sell').reduce((s, t) => s + t.totalAmount, 0);
            const netInvestment = totalInvested - totalReceived;
            const avgBuyPrice = bought > 0 ? netInvestment / totalGrams : 0;
            setHoldings({ totalGrams, netInvestment, avgBuyPrice });
        } catch {
            setHoldings({ totalGrams: 2.5, netInvestment: 15000, avgBuyPrice: 6000 });
        }
    };

    const loadGoldPrice = async () => {
        const price = await goldDataService.fetchLivePrice();
        setGoldPrice(price);
    };

    const handleInputChange = (value: string) => {
        setInputValue(value);
        const num = parseFloat(value);
        if (isNaN(num) || !goldPrice || num <= 0) {
            setGramsToSell(0); setRupeesToGet(0); return;
        }
        if (sellMode === 'rupees') {
            const maxRupees = holdings.totalGrams * goldPrice.pricePerGram;
            const capped = Math.min(num, maxRupees);
            setRupeesToGet(capped);
            setGramsToSell(parseFloat((capped / goldPrice.pricePerGram).toFixed(4)));
        } else {
            const capped = Math.min(num, holdings.totalGrams);
            setGramsToSell(parseFloat(capped.toFixed(4)));
            setRupeesToGet(capped * goldPrice.pricePerGram);
        }
    };

    const handleSell = () => {
        if (!goldPrice) return;
        analytics.trackTransaction('user', 'sell', rupeesToGet, gramsToSell);
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setSellDone(true);
        }, 2000);
    };

    if (!goldPrice) {
        return <div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>;
    }

    const currentValue = holdings.totalGrams * goldPrice.pricePerGram;
    const profitLoss = currentValue - holdings.netInvestment;
    const profitPct = holdings.netInvestment > 0 ? (profitLoss / holdings.netInvestment) * 100 : 0;

    // ------ Analysis section values ------
    const sellNowReturn = rupeesToGet;
    const gain6m = Math.round(rupeesToGet * 0.0495);
    const val6m = Math.round(rupeesToGet * 1.0495);
    const gain1y = Math.round(rupeesToGet * 0.099);
    const val1y = Math.round(rupeesToGet * 1.099);

    // Cost basis for this portion
    const portionPct = holdings.totalGrams > 0 ? gramsToSell / holdings.totalGrams : 0;
    const costBasis = holdings.netInvestment * portionPct;
    const profitIfSellNow = rupeesToGet - costBasis;

    return (
        <div className="min-h-screen">
            <Header goldPrice={goldPrice} />

            {/* ── Sell Done Modal ─────────────────────────────────── */}
            {sellDone && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}>
                    <div className="relative max-w-md w-full rounded-2xl overflow-hidden text-center"
                        style={{ background: 'linear-gradient(135deg,rgba(20,20,30,.99),rgba(10,10,20,.99))', border: '1px solid rgba(251,191,36,0.3)', boxShadow: '0 0 80px rgba(251,191,36,0.15)', animation: 'fadeInUp 0.4s ease-out' }}>
                        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg,#f59e0b,#fcd34d,#f59e0b)' }} />
                        <div className="p-8">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl animate-pulse">
                                <span className="text-4xl">✓</span>
                            </div>
                            <h2 className="text-3xl font-bold gold-gradient-text mb-2" style={{ fontFamily: 'Playfair Display,serif' }}>
                                Sale Initiated!
                            </h2>
                            <p className="text-gray-400 mb-8">Amount will be credited to your account in 1–2 business days</p>
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                                    <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Gold Sold</p>
                                    <p className="text-2xl font-bold text-amber-400">{gramsToSell.toFixed(4)}g</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">You Receive</p>
                                    <p className="text-2xl font-bold text-white">₹{Math.round(rupeesToGet).toLocaleString()}</p>
                                </div>
                            </div>
                            <button onClick={() => router.push('/holdings')} className="btn-gold w-full py-3 text-base">
                                View My Holdings →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Page Header */}
                <div className="text-center mb-8 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-bold mb-3 gold-gradient-text" style={{ fontFamily: 'Playfair Display,serif' }}>
                        Sell Digital Gold
                    </h1>
                    <p className="text-gray-300 text-lg">Instant liquidity at current market rates</p>
                </div>

                {/* Live Sell Price */}
                <div className="premium-card p-6 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
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

                {/* ══════════════════ STEP: INPUT ══════════════════ */}
                {step === 'input' && (
                    <div className="premium-card p-8 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <h2 className="text-2xl font-bold text-white mb-2">Sell Gold</h2>
                        <p className="text-gray-400 text-sm mb-6">Enter the amount or grams you want to sell</p>

                        {/* Toggle */}
                        <div className="flex gap-3 mb-6">
                            <button onClick={() => { setSellMode('rupees'); setInputValue(''); setGramsToSell(0); setRupeesToGet(0); }}
                                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${sellMode === 'rupees' ? 'bg-amber-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                Amount (₹)
                            </button>
                            <button onClick={() => { setSellMode('grams'); setInputValue(''); setGramsToSell(0); setRupeesToGet(0); }}
                                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${sellMode === 'grams' ? 'bg-amber-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                Grams (g)
                            </button>
                        </div>

                        {/* Input */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {sellMode === 'rupees' ? 'Enter amount to receive (₹)' : 'Enter grams to sell (g)'}
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-amber-400">
                                    {sellMode === 'rupees' ? '₹' : 'g'}
                                </span>
                                <input
                                    type="number"
                                    value={inputValue}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    className="input-gold pl-12 text-xl"
                                    placeholder={sellMode === 'rupees' ? 'e.g. 5000' : 'e.g. 1.0'}
                                    min="0"
                                    step={sellMode === 'rupees' ? '100' : '0.001'}
                                />
                            </div>
                            <p className="text-gray-500 text-xs mt-2">
                                Available: {holdings.totalGrams.toFixed(4)} g &nbsp;·&nbsp; ≈ ₹{Math.round(currentValue).toLocaleString()}
                            </p>
                        </div>

                        {/* Quick glance */}
                        {gramsToSell > 0 && (
                            <div className="bg-black/20 rounded-lg p-4 border border-amber-500/20 mb-6">
                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-gray-400 text-xs mb-1">You'll Sell</p>
                                        <p className="text-xl font-bold text-amber-400">{gramsToSell.toFixed(4)} grams</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-400 text-xs mb-1">You'll Receive</p>
                                        <p className="text-xl font-bold text-white">₹{Math.round(rupeesToGet).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CTA */}
                        <button
                            onClick={() => { if (gramsToSell > 0 && rupeesToGet >= 100) setStep('analysis'); }}
                            disabled={gramsToSell <= 0 || rupeesToGet < 100 || gramsToSell > holdings.totalGrams}
                            className="btn-gold w-full py-4 text-lg disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {gramsToSell <= 0
                                ? 'Enter an amount to continue'
                                : rupeesToGet < 100
                                    ? 'Minimum sell amount is ₹100'
                                    : gramsToSell > holdings.totalGrams
                                        ? 'Exceeds your gold balance'
                                        : `Sell ${gramsToSell.toFixed(4)}g → View Analysis`}
                        </button>
                    </div>
                )}

                {/* ══════════════════ STEP: ANALYSIS ══════════════════ */}
                {step === 'analysis' && (
                    <>
                        {/* Back button */}
                        <button onClick={() => setStep('input')}
                            className="flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm font-medium mb-6 transition">
                            ← Back to Edit Amount
                        </button>

                        {/* Portfolio Summary */}
                        <div className="premium-card p-6 mb-6 animate-fade-in-up">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <span>📊</span> Your Portfolio
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-gray-400 text-xs mb-1">Total Gold</p>
                                    <p className="text-xl font-bold text-amber-400">{holdings.totalGrams.toFixed(4)}g</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs mb-1">Current Value</p>
                                    <p className="text-xl font-bold text-white">₹{Math.round(currentValue).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs mb-1">Invested</p>
                                    <p className="text-xl font-bold text-gray-300">₹{Math.round(holdings.netInvestment).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs mb-1">Overall P&L</p>
                                    <p className={`text-xl font-bold ${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {profitLoss >= 0 ? '+' : ''}₹{Math.round(profitLoss).toLocaleString()}
                                    </p>
                                    <p className={`text-xs ${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        ({profitLoss >= 0 ? '+' : ''}{profitPct.toFixed(2)}%)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Returns Comparison – the main card */}
                        <div className="rounded-2xl overflow-hidden mb-6 animate-fade-in-up"
                            style={{ border: '1px solid rgba(251,191,36,0.2)', background: 'rgba(0,0,0,0.4)' }}>

                            <div className="px-6 py-4 border-b border-white/10"
                                style={{ background: 'linear-gradient(90deg,rgba(251,191,36,0.1),transparent)' }}>
                                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                    <span>💰</span> Returns Analysis for {gramsToSell.toFixed(4)}g
                                </h3>
                                <p className="text-gray-400 text-sm mt-0.5">
                                    Selling ₹{Math.round(rupeesToGet).toLocaleString()} worth of gold — here's how timing affects your returns
                                </p>
                            </div>

                            <div className="p-6 space-y-4">

                                {/* ─ Sell Now ─ */}
                                <div className="rounded-xl p-5 border border-gray-600/40"
                                    style={{ background: 'rgba(156,163,175,0.06)' }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">⚡</span>
                                            <div>
                                                <p className="text-white font-semibold">Sell Now</p>
                                                <p className="text-gray-400 text-xs">Today's market rate</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-white">₹{Math.round(sellNowReturn).toLocaleString()}</p>
                                            <p className={`text-xs font-semibold ${profitIfSellNow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {profitIfSellNow >= 0 ? '+' : ''}₹{Math.round(profitIfSellNow).toLocaleString()} vs cost
                                            </p>
                                        </div>
                                    </div>
                                    <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
                                        <div className="h-full bg-gray-500 rounded-full" style={{ width: '55%' }} />
                                    </div>
                                    <p className="text-gray-500 text-xs mt-1">Baseline — immediate liquidity</p>
                                </div>

                                {/* ─ After 6 Months ─ */}
                                <div className="rounded-xl p-5 border border-blue-500/30"
                                    style={{ background: 'rgba(59,130,246,0.07)' }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">📅</span>
                                            <div>
                                                <p className="text-blue-200 font-semibold">If You Wait 6 Months</p>
                                                <p className="text-blue-400/70 text-xs">~4.95% historical growth</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-blue-200">₹{val6m.toLocaleString()}</p>
                                            <p className="text-blue-400 text-xs font-semibold">+₹{gain6m.toLocaleString()} extra</p>
                                        </div>
                                    </div>
                                    <div className="h-2 rounded-full bg-blue-900/40 overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-1000"
                                            style={{ width: '72%', background: 'linear-gradient(90deg,#3b82f6,#06b6d4)' }} />
                                    </div>
                                    <p className="text-blue-300/60 text-xs mt-1">
                                        ✨ ₹{gain6m.toLocaleString()} more compared to selling today
                                    </p>
                                </div>

                                {/* ─ After 1 Year ─ */}
                                <div className="rounded-xl p-5 border border-green-500/30"
                                    style={{ background: 'rgba(34,197,94,0.07)' }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">🎯</span>
                                            <div>
                                                <p className="text-green-200 font-semibold">If You Wait 1 Year</p>
                                                <p className="text-green-400/70 text-xs">~9.9% historical growth</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-green-200">₹{val1y.toLocaleString()}</p>
                                            <p className="text-green-400 text-xs font-semibold">+₹{gain1y.toLocaleString()} extra</p>
                                        </div>
                                    </div>
                                    <div className="h-2 rounded-full bg-green-900/40 overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-1000"
                                            style={{ width: '90%', background: 'linear-gradient(90deg,#22c55e,#10b981)' }} />
                                    </div>
                                    <p className="text-green-300/60 text-xs mt-1">
                                        ✨ ₹{gain1y.toLocaleString()} more compared to selling today
                                    </p>
                                </div>

                                {/* Disclaimer */}
                                <div className="rounded-lg p-4 border border-amber-500/20 mt-2"
                                    style={{ background: 'rgba(245,158,11,0.06)' }}>
                                    <p className="text-amber-200/80 text-xs flex items-start gap-2">
                                        <span className="text-base flex-shrink-0">💎</span>
                                        <span>
                                            <strong>Informational only.</strong> Projections are based on historical gold performance (~9.9% p.a.)
                                            and do not guarantee future returns. The final decision is always yours.
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Transaction breakdown */}
                        <div className="premium-card p-6 mb-8 animate-fade-in-up">
                            <h3 className="text-white font-semibold mb-4">Transaction Breakdown</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Grams to sell</span>
                                    <span className="text-white font-medium">{gramsToSell.toFixed(4)} g</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Sell rate</span>
                                    <span className="text-white font-medium">₹{goldPrice.pricePerGram.toLocaleString()}/g</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Selling charges</span>
                                    <span className="text-green-400 font-medium">₹0 (Zero charges)</span>
                                </div>
                                <div className="border-t border-white/10 pt-3 flex justify-between">
                                    <span className="text-white font-semibold">You'll receive</span>
                                    <span className="text-amber-400 font-bold text-lg">₹{Math.round(rupeesToGet).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Settlement</span>
                                    <span className="text-white">1–2 business days</span>
                                </div>
                            </div>
                        </div>

                        {/* Confirm Sell Button */}
                        <button
                            onClick={handleSell}
                            disabled={isProcessing}
                            className="btn-gold w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in-up"
                        >
                            {isProcessing ? (
                                <span className="flex items-center justify-center gap-3">
                                    <div className="spinner w-5 h-5 border-2" />
                                    Processing Sale...
                                </span>
                            ) : (
                                `Confirm Sell — ₹${Math.round(rupeesToGet).toLocaleString()}`
                            )}
                        </button>
                        <p className="text-gray-500 text-sm text-center mt-3">
                            🔒 Instant price lock · Zero charges · Settlement in 1–2 days
                        </p>
                    </>
                )}

                {/* Benefits */}
                <div className="grid md:grid-cols-3 gap-4 mt-10">
                    {[['⚡', 'Instant Liquidity', 'Sell anytime at live rates'],
                    ['💰', 'Zero Charges', 'No deduction on selling'],
                    ['🏦', 'Quick Settlement', 'Money in 1–2 business days']].map(([icon, title, desc]) => (
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
