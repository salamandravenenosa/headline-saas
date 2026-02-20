import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import VibeButton from './VibeButton';
import { User, Lock, Mail, ShieldCheck, CheckCircle2, History } from 'lucide-react';
import { motion } from 'framer-motion';

const Account = ({ session }) => {
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState({ full_name: '' });
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [stats, setStats] = useState({ headlines: 0, knowledge: 0 });

    useEffect(() => {
        fetchProfile();
        fetchStats();
    }, [session]);

    const fetchProfile = async () => {
        const { data } = await supabase
            .from('QuiziCopy_profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .single();
        if (data) setProfile(data);
    };

    const fetchStats = async () => {
        const { count: headlineCount } = await supabase
            .from('QuiziCopy_headlines')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', session.user.id);

        const { count: knowledgeCount } = await supabase
            .from('QuiziCopy_knowledge_base')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', session.user.id);

        setStats({ headlines: headlineCount || 0, knowledge: knowledgeCount || 0 });
    };

    const validatePassword = (pass) => {
        const minLength = pass.length >= 6;
        const hasLower = /[a-z]/.test(pass);
        const hasUpper = /[A-Z]/.test(pass);
        const hasNumber = /[0-9]/.test(pass);
        const hasSpecial = /[@$!%*?&]/.test(pass);
        return minLength && hasLower && hasUpper && hasNumber && hasSpecial;
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (!validatePassword(newPassword)) {
            setMessage({ type: 'error', text: 'Senha não atende aos requisitos mínimos.' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            setMessage({ type: 'success', text: 'Senha atualizada com sucesso!' });
            setNewPassword('');
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<History />} label="Headlines Geradas" value={stats.headlines} color="blue" />
                <StatCard icon={<ShieldCheck />} label="Base Segura" value={stats.knowledge} color="indigo" />
                <StatCard icon={<User />} label="Status da Conta" value="PRO" color="green" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Profile Info */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass rounded-[32px] p-8 space-y-6"
                >
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400">
                            <User className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold italic uppercase underline decoration-blue-500/30">Perfil do Copywriter</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Nome Completo</label>
                            <div className="glass px-6 py-4 rounded-xl text-white font-medium flex items-center gap-3">
                                <CheckCircle2 className="w-4 h-4 text-green-400" /> {profile.full_name || 'Usuário QuiziCopy'}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">E-mail Cadastrado</label>
                            <div className="glass px-6 py-4 rounded-xl text-white/60 font-medium flex items-center gap-3">
                                <Mail className="w-4 h-4" /> {session.user.email}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Change Password */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass rounded-[32px] p-8 space-y-6 border-red-500/10"
                >
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-red-500/20 rounded-2xl text-red-400">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold italic uppercase underline decoration-red-500/30">Segurança da Conta</h3>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Nova Senha</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Ex: Senha@123"
                                className="w-full"
                            />
                        </div>

                        {newPassword && (
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                                <div className="flex flex-wrap gap-x-4 gap-y-2">
                                    <Requirement met={newPassword.length >= 6} label="6+ chars" />
                                    <Requirement met={/[A-Z]/.test(newPassword)} label="Maiúscula" />
                                    <Requirement met={/[a-z]/.test(newPassword)} label="Minúscula" />
                                    <Requirement met={/[0-9]/.test(newPassword)} label="Número" />
                                    <Requirement met={/[@$!%*?&]/.test(newPassword)} label="Símbolo" />
                                </div>
                            </div>
                        )}

                        {message.text && (
                            <p className={`text-xs font-bold px-1 ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                {message.text}
                            </p>
                        )}

                        <VibeButton type="submit" loading={loading} className="w-full">
                            Atualizar Senha
                        </VibeButton>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, color }) => {
    const colors = {
        blue: 'bg-blue-600/20 text-blue-400 border-blue-500/20',
        indigo: 'bg-indigo-600/20 text-indigo-400 border-indigo-500/20',
        green: 'bg-green-600/20 text-green-400 border-green-500/20',
    };
    return (
        <div className={`glass p-6 rounded-[24px] border flex items-center gap-5 ${colors[color]}`}>
            <div className="p-3 bg-white/10 rounded-xl">{icon}</div>
            <div>
                <p className="text-[10px] uppercase font-black tracking-widest opacity-60">{label}</p>
                <p className="text-2xl font-black">{value}</p>
            </div>
        </div>
    );
};

const Requirement = ({ met, label }) => (
    <div className={`flex items-center gap-1.5 text-[9px] font-bold ${met ? 'text-green-400' : 'text-white/20'}`}>
        <div className={`w-1 h-1 rounded-full ${met ? 'bg-green-400' : 'bg-white/10'}`} />
        {label}
    </div>
);

export default Account;
