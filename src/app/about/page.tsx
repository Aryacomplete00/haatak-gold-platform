'use client';

import Header from '@/components/Header';

export default function AboutPage() {
    return (
        <div className="min-h-screen">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="premium-card p-12 text-center">
                    <h1 className="text-4xl font-bold mb-4 gold-gradient-text" style={{ fontFamily: 'Playfair Display, serif' }}>
                        About HAATAK
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                        Your trusted partner in digital gold investment
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 text-left mt-12">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-semibold text-white">Our Mission</h2>
                            <p className="text-gray-300 leading-relaxed">
                                At HAATAK, we believe wealth creation should be accessible to everyone.
                                We're democratizing gold investment by combining traditional wealth preservation
                                with cutting-edge AI technology and digital convenience.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-semibold text-white">Why Choose Us</h2>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <span className="text-2xl">🏆</span>
                                    <div>
                                        <p className="font-semibold text-white">99.9% Pure Gold</p>
                                        <p className="text-sm text-gray-400">Certified and insured</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-2xl">🤖</span>
                                    <div>
                                        <p className="font-semibold text-white">AI- Powered Insights</p>
                                        <p className="text-sm text-gray-400">Data-driven recommendations</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-2xl">🔒</span>
                                    <div>
                                        <p className="font-semibold text-white">Bank-Grade Security</p>
                                        <p className="text-sm text-gray-400">Your assets are protected</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
