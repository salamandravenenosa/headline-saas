"use client"

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { PenTool, Target, ChevronRight, Loader2, Sparkles, Copy, Check, BarChart3, Shield, Flame, Info } from 'lucide-react';
import { supabase } from '@/shared/lib/supabase';
import { useAuth } from '@/shared/context/AuthContext';

interface HeadlineResult {
    id: string;
    content: string;
    score: number;
    type: string;
}

export default function HeadlinesPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<HeadlineResult[]>([]);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [copyStyle, setCopyStyle] = useState<'black' | 'white'>('black');
    const [niche, setNiche] = useState('');
    const [briefing, setBriefing] = useState('');
    const [orgId, setOrgId] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrg = async () => {
            if (!user) return;

            // Fetch membership and organization
            const { data, error } = await supabase
                .from('memberships')
                .select('organization_id')
                .eq('profile_id', user.id)
                .maybeSingle();

            if (data?.organization_id) {
                setOrgId(data.organization_id);
            } else {
                console.error('No organization found for user');
            }
        };

        fetchOrg();
    }, [user]);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!orgId) {
            toast.error('Organização não identificada. Tente recarregar a página.');
            return;
        }

        setLoading(true);
        setResults([]);
        const loadToast = toast.loading('Motor de IA processando sua headline...');

        try {
            const response = await fetch('/api/v1/headlines/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-organization-id': orgId
                },
                body: JSON.stringify({ niche, briefing, style: copyStyle })
            });

            const json = await response.json();

            if (json.success) {
                toast.success('Headline gerada com sucesso!', { id: loadToast });
                setResults([{
                    id: json.data.id,
                    content: json.data.content,
                    score: json.data.score,
                    type: copyStyle === 'black' ? 'Black' : 'White'
                }]);
            } else {
                const errorMsg = json.error?.message;
                let finalMsg = json.error?.message || 'Erro ao gerar headline.';

                if (errorMsg === 'Missing or invalid API key' || errorMsg?.includes('API key') || json.error?.code === 'UNAUTHORIZED') {
                    finalMsg = 'Chave de API ausente ou inválida. Verifique sua conexão com o servidor.';
                } else if (errorMsg === 'INSUFFICIENT_CREDITS' || json.error?.code === 'FORBIDDEN') {
                    finalMsg = 'Créditos insuficientes. Faça um upgrade para PRO.';
                }

                toast.error(finalMsg, { id: loadToast });
            }
        } catch (err) {
            toast.error('Erro de conexão com o motor de IA.', { id: loadToast });
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success('Copiado para a área de transferência!');
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 py-2">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase font-outfit">Gerador de <span className="text-blue-500">Headlines</span></h1>
                    <p className="text-white/30 font-medium italic text-sm max-w-2xl">
                        Use o poder da inteligência artificial para criar títulos que vendem. Preencha os detalhes abaixo para que o motor entenda exatamente o seu público.
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Section */}
                <div className="lg:col-span-5">
                    <form onSubmit={handleGenerate} className="glass rounded-3xl p-8 border-white/[0.05] space-y-6 sticky top-28 shadow-xl">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 px-1">
                                <Info className="w-4 h-4 text-blue-500" />
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">
                                    Instruções do Motor
                                </h3>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-1 italic">1. Qual o seu Nicho? (Ex: Emagrecimento)</label>
                                <input
                                    type="text"
                                    placeholder="Quem você quer atingir?"
                                    value={niche}
                                    onChange={(e) => setNiche(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-1 italic">2. Briefing (O que você vende e qual a dor?)</label>
                                <textarea
                                    rows={4}
                                    placeholder="Descreva seu produto e o problema que ele resolve..."
                                    value={briefing}
                                    onChange={(e) => setBriefing(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-1 italic">3. Estilo da Cópia (Como você quer falar?)</label>
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
                                            <p className={`text-[11px] font-black uppercase italic ${copyStyle === 'black' ? 'text-white' : 'text-white/40'}`}>Estilo Black</p>
                                            <p className="text-[9px] font-medium text-white/20 leading-tight italic">Mais agressivo. Toca fundo na dor e na promessa de ganho.</p>
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
                                            <p className={`text-[11px] font-black uppercase italic ${copyStyle === 'white' ? 'text-white' : 'text-white/40'}`}>Estilo White</p>
                                            <p className="text-[9px] font-medium text-white/20 leading-tight italic">Mais suave. Focado em confiança, clareza e autoridade.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <button type="submit" disabled={loading} className="btn-primary w-full shadow-blue-600/20 group">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                <>Gerar Minha Headline <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </form>
                </div>

                {/* Results Section */}
                <div className="lg:col-span-7 space-y-6">
                    {results.length > 0 ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">Headline Processada pelo Motor</h3>
                                <div className="flex items-center gap-2 text-green-500/40 italic text-[9px] font-black uppercase tracking-widest">
                                    <Sparkles className="w-3.5 h-3.5" /> Pronta para uso
                                </div>
                            </div>

                            <div className="space-y-4">
                                {results.map((headline) => (
                                    <div key={headline.id} className={`glass p-8 rounded-3xl border-white/[0.05] hover:bg-white/[0.03] transition-all relative group shadow-xl ${copyStyle === 'black' ? 'hover:border-orange-500/20' : 'hover:border-blue-500/20'}`}>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-start gap-4">
                                                <p className="text-base font-bold italic leading-relaxed text-white group-hover:text-blue-400 transition-colors">
                                                    "{headline.content}"
                                                </p>
                                                <button
                                                    onClick={() => copyToClipboard(headline.content, headline.id)}
                                                    className="p-3 bg-white/5 hover:bg-blue-600 hover:text-white rounded-xl transition-all flex-shrink-0"
                                                >
                                                    {copiedId === headline.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                                                <div className="flex items-center gap-1.5">
                                                    <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
                                                    <span className="text-[10px] font-black text-white/30 italic uppercase tracking-widest">Score de Conversão: {headline.score}%</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Target className="w-3.5 h-3.5 text-indigo-500" />
                                                    <span className="text-[10px] font-black text-white/30 italic uppercase tracking-widest">Tom: {headline.type}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <p className="text-[10px] text-white/10 text-center italic font-medium px-10">
                                Dica: Se a headline não estiver exatamente como você quer, tente dar mais detalhes no campo "Briefing" acima.
                            </p>
                        </div>
                    ) : !loading && (
                        <div className="h-full min-h-[500px] glass rounded-3xl border-dashed border-white/5 flex flex-col items-center justify-center text-center space-y-6 opacity-30 p-12">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
                                <PenTool className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black italic uppercase font-outfit">Motor Aguardando Dados</h3>
                                <p className="text-xs font-medium italic max-w-xs leading-relaxed">
                                    Preencha o nicho e o briefing ao lado. Nossa IA vai analisar seus dados para criar a headline perfeita.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/40">
                                Pronto para processar <ChevronRight className="w-4 h-4" />
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div className="h-full min-h-[500px] glass rounded-3xl border-white/[0.05] flex flex-col items-center justify-center text-center space-y-6 p-12 animate-pulse">
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                            <div className="space-y-2">
                                <h3 className="text-xl font-black italic uppercase font-outfit">Processando Copy...</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">Injetando psicologia de compra</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
