"use client"

import React from 'react';
import Link from 'next/link';
import { Zap, Shield, Rocket, Sparkles, ChevronRight, Github, Twitter, Layers, Globe, Check } from 'lucide-react';
import { useAuth } from '@/shared/context/AuthContext';

export default function Home() {
    const { user } = useAuth();
    const dashboardLink = user ? "/dashboard" : "/login";

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 overflow-x-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-blue-600/[0.1] blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-indigo-600/[0.1] blur-[120px] rounded-full"></div>
                <div className="absolute inset-0 bg-grid opacity-20"></div>
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/[0.05] bg-[#020617]/60 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Zap className="w-4 h-4 fill-white text-white" />
                        </div>
                        <span className="text-xl font-black italic tracking-tighter font-outfit uppercase">QyiCopy</span>
                    </div>

                    <div className="hidden lg:flex items-center gap-8 text-[9px] font-black uppercase tracking-[0.2em] text-white/30 italic">
                        <a href="#features" className="hover:text-white transition-all">Funcionalidades</a>
                        <a href="#pricing" className="hover:text-white transition-all">Preços</a>
                        <Link href="/dashboard/api/docs" className="hover:text-white transition-all">Docs</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {!user ? (
                            <>
                                <Link href="/login" className="px-5 py-2 hover:bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all italic border border-white/5">
                                    Acessar
                                </Link>
                                <Link href="/signup" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all shadow-lg shadow-blue-600/20 italic">
                                    Começar
                                </Link>
                            </>
                        ) : (
                            <Link href="/dashboard" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all shadow-lg italic">
                                Dashboard
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-6">
                <div className="max-w-7xl mx-auto text-center space-y-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/[0.08] border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest animate-fade-in italic">
                        <Sparkles className="w-3 h-3" /> Motor Viral v2.0 Disponível
                    </div>

                    <div className="space-y-6 max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black italic tracking-tighter leading-[0.9] uppercase font-outfit">
                            O Engine de Solo <br /> <span className="text-blue-500">Viral</span> para SaaS.
                        </h1>
                        <p className="text-lg text-white/30 font-medium max-w-2xl mx-auto leading-relaxed italic">
                            Automatize seu copywriting com IA de alta performance. Escalabilidade global e scoring em tempo real via API.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
                        <Link href={dashboardLink} className="btn-primary flex items-center gap-3">
                            Ativar Engine <ChevronRight className="w-4 h-4" />
                        </Link>
                        <a href="#features" className="btn-secondary italic">
                            Ver Componentes
                        </a>
                    </div>

                    {/* Dashboard Preview Overlay */}
                    <div className="relative mt-20 p-2 glass rounded-[32px] border-white/5 shadow-2xl animate-float group max-w-5xl mx-auto overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2574&auto=format&fit=crop"
                            alt="AI Dashboard Preview"
                            className="rounded-[24px] w-full h-[500px] object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent z-10"></div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 px-6 relative">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: 'Performance', desc: 'Gere centenas de variações em milissegundos com baixa latência.', icon: Zap, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                        { title: 'Testes A/B', desc: 'Ajuste fino via API com scoring emocional em tempo real.', icon: Layers, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                        { title: 'Infra Enterprise', desc: 'Isolamento de dados nível bancário e roteamento global.', icon: Shield, color: 'text-purple-500', bg: 'bg-purple-500/10' }
                    ].map((feature, i) => (
                        <div key={i} className="glass-card p-8 rounded-3xl space-y-6 border-white/[0.03] group shadow-xl">
                            <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center`}>
                                <feature.icon className={`w-6 h-6 ${feature.color}`} />
                            </div>
                            <h3 className="text-xl font-black italic tracking-tighter uppercase font-outfit">{feature.title}</h3>
                            <p className="text-white/20 font-medium leading-relaxed italic text-sm">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Numbers Section */}
            <section className="py-20 px-6 border-y border-white/[0.05] bg-white/[0.01]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10 text-center md:text-left items-center">
                    <div className="space-y-1">
                        <p className="text-5xl font-black text-blue-500 italic tabular-nums font-outfit">1M+</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/20 italic">API Requests / Day</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-5xl font-black text-indigo-500 italic tabular-nums font-outfit">99.9%</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/20 italic">Uptime</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-5xl font-black text-purple-500 italic tabular-nums font-outfit">12ms</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/20 italic">Latency</p>
                    </div>
                </div>
            </section>

            {/* Pricing Preview */}
            <section id="pricing" className="py-24 px-6 relative">
                <div className="max-w-4xl mx-auto text-center space-y-16 relative z-10">
                    <div className="space-y-4">
                        <h2 className="text-5xl font-black italic tracking-tighter uppercase font-outfit">Preços <span className="text-blue-500">Elite</span></h2>
                        <p className="text-white/20 font-medium italic text-sm uppercase tracking-widest">Escalabilidade sob demanda.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="glass p-10 rounded-3xl border-white/5 space-y-8 text-left hover:bg-white/[0.03] transition-all group shadow-xl">
                            <div className="space-y-2">
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/20 italic">Starter</p>
                                <h3 className="text-5xl font-black italic font-outfit uppercase">Free</h3>
                            </div>
                            <ul className="space-y-4">
                                {['100 Requests/mês', '3 Chaves de API', 'Modelos Standard Lite'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest italic text-white/30">
                                        <Check className="w-3.5 h-3.5" /> {item}
                                    </li>
                                ))}
                            </ul>
                            <Link href={dashboardLink} className="btn-secondary !w-full">
                                Começar Grátis
                            </Link>
                        </div>

                        <div className="glass p-10 rounded-3xl border-blue-500/20 bg-blue-500/[0.03] space-y-8 text-left relative overflow-hidden shadow-2xl group">
                            <div className="absolute top-6 right-6 px-3 py-1 bg-blue-600 rounded-full text-[8px] font-black uppercase tracking-widest italic animate-pulse">Popullar</div>
                            <div className="space-y-2">
                                <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 italic">Pro Engine</p>
                                <h3 className="text-5xl font-black italic font-outfit uppercase tracking-tighter">$49<span className="text-xl text-blue-500/40 italic ml-1">/mês</span></h3>
                            </div>
                            <ul className="space-y-4">
                                {['10,000 Requests/mês', 'Full API Scalability', 'Modelos Premium Brain'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest italic text-white/60">
                                        <Check className="w-3.5 h-3.5 text-blue-500" /> {item}
                                    </li>
                                ))}
                            </ul>
                            <Link href={dashboardLink} className="btn-primary !w-full">
                                Dominar Agora
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 border-t border-white/[0.05] relative bg-black/60">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
                    <div className="col-span-2 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Zap className="w-4 h-4 fill-white text-white" />
                            </div>
                            <span className="text-xl font-black italic tracking-tighter uppercase font-outfit">QyiCopy</span>
                        </div>
                        <p className="text-white/20 font-medium italic max-w-sm leading-relaxed text-sm">
                            Tecnologia de ponta aplicada ao copywriting de conversão direta.
                        </p>
                        <div className="flex items-center gap-6 text-white/5">
                            <Github className="w-4 h-4 hover:text-white transition-all cursor-pointer" />
                            <Twitter className="w-4 h-4 hover:text-white transition-all cursor-pointer" />
                            <Globe className="w-4 h-4 hover:text-white transition-all cursor-pointer" />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <h4 className="text-[9px] font-black uppercase tracking-widest text-blue-500 italic">Central</h4>
                        <ul className="space-y-3 text-[9px] font-black uppercase tracking-widest text-white/10 italic">
                            <li><Link href="/dashboard/api/docs" className="hover:text-white transition-all">Documentação</Link></li>
                            <li><a href="#" className="hover:text-white transition-all">API Playground</a></li>
                        </ul>
                    </div>
                    <div className="space-y-6">
                        <h4 className="text-[9px] font-black uppercase tracking-widest text-indigo-500 italic">Legal</h4>
                        <ul className="space-y-3 text-[9px] font-black uppercase tracking-widest text-white/10 italic">
                            <li><a href="#" className="hover:text-white transition-all">Privacidade</a></li>
                            <li><a href="#" className="hover:text-white transition-all">Termos</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto pt-16 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/[0.05] mt-16 text-[9px] font-black uppercase tracking-widest text-white/5 italic">
                    <p>© 2026 QYICOPY ENGINE. ALL RIGHTS RESERVED.</p>
                    <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-green-500/[0.02] border border-green-500/10">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                        <span className="text-green-500/60">Engine Status: Optimized</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
