'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { getCurrentGoldPrice, getUserProfile } from '@/services/mock-data.service';
import { GoldPrice } from '@/types';
import { UserProfile } from '@/types/user';
import { useUser } from '@/context/UserContext';
import { useHoldings } from '@/hooks/useHoldings';

export default function ProfilePage() {
    const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const { user } = useUser();
    const holdings = useHoldings(goldPrice?.pricePerGram || 6250);

    // Use logged-in user's info, fallback to mock data
    const displayName = user?.name || userProfile?.name || 'User';
    const displayEmail = user?.email || userProfile?.email || '';

    useEffect(() => {
        setGoldPrice(getCurrentGoldPrice());
        setUserProfile(getUserProfile());
    }, []);

    if (!userProfile) {
        return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
            <div className="spinner w-12 h-12 border-4"></div>
        </div>;
    }

    const getKYCStatusBadge = (status: string) => {
        const badges = {
            verified: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', icon: '✓', label: 'Verified' },
            pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', icon: '⏳', label: 'Pending' },
            rejected: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', icon: '✗', label: 'Rejected' },
            not_started: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', icon: '⚠', label: 'Not Started' }
        };
        return badges[status as keyof typeof badges] || badges.not_started;
    };

    const kycBadge = getKYCStatusBadge(userProfile.kycStatus);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
            <Header goldPrice={goldPrice || undefined} />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Page Header */}
                <div className="mb-8 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-bold gold-gradient-text mb-3">
                        My Profile
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Manage your account and verify your identity
                    </p>
                </div>

                {/* Profile Card */}
                <div className="premium-card p-6 md:p-8 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                        {/* Profile Image */}
                        <div className="flex-shrink-0">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/30">
                                {userProfile.profileImage ? (
                                    <img src={userProfile.profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <span>👤</span>
                                )}
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-1">{displayName}</h2>
                                    <p className="text-gray-400">{displayEmail}</p>
                                </div>
                                <button className="btn-outline-gold px-4 py-2 text-sm w-fit">
                                    Edit Profile
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">Phone Number</p>
                                    <p className="text-white font-medium">{userProfile.phone || 'Not provided'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">User ID</p>
                                    <p className="text-white font-medium font-mono">{userProfile.id}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">Member Since</p>
                                    <p className="text-white font-medium">{formatDate(userProfile.joinedDate)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">Last Login</p>
                                    <p className="text-white font-medium">{formatDate(userProfile.lastLoginDate)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KYC Status Card */}
                <div className={`premium-card p-6 md:p-8 mb-6 animate-fade-in-up border-2 ${kycBadge.border}`} style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <span className="text-4xl">🛡️</span>
                            <div>
                                <h3 className="text-xl font-bold text-white">KYC Verification</h3>
                                <p className="text-gray-400 text-sm">Know Your Customer verification status</p>
                            </div>
                        </div>
                        <span className={`px-4 py-2 rounded-lg font-semibold text-sm ${kycBadge.bg} ${kycBadge.text} border ${kycBadge.border}`}>
                            {kycBadge.icon} {kycBadge.label}
                        </span>
                    </div>

                    {userProfile.kycStatus === 'verified' && userProfile.kycDetails && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                            <p className="text-green-400 font-semibold mb-3">✓ Your account is fully verified</p>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-400">Document Type:</p>
                                    <p className="text-white font-medium capitalize">{userProfile.kycDetails.documentType}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Document Number:</p>
                                    <p className="text-white font-medium">{userProfile.kycDetails.documentNumber}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Verified On:</p>
                                    <p className="text-white font-medium">{formatDate(userProfile.kycDetails.verifiedDate!)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Status Validity:</p>
                                    <p className="text-green-400 font-medium">Active</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {userProfile.kycStatus === 'pending' && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                            <p className="text-yellow-400 font-semibold mb-2">⏳ Verification in Progress</p>
                            <p className="text-gray-400 text-sm">
                                Your documents are being reviewed by our team. This usually takes 24-48 hours.
                            </p>
                        </div>
                    )}

                    {userProfile.kycStatus === 'rejected' && userProfile.kycDetails?.rejectionReason && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                            <p className="text-red-400 font-semibold mb-2">✗ Verification Failed</p>
                            <p className="text-gray-400 text-sm mb-3">Reason: {userProfile.kycDetails.rejectionReason}</p>
                            <Link href="/kyc" className="btn-gold px-4 py-2 text-sm inline-block">
                                Resubmit Documents
                            </Link>
                        </div>
                    )}

                    {userProfile.kycStatus === 'not_started' && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-6">
                            <div className="flex items-start gap-4">
                                <span className="text-3xl">⚠️</span>
                                <div className="flex-1">
                                    <p className="text-amber-400 font-semibold mb-2">Complete KYC to unlock full features</p>
                                    <p className="text-gray-400 text-sm mb-4">
                                        KYC verification is required for:
                                    </p>
                                    <ul className="text-gray-400 text-sm space-y-1 mb-4">
                                        <li>✓ Higher transaction limits</li>
                                        <li>✓ Faster withdrawals</li>
                                        <li>✓ Selling gold</li>
                                        <li>✓ Full account access</li>
                                    </ul>
                                    <Link href="/kyc" className="btn-gold px-6 py-3 text-sm inline-block">
                                        Start KYC Verification →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Account Stats */}
                <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <div className="premium-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-3xl">💎</span>
                            <h3 className="text-lg font-bold text-white">Holdings Summary</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Total Gold:</span>
                                <span className="text-amber-400 font-bold">{holdings.totalGoldHoldings.toFixed(3)}g</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Current Value:</span>
                                <span className="text-white font-semibold">₹{Math.round(holdings.currentValue).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Net Invested:</span>
                                <span className="text-white font-semibold">₹{Math.round(holdings.totalInvested).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Returns:</span>
                                <span className={`font-semibold ${holdings.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {holdings.totalProfit >= 0 ? '+' : ''}₹{Math.round(holdings.totalProfit).toLocaleString()}
                                    <span className="text-xs ml-1 opacity-75">({holdings.profitPercent >= 0 ? '+' : ''}{holdings.profitPercent.toFixed(2)}%)</span>
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Transactions:</span>
                                <span className="text-gray-300">{holdings.transactions.length} total</span>
                            </div>
                        </div>
                        <Link href="/holdings" className="btn-outline-gold w-full py-2 text-sm mt-4 inline-block text-center">
                            View Holdings →
                        </Link>
                    </div>

                    <div className="premium-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-3xl">🎯</span>
                            <h3 className="text-lg font-bold text-white">Goals & Targets</h3>
                        </div>
                        <div className="space-y-3">
                            {userProfile.sipTargets && userProfile.sipTargets[0] && (
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-gray-400 text-sm">SIP Progress:</span>
                                        <span className="text-white font-semibold text-sm">
                                            {((userProfile.sipTargets[0].currentProgress / userProfile.sipTargets[0].targetAmount) * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-700/30 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-amber-400 to-yellow-600 h-2 rounded-full"
                                            style={{ width: `${(userProfile.sipTargets[0].currentProgress / userProfile.sipTargets[0].targetAmount) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                            {userProfile.wealthTargets && userProfile.wealthTargets[0] && (
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-gray-400 text-sm">Wealth Target:</span>
                                        <span className="text-white font-semibold text-sm">
                                            {userProfile.wealthTargets[0].currentGrams}g / {userProfile.wealthTargets[0].targetGoldGrams}g
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-700/30 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-green-400 to-emerald-600 h-2 rounded-full"
                                            style={{ width: `${(userProfile.wealthTargets[0].currentGrams / userProfile.wealthTargets[0].targetGoldGrams) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button className="btn-outline-gold w-full py-2 text-sm mt-4">
                            Manage Goals →
                        </button>
                    </div>
                </div>

                {/* Security */}
                <div className="premium-card p-6 md:p-8 mt-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span>🔒</span> Security Settings
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-800/50">
                            <div>
                                <p className="text-white font-medium">Password</p>
                                <p className="text-gray-500 text-sm">Last changed 45 days ago</p>
                            </div>
                            <button className="text-amber-400 hover:text-amber-300 text-sm font-medium">
                                Change →
                            </button>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-800/50">
                            <div>
                                <p className="text-white font-medium">Two-Factor Authentication</p>
                                <p className="text-green-400 text-sm">✓ Enabled</p>
                            </div>
                            <button className="text-amber-400 hover:text-amber-300 text-sm font-medium">
                                Manage →
                            </button>
                        </div>
                        <div className="flex justify-between items-center py-3">
                            <div>
                                <p className="text-white font-medium">Session History</p>
                                <p className="text-gray-500 text-sm">View your login activity</p>
                            </div>
                            <button className="text-amber-400 hover:text-amber-300 text-sm font-medium">
                                View →
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
