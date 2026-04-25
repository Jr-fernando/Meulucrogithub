import React from "react";
import { motion } from "motion/react";
import { PlayCircle, Clock, BookOpen, ChevronRight, Lock, Video } from "lucide-react";
import { useBusiness } from "../contexts/BusinessContext";

export function ClassesPage() {
  const { openUpgradeModal } = useBusiness();

  const trilhas = [
    { title: "Dominando Vendas de iPhones", modules: 12, hours: "4h 30m", progress: 45, image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=500&auto=format&fit=crop", locked: false },
    { title: "Precificação e Margem Real", modules: 5, hours: "1h 45m", progress: 0, image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=500&auto=format&fit=crop", locked: false },
    { title: "Tráfego Pago para Lojistas", modules: 8, hours: "3h 15m", progress: 0, image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=500&auto=format&fit=crop", locked: true },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="mb-10 text-center max-w-2xl mx-auto pt-8">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">Treinamentos PRO</h1>
        <p className="text-slate-400 text-lg">Acesse nossos conteúdos exclusivos sobre vendas, gestão financeira e tráfego pago para lojistas e revendedores.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trilhas.map((trilha, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-[#111114] border border-[#222226] rounded-3xl overflow-hidden hover:border-[#333336] transition-all group relative">
            {trilha.locked && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                <div className="bg-amber-500/10 p-4 rounded-full mb-3">
                  <Lock className="h-8 w-8 text-amber-500" />
                </div>
                <p className="text-white font-bold">Desbloqueio no Plano Premium</p>
                <button onClick={openUpgradeModal} className="mt-4 bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-2 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all">Fazer Upgrade</button>
              </div>
            )}
            
            <div className="h-40 bg-[#0A0A0C] relative overflow-hidden">
               <img src={trilha.image} alt={trilha.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500" referrerPolicy="no-referrer" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <PlayCircle className="h-12 w-12 text-white/50 group-hover:text-white transition-colors drop-shadow-lg" />
               </div>
            </div>
            <div className="p-6">
              <h3 className="text-white font-bold text-lg mb-4">{trilha.title}</h3>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-400 mb-6">
                <span className="flex items-center gap-1.5 bg-[#222226] px-2.5 py-1 rounded-lg"><BookOpen className="h-4 w-4" /> {trilha.modules} Módulos</span>
                <span className="flex items-center gap-1.5 bg-[#222226] px-2.5 py-1 rounded-lg"><Clock className="h-4 w-4" /> {trilha.hours}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className={trilha.progress > 0 ? "text-[var(--color-primary)]" : "text-slate-500"}>Progresso</span>
                  <span className="text-white">{trilha.progress}%</span>
                </div>
                <div className="h-2 w-full bg-[#222226] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-500" style={{ width: `${trilha.progress}%` }} />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
