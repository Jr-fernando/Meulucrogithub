import { useState, useEffect, useMemo } from "react";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { motion } from "motion/react";
import { 
  Package, 
  TrendingUp, 
  DollarSign,
  AlertCircle,
  Lightbulb,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Users,
  Store,
  Wallet,
  PieChart,
  MessageCircleQuestion,
  GraduationCap,
  Truck,
  ShoppingCart
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { startOfMonth, subMonths, isAfter, differenceInDays } from "date-fns";
import { quotes } from "../lib/quotes";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { useBusiness } from "../contexts/BusinessContext";

export function DashboardPage() {
  const [isLoadingSales, setIsLoadingSales] = useState(true);
  const [isLoadingDevices, setIsLoadingDevices] = useState(true);
  const [sales, setSales] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [quote, setQuote] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();
  const { currentBusiness, openUpgradeModal } = useBusiness();

  const monthlyGoal = 10000;

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    
    if (!auth.currentUser) return;

    // Fetch user profile
    const fetchUser = async () => {
       const userDoc = await getDoc(doc(db, "users", auth.currentUser!.uid));
       if (userDoc.exists()) setUserProfile(userDoc.data());
    };
    fetchUser();
    
    const qSales = query(collection(db, "sales"), where("uid", "==", auth.currentUser.uid));
    const unsubSales = onSnapshot(qSales, (snapshot) => {
      let data: any[] = [];
      snapshot.forEach(docSnap => data.push({ id: docSnap.id, ...docSnap.data() }));
      // Filter by current business context
      if (currentBusiness) {
        data = data.filter(s => s.businessId === currentBusiness.id || !s.businessId);
      }
      setSales(data);
      setIsLoadingSales(false);
    }, (error) => {
      try { handleFirestoreError(error, OperationType.LIST, "sales"); } catch (e) { console.error(e); }
      setIsLoadingSales(false);
    });

    const qDevices = query(collection(db, "devices"), where("uid", "==", auth.currentUser.uid));
    const unsubDevices = onSnapshot(qDevices, (snapshot) => {
      let data: any[] = [];
      snapshot.forEach(docSnap => data.push({ id: docSnap.id, ...docSnap.data() }));
      // Filter by current business context
      if (currentBusiness) {
        data = data.filter(d => d.businessId === currentBusiness.id || !d.businessId);
      }
      setDevices(data);
      setIsLoadingDevices(false);
    }, (error) => {
      try { handleFirestoreError(error, OperationType.LIST, "devices"); } catch (e) { console.error(e); }
      setIsLoadingDevices(false);
    });

    return () => {
      unsubSales();
      unsubDevices();
    };
  }, [currentBusiness?.id]);

  const {
    faturamentoMes,
    lucroMes,
    roiMes,
    ticketMedio,
    faturamentoGrowth,
    currentStreak,
    capitalInvestido,
    stagnantProducts,
    goalProgress,
    chartData,
    currentMonthSalesLength,
    inStockDevicesLength
  } = useMemo(() => {
    const today = new Date();
    const startOfCurrentMonth = startOfMonth(today);
    const startOfPrevMonth = startOfMonth(subMonths(today, 1));

    const currentMonthSales = sales.filter(s => s.saleDate?.toDate && isAfter(s.saleDate.toDate(), startOfCurrentMonth));
    const currentFaturamento = currentMonthSales.reduce((acc, s) => acc + (s.salePrice || 0), 0);
    const currentLucro = currentMonthSales.reduce((acc, s) => acc + (s.profit || 0), 0);
    const custoMes = currentMonthSales.reduce((acc, s) => acc + ((s.salePrice || 0) - (s.profit || 0)), 0);
    const roi = custoMes > 0 ? (currentLucro / custoMes) * 100 : 0;
    const ticket = currentMonthSales.length > 0 ? currentFaturamento / currentMonthSales.length : 0;

    const prevMonthSales = sales.filter(s => s.saleDate?.toDate && isAfter(s.saleDate.toDate(), startOfPrevMonth) && !isAfter(s.saleDate.toDate(), startOfCurrentMonth));
    const faturamentoMesAnterior = prevMonthSales.reduce((acc, s) => acc + (s.salePrice || 0), 0);
    
    const growth = faturamentoMesAnterior > 0 ? ((currentFaturamento - faturamentoMesAnterior) / faturamentoMesAnterior) * 100 : (currentFaturamento > 0 ? 100 : 0);

    // Calculate Sales Streak (Gamification)
    let streak = 0;
    let checkDate = new Date();
    checkDate.setHours(0,0,0,0);
    
    const sortedSalesDates = sales
      .sort((a,b) => b.saleDate?.toDate() - a.saleDate?.toDate())
      .map(s => {
        const d = s.saleDate?.toDate();
        if(d) {
          d.setHours(0,0,0,0);
          return d.getTime();
        }
        return 0;
      });
    
    const uniqueSaleDates = Array.from(new Set(sortedSalesDates));
    
    if (uniqueSaleDates.includes(checkDate.getTime())) {
       streak++;
       checkDate.setDate(checkDate.getDate() - 1);
       while(uniqueSaleDates.includes(checkDate.getTime())) {
         streak++;
         checkDate.setDate(checkDate.getDate() - 1);
       }
    } else {
      // maybe they haven't sold today yet, check yesterday
      checkDate.setDate(checkDate.getDate() - 1);
      if (uniqueSaleDates.includes(checkDate.getTime())) {
         streak++;
         checkDate.setDate(checkDate.getDate() - 1);
         while(uniqueSaleDates.includes(checkDate.getTime())) {
           streak++;
           checkDate.setDate(checkDate.getDate() - 1);
         }
      }
    }

    const inStock = devices.filter(d => d.status === 'in_stock');
    const capital = inStock.reduce((acc, d) => acc + (d.purchasePrice || 0), 0);
    const stagnant = inStock.filter(d => d.createdAt?.toDate && differenceInDays(today, d.createdAt.toDate()) > 30);

    const progress = Math.min((currentLucro / monthlyGoal) * 100, 100);

    const dailyDataMap = new Map();
    currentMonthSales.forEach(s => {
      if (!s.saleDate?.toDate) return;
      const dateStr = s.saleDate.toDate().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      dailyDataMap.set(dateStr, (dailyDataMap.get(dateStr) || 0) + s.salePrice);
    });
    
    let cData: any[] = [];
    if (dailyDataMap.size > 0) {
      cData = Array.from(dailyDataMap, ([name, value]) => ({ name, value })).sort((a, b) => {
        const [dayA] = a.name.split('/');
        const [dayB] = b.name.split('/');
        return Number(dayA) - Number(dayB);
      });
    } else {
      cData = [ { name: '01', value: 0 }, { name: '05', value: 0 } ];
    }

    return {
      faturamentoMes: currentFaturamento,
      lucroMes: currentLucro,
      roiMes: roi,
      ticketMedio: ticket,
      faturamentoGrowth: growth,
      currentStreak: streak,
      capitalInvestido: capital,
      stagnantProducts: stagnant,
      goalProgress: progress,
      chartData: cData,
      currentMonthSalesLength: currentMonthSales.length,
      inStockDevicesLength: inStock.length
    };
  }, [sales, devices]);

  if (isLoadingSales || isLoadingDevices) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-48 bg-[#0A0A0B] rounded-[2.5rem] border border-[#222226]/60"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-[#0A0A0B] rounded-[2rem] border border-[#222226]"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-[#0A0A0B] rounded-[2rem] border border-[#222226]"></div>
          ))}
        </div>
      </div>
    );
  }

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  const blocks = [
    { title: "Operacional", items: [
      { name: "Estoque Exato", path: "/inventory", icon: Package, color: "text-blue-500", bg: "bg-blue-500/10 hover:bg-blue-500/20" },
      { name: "Painel de Vendas", path: "/sales", icon: DollarSign, color: "text-[var(--color-primary)]", bg: "bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20" },
      { name: "Canais Web", path: "/orders", icon: ShoppingCart, color: "text-amber-500", bg: "bg-amber-500/10 hover:bg-amber-500/20" },
    ]},
    { title: "Métricas B2B", items: [
      { name: "Fluxo Contábil", path: "/capital", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10 hover:bg-emerald-500/20" },
      { name: "Caixa & Relatórios", path: "/reports", icon: PieChart, color: "text-purple-500", bg: "bg-purple-500/10 hover:bg-purple-500/20" },
      { name: "Clientes Premium", path: "/customers", icon: Users, color: "text-pink-500", bg: "bg-pink-500/10 hover:bg-pink-500/20" },
    ]},
    { title: "Escalonamento", items: [
      { name: "Marketplace Oculto", path: "/marketplace", icon: Store, color: "text-cyan-500", bg: "bg-cyan-500/10 hover:bg-cyan-500/20", reqVip: true },
      { name: "Comunidade + Cursos", path: "/community", icon: GraduationCap, color: "text-sky-500", bg: "bg-sky-500/10 hover:bg-sky-500/20", reqVip: false },
      { name: "Verificador IMEI", path: "/imei", icon: Sparkles, color: "text-indigo-500", bg: "bg-indigo-500/10 hover:bg-indigo-500/20", reqVip: true },
    ]}
  ];

  return (
    <motion.div className="space-y-8 md:space-y-12" variants={containerVariants} initial="show" animate="show">
      {/* Hello Banner */}
      <motion.div variants={itemVariants} className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 bg-[#0A0A0B] p-8 md:p-10 rounded-[2.5rem] border border-[#222226]/60 relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-[var(--color-primary)]/5 to-transparent pointer-events-none"></div>
        <div className="absolute right-[-10%] top-[-50%] w-[500px] h-[500px] bg-[var(--color-primary)] opacity-[0.03] rounded-full blur-[120px] animate-[spin_15s_linear_infinite] pointer-events-none"></div>
        
        <div className="relative z-10 w-full flex flex-col xl:flex-row xl:items-center justify-between gap-8 xl:gap-14">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
              <h1 className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-[0.25em] bg-[var(--color-primary)]/10 px-3 py-1.5 rounded-md border border-[var(--color-primary)]/20">Visão Executiva</h1>
              {currentStreak > 1 && (
                <div className="bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md flex items-center gap-1.5 border border-orange-500/20">
                  <TrendingUp className="h-3 w-3" /> {currentStreak} Dias Faturando!
                </div>
              )}
            </div>
            <p className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter mb-4 leading-tight">
              Olá, {auth.currentUser?.displayName?.split(' ')[0] || 'Gestor'}.
            </p>
            <p className="text-slate-400 text-sm md:text-lg max-w-xl font-medium leading-relaxed">
              "{quote}"
            </p>
          </div>
          
          <div className="bg-[#111114] border border-[#222226] p-6 rounded-3xl xl:w-[340px] shadow-2xl relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--color-primary)]/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
             <div className="flex justify-between items-start mb-6">
               <div>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-1.5">Meta de Lucro Mensal</span>
                 <span className="text-2xl font-black text-white tracking-tight">R$ {lucroMes.toLocaleString('pt-BR')}</span>
               </div>
               <div className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-black text-sm px-3.5 py-1.5 rounded-xl border border-[var(--color-primary)]/20 shadow-[0_0_15px_rgba(0,223,100,0.1)]">
                 {goalProgress.toFixed(0)}%
               </div>
             </div>
             
             <div className="relative h-2.5 bg-[#050505] rounded-full overflow-hidden border border-[#222226] mb-3">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${goalProgress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-[var(--color-primary)]/60 to-[var(--color-primary)] rounded-full" 
                >
                  <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" style={{ transform: 'translateX(-100%)' }}></div>
                </motion.div>
             </div>
             <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-500">
                <span>Zero</span>
                <span className="text-[var(--color-primary)]">R$ {monthlyGoal.toLocaleString('pt-BR')}</span>
             </div>
          </div>
        </div>
      </motion.div>

      {/* Main KPI Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-[#0A0A0B] p-6 md:p-8 rounded-[2rem] border border-[#222226] flex flex-col justify-between group hover:bg-[#111114] transition-all cursor-pointer relative overflow-hidden shadow-lg hover:shadow-2xl">
          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex items-center justify-between">
               <div className="bg-[#111114] border border-[#222226] p-2.5 rounded-xl group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all"><DollarSign className="h-5 w-5 text-slate-400 group-hover:text-emerald-400 transition-colors" /></div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-400 transition-colors">Receita Real</p>
            </div>
            <div className="mt-2 text-left">
               <p className="text-3xl md:text-4xl font-black text-white tracking-tighter">R$ {faturamentoMes.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
               <div className={`flex items-center justify-start gap-1.5 mt-3 text-[10px] md:text-xs font-black uppercase tracking-wider ${faturamentoGrowth >= 0 ? "text-[var(--color-primary)]" : "text-rose-500"}`}>
                 {faturamentoGrowth >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                 <span>{Math.abs(faturamentoGrowth).toFixed(1)}% / mês ref.</span>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-[#111114] to-[#0A0A0B] p-6 md:p-8 rounded-[2rem] border border-[var(--color-primary)]/30 flex flex-col justify-between group hover:border-[var(--color-primary)]/60 transition-all cursor-pointer relative overflow-hidden shadow-xl hover:shadow-[0_20px_50px_rgba(0,223,100,0.1)]">
          <div className="absolute inset-0 bg-[var(--color-primary)]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex items-center justify-between">
               <div className="bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/30 shadow-[0_0_15px_rgba(0,223,100,0.2)] p-2.5 rounded-xl group-hover:scale-110 transition-transform"><TrendingUp className="h-5 w-5 text-[var(--color-primary)]" /></div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary)] opacity-80">Lucro Puro</p>
            </div>
            <div className="mt-2 text-left">
               <p className="text-3xl md:text-4xl font-black text-[var(--color-primary)] tracking-tighter drop-shadow-[0_0_10px_rgba(0,223,100,0.3)]">R$ {lucroMes.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
               <p className="text-[10px] md:text-xs text-[var(--color-primary)]/80 mt-3 font-black uppercase tracking-widest">Margem/ROI: {roiMes.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-[#0A0A0B] p-6 md:p-8 rounded-[2rem] border border-[#222226] flex flex-col justify-between group hover:bg-[#111114] transition-all cursor-pointer relative overflow-hidden shadow-lg hover:shadow-2xl" onClick={() => navigate('/inventory')}>
          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex items-center justify-between">
               <div className="bg-[#111114] border border-[#222226] p-2.5 rounded-xl group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all"><Package className="h-5 w-5 text-slate-400 group-hover:text-blue-400 transition-colors" /></div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-400 transition-colors">Em Estoque</p>
            </div>
            <div className="mt-2 text-left">
               <p className="text-3xl md:text-4xl font-black text-white tracking-tighter">R$ {capitalInvestido.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
               <p className="text-[10px] md:text-xs text-blue-400 mt-3 font-black tracking-widest uppercase">{inStockDevicesLength} Volumes</p>
            </div>
          </div>
        </div>

        <div className="bg-[#0A0A0B] p-6 md:p-8 rounded-[2rem] border border-[#222226] flex flex-col justify-between group hover:bg-[#111114] transition-all cursor-pointer relative overflow-hidden shadow-lg hover:shadow-2xl">
          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex items-center justify-between">
               <div className="bg-[#111114] border border-[#222226] p-2.5 rounded-xl group-hover:bg-purple-500/10 group-hover:border-purple-500/20 transition-all"><BarChart3 className="h-5 w-5 text-slate-400 group-hover:text-purple-400 transition-colors" /></div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-400 transition-colors">Ticket Tático</p>
            </div>
            <div className="mt-2 text-left">
               <p className="text-3xl md:text-4xl font-black text-white tracking-tighter">R$ {ticketMedio.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
               <p className="text-[10px] md:text-xs text-slate-500 mt-3 font-black tracking-widest uppercase group-hover:text-purple-400/80 transition-colors">{currentMonthSalesLength} Conversões</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Block Navigation Matrix */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {blocks.map((block, idx) => (
          <div key={idx} className="bg-[#0A0A0B] border border-[#222226] p-6 rounded-[2rem] flex flex-col shadow-xl relative group hover:border-[#2A2A2E] transition-colors">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6">{block.title}</h3>
            <div className="space-y-3 flex-1 flex flex-col justify-end">
              {block.items.map((item, i) => (
                <button 
                  key={i} 
                  onClick={(e) => {
                     if (item.reqVip && userProfile?.plan !== "VIP") {
                        e.preventDefault();
                        openUpgradeModal(item.name, "VIP");
                     } else {
                        navigate(item.path);
                     }
                  }}
                  className="w-full bg-[#111114] border border-[#222226] hover:bg-[#1A1A1E] hover:border-[#2A2A2E] p-4 rounded-2xl flex items-center gap-4 transition-all group/btn shadow-inner"
                >
                  <div className={cn("p-2.5 rounded-xl transition-all border border-transparent shadow-sm group-hover/btn:scale-105", item.bg)}>
                     <item.icon className={cn("h-5 w-5", item.color)} />
                  </div>
                  <span className="text-sm font-bold text-slate-300 group-hover/btn:text-white transition-colors tracking-tight">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Charts & Insights */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-gradient-to-b from-[#111114] to-[#0A0A0B] rounded-[2rem] border border-[#222226] p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity">
            <TrendingUp className="h-64 w-64 text-[var(--color-primary)] blur-[60px]" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 relative z-10 gap-4">
            <div className="flex items-center gap-3">
               <div className="bg-[#1A1A1E] p-3 rounded-xl border border-[#2A2A2E]"><BarChart3 className="h-5 w-5 text-white" /></div>
               <div>
                 <h2 className="text-lg font-black text-white tracking-tight">Evolução do Mês</h2>
                 <p className="text-xs text-slate-400 font-medium">Crescimento de receita diária</p>
               </div>
            </div>
            <select className="bg-[#1A1A1E] border border-[#2A2A2E] text-white text-xs font-bold rounded-xl px-4 py-2 outline-none focus:border-[var(--color-primary)] transition-colors cursor-pointer hover:bg-[#222226]">
              <option>Este Mês</option>
            </select>
          </div>
          <div className="flex-1 w-full min-h-[250px] relative z-10 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222226" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#52525b" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val/1000}k`} dx={-10} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#050505', borderColor: '#222226', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: 'var(--color-primary)', fontWeight: 'black' }}
                  cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Area type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" style={{ filter: 'drop-shadow(0 0 10px rgba(0,223,100,0.3))' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actionable Insights Board */}
        <div className="bg-gradient-to-b from-[#111114] to-[#0A0A0B] rounded-[2rem] border border-[#222226] p-6 shadow-xl flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors blur-3xl rounded-full"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h2 className="text-sm font-black text-white flex items-center gap-2 tracking-tight">
              <div className="bg-amber-500/10 p-1.5 rounded-lg relative">
                <Lightbulb className="h-4 w-4 text-amber-400" />
                <div className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full animate-ping"></div>
                <div className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full"></div>
              </div>
              Radar Inteligente
            </h2>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-[#1A1A1E] px-2 py-1 rounded-md">Ao Vivo</span>
          </div>
          
          <div className="space-y-3 flex-1 relative z-10">
            {stagnantProducts.length > 0 ? (
              <div onClick={() => navigate('/inventory')} className="bg-[#151519] border border-rose-500/30 p-4 rounded-2xl flex items-start gap-3 hover:bg-rose-500/5 transition-all cursor-pointer group shadow-lg hover:-translate-y-0.5">
                <div className="bg-rose-500/10 p-2 rounded-xl mt-0.5"><AlertCircle className="h-4 w-4 text-rose-500 group-hover:scale-110 transition-transform" /></div>
                <div>
                  <p className="text-sm font-black text-white">Atenção: Estoque Congelado</p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">{stagnantProducts.length} itens parados há +30 dias. Faça uma oferta rápida.</p>
                </div>
              </div>
            ) : (
              <div className="bg-[#151519] border border-emerald-500/30 p-4 rounded-2xl flex items-start gap-3 hover:bg-emerald-500/5 transition-all cursor-pointer group shadow-lg hover:-translate-y-0.5">
                <div className="bg-emerald-500/10 p-2 rounded-xl mt-0.5"><Package className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform" /></div>
                <div>
                  <p className="text-sm font-black text-white">Giro Perfeito</p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">Nenhum aparelho mofando na prateleira.</p>
                </div>
              </div>
            )}
            
            <div onClick={() => navigate('/reports')} className="bg-[#151519] border border-[var(--color-primary)]/30 p-4 rounded-2xl flex items-start gap-3 hover:bg-[var(--color-primary)]/5 transition-all cursor-pointer group shadow-lg hover:-translate-y-0.5">
              <div className="bg-[var(--color-primary)]/10 p-2 rounded-xl mt-0.5"><TrendingUp className="h-4 w-4 text-[var(--color-primary)] group-hover:scale-110 transition-transform" /></div>
              <div>
                <p className="text-sm font-black text-white">Tração de Negócios</p>
                <p className="text-xs text-slate-400 mt-1 font-medium">Ticket médio mantido em R$ {ticketMedio.toLocaleString('pt-BR', {minimumFractionDigits: 2})}. Explore Up-sell.</p>
              </div>
            </div>
            
            <div onClick={() => navigate('/insights')} className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-2xl flex items-center justify-between hover:bg-blue-500/20 transition-all cursor-pointer group mt-auto shadow-[0_0_20px_rgba(59,130,246,0.1)]">
               <span className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-2"><Sparkles className="h-3 w-3" /> Ver Mais Insights</span>
               <ArrowUpRight className="h-4 w-4 text-blue-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
