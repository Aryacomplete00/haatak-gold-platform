'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { GoldPrice } from '@/types';
import { mockUser, mockUserProfile } from '@/services/mock-data.service';

interface HeaderProps {
    goldPrice?: GoldPrice;
}

export default function Header({ goldPrice }: HeaderProps) {
    const pathname = usePathname();
    const [showProfile, setShowProfile] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const navItems = [
        { name: 'Home', path: '/home' },
        { name: 'Holdings', path: '/holdings' },
        { name: 'About', path: '/about' },
        { name: 'How It Works', path: '/how-it-works' },
        { name: 'Blog', path: '/blog' },
        { name: 'Contact Us', path: '/contact' },
    ];

    const isActive = (path: string) => pathname === path;

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowProfile(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentValue = mockUser.totalGoldHoldings * (goldPrice?.pricePerGram || 6250);
    const totalProfit = currentValue - mockUser.totalInvestment;
    const profitPercent = (totalProfit / mockUser.totalInvestment) * 100;

    return (
        <header className="sticky top-0 z-50 glass border-b border-amber-500/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/home" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all">
                            <span className="text-2xl">✨</span>
                        </div>
                        <span className="text-2xl font-bold gold-gradient-text" style={{ fontFamily: 'Playfair Display, serif' }}>
                            HAATAK
                        </span>
                    </Link>

                    {/* Live Gold Price - Center */}
                    {goldPrice && (
                        <div className="hidden md:flex items-center gap-4 premium-card px-6 py-2">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">💰</span>
                                <div>
                                    <p className="text-xs text-gray-400">Live Gold Price</p>
                                    <p className="text-lg font-bold text-amber-400">
                                        ₹{goldPrice.pricePerGram.toLocaleString()}
                                        <span className="text-xs text-gray-400 ml-1">/gram</span>
                                    </p>
                                </div>
                            </div>
                            <div className={`flex items-center gap-1 ${goldPrice.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                <span>{goldPrice.change24h >= 0 ? '↑' : '↓'}</span>
                                <span className="font-semibold">
                                    {Math.abs(goldPrice.changePercent24h).toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${isActive(item.path)
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'text-gray-300 hover:text-amber-400 hover:bg-amber-500/10'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* User Menu with Buy/Sell Actions */}
                    <div className="flex items-center gap-3">
                        <Link href="/buy" className="hidden sm:block btn-gold px-4 py-2 text-sm">
                            Buy Gold
                        </Link>
                        <Link href="/sell" className="hidden sm:block btn-outline-gold px-4 py-2 text-sm">
                            Sell Gold
                        </Link>

                        {/* Profile Icon with Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowProfile(!showProfile)}
                                className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center cursor-pointer hover:shadow-lg hover:shadow-amber-500/30 transition-all ring-2 ring-transparent hover:ring-amber-400/40"
                            >
                                <span className="text-lg">👤</span>
                            </button>

                            {/* Profile Dropdown */}
                            {showProfile && (
                                <div
                                    className="absolute right-0 mt-3 w-80 rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-amber-500/20 z-50"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(20,20,30,0.98) 0%, rgba(10,10,20,0.98) 100%)',
                                        backdropFilter: 'blur(20px)',
                                        animation: 'fadeInUp 0.25s ease-out'
                                    }}
                                >
                                    {/* User Info Header */}
                                    <div className="p-5 border-b border-white/10 bg-gradient-to-r from-amber-500/10 to-yellow-500/5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30 flex-shrink-0">
                                                👤
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-lg font-bold text-white truncate">{mockUserProfile.name}</h3>
                                                <p className="text-sm text-gray-400 truncate">{mockUserProfile.email}</p>
                                                <div className="flex items-center gap-1.5 mt-1.5">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${mockUserProfile.kycStatus === 'verified'
                                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                            : mockUserProfile.kycStatus === 'pending'
                                                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                                        }`}>
                                                        {mockUserProfile.kycStatus === 'verified' ? '✓ KYC Verified' :
                                                            mockUserProfile.kycStatus === 'pending' ? '⏳ KYC Pending' : '⚠ KYC Required'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Gold Holdings Summary */}
                                    <div className="p-4 border-b border-white/10">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Gold Holdings</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-white/5 rounded-lg p-3">
                                                <p className="text-xs text-gray-400">Total Gold</p>
                                                <p className="text-lg font-bold text-amber-400">{mockUser.totalGoldHoldings}g</p>
                                            </div>
                                            <div className="bg-white/5 rounded-lg p-3">
                                                <p className="text-xs text-gray-400">Current Value</p>
                                                <p className="text-lg font-bold text-white">₹{Math.round(currentValue).toLocaleString()}</p>
                                            </div>
                                            <div className="bg-white/5 rounded-lg p-3">
                                                <p className="text-xs text-gray-400">Invested</p>
                                                <p className="text-sm font-semibold text-gray-300">₹{mockUser.totalInvestment.toLocaleString()}</p>
                                            </div>
                                            <div className="bg-white/5 rounded-lg p-3">
                                                <p className="text-xs text-gray-400">Returns</p>
                                                <p className={`text-sm font-semibold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {totalProfit >= 0 ? '+' : ''}₹{Math.round(totalProfit).toLocaleString()}
                                                    <span className="text-xs ml-1">({profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(1)}%)</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Links */}
                                    <div className="p-2">
                                        <Link
                                            href="/profile"
                                            onClick={() => setShowProfile(false)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-all group"
                                        >
                                            <span className="text-lg">👤</span>
                                            <div>
                                                <p className="text-sm font-medium text-white group-hover:text-amber-400 transition">My Profile</p>
                                                <p className="text-xs text-gray-500">View & edit your information</p>
                                            </div>
                                        </Link>
                                        <Link
                                            href="/holdings"
                                            onClick={() => setShowProfile(false)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-all group"
                                        >
                                            <span className="text-lg">💎</span>
                                            <div>
                                                <p className="text-sm font-medium text-white group-hover:text-amber-400 transition">View Holdings</p>
                                                <p className="text-xs text-gray-500">Purchase history & transactions</p>
                                            </div>
                                        </Link>
                                        <Link
                                            href="/buy"
                                            onClick={() => setShowProfile(false)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-all group"
                                        >
                                            <span className="text-lg">🛒</span>
                                            <div>
                                                <p className="text-sm font-medium text-white group-hover:text-amber-400 transition">Buy Gold</p>
                                                <p className="text-xs text-gray-500">Invest in digital gold</p>
                                            </div>
                                        </Link>
                                        <div className="border-t border-white/10 mt-1 pt-1">
                                            <button
                                                onClick={() => setShowProfile(false)}
                                                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 transition-all w-full text-left group"
                                            >
                                                <span className="text-lg">🚪</span>
                                                <p className="text-sm font-medium text-gray-400 group-hover:text-red-400 transition">Sign Out</p>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Gold Price */}
                {goldPrice && (
                    <div className="md:hidden pb-3 flex items-center justify-center gap-3">
                        <div className="premium-card px-4 py-2 flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">💰</span>
                                <div>
                                    <p className="text-xs text-gray-400">Live Gold Price</p>
                                    <p className="text-base font-bold text-amber-400">
                                        ₹{goldPrice.pricePerGram.toLocaleString()}/g
                                    </p>
                                </div>
                            </div>
                            <div className={`text-sm font-semibold ${goldPrice.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {goldPrice.change24h >= 0 ? '↑' : '↓'} {Math.abs(goldPrice.changePercent24h).toFixed(2)}%
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
