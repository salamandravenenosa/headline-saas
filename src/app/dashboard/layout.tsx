"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Key, PlayCircle, BookOpen, LayoutDashboard, LogOut, ChevronRight } from 'lucide-react';

const navItems = [
    { name: 'Geral', href: '/dashboard', icon: LayoutDashboard },
    { name: 'API Management', href: '/dashboard/api', icon: Key },
    { name: 'API Playground', href: '/dashboard/api/test', icon: PlayCircle },
    { name: 'Documentação', href: '/dashboard/api/docs', icon: BookOpen },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-[#020617] text-white flex">
            {/* Sidebar */}
            <aside className="w-72 border-r border-white/5 bg-black/20 backdrop-blur-xl flex flex-col fixed h-screen">
                <div className="p-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <span className="font-black italic">Q</span>
                        </div>
                        <span className="text-xl font-black italic tracking-tighter uppercase">QyiCopy</span>
                    </div>
                </div>

                <nav className="flex-1 px-6 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center justify-between px-6 py-4 rounded-2xl transition-all group ${isActive ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white/40 group-hover:text-blue-400'}`} />
                                    <span className="text-xs font-black uppercase tracking-widest">{item.name}</span>
                                </div>
                                {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-8 border-t border-white/5">
                    <button className="flex items-center gap-4 w-full px-6 py-4 text-white/20 hover:text-red-500 transition-colors">
                        <LogOut className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">Sair da Conta</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-72 p-12 min-h-screen">
                {children}
            </main>
        </div>
    );
}
