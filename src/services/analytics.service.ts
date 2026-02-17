import { AnalyticsEvent } from '@/types';

/**
 * Analytics Ingestion Service
 * Responsible for collecting and processing user behavior and system events
 */
class AnalyticsService {
    private events: AnalyticsEvent[] = [];
    private readonly maxBatchSize = 100;

    /**
     * Track an analytics event
     */
    trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>): void {
        const fullEvent: AnalyticsEvent = {
            ...event,
            timestamp: new Date().toISOString()
        };

        this.events.push(fullEvent);

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log('📊 Analytics Event:', fullEvent);
        }

        // Auto-flush if batch size is reached
        if (this.events.length >= this.maxBatchSize) {
            this.flush();
        }
    }

    /**
     * Track page view
     */
    trackPageView(userId: string, page: string): void {
        this.trackEvent({
            eventType: 'page_view',
            userId,
            metadata: { page }
        });
    }

    /**
     * Track transaction
     */
    trackTransaction(userId: string, type: 'buy' | 'sell', amount: number, goldGrams: number): void {
        this.trackEvent({
            eventType: 'transaction',
            userId,
            metadata: { type, amount, goldGrams }
        });
    }

    /**
     * Track recommendation shown to user
     */
    trackRecommendationShown(userId: string, recommendation: any): void {
        this.trackEvent({
            eventType: 'recommendation_shown',
            userId,
            metadata: { recommendation }
        });
    }

    /**
     * Track recommendation interaction
     */
    trackRecommendationClicked(userId: string, action: string): void {
        this.trackEvent({
            eventType: 'recommendation_clicked',
            userId,
            metadata: { action }
        });
    }

    /**
     * Track general user action
     */
    trackUserAction(userId: string, action: string, metadata?: Record<string, any>): void {
        this.trackEvent({
            eventType: 'user_action',
            userId,
            metadata: { action, ...metadata }
        });
    }

    /**
     * Flush events to backend/storage
     * In production, this would send to a real analytics service
     */
    private flush(): void {
        if (this.events.length === 0) return;

        // In production, send to backend API
        console.log(`Flushing ${this.events.length} analytics events`);

        // For demo purposes, store in localStorage
        if (typeof window !== 'undefined') {
            const existingEvents = this.getStoredEvents();
            const allEvents = [...existingEvents, ...this.events];
            localStorage.setItem('haatak_analytics', JSON.stringify(allEvents.slice(-1000))); // Keep last 1000 events
        }

        this.events = [];
    }

    /**
     * Get stored events from localStorage
     */
    private getStoredEvents(): AnalyticsEvent[] {
        if (typeof window === 'undefined') return [];

        try {
            const stored = localStorage.getItem('haatak_analytics');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error reading stored analytics:', error);
            return [];
        }
    }

    /**
     * Get analytics summary for a user
     */
    getUserAnalytics(userId: string): {
        totalPageViews: number;
        totalTransactions: number;
        totalBuyTransactions: number;
        totalSellTransactions: number;
        recommendationsShown: number;
        recommendationsClicked: number;
    } {
        const allEvents = this.getStoredEvents();
        const userEvents = allEvents.filter(e => e.userId === userId);

        return {
            totalPageViews: userEvents.filter(e => e.eventType === 'page_view').length,
            totalTransactions: userEvents.filter(e => e.eventType === 'transaction').length,
            totalBuyTransactions: userEvents.filter(e =>
                e.eventType === 'transaction' && e.metadata?.type === 'buy'
            ).length,
            totalSellTransactions: userEvents.filter(e =>
                e.eventType === 'transaction' && e.metadata?.type === 'sell'
            ).length,
            recommendationsShown: userEvents.filter(e => e.eventType === 'recommendation_shown').length,
            recommendationsClicked: userEvents.filter(e => e.eventType === 'recommendation_clicked').length,
        };
    }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
