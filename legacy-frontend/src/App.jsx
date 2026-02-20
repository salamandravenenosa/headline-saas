import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { generateHeadline } from './lib/groq';
import VibeButton from './components/VibeButton';
import Auth from './components/Auth';
import Account from './components/Account';
import Admin from './components/Admin';
import { Sparkles, Book, History, Plus, Trash2, Copy, Check, LogOut, Zap, Shield, HelpCircle, User, LayoutDashboard, Settings, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
    const [session, setSession] = useState(null);
    const [niche, setNiche] = useState('');
    const [briefing, setBriefing] = useState('');
    const [style, setStyle] = useState('white');
    const [headline, setHeadline] = useState('');
    const [loading, setLoading] = useState(false);
    const [knowledgeBase, setKnowledgeBase] = useState([]);
    const [history, setHistory] = useState([]);
    const [newPhrase, setNewPhrase] = useState('');
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('generator');
    const [showAuth, setShowAuth] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminLogin, setAdminLogin] = useState({ username: '', password: '' });
    const [knowledgeLoading, setKnowledgeLoading] = useState(false);
    const [isInternalAdminRoute, setIsInternalAdminRoute] = useState(window.location.pathname === '/admin');

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) setShowAuth(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                setShowAuth(false);
                setIsAdmin(false);
            }
            else {
                setShowAuth(false);
                setIsAdmin(false);
            }
        });

        // Listen for browser navigation (popstate)
        const handleLocationChange = () => {
            setIsInternalAdminRoute(window.location.pathname === '/admin');
        };
        window.addEventListener('popstate', handleLocationChange);

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('popstate', handleLocationChange);
        };
    }, []);

    useEffect(() => {
        if (session) {
            fetchKnowledgeBase();
            fetchHistory();
        }
    }, [session]);

    const fetchKnowledgeBase = async () => {
        const { data } = await supabase
            .from('QuiziCopy_knowledge_base')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setKnowledgeBase(data);
    };

    const fetchHistory = async () => {
        const { data } = await supabase
            .from('QuiziCopy_headlines')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
        if (data) setHistory(data);
    };

    const handleGenerate = async () => {
        if (!session) {
            setShowAuth(true);
            return;
        }
        if (!niche) {
            alert('Por favor, informe o nicho.');
            return;
        }
        if (!briefing) {
            alert('Por favor, descreva sua oferta no briefing.');
            return;
        }

        setLoading(true);
        try {
            const result = await generateHeadline(niche, briefing, knowledgeBase, style);
            setHeadline(result);

            await supabase.from('QuiziCopy_headlines').insert([
                {
                    content: result,
                    niche,
                    briefing,
                    style,
                    user_id: session.user.id
                }
            ]);

            fetchHistory();
        } catch (error) {
            console.error(error);
            alert('Erro ao gerar headline. Verifique sua chave da API.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPhrase = async () => {
        if (!newPhrase) return;

        if (session.user.id === 'admin') {
            alert('A conta de demonstração não permite salvar no banco de dados. Use sua conta real.');
            return;
        }

        setKnowledgeLoading(true);
        try {
            const { error } = await supabase
                .from('QuiziCopy_knowledge_base')
                .insert([{
                    content: newPhrase,
                    user_id: session.user.id
                }]);

            if (error) throw error;

            setNewPhrase('');
            await fetchKnowledgeBase();
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar frase. Tente novamente.');
        } finally {
            setKnowledgeLoading(false);
        }
    };

    const handleDeletePhrase = async (id) => {
        if (session.user.id === 'admin') {
            alert('A conta de demonstração não permite deletar do banco de dados.');
            return;
        }

        try {
            const { error } = await supabase.from('QuiziCopy_knowledge_base').delete().eq('id', id);
            if (error) throw error;
            fetchKnowledgeBase();
        } catch (error) {
            console.error(error);
            alert('Erro ao deletar frase.');
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsAdmin(false);
        setActiveTab('generator');
        if (window.location.pathname === '/admin') {
            window.history.pushState({}, '', '/');
            setIsInternalAdminRoute(false);
        }
    };

    const handleAdminLogin = (e) => {
        e.preventDefault();
        if (adminLogin.username === 'davidias' && adminLogin.password === '@1Pontesdavi') {
            setIsAdmin(true);
            setSession({ user: { id: 'admin', email: 'admin@quizicopy.pro' } }); // Mock session for layout
        } else {
            alert('Acesso negado.');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!session && showAuth) {
        return <Auth />;
    }

    if (isAdmin) {
        return <Admin onLogout={handleLogout} />;
    }

    if (isInternalAdminRoute && !isAdmin) {
        return (
            <div className="min-h-screen z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-[#020617]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md glass rounded-[40px] p-10 space-y-8 relative border-red-500/20"
                >
                    <button
                        onClick={() => {
                            window.history.pushState({}, '', '/');
                            setIsInternalAdminRoute(false);
                        }}
                        className="absolute top-6 right-6 text-white/20 hover:text-white"
                    >
                        ✕
                    </button>
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-red-600/20">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter">David's Sanctum</h2>
                    </div>
                    <form onSubmit={handleAdminLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Login</label>
                            <input
                                type="text"
                                value={adminLogin.username}
                                onChange={(e) => setAdminLogin({ ...adminLogin, username: e.target.value })}
                                className="w-full"
                                placeholder="Admin User"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Senha</label>
                            <input
                                type="password"
                                value={adminLogin.password}
                                onChange={(e) => setAdminLogin({ ...adminLogin, password: e.target.value })}
                                className="w-full"
                                placeholder="••••••••"
                            />
                        </div>
                        <VibeButton type="submit" className="w-full !bg-red-600 shadow-red-600/20">Avançar para o Cérebro</VibeButton>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white font-sans selection:bg-blue-500/30">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
            </div>

            <nav className="relative z-10 border-b border-white/5 backdrop-blur-md bg-black/20">
                <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab('generator')}>
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 transform rotate-3">
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black italic tracking-tighter text-white">QuiziCopy</h1>
                            <p className="text-[10px] uppercase font-bold text-blue-400 tracking-widest leading-none">VibeCoder Edition</p>
                        </div>
                    </div>

                    {session && (
                        <div className="flex bg-white/5 p-1 rounded-xl sm:rounded-2xl border border-white/5 mx-2 sm:mx-0">
                            <NavTab active={activeTab === 'generator'} onClick={() => setActiveTab('generator')} icon={<LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />} label="Gerador" hideLabelOnMobile />
                            <NavTab active={activeTab === 'knowledge'} onClick={() => setActiveTab('knowledge')} icon={<Book className="w-3.5 h-3.5 sm:w-4 sm:h-4" />} label="Cérebro" hideLabelOnMobile />
                            <NavTab active={activeTab === 'account'} onClick={() => setActiveTab('account')} icon={<Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />} label="Config" hideLabelOnMobile />
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        {!session ? (
                            <VibeButton onClick={() => setShowAuth(true)} className="!w-auto !px-8 !py-4 !text-sm">
                                Entrar na Plataforma
                            </VibeButton>
                        ) : (
                            <div className="flex items-center gap-4 pl-4 border-l border-white/5">
                                <button
                                    onClick={() => setActiveTab('account')}
                                    className={`w-12 h-12 glass rounded-xl flex items-center justify-center transition-all ${activeTab === 'account' ? 'border-blue-500/50 bg-blue-500/10' : 'hover:border-white/20'}`}
                                >
                                    <User className="w-5 h-5 text-white/50" />
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/20 transition-all group"
                                    title="Sair"
                                >
                                    <LogOut className="w-5 h-5 text-red-500/50 group-hover:text-red-500" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                <AnimatePresence mode="wait">
                    {activeTab === 'generator' && (
                        <motion.div
                            key="generator"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
                        >
                            {/* Left Side: Inputs */}
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest">
                                        <Zap className="w-3 h-3 fill-current" /> High Conversion DNA
                                    </div>
                                    <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-[0.9]">Crie Headlines <span className="text-blue-500">Imbatíveis</span></h2>
                                    <p className="text-white/40 text-lg sm:text-xl font-medium max-w-md">Transforme o briefing do seu produto em uma copy que para o scroll e gera lucro.</p>
                                </div>

                                <div className="space-y-8">
                                    {/* Style Toggle */}
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-white/40 uppercase tracking-widest flex items-center gap-2 px-1">
                                            <Shield className="w-4 h-4" /> Intensidade da Headline
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <StyleBtn
                                                active={style === 'white'}
                                                onClick={() => setStyle('white')}
                                                icon={<Shield className="w-5 h-5" />}
                                                title="White Copy"
                                                sub="Curiosidade Suave"
                                                color="blue"
                                            />
                                            <StyleBtn
                                                active={style === 'black'}
                                                onClick={() => setStyle('black')}
                                                icon={<Zap className="w-5 h-5" />}
                                                title="Black Copy"
                                                sub="Agressiva & Direct"
                                                color="red"
                                                badge="HOT"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-white/40 uppercase tracking-widest px-1">Nicho do Mercado</label>
                                        <input
                                            type="text"
                                            value={niche}
                                            onChange={(e) => setNiche(e.target.value)}
                                            placeholder="Ex: Emagrecimento, Finanças Profissional..."
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-white/40 uppercase tracking-widest px-1">Briefing da Oferta</label>
                                        <textarea
                                            rows="5"
                                            value={briefing}
                                            onChange={(e) => setBriefing(e.target.value)}
                                            placeholder="Fale tudo sobre o produto. Cite influencer/famosa, exemplo: Virginia, Canetas, Injeções, Planilhas ou qualquer mecanismo único que você tenha."
                                            className="w-full"
                                        />
                                    </div>

                                    <VibeButton onClick={handleGenerate} loading={loading} className="w-full !py-6">
                                        {session ? 'Garantir Headline Agora' : 'Acessar para Gerar'}
                                    </VibeButton>
                                </div>

                                {session && history.length > 0 && (
                                    <div className="pt-10 border-t border-white/5 space-y-6">
                                        <div className="flex items-center gap-2 text-white/20">
                                            <History className="w-4 h-4" />
                                            <span className="text-xs font-black uppercase tracking-widest">Seu Laboratório de Copy</span>
                                        </div>
                                        <div className="space-y-3">
                                            {history.map((item) => (
                                                <div key={item.id} className="group flex items-center justify-between p-5 glass rounded-2xl hover:border-white/20 transition-all">
                                                    <div className="flex-1 overflow-hidden mr-4">
                                                        <p className="text-sm font-bold text-white/80 line-clamp-1">{item.content}</p>
                                                        <div className="flex gap-2 mt-2">
                                                            <span className={`text-[8px] uppercase font-black px-2 py-0.5 rounded-full ${item.style === 'black' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                                {item.style}
                                                            </span>
                                                            <span className="text-[8px] text-white/20 uppercase font-bold">{item.niche}</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => copyToClipboard(item.content)}
                                                        className="p-3 glass hover:bg-white/10 rounded-xl transition-all"
                                                    >
                                                        <Copy className="w-4 h-4 text-white/40" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Side: Result Area */}
                            <div className="relative">
                                <div className="sticky top-12 p-8 sm:p-10 lg:p-16 glass rounded-[40px] md:rounded-[60px] min-h-[400px] md:min-h-[600px] flex flex-col items-center justify-center text-center overflow-hidden border-white/5 shadow-2xl">
                                    {/* Visual Background Pattern */}
                                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

                                    <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${style === 'black' ? 'from-transparent via-red-500/50 to-transparent' : 'from-transparent via-blue-500/50 to-transparent'}`}></div>

                                    <AnimatePresence mode="wait">
                                        {headline ? (
                                            <motion.div
                                                key="result"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="space-y-12 relative z-10"
                                            >
                                                <div className="relative inline-block">
                                                    <span className={`absolute -top-16 -left-12 text-[160px] font-serif opacity-5 leading-none ${style === 'black' ? 'text-red-500' : 'text-blue-500'}`}>"</span>
                                                    <h3 className={`text-3xl sm:text-4xl lg:text-6xl font-black leading-tight tracking-tighter ${style === 'black' ? 'italic uppercase underline decoration-red-500/30 underline-offset-8' : ''}`}>
                                                        {headline}
                                                    </h3>
                                                </div>

                                                <div className="flex flex-col items-center gap-8">
                                                    <button
                                                        onClick={() => copyToClipboard(headline)}
                                                        className={`relative group w-24 h-24 flex items-center justify-center rounded-[32px] glass transition-all duration-500 ${copied ? 'border-green-500 bg-green-500/10' : 'hover:border-blue-500 hover:bg-blue-500/10 hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:-translate-y-1'}`}
                                                    >
                                                        <div className={`absolute inset-0 rounded-[32px] transition-opacity duration-500 ${copied ? 'bg-green-500/20 blur-xl opacity-100' : 'bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100'}`}></div>

                                                        <AnimatePresence mode="wait">
                                                            {copied ? (
                                                                <motion.div
                                                                    key="check"
                                                                    initial={{ scale: 0, rotate: -20 }}
                                                                    animate={{ scale: 1, rotate: 0 }}
                                                                    exit={{ scale: 0 }}
                                                                >
                                                                    <Check className="w-10 h-10 text-green-400" />
                                                                </motion.div>
                                                            ) : (
                                                                <motion.div
                                                                    key="copy"
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    exit={{ scale: 0 }}
                                                                    className="relative z-10"
                                                                >
                                                                    <Copy className="w-10 h-10 text-white/40 group-hover:text-white transition-colors" />
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>

                                                        {/* Pulsing rings when copied */}
                                                        {copied && (
                                                            <div className="absolute inset-0 rounded-[32px] border-2 border-green-500 animate-ping opacity-20"></div>
                                                        )}
                                                    </button>
                                                    <p className={`text-xs font-black uppercase tracking-[0.4em] transition-all duration-500 ${copied ? 'text-green-400' : 'text-white/20'}`}>
                                                        {copied ? 'HEADLINE COPIADA!' : 'CLIQUE NO BOTÃO PARA COPIAR'}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <div className="space-y-8 text-white/20 relative z-10">
                                                <div className="w-32 h-32 glass rounded-full flex items-center justify-center mx-auto border-dashed border-2">
                                                    <HelpCircle className="w-16 h-16 opacity-10" />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-2xl font-black italic uppercase tracking-tighter">O Laboratório está pronto</p>
                                                    <p className="text-sm max-w-[280px] mx-auto opacity-50">Sua headline gerada aparecerá aqui com o design de alta conversão.</p>
                                                </div>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'knowledge' && (
                        <motion.div
                            key="knowledge"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-4xl mx-auto space-y-12"
                        >
                            <div className="space-y-4 text-center">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-black uppercase tracking-widest">
                                    <Book className="w-4 h-4" /> Knowledge Base
                                </div>
                                <h2 className="text-5xl font-black tracking-tight">O Cérebro da <span className="text-indigo-500">Copy</span></h2>
                                <p className="text-white/40 text-xl">Alimente a inteligência com suas frases de maior conversão.</p>
                            </div>

                            <div className="glass rounded-[40px] p-10 space-y-10">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <input
                                        type="text"
                                        value={newPhrase}
                                        onChange={(e) => setNewPhrase(e.target.value)}
                                        placeholder="Cole aqui seu hook vencedor ou expressão favorita..."
                                        className="flex-1 bg-black/40 border-white/5"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddPhrase()}
                                    />
                                    <VibeButton onClick={handleAddPhrase} loading={knowledgeLoading} className="!w-auto !min-w-[80px] !px-8">
                                        <Plus className="w-6 h-6" />
                                    </VibeButton>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {knowledgeBase.length > 0 ? (
                                        knowledgeBase.map((item) => (
                                            <div key={item.id} className="group flex items-center justify-between p-6 glass rounded-2xl hover:border-indigo-500/30 transition-all">
                                                <p className="text-white/80 font-bold text-sm italic">"{item.content}"</p>
                                                <button
                                                    onClick={() => handleDeletePhrase(item.id)}
                                                    className="p-3 glass text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-24 text-center text-white/10 flex flex-col items-center gap-6">
                                            <Book className="w-20 h-20 opacity-10" />
                                            <p className="font-black italic text-xl uppercase tracking-widest">Tudo vazio por aqui</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'account' && <Account session={session} />}
                </AnimatePresence>
            </main>

            <footer className="relative z-10 border-t border-white/5 py-16 mt-20 bg-black/60 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-blue-500" />
                            <span className="text-2xl font-black italic tracking-tighter">QuiziCopy PRO</span>
                        </div>
                        <p className="text-white/20 text-xs font-bold uppercase tracking-[0.4em]">A Máquina de Direct Response para Quizzes</p>
                    </div>
                    <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-white/30">
                        <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
                        <a href="#" className="hover:text-white transition-colors">Privacidade</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

const NavTab = ({ active, onClick, icon, label, hideLabelOnMobile }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 sm:gap-2.5 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
    >
        {icon}
        <span className={hideLabelOnMobile ? 'hidden sm:inline' : ''}>{label}</span>
    </button>
);

const StyleBtn = ({ active, onClick, icon, title, sub, color, badge }) => (
    <button
        onClick={onClick}
        className={`group relative flex items-center gap-4 p-5 rounded-[24px] border transition-all text-left ${active ? (color === 'red' ? 'bg-red-500/10 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.15)]' : 'bg-blue-500/10 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.15)]') : 'bg-white/5 border-white/5 opacity-40 hover:opacity-100 hover:border-white/10'}`}
    >
        <div className={`p-3 rounded-xl transition-colors ${active ? (color === 'red' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white') : 'bg-white/10 text-white/40'}`}>
            {icon}
        </div>
        <div className="flex-1">
            <p className="font-black text-sm uppercase italic tracking-tight">{title}</p>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-none mt-1">{sub}</p>
        </div>
        {badge && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-[9px] font-black px-2 py-1 rounded-lg shadow-lg rotate-3 uppercase animate-pulse">
                {badge}
            </div>
        )}
    </button>
);

export default App;
