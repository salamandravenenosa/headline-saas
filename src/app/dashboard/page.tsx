"use client"

import React, { useState, useEffect } from 'react';
import { Activity, Zap, TrendingUp, Layers } from 'lucide-react';

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const orgId = "00000000-0000-0000-0000-000000000000"; // Mock

    useEffect(() => {
        fetch('/api/v1/analytics/overview', {
            headers: { 'x-organization-id': orgId }
        })
            .then(res => res.json())
            .then(json => {
                if (json.success) setStats(json.data);
            });
    }, []);

    const limit = 1000;
    const consumed = stats?.totalCreditsConsumed || 0;
    const percent = Math.min(100, (consumed / limit) * 100);

    return (
        <div className="space-y-12 max-w-5xl mx-auto py-8">
            <header className="space-y-1">
                <h1 className="text-4xl font-black italic tracking-tighter">Visão <span className="text-blue-500">Geral</span></h1>
                <p className="text-white/40 font-medium">Bem-vindo à central de inteligência da sua conta.</p>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass p-8 rounded-[32px] border-blue-600/10 space-y-4">
                    <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-white/40">Headlines Geradas</p>
                        <p className="text-3xl font-black">{stats?.totalHeadlines || 0}</p>
                    </div>
                </div>
                <div className="glass p-8 rounded-[32px] border-indigo-600/10 space-y-4">
                    <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center">
                        <Layers className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-white/40">Testes A/B Ativos</p>
                        <p className="text-3xl font-black">{stats?.activeExperiments || 0}</p>
                    </div>
                </div>
                <div className="glass p-8 rounded-[32px] border-emerald-600/10 space-y-4">
                    <div className="w-12 h-12 bg-emerald-600/10 rounded-2xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-white/40">Média de Performance</p>
                        <p className="text-3xl font-black">--</p>
                    </div>
                </div>
            </div>

            {/* Progress Section */}
            <div className="glass rounded-[40px] p-12 border-white/5 space-y-8">
                <div className="flex justify-between items-end">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-white/20">
                            <Activity className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-widest italic">Análise de Uso Mensal</span>
                        </div>
                        <h2 className="text-5xl font-black italic tracking-tighter">
                            {consumed} <span className="text-white/10 text-3xl">/ {limit}</span>
                        </h2>
                    </div>
                    <Link href="/dashboard/api" className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                        Ver Detalhes das Chaves
                    </Link>
                </div>
                <div className="space-y-4">
                    <div className="h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
                        <div
                            className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-blue-400">0% Consumido</span>
                        <span className="text-white/20">Reinicia em 12 dias</span>
                        <span className="text-indigo-400">100% de Limite</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Minimal Link replacement if not using next/link in this specific file scope
function Link({ children, href, className }: any) {
    return <a href={href} className={className}>{children}</a>;
}
