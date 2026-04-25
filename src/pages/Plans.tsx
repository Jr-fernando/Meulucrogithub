import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Check, X, ArrowRight, Zap, Star, ShieldCheck, Crown, TrendingUp } from "lucide-react";
import { cn } from "../lib/utils";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export function PlansPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>("pro");

  useEffect(() => {
    async function loadPlan() {
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.plan) {
            setCurrentPlan(data.plan.toLowerCase());
          }
        }
      }
    }
    loadPlan();
  }, []);

  const plans = [
    {
      id: "free",
      name: "FREE",
      desc: "Comece a usar sem pagar. Perfeito para iniciar.",
      firstMonth: 0,
      monthlyPrice: 0,
      annualPrice: 0,
      highlight: false,
      features: [
        "1 Comércio isolado",
        "Controle de estoque (30 itens)",
        "Registro de vendas",
        "Cálculo de lucro",
        "Dashboard simples",
        "Cadastro de clientes"
      ],
      icon: Zap
    },
    {
      id: "pro",
      name: "PRO",
      desc: "Plano ideal para quem quer crescer e ter controle real.",
      firstMonth: 12.90,
      monthlyPrice: 19.90,
      annualPrice: 14.91, // 179 / 12
      highlight: true,
      features: [
        "Tudo do Free",
        "Até 3 Comércios isolados",
        "Estoque Ilimitado",
        "Relatórios completos",
        "Comparações e Metas",
        "Alertas inteligentes"
      ],
      icon: ShieldCheck
    },
    {
      id: "premium",
      name: "PREMIUM",
      desc: "Usuários mais avançados com foco em escala.",
      firstMonth: 24.90,
      monthlyPrice: 29.90,
      annualPrice: 24.91, // 299 / 12
      highlight: false,
      features: [
        "Tudo do Pro",
        "Até 10 Comércios isolados",
        "Insights inteligentes e IA",
        "Automações e Performance",
        "Múltiplos usuários e equipe",
        "Relatórios avançados"
      ],
      icon: Star
    },
    {
      id: "vip",
      name: "PREMIUM VIP",
      desc: "Para quem quer escalar o negócio no máximo nível.",
      firstMonth: 39.90,
      monthlyPrice: 49.90,
      annualPrice: 41.58, // 499 / 12
      highlight: false,
      features: [
        "Tudo do Premium",
        "Comércios ilimitados",
        "Consulta de IMEI",
        "Acesso antecipado a funções",
        "Marketplace B2B VIP",
        "Suporte Prioritário VIP"
      ],
      icon: Crown
    }
  ];

  const comparison = [
    { feature: "Limite de Comércios / Negócios", free: "1", pro: "3", premium: "10", vip: "Ilimitado" },
    { feature: "Limite de Aparelhos", free: "30", pro: "Ilimitado", premium: "Ilimitado", vip: "Ilimitado" },
    { feature: "Vendas e Lucro com Custos", free: true, pro: true, premium: true, vip: true },
    { feature: "Relatórios Completos e Metas", free: false, pro: true, premium: true, vip: true },
    { feature: "Múltiplos Usuários (Equipe)", free: false, pro: false, premium: true, vip: true },
    { feature: "Insights de Inteligência Artificial", free: false, pro: false, premium: true, vip: true },
    { feature: "Marketplace B2B e Automações", free: false, pro: false, premium: false, vip: true },
    { feature: "Consulta de IMEI Premium", free: false, pro: false, premium: false, vip: true },
    { feature: "Acesso ao Suporte", free: "Comunidade", pro: "E-mail", premium: "Site", vip: "WhatsApp VIP" },
  ];

  const getButtonText = (planId: string) => {
    if (currentPlan === planId) return "Seu Plano Atual";
    
    // Simple logic: if current plan is less than target plan, it's an upgrade
    const hierarchy = { "free": 0, "pro": 1, "premium": 2, "vip": 3 };
    const currLevel = hierarchy[currentPlan as keyof typeof hierarchy] || 0;
    const planLevel = hierarchy[planId as keyof typeof hierarchy] || 0;
    
    if (planLevel > currLevel) {
      return "Fazer Upgrade";
    }
    return "Assinar";
  };

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar bg-[#050505] text-slate-100 pb-24 relative">
      {/* Background Glows Netflix Style */}
      <div className="absolute top-0 left-1/4 w-1/2 h-[500px] bg-red-600/10 opacity-30 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[250px] bg-[var(--color-primary)] opacity-5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 pt-12 md:pt-16">
        
        {/* HERO SECTION */}
        <div className="text-center space-y-4 mb-14">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 leading-tight">
              Escolha o plano ideal para <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                o tamanho do seu negócio.
              </span>
            </h1>
            <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto mb-8 font-medium">
              Cancele quando quiser. Nenhuma taxa oculta.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex justify-center">
            {/* TOGGLE MENSAL/ANUAL */}
            <div className="bg-[#111114] p-1.5 rounded-2xl flex items-center border border-[#222226] shadow-xl relative z-10 w-full max-w-sm">
              <button 
                onClick={() => setIsAnnual(false)}
                className={cn(
                  "flex-1 py-3 px-6 rounded-xl text-sm font-black transition-all z-10",
                  !isAnnual ? "text-slate-900 bg-white shadow-md" : "text-slate-400 hover:text-slate-200"
                )}
              >
                Mensal
              </button>
              <button 
                onClick={() => setIsAnnual(true)}
                className={cn(
                  "flex-1 py-3 px-6 rounded-xl text-sm font-black transition-all z-10 flex items-center justify-center gap-1.5",
                  isAnnual ? "text-slate-900 bg-white shadow-md" : "text-slate-400 hover:text-slate-200"
                )}
              >
                Anual <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-md uppercase tracking-wider animate-pulse ml-1">-20%</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* PRICING CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start max-w-7xl mx-auto mb-24 relative z-10">
          {plans.map((plan, i) => (
            <motion.div 
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
              className={cn(
                "relative bg-gradient-to-b from-[#111114] to-[#0A0A0B] border rounded-3xl p-6 sm:p-8 flex flex-col transition-all duration-300",
                plan.highlight 
                  ? "border-red-600/50 shadow-[0_0_40px_rgba(220,38,38,0.1)] md:scale-105 z-20 hover:border-red-500 hover:shadow-[0_0_50px_rgba(220,38,38,0.15)]" 
                  : "border-[#222226] hover:border-slate-500 z-10 hover:-translate-y-2",
                plan.id === "vip" && "border-amber-500/30 hover:border-amber-500/50"
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-[0_4px_15px_rgba(220,38,38,0.5)] flex items-center gap-1">
                  <Star className="h-3 w-3 fill-white" /> Mais Escolhido
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl md:text-2xl font-black text-slate-100 flex items-center gap-2 mb-2">
                  <plan.icon className={cn("h-6 w-6", plan.highlight ? "text-red-500" : plan.id === "vip" ? "text-amber-500" : "text-blue-500")} />
                  {plan.name}
                </h3>
                <p className="text-slate-400 text-sm font-medium h-10">{plan.desc}</p>
              </div>

              <div className="mb-6 pb-6 border-b border-[#222226]">
                 <div className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-2xl p-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">1º mês por apenas</p>
                    <div className="flex items-start gap-1">
                      <span className="text-sm font-bold text-slate-300 mt-1">R$</span>
                      <span className="text-4xl font-black text-white">{plan.firstMonth.toFixed(2).replace('.', ',')}</span>
                    </div>
                 </div>
                 <div className="mt-4 flex flex-col justify-center text-center">
                    <div className="text-sm text-slate-400 font-medium">Depois R$ {(isAnnual ? plan.annualPrice : plan.monthlyPrice).toFixed(2).replace('.', ',')} / mês</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {isAnnual ? `Cobrado anualmente (R$ ${(plan.annualPrice * 12).toFixed(2).replace('.', ',')}/ano)` : 'Cobrado mensalmente'}
                    </div>
                 </div>
              </div>

              <button 
                disabled={currentPlan === plan.id}
                className={cn(
                  "w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all mb-8 group overflow-hidden relative",
                  currentPlan === plan.id 
                    ? "bg-[#222226] text-slate-500 cursor-not-allowed" 
                    : plan.highlight 
                      ? "bg-red-600 text-white hover:bg-red-700 shadow-[0_4px_15px_rgba(220,38,38,0.3)] active:scale-95" 
                      : "bg-[#222226] text-white hover:bg-slate-700 active:scale-95",
                  plan.id === "vip" && currentPlan !== "vip" && "bg-amber-500 text-slate-900 hover:bg-amber-400"
                )}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {getButtonText(plan.id)}
                  {currentPlan !== plan.id && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                </span>
                {plan.highlight && currentPlan !== plan.id && (
                  <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                )}
              </button>

              <div className="space-y-4 flex-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recursos inclusos</p>
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 group/feature">
                    <div className={cn("p-0.5 rounded-full mt-0.5 shrink-0 transition-colors", plan.highlight ? "bg-red-500/10 group-hover/feature:bg-red-500/20" : plan.id === "vip" ? "bg-amber-500/10 group-hover/feature:bg-amber-500/20" : "bg-blue-500/10 group-hover/feature:bg-blue-500/20")}>
                      <Check className={cn("h-3 w-3", plan.highlight ? "text-red-500" : plan.id === "vip" ? "text-amber-500" : "text-blue-500")} strokeWidth={3} />
                    </div>
                    <span className={cn("text-sm text-slate-400 font-medium transition-colors", feature.startsWith("Tudo do") ? "text-white font-bold" : "group-hover/feature:text-slate-200")}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* VALUE BLOCK */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4">
            Você não precisa vender mais. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-emerald-400">Você precisa lucrar melhor.</span>
          </h2>
          <p className="text-lg text-slate-400 font-medium">
            O <span className="text-white font-bold">Meu Lucro</span> te dá controle total do dinheiro que entra, onde ele está aplicado, e direciona o fluxo para o seu crescimento contínuo.
          </p>
        </motion.div>

        {/* COMPARISON TABLE */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#111114] border border-[#222226] rounded-3xl overflow-hidden mb-24 max-w-5xl mx-auto shadow-2xl relative"
        >
           <div className="p-6 md:p-8 border-b border-[#222226] bg-[#0A0A0B]">
             <h3 className="text-2xl font-black text-slate-100">Compare os Planos Detalhadamente</h3>
           </div>
           <div className="overflow-x-auto custom-scrollbar">
             <table className="w-full text-left min-w-[800px]">
               <thead>
                 <tr className="border-b border-[#222226]">
                   <th className="p-4 md:p-6 text-sm font-bold text-slate-400 uppercase tracking-wider w-1/5">Funcionalidade</th>
                   <th className="p-4 md:p-6 text-sm font-black text-slate-400 w-1/5 text-center bg-[#0A0A0B]/50">FREE</th>
                   <th className="p-4 md:p-6 text-sm font-black text-red-500 w-1/5 text-center bg-red-950/10 relative">
                     PRO
                     <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
                   </th>
                   <th className="p-4 md:p-6 text-sm font-black text-blue-400 w-1/5 text-center bg-[#0A0A0B]/50">PREMIUM</th>
                   <th className="p-4 md:p-6 text-sm font-black text-amber-500 w-1/5 text-center bg-[#0A0A0B]/50">VIP</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-[#222226]">
                 {comparison.map((item, idx) => (
                   <tr key={idx} className="hover:bg-[#222226]/50 transition-colors">
                     <td className="p-4 md:p-6 text-sm font-medium text-slate-300">{item.feature}</td>
                     <td className="p-4 md:p-6 text-center text-sm font-bold bg-[#0A0A0B]/50">
                       {typeof item.free === "boolean" ? (
                         item.free ? <Check className="h-5 w-5 text-slate-400 mx-auto" /> : <X className="h-5 w-5 text-slate-600 mx-auto" strokeWidth={3} />
                       ) : (
                         <span className="text-slate-400">{item.free}</span>
                       )}
                     </td>
                     <td className="p-4 md:p-6 text-center text-sm font-black bg-red-950/5">
                       {typeof item.pro === "boolean" ? (
                         item.pro ? <Check className="h-5 w-5 text-red-500 mx-auto" strokeWidth={3} /> : <X className="h-5 w-5 text-slate-600 mx-auto" />
                       ) : (
                         <span className="text-red-500">{item.pro}</span>
                       )}
                     </td>
                     <td className="p-4 md:p-6 text-center text-sm font-bold bg-[#0A0A0B]/50">
                       {typeof item.premium === "boolean" ? (
                         item.premium ? <Check className="h-5 w-5 text-blue-400 mx-auto" strokeWidth={3} /> : <X className="h-5 w-5 text-slate-600 mx-auto" />
                       ) : (
                         <span className="text-blue-400">{item.premium}</span>
                       )}
                     </td>
                     <td className="p-4 md:p-6 text-center text-sm font-bold bg-[#0A0A0B]/50">
                        {typeof item.vip === "boolean" ? (
                         item.vip ? <Check className="h-5 w-5 text-amber-500 mx-auto" strokeWidth={3} /> : <X className="h-5 w-5 text-slate-600 mx-auto" />
                       ) : (
                         <span className="text-amber-500">{item.vip}</span>
                       )}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </motion.div>

        {/* FINAL CTA */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#0A0A0B] to-[#111114] border border-[#222226] border-t-red-600/30 rounded-3xl p-10 md:p-16 text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-red-600/5 blur-3xl rounded-full"></div>
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-white relative z-10 tracking-tight">
            Pare de perder dinheiro por <br className="hidden md:block" />
            <span className="text-red-500">falta de organização.</span>
          </h2>
          <p className="text-slate-400 font-medium mb-10 text-lg relative z-10 max-w-2xl mx-auto">
            Junte-se a centenas de logistas que transformaram suas operações com o Meu Lucro. Inicie sua jornada hoje.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">
             <button className="bg-white text-slate-900 px-8 py-4 rounded-xl font-black flex items-center gap-2 hover:bg-slate-200 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] w-full sm:w-auto justify-center">
               Quero Lucrar Mais <ArrowRight className="h-5 w-5" />
             </button>
             <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="bg-[#222226] text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-700 transition-colors w-full sm:w-auto justify-center">
               Ver planos novamente
             </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
