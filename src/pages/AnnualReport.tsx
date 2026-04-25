import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { motion } from "motion/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { CalendarDays, Trophy, Target, TrendingUp, Sparkles } from "lucide-react";
import { cn } from "../lib/utils";
import { useBusiness } from "../contexts/BusinessContext";
import { startOfYear, endOfYear, eachMonthOfInterval, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AnnualReportPage() {
  const { currentBusiness } = useBusiness();
  const [sales, setSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const qSales = query(collection(db, "sales"), where("uid", "==", auth.currentUser.uid));
    const unsubSales = onSnapshot(qSales, (snapshot) => {
      let data: any[] = [];
      snapshot.forEach(docSnap => data.push({ id: docSnap.id, ...docSnap.data() }));
      if (currentBusiness) data = data.filter(s => s.businessId === currentBusiness.id || !s.businessId);
      setSales(data);
      setIsLoading(false);
    });

    return () => unsubSales();
  }, [currentBusiness?.id]);

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-[#222226] border-t-[var(--color-primary)] animate-spin"></div></div>;
  }

  const now = new Date();
  const yearStart = startOfYear(now);
  const yearEnd = endOfYear(now);
  
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });
  
  let bestMonth = { name: "-", faturamento: 0 };
  let worstMonth = { name: "-", faturamento: Infinity };
  let firstMonthFaturamento = 0;
  let lastMonthFaturamento = 0;

  const annualData = months.map((month, index) => {
    const monthSales = sales.filter(s => {
      if (!s.saleDate?.toDate) return false;
      const d = s.saleDate.toDate();
      return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
    });

    const faturamento = monthSales.reduce((acc, s) => acc + (Number(s.salePrice) || 0), 0);
    const lucro = monthSales.reduce((acc, s) => acc + (Number(s.profit) || 0), 0);
    const name = format(month, 'MMM', { locale: ptBR });

    if (faturamento > bestMonth.faturamento) bestMonth = { name, faturamento };
    if (faturamento < worstMonth.faturamento && faturamento > 0) worstMonth = { name, faturamento };
    
    // For calculation of growth
    if (index === 0) firstMonthFaturamento = faturamento;
    if (index === new Date().getMonth()) lastMonthFaturamento = faturamento; // Current month

    return { name, lucro, faturamento };
  });

  if (worstMonth.faturamento === Infinity) worstMonth.faturamento = 0;

  const growth = firstMonthFaturamento > 0 
    ? (((lastMonthFaturamento - firstMonthFaturamento) / firstMonthFaturamento) * 100).toFixed(0)
    : "100";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Crescimento Anual</h1>
        <p className="text-slate-400">Acompanhe sua evolução mês a mês ao longo do ano.</p>
      </header>

      {/* Destaque Principal */}
      <div className="bg-gradient-to-br from-[#111114] to-[#1A1A1E] border border-[#222226] p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-primary)]/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold uppercase tracking-widest text-xs mb-3">
              <Sparkles className="h-4 w-4" /> Evolução {now.getFullYear()}
            </div>
            <h2 className="text-5xl font-black text-white mb-2">+ {growth}%</h2>
            <p className="text-slate-400 max-w-sm">
              Seu faturamento aumentou {growth}% este ano comparado ao primeiro mês. Continue expandindo sua rede.
            </p>
          </div>
          <div className="flex bg-[#0A0A0B] p-4 rounded-3xl border border-[#222226] gap-6 w-full md:w-auto">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Pior Mês</p>
              <p className="text-2xl font-bold text-slate-300 capitalize">{worstMonth.name}</p>
            </div>
            <div className="w-px bg-[#222226]" />
            <div>
              <p className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-widest mb-1">Melhor Mês</p>
              <p className="text-2xl font-bold text-white flex items-center gap-2 capitalize">{bestMonth.name} <Trophy className="h-5 w-5 text-amber-500" /></p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico Anual de Área */}
      <div className="bg-[#111114] border border-[#222226] p-6 rounded-3xl">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-lg font-bold text-white flex items-center gap-2"><TrendingUp className="h-5 w-5 text-[var(--color-primary)]" /> Faturamento Anual</h3>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={annualData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFaturamento" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00df64" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00df64" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" vertical={false} />
              <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis stroke="#666" tick={{ fill: '#888' }} axisLine={false} tickLine={false} tickFormatter={(val) => `R$ ${val/1000}k`} />
              <RechartsTooltip cursor={{ stroke: '#2A2A2E', strokeWidth: 2 }} contentStyle={{ backgroundColor: '#151519', border: '1px solid #2A2A2E', borderRadius: '12px', color: '#fff' }} />
              <Area type="monotone" dataKey="faturamento" stroke="#00df64" strokeWidth={3} fillOpacity={1} fill="url(#colorFaturamento)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
