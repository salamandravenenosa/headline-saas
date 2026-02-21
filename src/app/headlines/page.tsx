"use client"

import React, { useState } from 'react';
import { PenTool, Target, Zap, ChevronRight, Loader2, Sparkles, Copy, Check, BarChart3, Shield, Flame } from 'lucide-react';

export default function HeadlinesPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [copyStyle, setCopyStyle] = useState<'black' | 'white'>('black');

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
        }, 1500);
    };

    const copyToClipboard = (text: string, id: number) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 py-2">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase font-outfit">Escrita <span className="text-blue-500">Viral</span></h1>
                    <p className="text-white/30 font-medium italic text-sm">Gere headlines de alta conversão injetando psicologia de compra.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Section */}
                <div className="lg:col-span-5">
                    <form onSubmit={handleGenerate} className="glass rounded-3xl p-8 border-white/[0.05] space-y-6 sticky top-28 shadow-xl">
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/20 flex items-center gap-2 italic">
                                <PenTool className="w-4 h-4" /> Configuração do Engine
                            </h3>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-1 italic">Nicho / Persona</label>
                                <input type="text" placeholder="ex: Emagrecimento, Marketing..." required />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-1 italic">Contexto / Produto</label>
                                <textarea rows={4} placeholder="Sobre o que é sua copy?" required />
                            </div>

                            {/* Black vs White Selection Cards */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-1 italic">Estilo da Cópia</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div
                                        onClick={() => setCopyStyle('black')}
                                        className={`cursor-pointer p-4 rounded-2xl border-2 transition-all space-y-2 group ${copyStyle === 'black'
                                                ? 'bg-orange-600/10 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.1)]'
                                                : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <Flame className={`w-5 h-5 ${copyStyle === 'black' ? 'text-orange-500' : 'text-white/20'}`} />
                                            {copyStyle === 'black' && <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>}
                                        </div>
                                        <div>
                                            <p className={`text-[11px] font-black uppercase italic ${copyStyle === 'black' ? 'text-white' : 'text-white/40'}`}>Black Copy</p>
                                            <p className="text-[9px] font-medium text-white/20 leading-tight italic">Agressiva. Focada em lucro imediato.</p>
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => setCopyStyle('white')}
                                        className={`cursor-pointer p-4 rounded-2xl border-2 transition-all space-y-2 group ${copyStyle === 'white'
                                                ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                                                : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <Shield className={`w-5 h-5 ${copyStyle === 'white' ? 'text-blue-500' : 'text-white/20'}`} />
                                            {copyStyle === 'white' && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>}
                                        </div>
                                        <div>
                                            <p className={`text-[11px] font-black uppercase italic ${copyStyle === 'white' ? 'text-white' : 'text-white/40'}`}>White Copy</p>
                                            <p className="text-[9px] font-medium text-white/20 leading-tight italic">Suave. Focada em autoridade e confiança.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full shadow-blue-600/20 group">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                <>Gerar Headline <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </form>
                </div>

                {/* Results Section */}
                <div className="lg:col-span-7 space-y-6">
                    {success ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">Variações Geradas (3)</h3>
                                <div className="flex items-center gap-2 text-green-500/40 italic text-[9px] font-black uppercase tracking-widest">
                                    <Sparkles className="w-3.5 h-3.5" /> Otimizado para {copyStyle === 'black' ? 'Conversão Black' : 'Conversão White'}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { text: "O Sistema Invisível para Escalar seu Infoproduto sem Depender de Tráfego Pago.", score: 98, type: copyStyle === 'black' ? 'Black' : 'White' },
                                    { text: "Por que 97% dos Marketers Falham e como o Engine QyiCopy está Mudando o Jogo.", score: 95, type: copyStyle === 'black' ? 'Black' : 'White' },
                                    { text: "A Única Headline que Você Precisa para Dobrar seu ROI ainda esta Semana.", score: 92, type: copyStyle === 'black' ? 'Black' : 'White' },
                                ].map((headline, i) => (
                                    <div key={i} className={`glass p-8 rounded-3xl border-white/[0.05] hover:bg-white/[0.03] transition-all relative group shadow-xl ${copyStyle === 'black' ? 'hover:border-orange-500/20' : 'hover:border-blue-500/20'}`}>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-start gap-4">
                                                <p className="text-base font-bold italic leading-relaxed text-white group-hover:text-blue-400 transition-colors">
                                                    "{headline.text}"
                                                </p>
                                                <button
                                                    onClick={() => copyToClipboard(headline.text, i)}
                                                    className="p-3 bg-white/5 hover:bg-blue-600 hover:text-white rounded-xl transition-all flex-shrink-0"
                                                >
                                                    {copiedId === i ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                                                <div className="flex items-center gap-1.5">
                                                    <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
                                                    <span className="text-[10px] font-black text-white/30 italic uppercase tracking-widest">Score: {headline.score}%</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Target className="w-3.5 h-3.5 text-indigo-500" />
                                                    <span className="text-[10px] font-black text-white/30 italic uppercase tracking-widest">Estilo: {headline.type}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[500px] glass rounded-3xl border-dashed border-white/5 flex flex-col items-center justify-center text-center space-y-6 opacity-30 p-12">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
                                <PenTool className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black italic uppercase font-outfit">Silo de Criação Vazio</h3>
                                <p className="text-xs font-medium italic max-w-xs leading-relaxed">Selecione o estilo e preencha os dados ao lado para começar.</p>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/40">
                                Engine pronta <ChevronRight className="w-4 h-4" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
