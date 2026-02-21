"use client"

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { isAdmin } from '@/shared/lib/admin';
import {
    Shield, Users, Activity, Database, Zap, Search,
    MoreHorizontal, CheckCircle2, XCircle, Settings,
    BarChart3, Clock, AlertTriangle, ChevronRight, Loader2,
    Crown, Lock, Unlock, Sliders, PenTool, Key, Trash2,
    RefreshCcw, Eye
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { toast } from 'react-hot-toast';

export default function AdminPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    // States
    const [users, setUsers] = useState<any[]>([]);
    const [selectedTab, setSelectedTab] = useState<'users' | 'database' | 'logs'>('users');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Database states
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [tableData, setTableData] = useState<any[]>([]);
    const [dbLoading, setDbLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAdmin(user?.email)) {
            router.push('/dashboard');
        } else if (!authLoading) {
            fetchUsers();
        }
    }, [user, authLoading]);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/users', {
                headers: { 'x-admin-email': user?.email || '' }
            });
            const json = await res.json();
            if (json.success) {
                setUsers(json.data);
            } else {
                setError(json.error);
                toast.error('Erro ao carregar usuários: ' + json.error);
            }
        } catch (e) {
            setError('Falha ao conectar com a API de Admin');
            toast.error('Falha na conexão com o servidor');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        const confirmToast = toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="font-bold text-xs uppercase italic">Tem certeza? Deletar usuário permanentemente.</p>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            await executeDelete(userId);
                        }}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase italic"
                    >
                        Sim, Deletar
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="bg-white/10 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase italic"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    const executeDelete = async (userId: string) => {
        setActionLoading(userId);
        try {
            const res = await fetch(`/api/admin/users?id=${userId}`, {
                method: 'DELETE',
                headers: { 'x-admin-email': user?.email || '' }
            });
            const json = await res.json();
            if (json.success) {
                setUsers(users.filter(u => u.id !== userId));
                toast.success('Usuário removido com sucesso!');
            } else {
                toast.error('Erro ao deletar: ' + json.error);
            }
        } catch (e) {
            toast.error('Erro de conexão ao deletar');
        } finally {
            setActionLoading(null);
        }
    };

    const handleChangePlan = async (userId: string, planName: string) => {
        setActionLoading(userId);
        const loadingToast = toast.loading(`Alterando plano para ${planName}...`);
        try {
            const res = await fetch('/api/admin/plans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-email': user?.email || ''
                },
                body: JSON.stringify({ userId, planName })
            });
            const json = await res.json();
            if (json.success) {
                toast.success(`Plano ${planName} aplicado com sucesso!`, { id: loadingToast });
                fetchUsers();
            } else {
                toast.error('Erro: ' + json.error, { id: loadingToast });
            }
        } catch (e) {
            toast.error('Erro de conexão', { id: loadingToast });
        } finally {
            setActionLoading(null);
        }
    };

    const handleViewTable = async (tableName: string) => {
        setSelectedTable(tableName);
        setDbLoading(true);
        try {
            const res = await fetch(`/api/admin/db/${tableName}`, {
                headers: { 'x-admin-email': user?.email || '' }
            });
            const json = await res.json();
            if (json.success) {
                setTableData(json.data);
            } else {
                toast.error('Erro ao ler tabela: ' + json.error);
            }
        } catch (e) {
            toast.error('Erro de conexão ao acessar banco de dados');
        } finally {
            setDbLoading(false);
        }
    };

    if (authLoading || !isAdmin(user?.email)) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-10 py-2">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-blue-500">
                        <Shield className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Acesso Restrito</span>
                    </div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase font-outfit">Admin <span className="text-blue-500">Central</span></h1>
                    <p className="text-white/20 text-xs italic font-medium">Gestão total da infraestrutura e usuários do QyiCopy.</p>
                </div>

                <div className="flex bg-white/[0.03] p-1 rounded-2xl border border-white/5">
                    {(['users', 'database', 'logs'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setSelectedTab(tab)}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase italic transition-all ${selectedTab === tab
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'text-white/30 hover:text-white'
                                }`}
                        >
                            {tab === 'users' ? 'Usuários' : tab === 'database' ? 'Banco de Dados' : 'Auditoria'}
                        </button>
                    ))}
                </div>
            </header>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs italic font-bold flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {selectedTab === 'users' && (
                <div className="space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { label: 'Total Usuários', value: users.length, icon: Users, color: 'text-blue-500' },
                            { label: 'Administradores', value: users.filter(u => u.is_admin).length, icon: Shield, color: 'text-orange-500' },
                            { label: 'Sincronização', value: 'Ativa', icon: Activity, color: 'text-green-500' },
                            { label: 'Status Server', value: 'Online', icon: Database, color: 'text-purple-500' },
                        ].map((stat, i) => (
                            <div key={i} className="glass-card p-6 border-white/[0.03] space-y-4 shadow-xl">
                                <div className="flex justify-between items-start">
                                    <div className={`w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center ${stat.color}`}>
                                        <stat.icon className="w-4 h-4" />
                                    </div>
                                    <button onClick={fetchUsers} className="text-white/10 hover:text-white transition-colors">
                                        <RefreshCcw className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20 italic">{stat.label}</p>
                                    <p className="text-2xl font-black font-outfit italic">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Users Table */}
                    <div className="glass rounded-[32px] border-white/[0.05] overflow-hidden shadow-2xl bg-black/20">
                        <div className="bg-white/[0.02] px-8 py-6 border-b border-white/[0.05] flex items-center justify-between">
                            <h3 className="text-sm font-black italic uppercase font-outfit">Diretório Global</h3>
                            <button onClick={fetchUsers} disabled={loading} className="p-2 hover:bg-white/5 rounded-lg transition-all">
                                <RefreshCcw className={`w-4 h-4 text-white/20 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white/[0.01]">
                                    <tr>
                                        <th className="px-8 py-4 text-[9px] font-black uppercase text-white/20 italic tracking-widest">Identidade</th>
                                        <th className="px-8 py-4 text-[9px] font-black uppercase text-white/20 italic tracking-widest text-center">Admin</th>
                                        <th className="px-8 py-4 text-[9px] font-black uppercase text-white/20 italic tracking-widest text-right">Ações Rápidas</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.02]">
                                    {users.map((u: any) => {
                                        const isCurrentUser = u.email === user?.email;
                                        const isMainAdmin = u.email === 'davikko18dias@gmail.com';
                                        const currentPlan = u.plan_name || 'Free';
                                        const isProOrAbove = currentPlan.toLowerCase() === 'pro' || currentPlan.toLowerCase() === 'enterprise';

                                        return (
                                            <tr key={u.id} className={`hover:bg-white/[0.02] transition-colors group ${isCurrentUser ? 'bg-blue-500/[0.03]' : ''}`}>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-blue-600/10 text-blue-500'} rounded-full flex items-center justify-center text-xs font-black italic font-outfit shadow-lg shadow-blue-500/10`}>
                                                            {(u.full_name?.[0] || u.email[0]).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black italic uppercase font-outfit text-white/90 flex items-center gap-2">
                                                                {u.full_name || 'Usuário Sem Nome'}
                                                                {isCurrentUser && <span className="bg-blue-500/10 text-blue-500 text-[8px] px-1.5 py-0.5 rounded-md">VOCÊ</span>}
                                                            </p>
                                                            <p className="text-[10px] text-white/20 font-medium italic">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        {u.is_admin || isMainAdmin ? (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-[9px] font-black uppercase italic">
                                                                <Shield className="w-3 h-3" /> Admin
                                                            </span>
                                                        ) : (
                                                            <span className="text-[9px] font-black uppercase text-white/10 italic">Colaborador</span>
                                                        )}
                                                        <span className={`text-[8px] font-black uppercase italic ${isProOrAbove ? 'text-orange-500' : 'text-white/20'}`}>
                                                            {isMainAdmin ? 'Acesso Enterprise / Ilimitado' : `Plano: ${currentPlan}`}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {!isMainAdmin && (
                                                            <button
                                                                onClick={() => handleChangePlan(u.id, isProOrAbove ? 'Free' : 'Pro')}
                                                                disabled={actionLoading === u.id}
                                                                className={`p-2 rounded-lg transition-all ${isProOrAbove ? 'hover:bg-white/10 text-orange-500' : 'hover:bg-orange-500/10 text-white/10 hover:text-orange-500'}`}
                                                                title={isProOrAbove ? "Remover Plano PRO" : "Conceder Plano PRO"}
                                                            >
                                                                {actionLoading === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteUser(u.id)}
                                                            disabled={actionLoading === u.id || isMainAdmin}
                                                            className={`p-2 rounded-lg transition-all ${isMainAdmin ? 'opacity-20 cursor-not-allowed' : 'hover:bg-red-500/10 text-white/10 hover:text-red-500'}`}
                                                            title={isMainAdmin ? 'Operação Negada no Admin Master' : "Deletar Usuário"}
                                                        >
                                                            {actionLoading === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {users.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan={3} className="px-8 py-20 text-center text-white/20 italic text-sm">Nenhum dado encontrado no silo.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {selectedTab === 'database' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 space-y-4">
                        <div className="glass rounded-[24px] border-white/[0.05] overflow-hidden shadow-xl">
                            <div className="bg-white/[0.02] px-6 py-4 border-b border-white/[0.05]">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">Explorer de Tabelas</p>
                            </div>
                            <div className="p-2 space-y-1">
                                {[
                                    { name: 'QuiziCopy_profiles', icon: Users },
                                    { name: 'QuiziCopy_headlines', icon: PenTool },
                                    { name: 'api_keys', icon: Key },
                                    { name: 'usage_meters', icon: Activity },
                                    { name: 'QuiziCopy_audit_log', icon: Clock },
                                    { name: 'organizations', icon: Shield },
                                    { name: 'subscriptions', icon: Crown },
                                ].map((table) => (
                                    <button
                                        key={table.name}
                                        onClick={() => handleViewTable(table.name)}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-left group ${selectedTable === table.name ? 'bg-blue-600/10 border border-blue-500/20' : 'hover:bg-white/5 border border-transparent'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <table.icon className={`w-4 h-4 ${selectedTable === table.name ? 'text-blue-500' : 'text-white/20 group-hover:text-blue-500'}`} />
                                            <span className={`text-[11px] font-black italic uppercase font-outfit ${selectedTable === table.name ? 'text-white' : 'text-white/60'}`}>{table.name}</span>
                                        </div>
                                        <ChevronRight className={`w-3.5 h-3.5 ${selectedTable === table.name ? 'text-blue-500' : 'text-white/10'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8">
                        <div className="glass rounded-[32px] border-white/[0.05] min-h-[500px] flex flex-col overflow-hidden bg-black/20 shadow-2xl">
                            <div className="bg-white/[0.02] px-8 py-6 border-b border-white/[0.05] flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-black italic uppercase font-outfit">Dados da Tabela: <span className="text-blue-500">{selectedTable || '-'}</span></h3>
                                    <p className="text-[10px] text-white/20 italic">Visualização dos últimos 100 registros.</p>
                                </div>
                                {selectedTable && (
                                    <button onClick={() => handleViewTable(selectedTable)} className="p-2 hover:bg-white/5 rounded-lg transition-all">
                                        <RefreshCcw className={`w-4 h-4 text-white/20 ${dbLoading ? 'animate-spin' : ''}`} />
                                    </button>
                                )}
                            </div>

                            <div className="flex-1 overflow-auto custom-scrollbar">
                                {dbLoading ? (
                                    <div className="h-full flex flex-col items-center justify-center p-20 gap-4">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                        <p className="text-[9px] font-black uppercase tracking-widest italic text-white/20">Acessando registros...</p>
                                    </div>
                                ) : tableData.length > 0 ? (
                                    <div className="p-0">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead className="bg-white/[0.03] border-b border-white/[0.05] sticky top-0 z-10 backdrop-blur-md">
                                                    <tr>
                                                        {Object.keys(tableData[0]).map((key) => (
                                                            <th key={key} className="px-6 py-4 text-[9px] font-black uppercase text-white/30 italic tracking-widest min-w-[150px]">
                                                                {key}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/[0.02]">
                                                    {tableData.map((row, i) => (
                                                        <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                                                            {Object.values(row).map((val: any, j) => (
                                                                <td key={j} className="px-6 py-4 text-[10px] font-medium text-white/60 font-mono truncate max-w-[300px]">
                                                                    {val !== null && typeof val === 'object' ? JSON.stringify(val) : String(val ?? '-')}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center p-20 text-center space-y-4 opacity-20 italic">
                                        <Eye className="w-12 h-12" />
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest tracking-[0.3em]">Nenhum dado selecionado</p>
                                            <p className="text-[9px]">Selecione uma tabela ao lado para inspecionar os registros de forma organizada.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {selectedTab === 'logs' && (
                <div className="space-y-6">
                    <div className="glass rounded-[32px] border-white/[0.05] overflow-hidden bg-black/20 shadow-2xl">
                        <div className="bg-white/[0.02] px-8 py-6 border-b border-white/[0.05] flex items-center justify-between">
                            <h3 className="text-sm font-black italic uppercase font-outfit">Silo de Auditoria</h3>
                            <button onClick={() => handleViewTable('QuiziCopy_audit_log')} className="p-2 hover:bg-white/5 rounded-lg transition-all">
                                <RefreshCcw className="w-4 h-4 text-white/20" />
                            </button>
                        </div>

                        <div className="p-4 overflow-auto max-h-[600px] custom-scrollbar">
                            {selectedTable === 'QuiziCopy_audit_log' ? (
                                <div className="space-y-2">
                                    {(tableData || []).map((log, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-2xl border border-white/[0.03] hover:border-blue-500/20 transition-all">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                            <div className="flex-1">
                                                <p className="text-[11px] font-black italic uppercase text-white/90">{log.action || 'Ação do Sistema'}</p>
                                                <p className="text-[9px] text-white/40 font-medium">Origem: {log.user_id || 'System'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-bold text-white/10 uppercase italic">
                                                    {log.created_at ? new Date(log.created_at).toLocaleString('pt-BR') : 'Data Indefinida'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!tableData || tableData.length === 0) && <p className="text-center py-20 text-white/20 italic text-sm">Nenhum log encontrado no silo.</p>}
                                </div>
                            ) : (
                                <div className="py-32 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                                    <Clock className="w-12 h-12" />
                                    <button
                                        onClick={() => handleViewTable('QuiziCopy_audit_log')}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase italic shadow-lg shadow-blue-600/20"
                                    >
                                        Sincronizar Logs
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
