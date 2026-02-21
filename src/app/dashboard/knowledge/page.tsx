"use client"

import React, { useState, useEffect } from 'react';
import {
    Database as DbIcon, Plus as PlusIcon, Trash2 as TrashIcon, Search as SearchIcon,
    BookOpen as BookIcon, AlertCircle as AlertIcon, Loader2 as LoaderIcon,
    CheckCircle2 as CheckIcon, FileText as FileIcon, Info as InfoIcon,
    X as XIcon, ChevronRight as RightIcon, Sparkles, BrainCircuit, Plus, Trash2, Search, BookOpen, AlertCircle, Loader2, CheckCircle2, FileText, Info, X, ChevronRight
} from 'lucide-react';

export default function KnowledgeBasePage() {
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const orgId = "00000000-0000-0000-0000-000000000000";

    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        try {
            const res = await fetch('/api/v1/knowledge-base', {
                headers: { 'x-organization-id': orgId }
            });
            const json = await res.json();
            if (json.success) setEntries(json.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleAddEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        setSaving(true);
        setError(null);
        try {
            const res = await fetch('/api/v1/knowledge-base', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-organization-id': orgId },
                body: JSON.stringify({ content })
            });
            const json = await res.json();
            if (json.success) {
                setContent('');
                fetchEntries();
            } else { throw new Error(json.error); }
        } catch (err: any) { setError(err.message); }
        finally { setSaving(false); }
    };

    const filteredEntries = entries.filter(e =>
        e.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-5xl mx-auto space-y-10 py-2">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase font-outfit">Base de <span className="text-blue-500">Conhecimento</span></h1>
                    <p className="text-white/30 font-medium italic text-sm max-w-lg">Ensine a IA sobre os detalhes do seu produto, seu público e seus diferenciais para gerar cópias mais precisas e personalizadas.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Input Section */}
                <div className="lg:col-span-5">
                    <form onSubmit={handleAddEntry} className="glass rounded-[32px] p-8 border-white/[0.05] space-y-6 sticky top-28 shadow-xl relative overflow-hidden group">
                        <div className="space-y-6 relative z-10">
                            <div className="flex items-center gap-2 px-1">
                                <Sparkles className="w-4 h-4 text-blue-500" />
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">
                                    Adicionar Contexto
                                </h3>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-1 italic">Dados do Produto ou Público</label>
                                <textarea
                                    rows={8}
                                    placeholder="Ex: Meu produto resolve a dor X através do mecanismo Y e é focado em pessoas do tipo Z..."
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    className="leading-relaxed italic text-xs"
                                    required
                                />
                                <p className="text-[9px] text-white/10 px-1 italic leading-relaxed">Quanto mais detalhes você adicionar, melhor a IA vai entender a "voz" do seu negócio.</p>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/10 rounded-xl text-red-400 text-[10px] italic font-bold">
                                <AlertIcon className="w-4 h-4" />
                                <p>{error}</p>
                            </div>
                        )}

                        <button type="submit" disabled={saving} className="btn-primary w-full shadow-blue-600/10">
                            {saving ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <>Treinar Motor IA <RightIcon className="w-4 h-4" /></>}
                        </button>
                    </form>
                </div>

                {/* List Section */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="glass rounded-[32px] border-white/[0.05] overflow-hidden shadow-xl bg-black/10">
                        <div className="bg-white/[0.02] px-8 py-5 border-b border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <FileIcon className="w-4 h-4 text-blue-500" />
                                <span className="text-lg font-black italic tracking-tighter uppercase font-outfit">Sua Biblioteca</span>
                            </div>
                            <div className="relative w-full sm:w-auto">
                                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/10" />
                                <input
                                    type="text"
                                    placeholder="Procurar..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="!bg-black/60 !border-white/5 !rounded-lg !py-2 !pl-10 !pr-4 !text-[10px] !font-black !uppercase !tracking-widest sm:w-48 h-10"
                                />
                            </div>
                        </div>

                        <div className="divide-y divide-white/[0.05]">
                            {loading ? (
                                <div className="p-20 flex flex-col items-center gap-4 text-white/10 italic">
                                    <LoaderIcon className="w-10 h-10 animate-spin" />
                                    <p className="text-[9px] font-black uppercase tracking-widest">Sincronizando Biblioteca...</p>
                                </div>
                            ) : filteredEntries.length > 0 ? (
                                filteredEntries.map((entry) => (
                                    <div key={entry.id} className="group p-8 flex gap-6 hover:bg-white/[0.01] transition-all relative border-l-2 border-l-transparent hover:border-l-blue-500/40">
                                        <div className="w-10 h-10 bg-white/5 rounded-xl flex-shrink-0 flex items-center justify-center group-hover:bg-blue-600/10 transition-all">
                                            <BookIcon className="w-5 h-5 text-white/10 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                        <div className="space-y-4 flex-1 pr-10">
                                            <p className="text-sm leading-relaxed text-white/50 font-medium italic">
                                                {entry.content}
                                            </p>
                                            <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest italic opacity-40">
                                                <div className="flex items-center gap-1.5"><div className="w-1 h-1 bg-blue-500 rounded-full"></div> ID: {entry.id.slice(0, 8)}</div>
                                                <div className="flex items-center gap-1.5 text-green-500/60"><CheckIcon className="w-3.5 h-3.5" /> Alimentando IA</div>
                                            </div>
                                        </div>
                                        <button className="absolute top-8 right-8 p-3 opacity-0 group-hover:opacity-100 text-white/10 hover:text-red-500 transition-all">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="p-20 flex flex-col items-center gap-6 text-white/10 italic text-center opacity-40 grayscale">
                                    <DbIcon className="w-10 h-10" />
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-black italic uppercase font-outfit">Biblioteca Vazia</h3>
                                        <p className="text-[10px] font-medium italic">Sua IA ainda não tem um braintrust personalizado. Comece a adicionar dados ao lado.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
