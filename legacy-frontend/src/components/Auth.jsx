import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import VibeButton from './VibeButton';
import { Sparkles, Mail, Lock, User, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Auth = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showPassword, setShowPassword] = useState(false);

    const validatePassword = (pass) => {
        const minLength = pass.length >= 6;
        const hasLower = /[a-z]/.test(pass);
        const hasUpper = /[A-Z]/.test(pass);
        const hasNumber = /[0-9]/.test(pass);
        const hasSpecial = /[@$!%*?&]/.test(pass);
        return minLength && hasLower && hasUpper && hasNumber && hasSpecial;
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        if (!isLogin && !validatePassword(password)) {
            setMessage({ type: 'error', text: 'Senha deve ter: 6+ caracteres, maiúscula, minúscula, número e @$!%*?&' });
            setLoading(false);
            return;
        }

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName || 'Usuário QuiziCopy',
                        },
                        emailRedirectTo: window.location.origin
                    }
                });
                if (error) throw error;

                setMessage({ type: 'success', text: 'Verifique seu e-mail para confirmar a conta!' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[40px] p-8 md:p-14 space-y-10 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Sparkles className="w-24 h-24 text-blue-500" />
                </div>

                <div className="text-center space-y-3 relative z-10">
                    <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-600/40 mx-auto mb-8 transform -rotate-6">
                        <Sparkles className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase italic">
                        {isLogin ? 'Bem-vindo de Volta' : 'Criar Conta PRO'}
                    </h2>
                    <p className="text-white/40 text-base sm:text-lg">
                        {isLogin ? 'Entre para dominar as headlines' : 'Complete os campos para começar'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-6 relative z-10">
                    <AnimatePresence mode="wait">
                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2 overflow-hidden"
                            >
                                <label className="text-xs font-bold text-white/50 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                                    <User className="w-4 h-4" /> Nome Completo
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required={!isLogin}
                                    placeholder="Seu Nome"
                                    className="w-full glass"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-white/50 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                            <Mail className="w-4 h-4" /> Seu E-mail
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="exemplo@gmail.com"
                            className="w-full glass"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between px-1">
                            <label className="text-xs font-bold text-white/50 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Lock className="w-4 h-4" /> Senha Segura
                            </label>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full glass pr-14"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors p-2"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {!isLogin && password && (
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3" /> Requisitos de Segurança:
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-2">
                                <Requirement met={password.length >= 6} label="6+ caracteres" />
                                <Requirement met={/[A-Z]/.test(password)} label="Maiúscula" />
                                <Requirement met={/[a-z]/.test(password)} label="Minúscula" />
                                <Requirement met={/[0-9]/.test(password)} label="Número" />
                                <Requirement met={/[@$!%*?&]/.test(password)} label="Especial (@$!%)" />
                            </div>
                        </div>
                    )}

                    {message.text && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`p-4 rounded-2xl text-sm text-center font-bold border flex flex-col gap-3 ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
                        >
                            <span>{message.text}</span>
                            {message.type === 'success' && (
                                <button
                                    type="button"
                                    onClick={async () => {
                                        setLoading(true);
                                        const { error } = await supabase.auth.resend({
                                            type: 'signup',
                                            email: email,
                                            options: { emailRedirectTo: window.location.origin }
                                        });
                                        if (error) setMessage({ type: 'error', text: error.message });
                                        else setMessage({ type: 'success', text: 'E-mail reenviado! Verifique também o Spam.' });
                                        setLoading(false);
                                    }}
                                    className="text-[10px] uppercase tracking-widest underline opacity-60 hover:opacity-100 transition-opacity"
                                >
                                    Não recebeu? Reenviar agora
                                </button>
                            )}
                        </motion.div>
                    )}

                    <div className="pt-4">
                        <VibeButton type="submit" loading={loading} className="w-full">
                            {isLogin ? 'Acessar Plataforma' : 'Finalizar Cadastro'}
                        </VibeButton>
                    </div>
                </form>

                <div className="text-center pt-8 border-t border-white/5 relative z-10">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-white/40 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
                    >
                        {isLogin ? '→ Criar sua conta agora' : '← Já tenho uma conta'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const Requirement = ({ met, label }) => (
    <div className={`flex items-center gap-1.5 text-[10px] font-bold ${met ? 'text-green-400' : 'text-white/20'}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${met ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-white/10'}`} />
        {label}
    </div>
);

export default Auth;
