"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/shared/lib/supabase';
import { Zap, Mail, Lock, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
            if (authError) throw authError;
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Erro ao entrar na conta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none"></div>

            <div className="w-full max-w-md space-y-8 z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-4">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Zap className="w-5 h-5 fill-white text-white" />
                        </div>
                        <span className="text-2xl font-black italic tracking-tighter uppercase font-outfit">QyiCopy</span>
                    </Link>
                    <h1 className="text-2xl font-black italic tracking-tighter uppercase font-outfit">Bem-vindo de volta</h1>
                </div>

                <div className="glass rounded-[32px] p-10 border-white/[0.08] shadow-2xl space-y-6">
                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/10 rounded-xl text-red-500 text-[10px] italic font-bold">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-1 italic">E-mail</label>
                            <div className="input-with-icon-wrapper">
                                <Mail />
                                <input
                                    type="email"
                                    placeholder="voce@empresa.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 italic">Senha</label>
                                <Link href="#" className="text-[9px] font-black uppercase tracking-widest text-blue-500 hover:text-white transition-colors">Esqueci</Link>
                            </div>
                            <div className="input-with-icon-wrapper">
                                <Lock />
                                <input
                                    type="password"
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full shadow-blue-600/10">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Acessar Conta <ChevronRight className="w-4 h-4" /></>}
                        </button>
                    </form>

                    <p className="text-center text-[10px] font-medium text-white/20 italic">
                        Não tem conta? <Link href="/signup" className="text-white hover:text-blue-500 transition-colors font-black">Criar agora</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
