import React from 'react';
import { BookOpen, Key, Link, Terminal, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ApiDocsPage() {
    return (
        <div className="max-w-5xl mx-auto py-8 space-y-12">
            <header className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest">
                    <BookOpen className="w-3 h-3" /> API Reference
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter">Documentação <span className="text-blue-500">Técnica</span></h1>
                <p className="text-white/40 font-medium italic">Integre o poder do Headline Engine diretamente no seu fluxo de trabalho.</p>
            </header>

            {/* Base URL Section */}
            <div className="glass rounded-[40px] p-10 border-white/5 space-y-6">
                <h2 className="text-2xl font-black flex items-center gap-3 italic">
                    <Link className="w-6 h-6 text-blue-500" /> Base URL
                </h2>
                <div className="relative group">
                    <div className="bg-black/40 border border-white/10 rounded-2xl px-8 py-6 font-mono text-blue-300">
                        https://headline-engine.vercel.app/api/v1
                    </div>
                </div>
            </div>

            {/* Auth Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass rounded-[40px] p-10 border-white/5 space-y-6">
                    <h2 className="text-2xl font-black flex items-center gap-3 italic">
                        <Key className="w-6 h-6 text-indigo-500" /> Autenticação
                    </h2>
                    <p className="text-white/40 text-sm leading-relaxed italic font-medium">
                        Todas as requisições API devem ser autenticadas enviando sua chave no header <code className="text-indigo-400">Authorization</code>.
                    </p>
                    <div className="bg-white/5 rounded-2xl p-6 space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Header Obrigatório</p>
                        <code className="text-xs text-blue-200 block underline-offset-4 underline decoration-blue-500/30">
                            Authorization: Bearer YOUR_API_KEY
                        </code>
                    </div>
                </div>

                <div className="glass rounded-[40px] p-10 border-amber-500/10 space-y-6">
                    <h2 className="text-2xl font-black flex items-center gap-3 italic text-amber-500">
                        <AlertCircle className="w-6 h-6" /> Rate Limits
                    </h2>
                    <p className="text-white/40 text-sm leading-relaxed italic font-medium">
                        O limite padrão para chaves de produção é de <b>100 requisições por minuto</b>. Ultrapassar este limite resultará em erros 429.
                    </p>
                    <div className="flex gap-4">
                        <div className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black rounded-lg">REST_LIMIT: 100/min</div>
                        <div className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-black rounded-lg">BURST_LIMIT: 10/sec</div>
                    </div>
                </div>
            </div>

            {/* Code Example Section */}
            <div className="glass rounded-[40px] border-white/5 overflow-hidden">
                <div className="bg-white/5 px-10 py-5 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Terminal className="w-5 h-5 text-blue-400" />
                        <span className="text-xs font-black uppercase tracking-widest italic">Exemplo CURL</span>
                    </div>
                </div>
                <div className="p-10 bg-black/20 overflow-auto">
                    <pre className="font-mono text-sm text-blue-200/80 leading-relaxed">
                        {`curl -X POST https://headline-engine.vercel.app/api/v1/headlines/generate \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "niche": "marketing digital",
    "briefing": "como lucrar alto com IA",
    "style": "black"
  }'`}
                    </pre>
                </div>
            </div>

            {/* Success Response Section */}
            <div className="glass rounded-[40px] border-white/5 overflow-hidden">
                <div className="bg-white/5 px-10 py-5 border-b border-white/5 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-xs font-black uppercase tracking-widest italic text-green-500/80">Resposta de Sucesso</span>
                </div>
                <div className="p-10 bg-black/20">
                    <pre className="font-mono text-sm text-green-200/50 leading-relaxed">
                        {`{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "content": "A Nova Estratégia de IA que Está Gerando 10k/mês Revelada",
    "score": 92
  }
}`}
                    </pre>
                </div>
            </div>

            {/* Error Table Section */}
            <div className="space-y-6">
                <h2 className="text-2xl font-black italic tracking-tighter">Tratamento de <span className="text-blue-500">Erros</span></h2>
                <div className="glass rounded-[32px] overflow-hidden">
                    <table className="w-full text-left">
                        <tbody className="divide-y divide-white/5">
                            <tr className="bg-white/5">
                                <td className="px-8 py-5 text-red-400 font-mono text-xs">401</td>
                                <td className="px-8 py-5 text-white/40 text-xs italic">API Key inválida ou ausente.</td>
                            </tr>
                            <tr>
                                <td className="px-8 py-5 text-red-500 font-mono text-xs">429</td>
                                <td className="px-8 py-5 text-white/40 text-xs italic">Limite de requisições ou créditos atingido.</td>
                            </tr>
                            <tr className="bg-white/5">
                                <td className="px-8 py-5 text-red-600 font-mono text-xs">400</td>
                                <td className="px-8 py-5 text-white/40 text-xs italic">Payload JSON mal formatado ou campos faltando.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
