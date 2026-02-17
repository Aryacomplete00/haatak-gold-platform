'use client';

import Header from '@/components/Header';

export default function BlogPage() {
    const articles = [
        {
            title: 'Gold as a Hedge Against Inflation',
            excerpt: 'Understanding how gold protects your wealth during economic uncertainty',
            date: '2026-02-15',
            category: 'Investment Strategy',
            readTime: '5 min read'
        },
        {
            title: 'Digital vs Physical Gold: A Complete Comparison',
            excerpt: 'Explore the benefits and differences between traditional and digital gold investment',
            date: '2026-02-10',
            category: 'Education',
            readTime: '7 min read'
        },
        {
            title: 'How AI is Transforming Gold Investment',
            excerpt: 'Learn how artificial intelligence helps you make smarter investment decisions',
            date: '2026-02-05',
            category: 'Technology',
            readTime: '6 min read'
        }
    ];

    return (
        <div className="min-h-screen">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4 gold-gradient-text" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Investment Insights
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Expert advice and insights on gold investment and wealth creation
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article, index) => (
                        <div
                            key={index}
                            className="premium-card p-6 cursor-pointer animate-fade-in-up"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="mb-4">
                                <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full">
                                    {article.category}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-3 hover:text-amber-400 transition">
                                {article.title}
                            </h3>

                            <p className="text-gray-400 mb-4 line-clamp-2">
                                {article.excerpt}
                            </p>

                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <span>{article.date}</span>
                                <span>{article.readTime}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
