'use client'
import React from 'react';

export default function LandingPage() {
    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:8080/api/private';
    };

    return (
        <div className="min-h-screen bg-slate-50 font-inter">
            {/* Header */}
            <header className="px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <span 
                        className="material-symbols-outlined text-blue-600" 
                        style={{ fontSize: '48px' }}
                    >
                        forward_to_inbox
                    </span>
                    <h1 className="text-4xl font-bold text-slate-800">MakeMyMail</h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="px-6 py-16 max-w-4xl mx-auto text-center">
                {/* Hero Section */}
                <div className="mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-800">
                        Take Control of Your
                        <span className="block text-blue-600">Email Chaos</span>
                    </h2>
                    <p className="text-lg mb-8 max-w-2xl mx-auto text-slate-600">
                        Smart email management that groups by sender, enables mass actions, 
                        and helps you achieve inbox zero faster than ever.
                    </p>
                    <button 
                        onClick={handleGoogleLogin}
                        className="inline-flex items-center space-x-3 px-8 py-3 rounded-lg text-white font-semibold text-lg bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span>Login with Google</span>
                    </button>
                </div>


            </main>

            {/* Footer */}
            <footer className="px-6 py-8 border-t border-slate-200">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-slate-600">
                        © 2024 MakeMyMail. Your privacy is our priority.
                    </p>
                </div>
            </footer>
        </div>
    );
}