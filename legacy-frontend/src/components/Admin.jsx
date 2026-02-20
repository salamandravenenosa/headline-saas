import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, LayoutDashboard, Search, Eye, History, Trash2, Shield, Calendar, Mail, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Admin = ({ onLogout }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [userStats, setUserStats] = useState({ headlines: [] });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('QuiziCopy_profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) setUsers(data);
        setLoading(false);
    };

    const fetchUserDetails = async (user) => {
        setSelectedUser(user);
        const { data: headlines } = await supabase
            .from('QuiziCopy_headlines')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        setUserStats({ headlines: headlines || [] });
    };

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#020617] text-white p-6 lg:p-12">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-[10px] font-black uppercase tracking-widest">
                            <Shield className="w-3 h-3" /> Painel de Controle Master
                        </div>
                        <h1 className="text-4xl font-black tracking-tight">Admin <span className="text-red-500">QuiziCopy</span></h1>
                        <p className="text-white/40 text-sm font-medium">Gerencie usuários, veja faturamento e monitore atividades.</p>
                    </div>
                    <button
                        onClick={onLogout}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-xs font-bold uppercase tracking-widest transition-all"
                    >
                        Sair do Admin
                    </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <AdminStatCard label="Total de Usuários" value={users.length} icon={<Users />} color="red" />
                    <AdminStatCard label="Receita Estimada" value={`R$ ${(users.length * 97).toLocaleString()}`} icon={<Shield />} color="green" />
                    <AdminStatCard label="Headlines Hoje" value="--" icon={<LayoutDashboard />} color="blue" />
                    <AdminStatCard label="Taxa de Confirmação" value="100%" icon={<Calendar />} color="indigo" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* User List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-4 p-4 glass rounded-3xl">
                            <Search className="w-5 h-5 text-white/20" />
                            <input
                                type="text"
                                placeholder="Buscar por email ou nome..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 w-full !p-0 shadow-none !bg-transparent"
                            />
                        </div>

                        <div className="glass rounded-[40px] overflow-hidden border-white/5">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/5 border-b border-white/5">
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/40">Usuário</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/40">Cargo</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/40">Status</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredUsers.map(user => (
                                            <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="font-bold text-white mb-0.5">{user.full_name}</div>
                                                    <div className="text-xs text-white/40 flex items-center gap-2">
                                                        <Mail className="w-3 h-3" /> {user.email}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase ${user.is_admin ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                        {user.is_admin ? 'Administrador' : 'Membro'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-black rounded-full uppercase">Ativo</span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button
                                                        onClick={() => fetchUserDetails(user)}
                                                        className="p-3 glass hover:bg-white/10 rounded-xl transition-all"
                                                        title="Ver Detalhes"
                                                    >
                                                        <Eye className="w-4 h-4 text-white/40 group-hover:text-white" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Details/Stats */}
                    <div className="space-y-8">
                        <AnimatePresence mode="wait">
                            {selectedUser ? (
                                <motion.div
                                    key={selectedUser.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="glass rounded-[40px] p-8 space-y-8 border-red-500/10"
                                >
                                    <div className="space-y-4">
                                        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
                                            <Shield className="w-8 h-8 text-red-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black">{selectedUser.full_name}</h3>
                                            <p className="text-white/40 text-sm italic">"{selectedUser.email}"</p>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-white/5 space-y-6">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                            <History className="w-4 h-4" /> Atividade de Headlines ({userStats.headlines.length})
                                        </h4>
                                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                            {userStats.headlines.map(h => (
                                                <div key={h.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2">
                                                    <p className="text-xs font-bold line-clamp-2 italic">"{h.content}"</p>
                                                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest opacity-30">
                                                        <span>{h.niche}</span>
                                                        <span>{new Date(h.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {userStats.headlines.length === 0 && (
                                                <p className="text-center py-8 text-white/10 text-xs uppercase font-black italic">Sem atividades registradas</p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="glass rounded-[40px] p-12 text-center text-white/10 flex flex-col items-center gap-6 border-dashed border-2">
                                    <Users className="w-16 h-16 opacity-10" />
                                    <p className="font-black italic text-sm uppercase tracking-widest">Selecione um usuário para auditar</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminStatCard = ({ label, value, icon, color }) => {
    const colors = {
        red: 'bg-red-500/10 text-red-400 border-red-500/20',
        green: 'bg-green-500/10 text-green-400 border-green-500/20',
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    };
    return (
        <div className={`glass p-8 rounded-[32px] border flex items-center gap-6 ${colors[color]}`}>
            <div className="p-4 bg-white/10 rounded-2xl">{icon}</div>
            <div>
                <p className="text-[10px] uppercase font-black tracking-widest opacity-60">{label}</p>
                <p className="text-3xl font-black tracking-tight">{value}</p>
            </div>
        </div>
    );
};

export default Admin;
