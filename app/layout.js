import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import Sidebar from "@/components/Sidebar/page";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Sistema de Controle P4 - 17º BPM",
  description: "Gerenciamento de Munições",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-screen w-screen bg-slate-950 text-slate-100 flex p-4 gap-4 overflow-hidden box-border">
        
        {/* SIDEBAR FIXA COMPARTILHADA POR TODAS AS PÁGINAS */}
        <div className="w-80 h-full shrink-0 hidden md:block">
          <Sidebar />
        </div>

        {/* ÁREA DE CONTEÚDO DINÂMICO (ONDE RENDERIZA O PAGE.JS) */}
        <main className="flex-1 h-full bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col overflow-hidden">
          {children}
        </main>
        
        <Toaster theme="dark" position="top-right" richColors closeButton />
      </body>
    </html>
  );
}