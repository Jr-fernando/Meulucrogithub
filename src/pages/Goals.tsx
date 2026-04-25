import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { Target, TrendingUp, DollarSign, Package, Plus, CheckCircle2, Flame, Trophy, Crown, Medal, CalendarSync, ShieldCheck, X } from "lucide-react";
import { useBusiness } from "../contexts/BusinessContext";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { cn } from "../lib/utils";

export function GoalsPage() {
  const { currentBusiness, openUpgradeModal } = useBusiness();
  const [sales, setSales] = useState<any[]>([]);
  const [customGoals, setCustomGoals] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [type, setType] = useState("currency");

  useEffect(() => {
    if (!auth.currentUser) return;
    
    // Fetch Sales
    const qSales = query(collection(db, "sales"), where("uid", "==", auth.currentUser.uid));
    const unsubSales = onSnapshot(qSales, (snapshot) => {
      let data: any[] = [];
      snapshot.forEach(docSnap => data.push({ id: docSnap.id, ...docSnap.data() }));
      if (currentBusiness) data = data.filter(s => s.businessId === currentBusiness.id || !s.businessId);
      setSales(data);
    });

    // Fetch Custom Goals
    const qGoals = query(collection(db, "user_goals"), where("uid", "==", auth.currentUser.uid));
    const unsubGoals = onSnapshot(qGoals, (snapshot) => {
      let data: any[] = [];
      snapshot.forEach(docSnap => data.push({ id: docSnap.id, ...docSnap.data() }));
      if (currentBusiness) data = data.filter(g => g.businessId === currentBusiness.id || !g.businessId);
      setCustomGoals(data);
    });

    return () => { unsubSales(); unsubGoals(); };
  }, [currentBusiness?.id]);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, "user_goals"), {
        uid: auth.currentUser.uid,
        businessId: currentBusiness?.id || null,
        title,
        target: Number(target),
        type,
        color: type === 'currency' ? 'var(--color-primary)' : '#3b82f6',
        createdAt: serverTimestamp()
      });
      setIsModalOpen(false);
      setTitle(""); setTarget("");
    } catch (err) {
      console.error(err);
      alert("Erro ao criar meta.");
    }
  };

  const now = new Date();
  const startMonth = startOfMonth(now);
  const endMonth = endOfMonth(now);
  const currentMonthSales = sales.filter(s => s.saleDate?.toDate && isWithinInterval(s.saleDate.toDate(), { start: startMonth, end: endMonth }));
  
  const faturamento = currentMonthSales.reduce((acc, s) => acc + (Number(s.salePrice) || 0), 0);
  const totalSalesCount = currentMonthSales.length;

  let currentStreak = 0;
  let checkDate = new Date();
  checkDate.setHours(0,0,0,0);
  
  const sortedSalesDates = sales
    .sort((a,b) => b.saleDate?.toDate() - a.saleDate?.toDate())
    .map(s => {
      if(!s.saleDate?.toDate) return 0;
      const d = s.saleDate.toDate();
      d.setHours(0,0,0,0);
      return d.getTime();
    }).filter(d => d !== 0);
  
  const uniqueSaleDates = Array.from(new Set(sortedSalesDates));
  
  if (uniqueSaleDates.includes(checkDate.getTime())) {
     currentStreak++;
     checkDate.setDate(checkDate.getDate() - 1);
     while(uniqueSaleDates.includes(checkDate.getTime())) {
       currentStreak++;
       checkDate.setDate(checkDate.getDate() - 1);
     }
  } else {
    checkDate.setDate(checkDate.getDate() - 1);
    if (uniqueSaleDates.includes(checkDate.getTime())) {
       currentStreak++;
       checkDate.setDate(checkDate.getDate() - 1);
       while(uniqueSaleDates.includes(checkDate.getTime())) {
         currentStreak++;
         checkDate.setDate(checkDate.getDate() - 1);
       }
    }
  }

  // Base goals combined with custom goals
  const allGoals = [
    { title: "Faturamento Mensal", current: faturamento, target: 100000, type: "currency", icon: DollarSign, color: "var(--color-primary)" },
    { title: "Aparelhos Vendidos", current: totalSalesCount, target: 50, type: "number", icon: Package, color: "#3b82f6" },
    ...customGoals.map(g => ({
      title: g.title,
      current: g.type === 'currency' ? faturamento : totalSalesCount, // Simplified logic for demo
      target: g.target,
      type: g.type,
      icon: g.type === 'currency' ? TrendingUp : Target,
      color: g.color || '#a855f7'
    }))
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Metas & Gamificação</h1>
          <p className="text-slate-400 font-medium">Bata metas, libere conquistas e suba no ranking nacional de lojistas.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-[var(--color-primary)] text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[var(--color-primary-dark)] transition-colors shadow-[0_0_20px_rgba(0,223,100,0.2)]">
          <Plus className="h-5 w-5" /> Nova Meta Personalizada
        </button>
      </header>

      {/* Gamification Top Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
         <div className="bg-[#111114] border border-[#222226] p-4 rounded-2xl flex items-center gap-4">
            <div className="bg-amber-500/10 p-3 rounded-full shrink-0"><Flame className="h-6 w-6 text-amber-500" /></div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-0.5">Dias Faturando</p>
              <p className="text-xl font-black text-white">{currentStreak} Dias</p>
            </div>
         </div>
         <div className="bg-[#111114] border border-[#222226] p-4 rounded-2xl flex items-center gap-4">

            <div className="bg-blue-500/10 p-3 rounded-full shrink-0"><Crown className="h-6 w-6 text-blue-500" /></div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-0.5">Ranking Geral</p>
              <p className="text-xl font-black text-white">Top 15%</p>
            </div>
         </div>
         <div className="bg-[#111114] border border-[#222226] p-4 rounded-2xl flex items-center gap-4">
            <div className="bg-emerald-500/10 p-3 rounded-full shrink-0"><ShieldCheck className="h-6 w-6 text-emerald-500" /></div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-0.5">Nível da Loja</p>
              <p className="text-xl font-black text-white">Prata V</p>
            </div>
         </div>
         <div className="bg-[#111114] border border-[#222226] p-4 rounded-2xl flex items-center gap-4">
            <div className="bg-rose-500/10 p-3 rounded-full shrink-0"><CalendarSync className="h-6 w-6 text-rose-500" /></div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-0.5">Aproveitamento</p>
              <p className="text-xl font-black text-white">82%</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Metas Column */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-black text-white mb-4">Progresso do Mês</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {allGoals.map((goal, i) => {
              const rawProgress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
              const progress = Math.min(100, Math.round(rawProgress));
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-gradient-to-br from-[#151519] to-[#0A0A0B] border border-[#2A2A2E] hover:border-[#333336] p-6 rounded-[2rem] flex flex-col relative overflow-hidden group shadow-xl transition-all">
                  {/* Progress Glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 pointer-events-none transition-all group-hover:opacity-40" style={{ backgroundColor: goal.color }}></div>
                  
                  <div className="flex items-center gap-3 mb-8 relative z-10">
                    <div className="p-3.5 rounded-xl border border-white/5" style={{ backgroundColor: `${goal.color}15`, color: goal.color }}>
                      <goal.icon className="h-6 w-6" />
                    </div>
                    <div>
                       <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-0.5">Objetivo</p>
                       <h3 className="font-bold text-white text-base leading-tight">{goal.title}</h3>
                    </div>
                  </div>
                  
                  <div className="mt-auto space-y-4 relative z-10">
                    <div className="flex flex-col">
                      <span className="text-3xl font-black text-white tracking-tight mb-1">
                        {goal.type === "currency" ? `R$ ${goal.current.toLocaleString()}` : goal.type === "percent" ? `${goal.current}%` : goal.current}
                      </span>
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Target className="h-3 w-3" /> Meta de {goal.type === "currency" ? `R$ ${goal.target.toLocaleString()}` : goal.type === "percent" ? `${goal.target}%` : goal.target}
                      </span>
                    </div>
                    
                    <div className="h-3.5 w-full bg-[#111114] rounded-full overflow-hidden border border-[#222226] relative">
                      <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.max(5, progress)}%`, backgroundColor: goal.color }}>
                        <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider">
                      <span className="text-slate-500">Hoje</span>
                      <span style={{ color: goal.color }}>{progress}% Concluído</span>
                    </div>
                  </div>
                  
                  {progress >= 100 && (
                    <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-500 p-1.5 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="bg-[#111114] border border-[#2A2A2E] rounded-[2rem] p-6 shadow-xl relative overflow-hidden" onClick={() => openUpgradeModal('Metas Coloniais', 'Premium')}>
             <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 blur-[80px] pointer-events-none"></div>
             <h3 className="text-xl font-black text-white mb-4 relative z-10">Desafios da Semana</h3>
             <div className="space-y-3 relative z-10 cursor-pointer">
               {[
                 { title: "Giro Rápido", desc: "Venda 3 aparelhos em menos de 24h de estoque.", xp: "+500 XP", done: false },
                 { title: "Ticket Alto", desc: "Faça uma venda lucrando acima de R$ 800 líquidos.", xp: "+800 XP", done: true },
               ].map((c, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-[#151519] border border-[#222226] rounded-2xl hover:border-indigo-500/30 transition-colors">
                   <div className="flex items-center gap-4">
                     <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0", c.done ? "bg-indigo-500 border-indigo-500" : "border-[#333336]")}>
                       {c.done && <CheckCircle2 className="h-4 w-4 text-white" />}
                     </div>
                     <div>
                       <h4 className={cn("font-bold text-sm", c.done ? "text-slate-400 line-through" : "text-white")}>{c.title}</h4>
                       <p className="text-xs text-slate-500 mt-0.5">{c.desc}</p>
                     </div>
                   </div>
                   <div className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 font-black text-[10px] rounded shrink-0">
                     {c.xp}
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Gamification / Ranking Widget */}
        <div className="space-y-6">
           <h2 className="text-xl font-black text-white mb-4">Seu Ranking</h2>
           <div className="bg-gradient-to-b from-[#151519] to-[#0A0A0B] border border-[#2A2A2E] rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
             
             {/* Badge Display */}
             <div className="flex flex-col items-center justify-center mb-8 relative z-10">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-400 rounded-full flex items-center justify-center border-4 border-[#111114] shadow-[0_0_30px_rgba(148,163,184,0.15)] mb-4">
                   <Medal className="h-12 w-12 text-[#111114]" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">Prata V</h3>
                <p className="text-sm font-bold text-slate-400">7.450 XP</p>
                
                <div className="w-full mt-6 space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span>Prata V</span>
                    <span>Ouro I</span>
                  </div>
                  <div className="h-2 w-full bg-[#0A0A0B] border border-[#2A2A2E] rounded-full overflow-hidden">
                    <div className="h-full bg-slate-200 w-[60%] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                  </div>
                  <p className="text-center text-[10px] text-slate-500 font-bold mt-1">Faltam 2.550 XP para o Ouro</p>
                </div>
             </div>

             {/* Mini Leaderboard */}
             <div className="space-y-3 relative z-10 border-t border-[#2A2A2E] pt-6 mt-2">
               <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                 <Trophy className="h-4 w-4 text-amber-500" /> Líderes do Nível
               </h4>
               {[
                 { pos: 1, name: "Apple Imports", xp: "9.200", isMe: false },
                 { pos: 2, name: "Tech SC", xp: "8.150", isMe: false },
                 { pos: 3, name: "Você (Sua Loja)", xp: "7.450", isMe: true },
                 { pos: 4, name: "Rei dos iPhones", xp: "7.100", isMe: false },
               ].map((p, i) => (
                 <div key={i} className={cn("flex items-center justify-between p-2.5 rounded-xl border", p.isMe ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20" : "bg-transparent border-transparent")}>
                   <div className="flex items-center gap-3">
                     <span className={cn("text-xs font-black w-5 text-center", p.pos === 1 ? "text-amber-500" : p.pos === 2 ? "text-slate-300" : p.pos === 3 && !p.isMe ? "text-amber-700" : "text-slate-500")}>
                       {p.pos}º
                     </span>
                     <span className={cn("text-sm font-bold", p.isMe ? "text-white" : "text-slate-400")}>{p.name}</span>
                   </div>
                   <span className="text-xs font-black text-slate-500">{p.xp} XP</span>
                 </div>
               ))}
             </div>
             
             <button onClick={() => openUpgradeModal('Ranking Completo', 'VIP')} className="w-full mt-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors py-2">
               Ver Tabela Nacional
             </button>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#0A0A0B] border border-[#222226] p-6 rounded-3xl shadow-2xl relative z-10 w-full max-w-md">
              <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-slate-500 hover:text-white bg-[#111114] p-2 rounded-full"><X className="h-5 w-5" /></button>
              <h2 className="text-2xl font-black text-white mb-6">Criar Meta Personalizada</h2>
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Título da Meta</label>
                  <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#111114] border border-[#222226] rounded-xl px-4 py-3 text-white focus:border-[var(--color-primary)] outline-none" placeholder="Ex: Dobrar Faturamento" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Tipo de Métrica</label>
                  <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-[#111114] border border-[#222226] rounded-xl px-4 py-3 text-white focus:border-[var(--color-primary)] outline-none">
                    <option value="currency">Faturamento (R$)</option>
                    <option value="number">Aparelhos Vendidos (Qtd)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Alvo (Valor Numérico)</label>
                  <input required type="number" value={target} onChange={e => setTarget(e.target.value)} className="w-full bg-[#111114] border border-[#222226] rounded-xl px-4 py-3 text-white focus:border-[var(--color-primary)] outline-none" placeholder="100" />
                </div>
                <button type="submit" className="w-full bg-[var(--color-primary)] text-black font-black py-4 rounded-xl mt-6 hover:bg-emerald-400 transition-colors">
                  Salvar Meta
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
