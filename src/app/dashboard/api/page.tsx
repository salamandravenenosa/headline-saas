"use client"

import React, { useState, useEffect } from 'react';
import { Key, Plus, Copy, Trash2, Check, ExternalLink, Activity, Shield } from 'lucide-react';

export default function ApiManagementPage() {
    const [keys, setKeys] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [createdKey, setCreatedKey] = useState<string | null>(null);
    const [usage, setUsage] = useState({ current: 0, limit: 1000 });
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Mock organization ID for demo - in production this comes from session
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
        } catch (e) { console.error(e); }
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
                    current: json.data.credits.consumed,
                    limit: 1000 // In production, get from plan
                });
            }
        } catch (e) { console.error(e); }
    };

    const handleCreateKey = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/v1/auth/api-keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newKeyName, organizationId: orgId })
            });
            const json = await res.json();
            if (json.success) {
                setCreatedKey(json.data.key);
                fetchKeys();
            } else {
                alert(json.error.message);
            }
        } catch (e) { alert('Erro ao criar chave'); }
    };

    const handleRevoke = async (id: string) => {
        if (!confirm('Tem certeza que deseja revogar esta chave? Ela deixará de funcionar imediatamente.')) return;
        try {
            await fetch(`/api/v1/auth/api-keys/${id}`, {
                method: 'DELETE',
                headers: { 'x-organization-id': orgId }
            });
            fetchKeys();
        } catch (e) { console.error(e); }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const usagePercent = Math.min(100, (usage.current / usage.limit) * 100);

    return (
        <div className="max-w-5xl mx-auto space-y-12 py-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black italic tracking-tighter">Gerenciar <span className="text-blue-500">API</span></h1>
                    <p className="text-white/40 font-medium">Controle o acesso programático ao seu copywriting engine QyiCopy.</p>
                </div>
                <button
                    onClick={() => {
                        setCreatedKey(null);
                        setNewKeyName('');
                        setIsModalOpen(true);
                    }}
                    disabled={keys.length >= 3}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20"
                >
                    <Plus className="w-5 h-5" /> Criar nova chave
                </button>
            </header>

            {/* Usage Card */}
            <div className="glass rounded-[32px] p-8 border-white/5 space-y-6">
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                            <Activity className="w-3 h-3" /> Consumo do Período
                        </p>
                        <h2 className="text-3xl font-black">{usage.current} <span className="text-white/20 text-xl">/ {usage.limit}</span></h2>
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-blue-400">Plano Pro</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-1000"
                        style={{ width: `${usagePercent}%` }}
                    />
                </div>
                <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
                    Seu limite será reiniciado em 12 dias.
                </p>
            </div>

            {/* Keys Table */}
            <div className="glass rounded-[40px] overflow-hidden border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/40">Nome</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/40">Chave (Prefixo)</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/40">Criada em</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/40">Último uso</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {keys.map(key => (
                                <tr key={key.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="font-bold text-white mb-0.5">{key.name}</div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Ativa</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <code className="text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-lg text-xs font-mono">{key.prefix}• • • • • •</code>
                                    </td>
                                    <td className="px-8 py-6 text-sm text-white/40">
                                        {new Date(key.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-8 py-6 text-sm text-white/40">
                                        {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Nunca'}
                                    </td>
                                    <td className="px-8 py-6 text-right space-x-2">
                                        <button
                                            onClick={() => handleRevoke(key.id)}
                                            className="p-3 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {keys.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 text-white/10">
                                            <Key className="w-12 h-12" />
                                            <p className="font-black italic uppercase tracking-widest text-sm">Nenhuma chave gerada</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-lg glass rounded-[40px] p-10 space-y-8 relative border-white/10">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-white/20 hover:text-white">✕</button>

                        {!createdKey ? (
                            <form onSubmit={handleCreateKey} className="space-y-6">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black italic tracking-tighter">Criar Nova Chave</h3>
                                    <p className="text-white/40 text-sm">Dê um nome para identificar o uso desta chave.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-1">Nome da Chave</label>
                                    <input
                                        type="text"
                                        placeholder="ex: Landing Page Teste"
                                        value={newKeyName}
                                        onChange={e => setNewKeyName(e.target.value)}
                                        className="w-full"
                                        required
                                    />
                                </div>
                                <div className="flex items-start gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                                    <Shield className="w-10 h-10 text-amber-500" />
                                    <p className="text-xs text-amber-200/60 leading-relaxed italic">
                                        <b>Atenção:</b> Por segurança, a chave completa será exibida apenas uma vez. Salve em um local seguro antes de fechar.
                                    </p>
                                </div>
                                <button type="submit" className="w-full py-4 bg-blue-600 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg">
                                    Gerar Chave Programática
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-8 animate-in fade-in zoom-in duration-300">
                                <div className="text-center space-y-2">
                                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/5">
                                        <Check className="w-10 h-10 text-black" />
                                    </div>
                                    <h3 className="text-2xl font-black italic tracking-tighter">Chave Criada com Sucesso</h3>
                                    <p className="text-white/40 text-sm italic">Copie agora, você não verá este código novamente.</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="relative">
                                        <div className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-8 font-mono text-blue-300 break-all text-sm">
                                            {createdKey}
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(createdKey, 'created')}
                                            className="absolute top-2 right-2 p-3 glass hover:bg-white/10 rounded-xl transition-all"
                                        >
                                            {copiedId === 'created' ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setCreatedKey(null);
                                    }}
                                    className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl font-black uppercase tracking-widest transition-all"
                                >
                                    Concluído
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
