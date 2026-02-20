"use client"

import React, { useState } from 'react';
import { Play, Send, Code, Terminal, Clock, ShieldCheck } from 'lucide-react';

export default function ApiTestPage() {
    const [endpoint, setEndpoint] = useState('/api/v1/headlines/generate');
    const [method, setMethod] = useState('POST');
    const [apiKey, setApiKey] = useState('');
    const [body, setBody] = useState(JSON.stringify({
        niche: "Marketing Digital",
        briefing: "Curso completo de automação com IA",
        style: "black"
    }, null, 2));

    const [response, setResponse] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [duration, setDuration] = useState<number | null>(null);

    const handleSend = async () => {
        setLoading(true);
        const start = performance.now();
        try {
            const res = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'x-organization-id': '00000000-0000-0000-0000-000000000000' // Mock for playground
                },
                body: method === 'POST' ? body : undefined
            });
            const data = await res.json();
            setResponse({
                status: res.status,
                data
            });
        } catch (e: any) {
            setResponse({
                status: 'Error',
                data: { error: e.message }
            });
        }
        setDuration(Math.round(performance.now() - start));
        setLoading(false);
    };

    return (
        <div className="max-w-6xl mx-auto py-8 space-y-10">
            <header className="space-y-1">
                <h1 className="text-4xl font-black italic tracking-tighter">API <span className="text-blue-500">Playground</span></h1>
                <p className="text-white/40 font-medium italic">Teste seus endpoints em tempo real antes da integração.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Request Builder */}
                <div className="glass rounded-[40px] p-8 border-white/5 space-y-8">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-1">Método</label>
                            <select
                                value={method}
                                onChange={e => setMethod(e.target.value)}
                                className="w-full bg-black/40 border-white/5 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 appearance-none"
                            >
                                <option>POST</option>
                                <option>GET</option>
                            </select>
                        </div>
                        <div className="col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-1">Endpoint</label>
                            <select
                                value={endpoint}
                                onChange={e => setEndpoint(e.target.value)}
                                className="w-full bg-black/40 border-white/5 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 appearance-none"
                            >
                                <option value="/api/v1/headlines/generate">/headlines/generate</option>
                                <option value="/api/v1/knowledge-base">/knowledge-base</option>
                                <option value="/api/v1/usage">/usage</option>
                                <option value="/api/v1/analytics/overview">/analytics/overview</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-1">API Key (Bearer Token)</label>
                        <input
                            type="password"
                            placeholder="sk_live_..."
                            value={apiKey}
                            onChange={e => setApiKey(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    {method === 'POST' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-1">Body (JSON)</label>
                            <textarea
                                rows={8}
                                value={body}
                                onChange={e => setBody(e.target.value)}
                                className="w-full font-mono text-sm"
                            />
                        </div>
                    )}

                    <button
                        onClick={handleSend}
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-blue-600/10 flex items-center justify-center gap-3"
                    >
                        {loading ? 'Processando...' : <><Send className="w-5 h-5" /> Enviar Requisição</>}
                    </button>
                </div>

                {/* Response Viewer */}
                <div className="flex flex-col gap-6">
                    <div className="flex-1 glass rounded-[40px] border-white/5 overflow-hidden flex flex-col">
                        <div className="bg-white/5 px-8 py-4 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-blue-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Resultado do Console</span>
                            </div>
                            {response && (
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-2 h-2 rounded-full ${response.status >= 400 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{response.status}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-white/40">
                                        <Clock className="w-3 h-3" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{duration}ms</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 p-8 overflow-auto custom-scrollbar bg-black/20 font-mono text-sm leading-relaxed">
                            {response ? (
                                <pre className="text-blue-200/80">
                                    {JSON.stringify(response.data, null, 2)}
                                </pre>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center gap-4 text-white/10 italic">
                                    <Code className="w-12 h-12" />
                                    <p className="text-sm">Aguardando envio da requisição...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="glass rounded-[32px] p-6 border-blue-500/10 flex items-center gap-6">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Segurança Ativada</p>
                            <p className="text-xs font-medium text-white/60">Seus dados de teste não são persistidos pelo engine durante simulações.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
