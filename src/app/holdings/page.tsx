'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { getCurrentGoldPrice, getPurchaseHistory } from '@/services/mock-data.service';
import { GoldPrice } from '@/types';
import { PurchaseHistory } from '@/types/user';

export default function HoldingsPage() {
    const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null);
    const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([]);
    const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

    useEffect(() => {
        setGoldPrice(getCurrentGoldPrice());
        setPurchaseHistory(getPurchaseHistory());
    }, []);

    // Calculate live stats from actual transaction history (includes localStorage purchases)
    const totalGoldBought = purchaseHistory
        .filter(t => t.type === 'buy')
        .reduce((sum, t) => sum + t.goldGrams, 0);
    const totalGoldSold = purchaseHistory
        .filter(t => t.type === 'sell')
        .reduce((sum, t) => sum + t.goldGrams, 0);
    const totalGoldHoldings = parseFloat((totalGoldBought - totalGoldSold).toFixed(4));

    const totalInvested = purchaseHistory
        .filter(t => t.type === 'buy')
        .reduce((sum, t) => sum + t.totalAmount, 0);
    const totalReceived = purchaseHistory
        .filter(t => t.type === 'sell')
        .reduce((sum, t) => sum + t.totalAmount, 0);
    const netInvestment = totalInvested - totalReceived;

    const currentValue = totalGoldHoldings * (goldPrice?.pricePerGram || 0);
    const totalProfit = currentValue - netInvestment;
    const profitPercent = netInvestment > 0 ? (totalProfit / netInvestment) * 100 : 0;
    const avgBuyPrice = totalGoldBought > 0 ? totalInvested / totalGoldBought : 0;


    const filteredHistory = purchaseHistory.filter(txn => {
        if (filter === 'all') return true;
        return txn.type === filter;
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatShortDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Calculate per-transaction profit/loss at current price
    const getTransactionProfitLoss = (txn: PurchaseHistory) => {
        if (!goldPrice || txn.type === 'sell') return null;
        const currentWorth = txn.goldGrams * goldPrice.pricePerGram;
        const profitLoss = currentWorth - txn.totalAmount;
        const profitLossPercent = (profitLoss / txn.totalAmount) * 100;
        return { profitLoss, profitLossPercent, currentWorth };
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
            <Header goldPrice={goldPrice || undefined} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Page Header */}
                <div className="mb-8 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-bold gold-gradient-text mb-3">
                        My Gold Holdings
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Track your gold investments, purchases and transaction history
                    </p>
                </div>

                {/* Holdings Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="premium-card p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">💎</span>
                            <p className="text-gray-400 text-sm">Total Gold</p>
                        </div>
                        <p className="text-2xl font-bold text-amber-400">{totalGoldHoldings.toFixed(3)}g</p>
                        <p className="text-gray-500 text-xs mt-1">
                            Worth ₹{Math.round(currentValue).toLocaleString()}
                        </p>
                    </div>

                    <div className="premium-card p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">💰</span>
                            <p className="text-gray-400 text-sm">Invested</p>
                        </div>
                        <p className="text-2xl font-bold text-white">₹{netInvestment.toLocaleString()}</p>
                        <p className="text-gray-500 text-xs mt-1">
                            {purchaseHistory.filter(t => t.type === 'buy').length} purchases
                        </p>
                    </div>

                    <div className="premium-card p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{totalProfit >= 0 ? '📈' : '📉'}</span>
                            <p className="text-gray-400 text-sm">Returns</p>
                        </div>
                        <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {totalProfit >= 0 ? '+' : ''}₹{Math.round(totalProfit).toLocaleString()}
                        </p>
                        <p className={`text-sm mt-1 ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {totalProfit >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%
                        </p>
                    </div>

                    <div className="premium-card p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">⚖️</span>
                            <p className="text-gray-400 text-sm">Avg. Buy Price</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-200">₹{Math.round(avgBuyPrice).toLocaleString()}</p>
                        <p className="text-gray-500 text-xs mt-1">
                            per gram
                        </p>
                    </div>
                </div>

                {/* Transaction History Header */}
                <div className="premium-card p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <h2 className="text-2xl font-bold text-white">Purchase History</h2>

                        <div className="flex items-center gap-3">
                            {/* View Toggle */}
                            <div className="flex bg-gray-800/50 rounded-lg p-1 border border-gray-700/50">
                                <button
                                    onClick={() => setViewMode('cards')}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'cards'
                                        ? 'bg-amber-500/20 text-amber-400'
                                        : 'text-gray-400 hover:text-gray-300'
                                        }`}
                                >
                                    📋 Cards
                                </button>
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'table'
                                        ? 'bg-amber-500/20 text-amber-400'
                                        : 'text-gray-400 hover:text-gray-300'
                                        }`}
                                >
                                    📊 Table
                                </button>
                            </div>

                            {/* Filter */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'all'
                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                        : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:border-gray-600'
                                        }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilter('buy')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'buy'
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:border-gray-600'
                                        }`}
                                >
                                    Buys
                                </button>
                                <button
                                    onClick={() => setFilter('sell')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'sell'
                                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                        : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:border-gray-600'
                                        }`}
                                >
                                    Sells
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Cards View */}
                    {viewMode === 'cards' && (
                        <div className="space-y-4">
                            {filteredHistory.map((txn, index) => {
                                const pl = getTransactionProfitLoss(txn);
                                return (
                                    <div
                                        key={txn.id}
                                        className="bg-gradient-to-r from-white/[0.03] to-white/[0.01] border border-white/10 rounded-xl p-5 hover:border-amber-500/20 transition-all"
                                        style={{
                                            animation: 'fadeInUp 0.4s ease-out',
                                            animationDelay: `${index * 0.06}s`,
                                            animationFillMode: 'backwards'
                                        }}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                                            {/* Left: Date & Type Badge */}
                                            <div className="flex items-center gap-4 md:w-1/4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${txn.type === 'buy'
                                                    ? 'bg-green-500/15 border border-green-500/30'
                                                    : 'bg-red-500/15 border border-red-500/30'
                                                    }`}>
                                                    <span className="text-2xl">{txn.type === 'buy' ? '🛒' : '💸'}</span>
                                                </div>
                                                <div>
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${txn.type === 'buy'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-red-500/20 text-red-400'
                                                        }`}>
                                                        {txn.type === 'buy' ? '↑ BOUGHT' : '↓ SOLD'}
                                                    </span>
                                                    <p className="text-gray-400 text-sm mt-1">{formatShortDate(txn.timestamp)}</p>
                                                </div>
                                            </div>

                                            {/* Center: Gold & Price Details */}
                                            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3">
                                                <div>
                                                    <p className="text-xs text-gray-500">Gold Amount</p>
                                                    <p className="text-lg font-bold text-amber-400">{txn.goldGrams.toFixed(3)}g</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Rate per gram</p>
                                                    <p className="text-base font-semibold text-gray-300">₹{txn.pricePerGram.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Total Amount</p>
                                                    <p className="text-lg font-bold text-white">₹{txn.totalAmount.toLocaleString()}</p>
                                                </div>
                                            </div>

                                            {/* Right: Profit/Loss & Status */}
                                            <div className="flex items-center gap-4 md:w-1/4 md:justify-end">
                                                {pl && (
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500">Current P&L</p>
                                                        <p className={`text-base font-bold ${pl.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                            {pl.profitLoss >= 0 ? '+' : ''}₹{Math.round(pl.profitLoss).toLocaleString()}
                                                        </p>
                                                        <p className={`text-xs ${pl.profitLossPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                            {pl.profitLossPercent >= 0 ? '+' : ''}{pl.profitLossPercent.toFixed(2)}%
                                                        </p>
                                                    </div>
                                                )}
                                                <div className="text-right">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${txn.status === 'completed'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : txn.status === 'pending'
                                                            ? 'bg-yellow-500/20 text-yellow-400'
                                                            : 'bg-red-500/20 text-red-400'
                                                        }`}>
                                                        {txn.status === 'completed' && '✓'}
                                                        {txn.status === 'pending' && '⏳'}
                                                        {txn.status === 'failed' && '✗'}
                                                        {' '}{txn.status}
                                                    </span>
                                                    {txn.paymentMethod && (
                                                        <p className="text-xs text-gray-500 mt-1">{txn.paymentMethod}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Transaction ID */}
                                        {txn.transactionId && (
                                            <div className="mt-3 pt-3 border-t border-white/5">
                                                <p className="text-xs text-gray-600 font-mono">TxID: {txn.transactionId}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Table View */}
                    {viewMode === 'table' && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-700/50">
                                        <th className="text-left py-4 px-4 text-gray-400 font-semibold text-sm">Date</th>
                                        <th className="text-left py-4 px-4 text-gray-400 font-semibold text-sm">Type</th>
                                        <th className="text-right py-4 px-4 text-gray-400 font-semibold text-sm">Gold (g)</th>
                                        <th className="text-right py-4 px-4 text-gray-400 font-semibold text-sm">Price/g</th>
                                        <th className="text-right py-4 px-4 text-gray-400 font-semibold text-sm">Total Amount</th>
                                        <th className="text-right py-4 px-4 text-gray-400 font-semibold text-sm">P&L</th>
                                        <th className="text-left py-4 px-4 text-gray-400 font-semibold text-sm">Payment</th>
                                        <th className="text-center py-4 px-4 text-gray-400 font-semibold text-sm">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredHistory.map((txn, index) => {
                                        const pl = getTransactionProfitLoss(txn);
                                        return (
                                            <tr
                                                key={txn.id}
                                                className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-all"
                                                style={{
                                                    animation: 'fadeInUp 0.5s ease-out',
                                                    animationDelay: `${index * 0.05}s`,
                                                    animationFillMode: 'backwards'
                                                }}
                                            >
                                                <td className="py-4 px-4 text-gray-300 text-sm">
                                                    {formatDate(txn.timestamp)}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${txn.type === 'buy'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-red-500/20 text-red-400'
                                                        }`}>
                                                        {txn.type === 'buy' ? '↑' : '↓'} {txn.type.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-right text-amber-400 font-semibold">
                                                    {txn.goldGrams.toFixed(3)}g
                                                </td>
                                                <td className="py-4 px-4 text-right text-gray-300">
                                                    ₹{txn.pricePerGram.toLocaleString()}
                                                </td>
                                                <td className="py-4 px-4 text-right text-white font-semibold">
                                                    ₹{txn.totalAmount.toLocaleString()}
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    {pl ? (
                                                        <div>
                                                            <p className={`font-semibold ${pl.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                                {pl.profitLoss >= 0 ? '+' : ''}₹{Math.round(pl.profitLoss).toLocaleString()}
                                                            </p>
                                                            <p className={`text-xs ${pl.profitLossPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                                {pl.profitLossPercent >= 0 ? '+' : ''}{pl.profitLossPercent.toFixed(1)}%
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-500">—</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-gray-400 text-sm">
                                                    {txn.paymentMethod}
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${txn.status === 'completed'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : txn.status === 'pending'
                                                            ? 'bg-yellow-500/20 text-yellow-400'
                                                            : 'bg-red-500/20 text-red-400'
                                                        }`}>
                                                        {txn.status === 'completed' && '✓'}
                                                        {txn.status === 'pending' && '⏳'}
                                                        {txn.status === 'failed' && '✗'}
                                                        {' '}{txn.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {filteredHistory.length === 0 && (
                        <div className="text-center py-12">
                            <span className="text-6xl mb-4 block">📭</span>
                            <p className="text-gray-400">No {filter !== 'all' ? filter : ''} transactions found</p>
                        </div>
                    )}
                </div>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-2 gap-6 mt-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-green-300 mb-4 flex items-center gap-2">
                            <span>🛒</span> Total Purchases
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Transactions:</span>
                                <span className="text-white font-semibold">
                                    {purchaseHistory.filter(t => t.type === 'buy').length}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Total Gold Bought:</span>
                                <span className="text-green-400 font-semibold">
                                    {purchaseHistory.filter(t => t.type === 'buy').reduce((sum, t) => sum + t.goldGrams, 0).toFixed(3)}g
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Amount Invested:</span>
                                <span className="text-white font-semibold">
                                    ₹{purchaseHistory.filter(t => t.type === 'buy').reduce((sum, t) => sum + t.totalAmount, 0).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Avg. Buy Price:</span>
                                <span className="text-amber-400 font-semibold">
                                    ₹{Math.round(avgBuyPrice).toLocaleString()}/g
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-red-300 mb-4 flex items-center gap-2">
                            <span>💸</span> Total Sales
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Transactions:</span>
                                <span className="text-white font-semibold">
                                    {purchaseHistory.filter(t => t.type === 'sell').length}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Total Gold Sold:</span>
                                <span className="text-red-400 font-semibold">
                                    {purchaseHistory.filter(t => t.type === 'sell').reduce((sum, t) => sum + t.goldGrams, 0).toFixed(3)}g
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Amount Received:</span>
                                <span className="text-white font-semibold">
                                    ₹{purchaseHistory.filter(t => t.type === 'sell').reduce((sum, t) => sum + t.totalAmount, 0).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-8 text-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <div className="premium-card p-8 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 border border-amber-500/20">
                        <h3 className="text-xl font-bold text-white mb-2">Want to grow your gold portfolio?</h3>
                        <p className="text-gray-400 mb-5">Gold prices are showing positive momentum. Consider adding more to your holdings.</p>
                        <div className="flex items-center justify-center gap-4">
                            <Link href="/buy" className="btn-gold px-8 py-3">
                                Buy More Gold →
                            </Link>
                            <Link href="/sell" className="btn-outline-gold px-8 py-3">
                                Sell Gold
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
