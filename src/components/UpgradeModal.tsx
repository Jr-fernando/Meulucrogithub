import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Crown, CheckCircle2, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '../contexts/BusinessContext';
import { cn } from '../lib/utils';

export function UpgradeModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const navigate = useNavigate();
  const { upgradeModalContext } = useBusiness();

  if (!isOpen) return null;

  const plan = upgradeModalContext?.requiredPlan || 'Premium';
  const feature = upgradeModalContext?.featureName || 'Recurso Exclusivo';
  
  const isVip = plan === 'VIP';
  const isPremium = plan === 'Premium';
  const isPro = plan === 'Pro';
  
  const primaryColor = isVip ? 'amber-500' : isPremium ? 'rose-500' : 'blue-500';
  const gradientFrom = isVip ? 'from-amber-500' : isPremium ? 'from-rose-500' : 'from-blue-500';
  const gradientTo = isVip ? 'to-orange-500' : isPremium ? 'to-pink-500' : 'to-cyan-500';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md" 
          onClick={onClose} 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#0A0A0B] border border-[#222226] rounded-3xl w-full max-w-lg overflow-hidden relative z-10 shadow-2xl"
        >
          {/* Header */}
          <div className={cn("bg-gradient-to-br to-transparent p-8 relative overflow-hidden", isVip ? "from-amber-500/20" : isPremium ? "from-rose-500/20" : "from-blue-500/20")}>
             <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
               <Crown className={cn("w-48 h-48 blur-2xl translate-x-10 -translate-y-10", isVip ? "text-amber-500" : isPremium ? "text-rose-500" : "text-blue-500")} />
             </div>
             <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white bg-[#111114] p-2 rounded-xl border border-[#222226] transition-colors relative z-10 active:scale-95">
               <X className="h-5 w-5" />
             </button>
             
             <div className="relative z-10">
               <div className={cn("w-14 h-14 flex items-center justify-center rounded-2xl mb-5 shadow-lg border", 
                  isVip ? "bg-amber-500/20 text-amber-500 border-amber-500/30" : isPremium ? "bg-rose-500/20 text-rose-500 border-rose-500/30" : "bg-blue-500/20 text-blue-500 border-blue-500/30")}>
                 <Lock className="h-7 w-7" />
               </div>
               
               <div className="flex items-center gap-2 mb-2">
                  <span className={cn("text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded-md",
                    isVip ? "bg-amber-500/10 text-amber-500" : isPremium ? "bg-rose-500/10 text-rose-500" : "bg-blue-500/10 text-blue-500")}>
                    Exclusivo {plan}
                  </span>
               </div>

               <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
                 Você está a um passo<br/> de desbloquear <span className={cn(isVip ? "text-amber-500" : isPremium ? "text-rose-500" : "text-blue-500")}>{feature}</span>.
               </h2>
               <p className="text-slate-400 mt-3 font-medium">Este é um recurso avançado projetado para escalar o seu negócio e acelerar os seus lucros diários.</p>
             </div>
          </div>

          <div className="p-8">
             <div className="bg-[#111114] rounded-2xl border border-[#222226] p-4 mb-8">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">O que mais você ganha:</h3>
               <ul className="space-y-3">
                  {isVip ? [
                    "Consultas IMEI Ilimitadas",
                    "Marketplace B2B Integral",
                    "Todas as aulas e treinamentos",
                    "Acesso Elite (Lojas Ilimitadas)",
                    "Suporte Prioritário VIP"
                  ].map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300 font-medium text-sm">
                       <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" /> {feat}
                    </li>
                  )) : isPremium ? [
                    "Gestão de Múltiplas Lojas (Até 10)",
                    "Adição de membros da equipe",
                    "Relatórios e Fechamentos Premium",
                    "Insights com Inteligência Artificial",
                    "Automações"
                  ].map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300 font-medium text-sm">
                       <Sparkles className="h-4 w-4 text-rose-500 shrink-0" /> {feat}
                    </li>
                  )) : [
                    "Relatórios e Metas de Lucro",
                    "Até 3 comércios independentes",
                    "Painel Financeiro Completo",
                    "Comunidade PRO",
                    "Estoque Ilimitado"
                  ].map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300 font-medium text-sm">
                       <Sparkles className="h-4 w-4 text-blue-500 shrink-0" /> {feat}
                    </li>
                  ))}
               </ul>
             </div>

             <div className="flex gap-3">
               <button onClick={onClose} className="flex-1 bg-[#1A1A1E] border border-[#2A2A2E] hover:bg-[#222226] text-slate-300 py-3.5 rounded-2xl font-bold transition-colors text-sm">
                  Continuar sem {feature.split(" ")[0]}
               </button>
               <button onClick={() => { onClose(); navigate('/plans'); }} className={cn(
                 "flex-[1.5] py-3.5 rounded-2xl font-black transition-all flex items-center justify-center gap-2 text-white shadow-xl hover:-translate-y-0.5",
                 `bg-gradient-to-r ${gradientFrom} ${gradientTo}`
               )}>
                  Ver Planos <ArrowRight className="h-4 w-4" />
               </button>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
