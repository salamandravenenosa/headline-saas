"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/shared/lib/supabase';
import { Zap, Mail, Lock, User, ChevronRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: fullName } }
            });
            if (signUpError) throw signUpError;
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Erro ao criar conta');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none"></div>
                <div className="w-full max-w-md glass rounded-[32px] p-10 border-blue-500/20 text-center space-y-6 z-10 animate-in fade-in zoom-in duration-500">
                    <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-green-500/20">
                        <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase font-outfit">Motor Ativado</h2>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest italic">Verifique seu e-mail para validar o acesso.</p>
                    </div>
                    <Link href="/login" className="btn-secondary !w-full">Voltar para o Login</Link>
                </div>
            </div>
        );
    }

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
                    <h1 className="text-2xl font-black italic tracking-tighter uppercase font-outfit">Nova Conta Engine</h1>
                </div>

                <div className="glass rounded-[32px] p-10 border-white/[0.08] shadow-2xl space-y-6">
                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/10 rounded-xl text-red-500 text-[10px] italic font-bold">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-1 italic">Nome</label>
                            <div className="input-with-icon-wrapper">
                                <User />
                                <input type="text" placeholder="Seu Nome" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-1 italic">E-mail</label>
                            <div className="input-with-icon-wrapper">
                                <Mail />
                                <input type="email" placeholder="voce@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-1 italic">Senha</label>
                            <div className="input-with-icon-wrapper">
                                <Lock />
                                <input type="password" placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full shadow-blue-600/10">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Criar Conta <ChevronRight className="w-4 h-4" /></>}
                        </button>
                    </form>

                    <p className="text-center text-[10px] font-medium text-white/20 italic">
                        Já tem conta? <Link href="/login" className="text-white hover:text-blue-500 transition-colors font-black">Acessar agora</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
