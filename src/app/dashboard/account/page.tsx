"use client"

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { supabase } from '@/shared/lib/supabase';
import { User, Mail, Shield, Zap, CreditCard, ChevronRight, Settings, Bell, Lock, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AccountPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [profile, setProfile] = useState<any>(null);
    const [subscription, setSubscription] = useState<any>(null);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch profile - check both tables if necessary, but let's assume QuiziCopy_profiles is primary
            const { data: profileData } = await supabase
                .from('QuiziCopy_profiles')
                .select('*')
                .eq('id', user?.id)
                .maybeSingle();

            setProfile(profileData);
            if (profileData) setNewName(profileData.full_name || '');

            // Fetch subscription through membership
            const { data: membership } = await supabase
                .from('memberships')
                .select('organization_id')
                .eq('profile_id', user?.id)
                .maybeSingle();

            if (membership?.organization_id) {
                const { data: subData } = await supabase
                    .from('subscriptions')
                    .select('*, plans(*)')
                    .eq('organization_id', membership.organization_id)
                    .maybeSingle();
                setSubscription(subData);
            }
        } catch (error) {
            console.error('Error fetching account data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || newName === profile?.full_name) {
            setEditModalOpen(false);
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase
                .from('QuiziCopy_profiles')
                .update({ full_name: newName, updated_at: new Date().toISOString() })
                .eq('id', user?.id);

            if (error) throw error;
            setProfile({ ...profile, full_name: newName });
            toast.success('Perfil atualizado!');
            setEditModalOpen(false);
        } catch (error: any) {
            toast.error('Erro ao atualizar: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!user?.email) return;

        const loadToast = toast.loading('Enviando e-mail de redefinição...');
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                redirectTo: `${window.location.origin}/dashboard/account`,
            });
            if (error) throw error;
            toast.success('E-mail enviado! Verifique sua caixa de entrada.', { id: loadToast });
        } catch (error: any) {
            toast.error('Erro: ' + error.message, { id: loadToast });
        }
    };

    const handleUpgrade = async () => {
        toast.error('O sistema de pagamentos está em manutenção. Contate o suporte para upgrade manual.');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    const currentPlan = subscription?.plans?.name || 'Free';
    const isPro = currentPlan.toLowerCase() === 'pro';

    return (
        <div className="max-w-5xl mx-auto space-y-10 py-2">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase font-outfit">Minha <span className="text-blue-500">Conta</span></h1>
                    <p className="text-white/30 font-medium italic text-sm">Gerencie sua identidade digital e nível de acesso.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Profile Section */}
                <div className="lg:col-span-12">
                    <div className="glass rounded-[32px] p-8 border-white/[0.05] relative overflow-hidden group shadow-xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/[0.02] blur-[100px] rounded-full"></div>

                        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                            <div className="relative">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-xl border-2 border-white/10 group-hover:scale-105 transition-transform duration-500">
                                    <User className="w-12 h-12 text-white" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-black border border-white/10 rounded-xl flex items-center justify-center text-green-500 shadow-xl">
                                    <Shield className="w-4 h-4" />
                                </div>
                            </div>

                            <div className="flex-1 space-y-4 text-center md:text-left">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 italic">Identidade Ativa</p>
                                    <h2 className="text-3xl font-black italic tracking-tighter uppercase font-outfit">{profile?.full_name || user?.email?.split('@')[0] || 'Usuário Qyi'}</h2>
                                    <div className="flex items-center justify-center md:justify-start gap-4 text-white/30">
                                        <div className="flex items-center gap-1.5 font-bold italic text-xs">
                                            <Mail className="w-3.5 h-3.5" /> {user?.email}
                                        </div>
                                        <div className="w-1 h-1 bg-white/10 rounded-full"></div>
                                        <div className="flex items-center gap-1.5 font-bold italic text-[10px] uppercase tracking-widest">
                                            Role: {profile?.is_admin ? 'ADMIN' : 'USUÁRIO'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setEditModalOpen(true)}
                                disabled={saving}
                                className="btn-secondary !px-6 !py-3 flex items-center gap-2"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                                Editar Perfil
                            </button>
                        </div>
                    </div>
                </div>

                {/* Subscription Details */}
                <div className="lg:col-span-7">
                    <div className={`glass rounded-[32px] p-10 border-blue-500/20 bg-blue-500/[0.02] space-y-8 relative overflow-hidden group shadow-2xl h-full ${isPro ? 'border-orange-500/30 bg-orange-500/[0.02]' : ''}`}>
                        <div className="flex justify-between items-start relative z-10">
                            <div className="space-y-1">
                                <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] italic flex items-center gap-2 ${isPro ? 'text-orange-400' : 'text-blue-400'}`}>
                                    <Zap className={`w-4 h-4 ${isPro ? 'fill-orange-400' : 'fill-blue-400'}`} /> Nível de Acesso
                                </h3>
                                <h2 className="text-4xl font-black italic tracking-tighter uppercase font-outfit">
                                    Plano <span className={isPro ? 'text-orange-500' : 'text-blue-500'}>{currentPlan}</span>
                                </h2>
                            </div>
                            <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest italic shadow-lg ${isPro ? 'bg-orange-600 shadow-orange-600/20' : 'bg-blue-600 shadow-blue-600/20'}`}>Ativo</div>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="space-y-3">
                                <div className="flex justify-between text-[10px] font-black uppercase italic text-white/20">
                                    <span>Variações Restantes</span>
                                    <span>{isPro ? '∞' : 'Utilizadas'} / {subscription?.plans?.monthly_request_limit || (isPro ? '∞' : '100')}</span>
                                </div>
                                <div className="h-2.5 bg-black/40 rounded-full border border-white/5 overflow-hidden p-0.5">
                                    <div className={`h-full rounded-full shadow-lg ${isPro ? 'w-full bg-gradient-to-r from-orange-600 to-red-600' : 'w-[16%] bg-gradient-to-r from-blue-600 to-indigo-600'}`}></div>
                                </div>
                            </div>

                            <p className="text-xs text-white/30 font-medium italic leading-relaxed">
                                {isPro
                                    ? 'Aproveite seu acesso ilimitado ao motor de IA.'
                                    : 'Seu ciclo de processamento é renovado mensalmente. Atualize para o Pro e remova todos os limites.'}
                            </p>

                            {!isPro && (
                                <button onClick={handleUpgrade} className="btn-primary !w-full !py-4 shadow-blue-600/20">
                                    <CreditCard className="w-4 h-4" /> Gear Up para Pro Engine
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Settings */}
                <div className="lg:col-span-5 space-y-6">
                    <div
                        onClick={() => toast('Nenhuma notificação importante no momento.')}
                        className="glass-card p-6 rounded-[24px] flex items-center justify-between border-white/[0.03] group cursor-pointer shadow-lg"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/20 group-hover:text-white transition-all">
                                <Bell className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs font-black italic uppercase font-outfit tracking-tighter">Notificações</p>
                                <p className="text-[9px] font-medium text-white/20 uppercase tracking-widest italic">Alertas de uso da API.</p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white transition-all" />
                    </div>

                    <div
                        onClick={handlePasswordReset}
                        className="glass-card p-6 rounded-[24px] flex items-center justify-between border-white/[0.03] group cursor-pointer shadow-lg"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/20 group-hover:text-white transition-all">
                                <Lock className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs font-black italic uppercase font-outfit tracking-tighter">Segurança</p>
                                <p className="text-[9px] font-medium text-white/20 uppercase tracking-widest italic">Troca de senha e 2FA.</p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white transition-all" />
                    </div>

                    <div className="p-6 bg-red-500/[0.03] border border-red-500/10 rounded-[24px] space-y-4">
                        <p className="text-[9px] font-black uppercase tracking-widest text-red-500/40 italic">Zona de Risco</p>
                        <button className="text-[10px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 transition-colors italic">Desativar Motor Gratuitamente</button>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {editModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass w-full max-w-md rounded-[32px] p-8 border-white/[0.05] shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black italic uppercase font-outfit">Editar <span className="text-blue-500">Perfil</span></h3>
                            <p className="text-[10px] text-white/20 font-medium uppercase tracking-widest italic">Atualize suas informações de identidade.</p>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-white/30 px-1 italic">Nome Completo</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Ex: João Silva"
                                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold italic focus:border-blue-500/50 transition-all outline-none"
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditModalOpen(false)}
                                    className="flex-1 px-6 py-4 rounded-2xl bg-white/5 text-[10px] font-black uppercase italic hover:bg-white/10 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 btn-primary !py-4 shadow-blue-600/20"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
