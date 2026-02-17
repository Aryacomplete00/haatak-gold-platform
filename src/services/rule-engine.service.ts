import { AIRecommendation, RecommendationFactors, User, GoldPrice, EconomicData } from '@/types';

/**
 * AI Rule Evaluation Engine
 * Evaluates multiple factors to generate intelligent buy/sell/hold recommendations
 */
class RuleEvaluationEngine {
    /**
     * Main evaluation function that combines all factors
     */
    evaluateRecommendation(
        user: User,
        currentGoldPrice: GoldPrice,
        economicData: EconomicData,
        historicalTrends: number[] // last 30 days price changes
    ): AIRecommendation {
        const factors = this.calculateFactors(user, currentGoldPrice, economicData, historicalTrends);
        const overallScore = this.calculateOverallScore(factors);

        // Determine action based on overall score
        let action: 'buy' | 'hold' | 'sell';
        let confidence: number;

        if (overallScore > 30) {
            action = 'buy';
            confidence = Math.min(95, 60 + overallScore * 0.5);
        } else if (overallScore < -30) {
            action = 'sell';
            confidence = Math.min(95, 60 + Math.abs(overallScore) * 0.5);
        } else {
            action = 'hold';
            confidence = Math.min(95, 50 + Math.abs(overallScore) * 0.3);
        }

        const reasoning = this.generateReasoning(action, factors, user);
        const riskLevel = this.assessRiskLevel(factors);

        return {
            action,
            confidence,
            reasoning,
            factors,
            suggestedAmount: action === 'buy' ? this.calculateSuggestedAmount(user, currentGoldPrice) : undefined,
            expectedReturn: this.calculateExpectedReturn(action, factors, currentGoldPrice),
            riskLevel,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Calculate all recommendation factors
     */
    private calculateFactors(
        user: User,
        currentGoldPrice: GoldPrice,
        economicData: EconomicData,
        historicalTrends: number[]
    ): RecommendationFactors {
        return {
            economicScore: this.evaluateEconomicFactors(economicData),
            geopoliticalScore: this.evaluateGeopoliticalFactors(economicData),
            gdpTrend: economicData.gdp.trend > 0 ?
                Math.min(100, economicData.gdp.trend * 10) :
                Math.max(-100, economicData.gdp.trend * 10),
            warFactors: economicData.geopoliticalRisk.level,
            politicalStability: 100 - economicData.geopoliticalRisk.level,
            currentAffairsImpact: economicData.marketSentiment.score,
            priceMovement: currentGoldPrice.changePercent24h,
            userBehaviorScore: this.evaluateUserBehavior(user),
            goalProgressScore: this.evaluateGoalProgress(user)
        };
    }

    /**
     * Evaluate economic factors
     */
    private evaluateEconomicFactors(economicData: EconomicData): number {
        let score = 0;

        // High inflation is positive for gold
        if (economicData.inflation.current > 3) {
            score += 30;
        }

        // Rising inflation is positive
        if (economicData.inflation.trend > 0) {
            score += 20;
        }

        // Low interest rates are positive for gold
        if (economicData.interestRate.current < 4) {
            score += 25;
        }

        // Falling interest rates are positive
        if (economicData.interestRate.trend < 0) {
            score += 25;
        }

        return Math.max(-100, Math.min(100, score));
    }

    /**
     * Evaluate geopolitical factors
     */
    private evaluateGeopoliticalFactors(economicData: EconomicData): number {
        // Higher geopolitical risk is positive for gold (safe haven)
        const riskScore = economicData.geopoliticalRisk.level;

        // Negative market sentiment is positive for gold
        const sentimentScore = -economicData.marketSentiment.score / 2;

        return Math.max(-100, Math.min(100, riskScore + sentimentScore));
    }

    /**
     * Evaluate user behavior patterns
     */
    private evaluateUserBehavior(user: User): number {
        let score = 50; // neutral start

        // Regular investors get bonus
        if (user.averagePurchaseFrequency > 0 && user.averagePurchaseFrequency < 45) {
            score += 30;
        }

        // Has active SIP targets
        if (user.sipTargets && user.sipTargets.length > 0) {
            score += 20;
        }

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Evaluate goal progress
     */
    private evaluateGoalProgress(user: User): number {
        let score = 50;

        // Check SIP progress
        if (user.sipTargets && user.sipTargets.length > 0) {
            const avgProgress = user.sipTargets.reduce((sum, sip) =>
                sum + (sip.currentProgress / sip.targetAmount) * 100, 0
            ) / user.sipTargets.length;

            // If below 80% of target, encourage buying
            if (avgProgress < 80) {
                score += 30;
            }
        }

        // Check wealth targets
        if (user.wealthTargets && user.wealthTargets.length > 0) {
            const avgProgress = user.wealthTargets.reduce((sum, target) =>
                sum + (target.currentGrams / target.targetGoldGrams) * 100, 0
            ) / user.wealthTargets.length;

            if (avgProgress < 80) {
                score += 20;
            }
        }

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Calculate overall recommendation score
     */
    private calculateOverallScore(factors: RecommendationFactors): number {
        // Weighted scoring system
        const weights = {
            economicScore: 0.2,
            geopoliticalScore: 0.15,
            gdpTrend: 0.1,
            warFactors: 0.15,
            politicalStability: 0.05,
            currentAffairsImpact: 0.1,
            priceMovement: 0.1,
            userBehaviorScore: 0.08,
            goalProgressScore: 0.07
        };

        let totalScore = 0;
        totalScore += factors.economicScore * weights.economicScore;
        totalScore += factors.geopoliticalScore * weights.geopoliticalScore;
        totalScore += factors.gdpTrend * weights.gdpTrend;
        totalScore += factors.warFactors * weights.warFactors;
        totalScore -= factors.politicalStability * weights.politicalStability; // Stability is negative for gold
        totalScore += factors.currentAffairsImpact * weights.currentAffairsImpact;
        totalScore += (factors.priceMovement > 0 ? -factors.priceMovement : Math.abs(factors.priceMovement)) * weights.priceMovement * 10;
        totalScore += (factors.userBehaviorScore - 50) * weights.userBehaviorScore;
        totalScore += (factors.goalProgressScore - 50) * weights.goalProgressScore;

        return totalScore;
    }

    /**
     * Generate human-readable reasoning
     */
    private generateReasoning(action: string, factors: RecommendationFactors, user: User): string {
        const reasons: string[] = [];

        if (action === 'buy') {
            if (factors.economicScore > 20) {
                reasons.push('Current economic conditions favor gold investment with rising inflation');
            }
            if (factors.geopoliticalScore > 20) {
                reasons.push('Increased geopolitical tensions make gold a safe haven asset');
            }
            if (factors.priceMovement < -2) {
                reasons.push('Recent price dip presents a good buying opportunity');
            }
            if (factors.goalProgressScore > 60) {
                reasons.push('Aligning with your investment goals and SIP targets');
            }
            if (factors.warFactors > 40) {
                reasons.push('Global uncertainty drives demand for safe assets');
            }
        } else if (action === 'sell') {
            if (factors.economicScore < -20) {
                reasons.push('Economic indicators suggest lower gold demand');
            }
            if (factors.politicalStability > 70) {
                reasons.push('Stable political environment may reduce safe haven appeal');
            }
            if (factors.priceMovement > 5) {
                reasons.push('Significant price appreciation - consider booking profits');
            }
        } else { // hold
            reasons.push('Market conditions suggest maintaining current position');
            reasons.push('Gold continues to be a stable long-term wealth preserver');
            if (user.sipTargets && user.sipTargets.length > 0) {
                reasons.push('Continue your SIP for rupee cost averaging benefits');
            }
        }

        return reasons.join('. ') + '.';
    }

    /**
     * Assess risk level
     */
    private assessRiskLevel(factors: RecommendationFactors): 'low' | 'medium' | 'high' {
        const volatilityScore =
            Math.abs(factors.priceMovement) +
            Math.abs(factors.currentAffairsImpact) / 2 +
            factors.warFactors / 2;

        if (volatilityScore > 60) return 'high';
        if (volatilityScore > 30) return 'medium';
        return 'low';
    }

    /**
     * Calculate suggested investment amount
     */
    private calculateSuggestedAmount(user: User, currentGoldPrice: GoldPrice): number {
        // Base suggestion on user's average transaction size
        const avgInvestmentPerGram = user.totalInvestment / Math.max(user.totalGoldHoldings, 1);
        const suggestedGrams = Math.max(1, Math.min(10, avgInvestmentPerGram / currentGoldPrice.pricePerGram));

        return Math.round(suggestedGrams * currentGoldPrice.pricePerGram);
    }

    /**
     * Calculate expected return
     */
    private calculateExpectedReturn(
        action: string,
        factors: RecommendationFactors,
        currentGoldPrice: GoldPrice
    ): number {
        if (action === 'sell') return 0;

        // Estimate based on factors (simplified model)
        const optimismScore = (
            factors.economicScore +
            factors.geopoliticalScore +
            factors.warFactors
        ) / 3;

        // Conservative estimate: 5-15% annual return
        const baseReturn = 5;
        const factorBonus = (optimismScore / 100) * 10;

        return baseReturn + factorBonus;
    }
}

// Export singleton instance
export const ruleEngine = new RuleEvaluationEngine();
