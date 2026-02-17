'use client';

import Link from 'next/link';
import { AIRecommendation } from '@/types';
import { captionService } from '@/services/caption.service';
import { useState } from 'react';

interface AIRecommendationCardProps {
    recommendation: AIRecommendation;
    onAction?: (action: string) => void;
}

export default function AIRecommendationCard({ recommendation, onAction }: AIRecommendationCardProps) {
    const uiPackage = captionService.generateCompleteUI(recommendation);
    const [isExpanded, setIsExpanded] = useState(false);

    const getActionColor = () => {
        switch (recommendation.action) {
            case 'buy': return 'from-green-500 to-emerald-600';
            case 'sell': return 'from-red-500 to-orange-600';
            default: return 'from-blue-500 to-cyan-600';
        }
    };

    const getActionIcon = () => {
        switch (recommendation.action) {
            case 'buy': return '🚀';
            case 'sell': return '📈';
            default: return '🛡️';
        }
    };

    const getActionLink = () => {
        switch (recommendation.action) {
            case 'buy': return '/buy';
            case 'sell': return '/sell';
            default: return '/home';
        }
    };

    return (
        <div className="premium-card p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getActionColor()} flex items-center justify-center text-2xl shadow-lg`}>
                        {getActionIcon()}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">{uiPackage.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">AI-Powered Recommendation</p>
                    </div>
                </div>

                {/* Confidence Badge */}
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${uiPackage.confidenceBadge.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                    uiPackage.confidenceBadge.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-amber-500/20 text-amber-400'
                    }`}>
                    {uiPackage.confidenceBadge.emoji} {uiPackage.confidenceBadge.text}
                </div>
            </div>

            {/* Description */}
            <p className="text-gray-300 leading-relaxed">
                {uiPackage.description}
            </p>

            {/* Nudge Message */}
            {uiPackage.nudge && (
                <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <p className="text-amber-100 font-medium flex-1">{uiPackage.nudge}</p>
                </div>
            )}

            {/* Hold Message */}
            {uiPackage.holdMessage && (
                <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3">
                    <span className="text-2xl">💎</span>
                    <p className="text-blue-100 font-medium flex-1">{uiPackage.holdMessage}</p>
                </div>
            )}

            {/* Risk Warning */}
            {uiPackage.riskWarning && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-200 text-sm flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{uiPackage.riskWarning}</span>
                </div>
            )}

            {/* Return Message */}
            {uiPackage.returnMessage && (
                <div className="flex items-center gap-2 text-green-400">
                    <span className="text-xl">📊</span>
                    <span className="font-semibold">{uiPackage.returnMessage}</span>
                </div>
            )}

            {/* Factor Insights */}
            {uiPackage.insights.length > 0 && (
                <div className="space-y-2">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-sm text-amber-400 hover:text-amber-300 transition flex items-center gap-2"
                    >
                        <span>{isExpanded ? '▼' : '▶'}</span>
                        <span>View Analysis Factors ({uiPackage.insights.length})</span>
                    </button>

                    {isExpanded && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            {uiPackage.insights.map((insight, index) => (
                                <div
                                    key={index}
                                    className="bg-black/20 rounded-lg p-3 border border-white/5 flex items-center gap-3"
                                >
                                    <span className="text-2xl">{insight.icon}</span>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-400">{insight.label}</p>
                                        <p className={`font-semibold ${insight.sentiment === 'positive' ? 'text-green-400' :
                                            insight.sentiment === 'negative' ? 'text-red-400' :
                                                'text-gray-300'
                                            }`}>
                                            {insight.value}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Action Button */}
            <div className="pt-4 border-t border-white/5">
                <Link
                    href={getActionLink()}
                    className={`w-full block text-center ${uiPackage.ctaButton.variant === 'primary' ? 'btn-gold' :
                        uiPackage.ctaButton.variant === 'secondary' ? 'btn-outline-gold' :
                            'btn-outline-gold'
                        }`}
                >
                    {uiPackage.ctaButton.text}
                </Link>

                <p className="text-xs text-gray-500 text-center mt-3">
                    This is a suggestion, not financial advice. Please consult a financial advisor.
                </p>
            </div>

            {/* Timestamp */}
            <div className="text-xs text-gray-500 text-center">
                Updated: {new Date(recommendation.timestamp).toLocaleString()}
            </div>
        </div>
    );
}
