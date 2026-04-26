import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { motion } from "motion/react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Calendar, ArrowUpRight, ArrowDownRight, Target } from "lucide-react";
import { cn } from "../lib/utils";
import { useBusiness } from "../contexts/BusinessContext";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

export function ReportsPage() {
  const { currentBusiness } = useBusiness();
  const [sales, setSales] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

    // Fetch Capital Transactions (Expenses)
    const qCap = query(collection(db, "capital_transactions"), where("uid", "==", auth.currentUser.uid), where("type", "==", "out"));
    const unsubCap = onSnapshot(qCap, (snapshot) => {
      let data: any[] = [];
      snapshot.forEach(docSnap => data.push({ id: docSnap.id, ...docSnap.data() }));
      if (currentBusiness) data = data.filter(d => d.businessId === currentBusiness.id || !d.businessId);
      setExpenses(data);
    });

    setTimeout(() => setIsLoading(false), 800);

    return () => {
      unsubSales();
      unsubCap();
    };
  }, [currentBusiness?.id]);

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-[#222226] border-t-[var(--color-primary)] animate-spin"></div></div>;
  }

  const now = new Date();
  const startMonth = startOfMonth(now);
  const endMonth = endOfMonth(now);

  const currentMonthSales = sales.filter(s => s.saleDate?.toDate && isWithinInterval(s.saleDate.toDate(), { start: startMonth, end: endMonth }));
  const currentMonthExpenses = expenses.filter(e => e.date?.toDate && isWithinInterval(e.date.toDate(), { start: startMonth, end: endMonth }));

  const faturamento = currentMonthSales.reduce((acc, s) => acc + (Number(s.salePrice) || 0), 0);
  const lucro = currentMonthSales.reduce((acc, s) => acc + (Number(s.profit) || 0), 0);
  const despesasTotal = currentMonthExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const ticketMedio = currentMonthSales.length > 0 ? faturamento / currentMonthSales.length : 0;
  
  const lucroLiquidoReal = lucro - despesasTotal;

  // Group Expenses by Category
  const expenseGroups: Record<string, number> = {};
  currentMonthExpenses.forEach(e => {
    const cat = e.category === 'venda' || e.category === 'aporte' || e.category === 'retirada' ? 'Outros' : e.category || 'Outros';
    expenseGroups[cat] = (expenseGroups[cat] || 0) + Number(e.amount);
  });
  
  const colors = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6"];
  const pieData = Object.entries(expenseGroups).map(([name, value], i) => ({
    name, value, color: colors[i % colors.length]
  }));

  // Simple mock for chart since we don't have historical weekly groupings yet, we'll just show the single month aggregated to display the component logic
  const monthlyData = [
     { name: "Este Mês", receitas: faturamento, despesas: despesasTotal }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Resumo do Mês</h1>
          <p className="text-slate-400">Desempenho financeiro e DRE resumido.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#111114] border border-[#222226] p-1.5 rounded-xl">
          <button className="px-4 py-2 rounded-lg text-sm font-bold bg-[#2A2A2E] text-white">Novembro</button>
          <button className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-colors">Outubro</button>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Faturamento Bruto", value: `R$ ${faturamento.toFixed(2).replace('.', ',')}`, icon: DollarSign, trend: "", isUp: true, color: "text-[var(--color-primary)]" },
          { title: "Lucro Líquido Real", value: `R$ ${lucroLiquidoReal.toFixed(2).replace('.', ',')}`, icon: TrendingUp, trend: "", isUp: true, color: "text-emerald-400" },
          { title: "Despesas Totais", value: `R$ ${despesasTotal.toFixed(2).replace('.', ',')}`, icon: TrendingDown, trend: "", isUp: false, color: "text-rose-400" },
          { title: "Ticket Médio", value: `R$ ${ticketMedio.toFixed(2).replace('.', ',')}`, icon: Target, trend: "", isUp: true, color: "text-blue-400" },
        ].map((kpi, i) => (
          <motion.div key={i} initial="show" animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-[#111114] border border-[#222226] p-6 rounded-3xl relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#1A1A1E] rounded-xl group-hover:scale-110 transition-transform">
                <kpi.icon className={cn("h-6 w-6", kpi.color)} />
              </div>
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">{kpi.title}</h3>
            <p className="text-2xl font-black text-white">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Fluxo de Caixa */}
        <div className="lg:col-span-2 bg-[#111114] border border-[#222226] p-6 rounded-3xl">
          <h3 className="text-lg font-bold text-white mb-6">Receitas vs Despesas (Semanas)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" vertical={false} />
                <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#666" tick={{ fill: '#888' }} axisLine={false} tickLine={false} tickFormatter={(val) => `R$ ${val/1000}k`} />
                <RechartsTooltip cursor={{ fill: '#1A1A1E' }} contentStyle={{ backgroundColor: '#151519', border: '1px solid #2A2A2E', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="receitas" fill="#00df64" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="despesas" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribuição de Despesas */}
        <div className="bg-[#111114] border border-[#222226] p-6 rounded-3xl">
          <h3 className="text-lg font-bold text-white mb-6">Origem das Despesas</h3>
          {pieData.length > 0 ? (
           <>
            <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#151519', border: '1px solid #2A2A2E', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-3">
              {pieData.map((expense, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: expense.color }} />
                    <span className="text-sm text-slate-400 capitalize">{expense.name}</span>
                  </div>
                  <span className="text-sm font-bold text-white">R$ {expense.value.toFixed(2).replace('.', ',')}</span>
                </div>
              ))}
            </div>
           </>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-slate-500">
               <span className="text-sm">Nenhuma despesa no período.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
