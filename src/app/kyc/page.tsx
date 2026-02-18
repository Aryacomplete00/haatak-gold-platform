'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { getCurrentGoldPrice, getUserProfile } from '@/services/mock-data.service';
import { GoldPrice } from '@/types';

export default function KYCPage() {
    const router = useRouter();
    const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null);
    const [step, setStep] = useState(1);
    const [documentType, setDocumentType] = useState<'aadhaar' | 'pan' | 'passport' | 'driving_license'>('aadhaar');
    const [documentNumber, setDocumentNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userProfile, setUserProfile] = useState(getUserProfile());

    useEffect(() => {
        setGoldPrice(getCurrentGoldPrice());
    }, []);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsSubmitting(false);
        router.push('/profile');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
            <Header goldPrice={goldPrice || undefined} />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Page Header */}
                <div className="mb-8 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-bold gold-gradient-text mb-3">
                        KYC Verification
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Complete your verification to unlock all features
                    </p>
                </div>

                {/* KYC Status Alert */}
                {userProfile.kycStatus === 'verified' && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 mb-6 animate-fade-in-up">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">✓</span>
                            <div>
                                <p className="text-green-400 font-semibold text-lg">Your KYC is already verified!</p>
                                <p className="text-gray-400 text-sm">You have full access to all platform features.</p>
                            </div>
                        </div>
                    </div>
                )}

                {userProfile.kycStatus === 'pending' && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 mb-6 animate-fade-in-up">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">⏳</span>
                            <div>
                                <p className="text-yellow-400 font-semibold text-lg">Verification in Progress</p>
                                <p className="text-gray-400 text-sm">Your documents are being reviewed. Please wait 24-48 hours.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Progress Steps */}
                <div className="premium-card p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center justify-between">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center flex-1">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${step >= s
                                        ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-black'
                                        : 'bg-gray-700 text-gray-400'
                                    }`}>
                                    {s}
                                </div>
                                {s < 3 && (
                                    <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-gradient-to-r from-amber-400 to-yellow-600' : 'bg-gray-700'
                                        }`}></div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-3 text-sm">
                        <span className={step >= 1 ? 'text-amber-400 font-medium' : 'text-gray-500'}>Document Type</span>
                        <span className={step >= 2 ? 'text-amber-400 font-medium' : 'text-gray-500'}>Upload Documents</span>
                        <span className={step >= 3 ? 'text-amber-400 font-medium' : 'text-gray-500'}>Review & Submit</span>
                    </div>
                </div>

                {/* Step 1: Document Type Selection */}
                {step === 1 && (
                    <div className="premium-card p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <h2 className="text-2xl font-bold text-white mb-6">Step 1: Choose Document Type</h2>

                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            {[
                                { value: 'aadhaar', label: 'Aadhaar Card', icon: '🆔', desc: 'Government-issued identity card' },
                                { value: 'pan', label: 'PAN Card', icon: '💳', desc: 'Permanent Account Number' },
                                { value: 'passport', label: 'Passport', icon: '🛂', desc: 'International travel document' },
                                { value: 'driving_license', label: 'Driving License', icon: '🚗', desc: 'State-issued driving permit' }
                            ].map((doc) => (
                                <button
                                    key={doc.value}
                                    onClick={() => setDocumentType(doc.value as any)}
                                    className={`p-6 rounded-lg border-2 text-left transition-all ${documentType === doc.value
                                            ? 'border-amber-500 bg-amber-500/10'
                                            : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-3xl">{doc.icon}</span>
                                        <div>
                                            <p className="text-white font-semibold mb-1">{doc.label}</p>
                                            <p className="text-gray-400 text-sm">{doc.desc}</p>
                                        </div>
                                    </div>
                                    {documentType === doc.value && (
                                        <span className="text-amber-400 text-sm mt-2 block">✓ Selected</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            className="btn-gold w-full py-3 text-lg"
                        >
                            Continue to Upload →
                        </button>
                    </div>
                )}

                {/* Step 2: Document Upload */}
                {step === 2 && (
                    <div className="premium-card p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <h2 className="text-2xl font-bold text-white mb-6">Step 2: Upload Documents</h2>

                        <div className="space-y-6">
                            {/* Document Number */}
                            <div>
                                <label className="block text-white font-medium mb-2">
                                    {documentType === 'aadhaar' && 'Aadhaar Number'}
                                    {documentType === 'pan' && 'PAN Number'}
                                    {documentType === 'passport' && 'Passport Number'}
                                    {documentType === 'driving_license' && 'License Number'}
                                </label>
                                <input
                                    type="text"
                                    value={documentNumber}
                                    onChange={(e) => setDocumentNumber(e.target.value)}
                                    placeholder="Enter document number"
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                                />
                            </div>

                            {/* Document Front */}
                            <div>
                                <label className="block text-white font-medium mb-2">
                                    Document Front Side
                                </label>
                                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-amber-500 transition-all cursor-pointer">
                                    <span className="text-5xl block mb-3">📄</span>
                                    <p className="text-white font-medium mb-1">Click to upload or drag and drop</p>
                                    <p className="text-gray-400 text-sm">PNG, JPG or PDF (max. 5MB)</p>
                                </div>
                            </div>

                            {/* Document Back (not for PAN) */}
                            {documentType !== 'pan' && (
                                <div>
                                    <label className="block text-white font-medium mb-2">
                                        Document Back Side
                                    </label>
                                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-amber-500 transition-all cursor-pointer">
                                        <span className="text-5xl block mb-3">📄</span>
                                        <p className="text-white font-medium mb-1">Click to upload or drag and drop</p>
                                        <p className="text-gray-400 text-sm">PNG, JPG or PDF (max. 5MB)</p>
                                    </div>
                                </div>
                            )}

                            {/* Selfie */}
                            <div>
                                <label className="block text-white font-medium mb-2">
                                    Selfie with Document
                                </label>
                                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-amber-500 transition-all cursor-pointer">
                                    <span className="text-5xl block mb-3">🤳</span>
                                    <p className="text-white font-medium mb-1">Click to upload or drag and drop</p>
                                    <p className="text-gray-400 text-sm">Clear photo of you holding the document</p>
                                </div>
                            </div>

                            {/* Address Proof */}
                            <div>
                                <label className="block text-white font-medium mb-2">
                                    Address Proof (Optional)
                                </label>
                                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-amber-500 transition-all cursor-pointer">
                                    <span className="text-5xl block mb-3">🏠</span>
                                    <p className="text-white font-medium mb-1">Click to upload or drag and drop</p>
                                    <p className="text-gray-400 text-sm">Utility bill, bank statement, etc.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={() => setStep(1)}
                                className="btn-outline-gold flex-1 py-3"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                className="btn-gold flex-1 py-3"
                            >
                                Review & Submit →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Review & Submit */}
                {step === 3 && (
                    <div className="premium-card p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <h2 className="text-2xl font-bold text-white mb-6">Step 3: Review & Submit</h2>

                        <div className="space-y-4 mb-6">
                            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                                <p className="text-gray-400 text-sm mb-1">Document Type</p>
                                <p className="text-white font-semibold capitalize">{documentType.replace('_', ' ')}</p>
                            </div>

                            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                                <p className="text-gray-400 text-sm mb-1">Document Number</p>
                                <p className="text-white font-semibold">{documentNumber || 'Not provided'}</p>
                            </div>

                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                                <p className="text-amber-400 font-semibold mb-2">📋 Verification Checklist</p>
                                <ul className="text-gray-300 text-sm space-y-1">
                                    <li>✓ Document is clear and readable</li>
                                    <li>✓ All corners are visible</li>
                                    <li>✓ No glare or shadows</li>
                                    <li>✓ Selfie shows face clearly</li>
                                    <li>✓ Document number matches uploaded doc</li>
                                </ul>
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                <p className="text-blue-400 font-semibold mb-2">⚡ What happens next?</p>
                                <ol className="text-gray-300 text-sm space-y-2">
                                    <li>1. Our team will review your documents (24-48 hours)</li>
                                    <li>2. You'll receive an email notification</li>
                                    <li>3. Once approved, you'll have full platform access</li>
                                </ol>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep(2)}
                                className="btn-outline-gold flex-1 py-3"
                                disabled={isSubmitting}
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="btn-gold flex-1 py-3 text-lg disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="spinner w-5 h-5 border-2"></div>
                                        Submitting...
                                    </span>
                                ) : (
                                    'Submit for Verification ✓'
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Info Cards */}
                <div className="grid md:grid-cols-3 gap-4 mt-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 text-center">
                        <span className="text-3xl block mb-2">🔒</span>
                        <p className="text-white font-semibold text-sm mb-1">Secure & Encrypted</p>
                        <p className="text-gray-400 text-xs">Your data is protected with bank-grade security</p>
                    </div>
                    <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 text-center">
                        <span className="text-3xl block mb-2">⚡</span>
                        <p className="text-white font-semibold text-sm mb-1">Quick Verification</p>
                        <p className="text-gray-400 text-xs">Most applications reviewed within 24 hours</p>
                    </div>
                    <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 text-center">
                        <span className="text-3xl block mb-2">✓</span>
                        <p className="text-white font-semibold text-sm mb-1">Compliance</p>
                        <p className="text-gray-400 text-xs">As per RBI and PMLA guidelines</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
