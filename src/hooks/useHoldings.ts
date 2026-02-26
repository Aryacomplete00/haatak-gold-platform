'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPurchaseHistory } from '@/services/mock-data.service';
import { PurchaseHistory } from '@/types/user';

export interface HoldingsSummary {
    transactions: PurchaseHistory[];
    totalGoldHoldings: number;   // grams held right now
    totalInvested: number;       // net money in (buy total − sell total)
    totalGoldBought: number;
    totalGoldSold: number;
    currentValue: number;        // requires goldPricePerGram passed in
    totalProfit: number;
    profitPercent: number;
}

// Custom event fired whenever a new purchase/sell is saved
export const HOLDINGS_UPDATED_EVENT = 'haatak_holdings_updated';

/**
 * Reads real-time holdings from localStorage + mock data.
 * Reacts to window storage events AND custom 'haatak_holdings_updated' events
 * so the header dropdown reflects purchases immediately without page reload.
 */
export function useHoldings(goldPricePerGram: number = 6250): HoldingsSummary {
    const [transactions, setTransactions] = useState<PurchaseHistory[]>([]);

    const refresh = useCallback(() => {
        setTransactions(getPurchaseHistory());
    }, []);

    useEffect(() => {
        // Initial load
        refresh();

        // Listen for purchases made in the same tab
        window.addEventListener(HOLDINGS_UPDATED_EVENT, refresh);
        // Listen for purchases made in other tabs
        window.addEventListener('storage', refresh);

        return () => {
            window.removeEventListener(HOLDINGS_UPDATED_EVENT, refresh);
            window.removeEventListener('storage', refresh);
        };
    }, [refresh]);

    // ── Derived stats ──────────────────────────────────────────────────────────
    const totalGoldBought = transactions
        .filter(t => t.type === 'buy')
        .reduce((sum, t) => sum + t.goldGrams, 0);

    const totalGoldSold = transactions
        .filter(t => t.type === 'sell')
        .reduce((sum, t) => sum + t.goldGrams, 0);

    const totalGoldHoldings = parseFloat((totalGoldBought - totalGoldSold).toFixed(4));

    const totalBuyAmount = transactions
        .filter(t => t.type === 'buy')
        .reduce((sum, t) => sum + t.totalAmount, 0);

    const totalSellAmount = transactions
        .filter(t => t.type === 'sell')
        .reduce((sum, t) => sum + t.totalAmount, 0);

    const totalInvested = totalBuyAmount - totalSellAmount;

    const currentValue = totalGoldHoldings * goldPricePerGram;
    const totalProfit = currentValue - totalInvested;
    const profitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

    return {
        transactions,
        totalGoldHoldings,
        totalInvested,
        totalGoldBought,
        totalGoldSold,
        currentValue,
        totalProfit,
        profitPercent,
    };
}
