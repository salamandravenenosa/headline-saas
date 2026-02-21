"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Key, PlayCircle, BookOpen, LayoutDashboard, LogOut, ChevronRight, PenTool, Database, User, Zap, Shield } from 'lucide-react';
import { useAuth } from '@/shared/context/AuthContext';
import { isAdmin } from '@/shared/lib/admin';

const navItems = [
    { name: 'Geral', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Gerar Headlines', href: '/dashboard/headlines', icon: PenTool },
    { name: 'Base de Conhecimento', href: '/dashboard/knowledge', icon: Database },
    { name: 'API Management', href: '/dashboard/api', icon: Key },
    { name: 'API Playground', href: '/dashboard/api/test', icon: PlayCircle },
    { name: 'Documentação', href: '/dashboard/api/docs', icon: BookOpen },
    { name: 'Minha Conta', href: '/dashboard/account', icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { signOut, user } = useAuth();

    const userIsAdmin = isAdmin(user?.email);

    // Filter nav items or add admin link
    const sidebarItems = [...navItems];
    if (userIsAdmin) {
        sidebarItems.push({ name: 'Admin Central', href: '/dashboard/admin', icon: Shield });
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/[0.05] bg-[#020617]/80 backdrop-blur-xl flex flex-col fixed h-screen z-50">
                <div className="p-8">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Zap className="w-4 h-4 fill-white text-white" />
                        </div>
                        <span className="text-lg font-black italic tracking-tighter uppercase font-outfit">QyiCopy</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all group ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white/30 group-hover:text-blue-400'}`} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest italic">{item.name}</span>
                                </div>
                                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-40" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-white/[0.05]">
                    <button
                        onClick={() => signOut()}
                        className="flex items-center gap-3 w-full px-4 py-3 text-white/20 hover:text-red-500 transition-colors group"
                    >
                        <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-widest italic">Encerrar Sessão</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 min-h-screen">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
