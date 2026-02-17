'use client';

import Header from '@/components/Header';

export default function HowItWorksPage() {
    const steps = [
        {
            number: 1,
            title: 'Sign Up & Verify',
            description: 'Create your account in minutes with simple KYC verification',
            icon: '📝'
        },
        {
            number: 2,
            title: 'Add Funds',
            description: 'Link your bank account or UPI for seamless transactions',
            icon: '💳'
        },
        {
            number: 3,
            title: 'Buy Gold',
            description: 'Purchase digital gold starting from just ₹100',
            icon: '🛒'
        },
        {
            number: 4,
            title: 'Track & Grow',
            description: 'Monitor your portfolio with real-time updates and AI insights',
            icon: '📈'
        },
        {
            number: 5,
            title: 'Sell Anytime',
            description: 'Liquidate your holdings instantly at current market rates',
            icon: '💰'
        }
    ];

    return (
        <div className="min-h-screen">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4 gold-gradient-text" style={{ fontFamily: 'Playfair Display, serif' }}>
                        How It Works
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Start your digital gold investment journey in 5 simple steps
                    </p>
                </div>

                <div className="space-y-6">
                    {steps.map((step, index) => (
                        <div
                            key={step.number}
                            className="premium-card p-8 animate-fade-in-up"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="flex items-start gap-6">
                                <div className="flex-shrink-0">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">
                                        {step.icon}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-amber-400 font-bold text-xl">Step {step.number}</span>
                                        <h3 className="text-2xl font-semibold text-white">{step.title}</h3>
                                    </div>
                                    <p className="text-gray-300 text-lg">{step.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 premium-card p-8 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Ready to get started?</h2>
                    <button className="btn-gold">
                        Create Account Now
                    </button>
                </div>
            </main>
        </div>
    );
}
