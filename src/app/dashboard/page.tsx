"use client"

import React from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { PenTool, Key, Database, ChevronRight, Activity, TrendingUp, Sparkles, Clock, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardOverview() {
    const { user } = useAuth();

    const stats = [
        { label: 'Copies Geradas', value: '428', increase: '+12%', icon: PenTool, color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'Total de textos criados pela IA.' },
        { label: 'Projetos Ativos', value: '12', increase: '+2', icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-500/10', desc: 'Experimentos em andamento.' },
        { label: 'Saúde da API', value: '99%', increase: 'Stable', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10', desc: 'Estabilidade das integrações.' },
    ];

    return (
        <div className="space-y-10 py-2">
            <header className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 italic flex items-center gap-2">
                        <Sparkles className="w-3 h-3" /> Bem-vindo ao Centro de Comando
                    </p>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase font-outfit">Painel de <span className="text-blue-500">Controle</span></h1>
                    <p className="text-white/20 text-xs italic font-medium">Acompanhe seu desempenho e gerencie suas ferramentas de copywriting.</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl">
                    <Clock className="w-3.5 h-3.5 text-white/20" />
                    <span className="text-[9px] font-black italic text-white/40 uppercase tracking-widest">Atualizado agora</span>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="glass-card p-6 rounded-3xl border-white/[0.03] space-y-4 shadow-xl">
                        <div className="flex justify-between items-start">
                            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[9px] font-black bg-green-500/10 text-green-500 px-2.5 py-1 rounded-full italic">{stat.increase}</span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">{stat.label}</p>
                            <p className="text-3xl font-black font-outfit italic">{stat.value}</p>
                            <p className="text-[9px] text-white/20 italic font-medium">{stat.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions & Usage */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-12">
                    <div className="glass rounded-[32px] p-8 border-white/[0.05] space-y-6 relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/[0.02] blur-[100px] rounded-full"></div>

                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative z-10">
                            <div className="space-y-2">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 flex items-center gap-2 italic">
                                    <HelpCircle className="w-3.5 h-3.5 text-blue-500" /> Suas Créditos Mensais (Plano Gratuito)
                                </p>
                                <h2 className="text-4xl font-black font-outfit italic">84 <span className="text-white/10 text-xl italic ml-1">/ 100</span> <span className="text-[12px] text-blue-500/50 ml-2 uppercase tracking-widest">Usados</span></h2>
                                <p className="text-[10px] text-white/20 italic font-medium max-w-md">Sua quota reseta automaticamente todo mês. Se precisar de mais, faça um upgrade para o Pro.</p>
                            </div>
                            <Link href="/dashboard/headlines" className="btn-primary !px-6 !py-3 !text-[10px] italic shadow-blue-600/20">
                                Liberar Mais Créditos <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="space-y-3 relative z-10">
                            <div className="h-3 bg-black/40 rounded-full p-0.5 border border-white/5 shadow-inner overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                    style={{ width: '84%' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tiles */}
                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: 'Gerador de Headlines', desc: 'Use IA para criar novos títulos virais.', icon: PenTool, href: '/dashboard/headlines', color: 'text-blue-500' },
                        { title: 'Chaves de API', desc: 'Conecte o QyiCopy em outros sites.', icon: Key, href: '/dashboard/api', color: 'text-indigo-500' },
                        { title: 'Base de Conhecimento', desc: 'Ensine a IA sobre o seu negócio.', icon: Database, href: '/dashboard/knowledge', color: 'text-purple-500' },
                    ].map((action, i) => (
                        <Link key={i} href={action.href} className="glass-card p-6 rounded-3xl border-white/[0.03] group flex gap-5 items-center">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-blue-600/10 transition-colors">
                                <action.icon className={`w-5 h-5 ${action.color}`} />
                            </div>
                            <div className="space-y-1 flex-1">
                                <p className="text-xs font-black italic tracking-tighter uppercase font-outfit">{action.title}</p>
                                <p className="text-[9px] text-white/20 font-medium italic group-hover:text-white/40">{action.desc}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
