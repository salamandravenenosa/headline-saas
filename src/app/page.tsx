import React from 'react';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-[#020617] text-white font-sans">
            <div className="z-10 max-w-5xl w-full items-center justify-between text-sm flex flex-col gap-8">
                <div className="text-center space-y-4">
                    <h1 className="text-6xl font-black italic tracking-tighter">Headline Engine</h1>
                    <p className="text-blue-400 font-bold uppercase tracking-[0.3em]">v1.0.0 API-First SaaS</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                    <div className="p-8 border border-white/5 bg-white/5 rounded-3xl space-y-4">
                        <h2 className="text-xl font-bold">Base URL</h2>
                        <code className="block bg-black/50 p-4 rounded-xl text-blue-300">https://your-domain.com/api/v1</code>
                    </div>
                    <div className="p-8 border border-white/5 bg-white/5 rounded-3xl space-y-4">
                        <h2 className="text-xl font-bold">Status</h2>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="font-bold">Sistemas Operantes</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
