"use client"

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Key, Plus, Copy, Trash2, Check, Activity, Shield, X, HelpCircle, Loader2, ChevronRight } from 'lucide-react';
import { ApiKey } from '@/types';

export default function ApiManagementPage() {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [createdKey, setCreatedKey] = useState<string | null>(null);
    const [usage, setUsage] = useState({ current: 0, limit: 1000 });
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const orgId = "00000000-0000-0000-0000-000000000000";

    useEffect(() => {
        fetchKeys();
        fetchUsage();
    }, []);

    const fetchKeys = async () => {
        try {
            const res = await fetch('/api/v1/auth/api-keys', {
                headers: { 'x-organization-id': orgId }
            });
            const json = await res.json();
            if (json.success) setKeys(json.data);
            else toast.error('Erro ao carregar chaves: ' + json.error);
        } catch (e) {
            toast.error('Erro de conexão ao buscar chaves');
        }
        setLoading(false);
    };

    const fetchUsage = async () => {
        try {
            const res = await fetch('/api/v1/usage', {
                headers: { 'x-organization-id': orgId }
            });
            const json = await res.json();
            if (json.success) {
                setUsage({
                    current: json.data.usage.consumed,
                    limit: json.data.plan.limit
                });
            }
        } catch (e) { console.error(e); }
    };

    const handleCreateKey = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const loadToast = toast.loading('Gerando novo acesso...');
        try {
            const res = await fetch('/api/v1/auth/api-keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newKeyName, organizationId: orgId })
            });
            const json = await res.json();
            if (json.success) {
                toast.success('Chave de API gerada com sucesso!', { id: loadToast });
                setCreatedKey(json.data.key);
                fetchKeys();
            } else {
                toast.error(json.error.message, { id: loadToast });
            }
        } catch (e) {
            toast.error('Erro ao criar chave', { id: loadToast });
        }
        setLoading(false);
    };

    const handleRevoke = async (id: string) => {
        const confirmToast = toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="font-bold text-xs uppercase italic">Revogar este acesso permanentemente?</p>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            await executeRevoke(id);
                        }}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase italic"
                    >
                        Sim, Revogar
                    </button>
                    <button onClick={() => toast.dismiss(t.id)} className="bg-white/10 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase italic">Cancelar</button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    const executeRevoke = async (id: string) => {
        try {
            const res = await fetch(`/api/v1/auth/api-keys/${id}`, {
                method: 'DELETE',
                headers: { 'x-organization-id': orgId }
            });
            const json = await res.json();
            if (json.success || res.ok) {
                toast.success('Acesso revogado.');
                fetchKeys();
            } else {
                toast.error('Erro ao revogar acesso');
            }
        } catch (e) { toast.error('Falha na conexão'); }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success('Chave copiada!');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const usagePercent = Math.min(100, (usage.current / usage.limit) * 100);

    return (
        <div className="max-w-5xl mx-auto space-y-10 py-2">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black italic tracking-tighter font-outfit uppercase">Conexões <span className="text-blue-500">Externas</span></h1>
                    <p className="text-white/30 font-medium italic text-sm">Crie chaves de API para usar a inteligência do QyiCopy em seus próprios sites e aplicativos.</p>
                </div>
                <button
                    onClick={() => {
                        setCreatedKey(null);
                        setNewKeyName('');
                        setIsModalOpen(true);
                    }}
                    disabled={keys.length >= 3}
                    className="btn-primary !px-6 !py-3 shadow-blue-500/10 disabled:opacity-30 flex items-center gap-2 font-outfit italic"
                >
                    <Plus className="w-4 h-4" /> Criar Minha Chave
                </button>
            </header>

            {/* Usage Summary */}
            <div className="glass rounded-[32px] p-8 border-white/[0.05] space-y-6 relative overflow-hidden group shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/[0.02] blur-[100px] rounded-full"></div>

                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative z-10">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 flex items-center gap-2 italic">
                            <Activity className="w-3.5 h-3.5 text-blue-500" /> Seu Limite de Chamadas Externas
                        </p>
                        <h2 className="text-4xl font-black font-outfit italic">{usage.current} <span className="text-white/10 text-xl italic ml-1">/ {usage.limit}</span></h2>
                    </div>
                </div>

                <div className="space-y-3 relative z-10">
                    <div className="h-3 bg-black/40 rounded-full p-0.5 border border-white/5 shadow-inner overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                            style={{ width: `${usagePercent}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Keys Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">Chaves Ativas ({keys.length}/3)</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {keys.length > 0 ? keys.map(key => (
                        <div key={key.id} className="glass p-6 rounded-[24px] border-white/[0.05] hover:bg-white/[0.03] transition-all flex flex-col md:flex-row items-center justify-between gap-6 group shadow-lg">
                            <div className="flex items-center gap-6 w-full md:w-auto">
                                <div className="w-12 h-12 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-center text-white/10 group-hover:text-blue-500 transition-colors">
                                    <Key className="w-5 h-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-lg font-black italic tracking-tighter uppercase font-outfit">{key.name}</h4>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-green-500/60 italic">Online</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-1 items-center justify-center md:justify-start w-full md:w-auto px-2">
                                <div className="bg-black/40 border border-white/5 px-4 py-2.5 rounded-xl font-mono text-xs text-blue-300 w-full md:w-auto text-center md:text-left shadow-inner">
                                    {key.prefix}•••••••••••••••••••••••••
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                                <button
                                    onClick={() => handleRevoke(key.id)}
                                    className="p-3 text-white/10 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all border border-transparent hover:border-red-500/10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )) : !loading && (
                        <div className="py-20 glass rounded-[32px] border border-dashed border-white/5 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                            <Key className="w-8 h-8" />
                            <h3 className="text-base font-black italic uppercase font-outfit">Nenhum Túnel Ativo</h3>
                        </div>
                    )}
                </div>
            </div>

            {/* Premium Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => !createdKey && setIsModalOpen(false)}></div>
                    <div className="w-full max-w-lg glass rounded-[40px] p-10 space-y-8 relative border-white/10 shadow-2xl animate-in zoom-in slide-in-from-bottom-4 duration-300">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 text-white/20 hover:text-white border border-white/5 rounded-xl">
                            <X className="w-4 h-4" />
                        </button>

                        {!createdKey ? (
                            <form onSubmit={handleCreateKey} className="space-y-8">
                                <div className="space-y-1 text-center">
                                    <h3 className="text-2xl font-black italic tracking-tighter uppercase font-outfit">Criar Nova Chave</h3>
                                    <p className="text-white/30 text-[10px] font-medium italic">Dê um nome para identificar sua integração.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 px-1 italic">Nome da Chave</label>
                                    <input
                                        type="text"
                                        placeholder="ex: Produção / Site Principal"
                                        value={newKeyName}
                                        onChange={e => setNewKeyName(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                                <button type="submit" disabled={loading} className="btn-primary w-full shadow-blue-600/10">
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Criar Chave <ChevronRight className="w-4 h-4" /></>}
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-8 text-center animate-in fade-in zoom-in">
                                <div className="space-y-4">
                                    <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg border-white/5 border">
                                        <Check className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-black italic tracking-tighter uppercase font-outfit">Acesso Criado</h3>
                                </div>

                                <div className="relative group">
                                    <div className="w-full bg-black/60 border-2 border-dashed border-blue-500/20 rounded-2xl px-6 py-8 font-mono text-blue-400 break-all text-sm shadow-inner">
                                        {createdKey}
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(createdKey, 'created')}
                                        className="absolute -top-3 -right-3 p-4 glass bg-white text-black hover:bg-blue-600 hover:text-white rounded-xl shadow-2xl transition-all"
                                    >
                                        {copiedId === 'created' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    </button>
                                </div>

                                <button onClick={() => { setIsModalOpen(false); setCreatedKey(null); }} className="btn-secondary w-full">
                                    Entendido
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
