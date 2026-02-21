import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/shared/context/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

export const metadata: Metadata = {
    title: "QyiCopy | Inteligência Artificial em Copywriting",
    description: "A plataforma definitiva de IA para geração de headlines e copy de alta conversão. Escalabilidade via API e testes A/B integrados.",
};

import { Toaster } from 'react-hot-toast';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" className="scroll-smooth">
            <body className={`${inter.variable} ${outfit.variable} font-sans bg-[#020617] text-white antialiased`}>
                <AuthProvider>
                    {children}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            style: {
                                background: '#0f172a',
                                color: '#fff',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '16px',
                                fontSize: '12px',
                                fontFamily: 'var(--font-outfit)',
                            },
                        }}
                    />
                </AuthProvider>
            </body>
        </html>
    );
}
