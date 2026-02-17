'use client';

import { useState, useEffect } from 'react';
import { GoldPriceTrend } from '@/types';

interface PriceChartProps {
    trends: GoldPriceTrend[];
}

export default function PriceChart({ trends }: PriceChartProps) {
    const [selectedPeriod, setSelectedPeriod] = useState<'1m' | '5m' | '6m' | '1y'>('1m');
    const [chartData, setChartData] = useState<{ date: string; price: number }[]>([]);

    const periods = [
        { value: '1m', label: '1 Month' },
        { value: '5m', label: '5 Months' },
        { value: '6m', label: '6 Months' },
        { value: '1y', label: '1 Year' },
    ];

    useEffect(() => {
        const trend = trends.find(t => t.period === selectedPeriod);
        if (trend) {
            // Sample data for display (show every nth point for cleaner chart)
            const sampleRate = selectedPeriod === '1y' ? 7 : selectedPeriod === '6m' ? 5 : selectedPeriod === '5m' ? 4 : 1;
            const sampled = trend.data.filter((_, i) => i % sampleRate === 0);
            setChartData(sampled);
        }
    }, [selectedPeriod, trends]);

    const calculateStats = () => {
        if (chartData.length === 0) return { min: 0, max: 0, change: 0, changePercent: 0 };

        const prices = chartData.map(d => d.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const first = prices[0];
        const last = prices[prices.length - 1];
        const change = last - first;
        const changePercent = (change / first) * 100;

        return { min, max, change, changePercent };
    };

    const stats = calculateStats();

    const renderChart = () => {
        if (chartData.length === 0) return null;

        const prices = chartData.map(d => d.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const priceRange = maxPrice - minPrice || 1;

        const width = 100;
        const height = 60;
        const padding = 5;

        const points = chartData.map((d, i) => {
            const x = (i / (chartData.length - 1)) * (width - padding * 2) + padding;
            const y = height - padding - ((d.price - minPrice) / priceRange) * (height - padding * 2);
            return `${x},${y}`;
        }).join(' ');

        const areaPoints = `${padding},${height} ${points} ${width - padding},${height}`;

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48" preserveAspectRatio="none">
                {/* Grid lines */}
                <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="rgba(245, 158, 11, 0.1)" strokeWidth="0.2" />
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(245, 158, 11, 0.1)" strokeWidth="0.2" />

                {/* Area fill */}
                <polygon
                    points={areaPoints}
                    fill="url(#areaGradient)"
                    opacity="0.3"
                />

                {/* Line */}
                <polyline
                    points={points}
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="0.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Gradients */}
                <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="50%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>
        );
    };

    return (
        <div className="premium-card p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span>📊</span>
                        Gold Price Trends
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">Historical price analysis</p>
                </div>

                {/* Period Selector */}
                <div className="flex gap-2">
                    {periods.map((period) => (
                        <button
                            key={period.value}
                            onClick={() => setSelectedPeriod(period.value as any)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${selectedPeriod === period.value
                                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {period.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                    <p className="text-xs text-gray-400 mb-1">Lowest</p>
                    <p className="text-lg font-bold text-white">₹{stats.min.toLocaleString()}</p>
                </div>
                <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                    <p className="text-xs text-gray-400 mb-1">Highest</p>
                    <p className="text-lg font-bold text-white">₹{stats.max.toLocaleString()}</p>
                </div>
                <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                    <p className="text-xs text-gray-400 mb-1">Change</p>
                    <p className={`text-lg font-bold ${stats.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {stats.change >= 0 ? '+' : ''}₹{stats.change.toFixed(0)}
                    </p>
                </div>
                <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                    <p className="text-xs text-gray-400 mb-1">% Change</p>
                    <p className={`text-lg font-bold ${stats.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {stats.changePercent >= 0 ? '+' : ''}{stats.changePercent.toFixed(2)}%
                    </p>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-black/20 rounded-lg p-4 border border-amber-500/10">
                {renderChart()}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-600"></div>
                    <span>Price Movement</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Growth</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Decline</span>
                </div>
            </div>
        </div>
    );
}
