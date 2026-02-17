import { AIRecommendation } from '@/types';

/**
 * UI Caption Generation Service
 * Converts AI recommendations into user-friendly UI messages and nudges
 */
class CaptionGenerationService {
    /**
     * Generate primary action caption
     */
    generateActionCaption(recommendation: AIRecommendation): string {
        const { action, confidence } = recommendation;

        if (action === 'buy') {
            if (confidence > 80) {
                return '🌟 Excellent time to invest in gold!';
            } else if (confidence > 60) {
                return '✨ Good opportunity to buy gold';
            } else {
                return '💡 Consider adding gold to your portfolio';
            }
        } else if (action === 'sell') {
            if (confidence > 80) {
                return '📈 Strong signal to book profits';
            } else if (confidence > 60) {
                return '🤔 You might consider partial profit booking';
            } else {
                return '💭 Evaluate selling some holdings';
            }
        } else { // hold
            return '🛡️ Hold your gold for long-term wealth';
        }
    }

    /**
     * Generate detailed description
     */
    generateDescription(recommendation: AIRecommendation): string {
        return recommendation.reasoning;
    }

    /**
     * Generate nudge message for buying
     */
    generateBuyNudge(recommendation: AIRecommendation): string | null {
        if (recommendation.action !== 'buy') return null;

        const nudges = [
            '🎯 Smart investors are accumulating gold now',
            '💰 Protect your wealth with digital gold today',
            '🌟 Your future self will thank you for buying now',
            '📊 Historical trends suggest this is a strategic entry point',
            '⚡ Don\'t miss this opportunity - gold prices may surge'
        ];

        // Select based on confidence
        const index = Math.floor((recommendation.confidence / 100) * (nudges.length - 1));
        return nudges[index];
    }

    /**
     * Generate hold encouragement message
     */
    generateHoldEncouragement(recommendation: AIRecommendation): string | null {
        if (recommendation.action === 'buy') return null;

        const holdMessages = [
            '💎 Patience pays - gold is a long-term wealth builder',
            '🏆 Champions hold through volatility for greater returns',
            '📈 Each day you hold, you\'re closer to your wealth goals',
            '🛡️ Your gold is your financial fortress - keep it strong',
            '⏰ Time in the market beats timing the market'
        ];

        return holdMessages[Math.floor(Math.random() * holdMessages.length)];
    }

    /**
     * Generate risk warning caption
     */
    generateRiskWarning(recommendation: AIRecommendation): string | null {
        if (recommendation.riskLevel === 'low') return null;

        if (recommendation.riskLevel === 'high') {
            return '⚠️ High market volatility detected - invest cautiously';
        } else {
            return '⚡ Moderate market fluctuations expected';
        }
    }

    /**
     * Generate expected return message
     */
    generateReturnMessage(recommendation: AIRecommendation): string | null {
        if (!recommendation.expectedReturn || recommendation.action === 'sell') return null;

        const returnPercent = recommendation.expectedReturn.toFixed(1);
        return `📊 Expected annual return: ~${returnPercent}%`;
    }

    /**
     * Generate confidence badge
     */
    generateConfidenceBadge(recommendation: AIRecommendation): {
        text: string;
        color: string;
        emoji: string;
    } {
        const { confidence } = recommendation;

        if (confidence > 80) {
            return {
                text: 'High Confidence',
                color: 'emerald',
                emoji: '🎯'
            };
        } else if (confidence > 60) {
            return {
                text: 'Good Confidence',
                color: 'blue',
                emoji: '✓'
            };
        } else {
            return {
                text: 'Moderate',
                color: 'amber',
                emoji: '~'
            };
        }
    }

    /**
     * Generate factor insights
     */
    generateFactorInsights(recommendation: AIRecommendation): Array<{
        label: string;
        value: string;
        sentiment: 'positive' | 'negative' | 'neutral';
        icon: string;
    }> {
        const { factors } = recommendation;
        const insights: Array<{
            label: string;
            value: string;
            sentiment: 'positive' | 'negative' | 'neutral';
            icon: string;
        }> = [];

        // Economic Score
        if (Math.abs(factors.economicScore) > 20) {
            insights.push({
                label: 'Economic Climate',
                value: factors.economicScore > 0 ? 'Favorable' : 'Challenging',
                sentiment: factors.economicScore > 0 ? 'positive' : 'negative',
                icon: '📊'
            });
        }

        // Geopolitical
        if (factors.warFactors > 30) {
            insights.push({
                label: 'Geopolitical Risk',
                value: factors.warFactors > 60 ? 'High' : 'Moderate',
                sentiment: 'positive', // High risk is good for gold
                icon: '🌍'
            });
        }

        // Price Movement
        if (Math.abs(factors.priceMovement) > 2) {
            insights.push({
                label: '24h Price Change',
                value: `${factors.priceMovement > 0 ? '+' : ''}${factors.priceMovement.toFixed(2)}%`,
                sentiment: factors.priceMovement < 0 ? 'positive' : 'neutral', // Dip is buying opportunity
                icon: '💹'
            });
        }

        // Goal Progress
        if (factors.goalProgressScore > 60) {
            insights.push({
                label: 'Goal Progress',
                value: 'On Track',
                sentiment: 'positive',
                icon: '🎯'
            });
        }

        return insights;
    }

    /**
     * Generate complete UI package
     */
    generateCompleteUI(recommendation: AIRecommendation): {
        title: string;
        description: string;
        nudge: string | null;
        holdMessage: string | null;
        riskWarning: string | null;
        returnMessage: string | null;
        confidenceBadge: ReturnType<typeof this.generateConfidenceBadge>;
        insights: ReturnType<typeof this.generateFactorInsights>;
        ctaButton: {
            text: string;
            variant: 'primary' | 'secondary' | 'outline';
        };
    } {
        return {
            title: this.generateActionCaption(recommendation),
            description: this.generateDescription(recommendation),
            nudge: this.generateBuyNudge(recommendation),
            holdMessage: this.generateHoldEncouragement(recommendation),
            riskWarning: this.generateRiskWarning(recommendation),
            returnMessage: this.generateReturnMessage(recommendation),
            confidenceBadge: this.generateConfidenceBadge(recommendation),
            insights: this.generateFactorInsights(recommendation),
            ctaButton: this.generateCTAButton(recommendation)
        };
    }

    /**
     * Generate CTA button config
     */
    private generateCTAButton(recommendation: AIRecommendation): {
        text: string;
        variant: 'primary' | 'secondary' | 'outline';
    } {
        switch (recommendation.action) {
            case 'buy':
                return {
                    text: recommendation.suggestedAmount
                        ? `Buy ₹${recommendation.suggestedAmount.toLocaleString()} Gold`
                        : 'Buy Gold Now',
                    variant: 'primary'
                };
            case 'sell':
                return {
                    text: 'Review Portfolio',
                    variant: 'secondary'
                };
            default:
                return {
                    text: 'View Holdings',
                    variant: 'outline'
                };
        }
    }
}

// Export singleton instance
export const captionService = new CaptionGenerationService();
