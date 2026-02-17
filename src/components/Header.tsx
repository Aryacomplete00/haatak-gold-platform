'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GoldPrice } from '@/types';

interface HeaderProps {
    goldPrice?: GoldPrice;
}

export default function Header({ goldPrice }: HeaderProps) {
    const pathname = usePathname();

    const navItems = [
        { name: 'Home', path: '/home' },
        { name: 'About', path: '/about' },
        { name: 'How It Works', path: '/how-it-works' },
        { name: 'Blog', path: '/blog' },
        { name: 'Contact Us', path: '/contact' },
    ];

    const isActive = (path: string) => pathname === path;

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
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center cursor-pointer hover:shadow-lg hover:shadow-amber-500/30 transition-all">
                            <span className="text-lg">👤</span>
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
