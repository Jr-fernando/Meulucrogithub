import React, { useState } from "react";
import { motion } from "motion/react";
import { Handshake, Copy, Gift, TrendingUp, Users, DollarSign, Download, Trophy, Clock, CheckCircle2, ChevronRight, BarChart3, AlertCircle } from "lucide-react";
import { useBusiness } from "../contexts/BusinessContext";
import { auth } from "../lib/firebase";
import { cn } from "../lib/utils";

export function PartnerPage() {
  const { currentBusiness } = useBusiness();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'withdraw'>('overview');

  const affiliateLink = auth.currentUser 
    ? `meulucro.app/s/${auth.currentUser.uid.slice(0, 8)}` 
    : "meulucro.app/s/loja";

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${affiliateLink}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const withdrawals = [
    { id: 'wd-1', date: '10/03/2026', amount: 450.00, status: 'completed' },
    { id: 'wd-2', date: '05/02/2026', amount: 120.00, status: 'completed' }
  ];

  const rankings = [
    { rank: 1, name: "IPhone King imports", refs: 42, rev: 1260 },
    { rank: 2, name: "Lucas Cell", refs: 28, rev: 840 },
    { rank: 3, name: "Gabriel Tech", refs: 15, rev: 450 },
    { rank: 4, name: "Sua Loja", refs: 0, rev: 0, isCurrent: true },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-10">
      <header className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-[var(--color-primary)]/10 p-2 rounded-xl">
             <Handshake className="h-5 w-5 text-[var(--color-primary)]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Programa de Sócios</h1>
        </div>
        <p className="text-slate-400 font-medium max-w-2xl text-sm md:text-base">
          Compartilhe o Meu Lucro e construa sua máquina de renda passiva. Você indica, a gente converte e te paga 30% de comissão recorrente todos os meses.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 bg-[#111114] p-1.5 rounded-2xl w-fit border border-[#222226]">
        {[
          { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
          { id: 'materials', label: 'Materiais de Divulgação', icon: Download },
          { id: 'withdraw', label: 'Saques (R$ 0,00)', icon: DollarSign }
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all",
              activeTab === t.id 
                ? "bg-[#222226] text-white shadow-sm" 
                : "text-slate-500 hover:text-slate-300 hover:bg-[#1A1A1E]"
            )}
          >
            <t.icon className="h-4 w-4" />
            <span className="hidden md:inline">{t.label}</span>
          </button>
        ))}
      </div>

      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="md:col-span-2 bg-gradient-to-br from-[#111114] to-[#0A0A0B] border border-[#222226] p-6 lg:p-8 rounded-[2rem] relative overflow-hidden group shadow-xl">
                <div className="absolute right-0 top-0 w-64 h-64 bg-[var(--color-primary)] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <h2 className="text-xl lg:text-3xl font-black text-white mb-2 tracking-tight">O seu Link de Sócio Exclusivo</h2>
                    <p className="text-slate-400 text-sm max-w-sm mb-6">
                      Basta enviar para um amigo logista e assim que ele assinar qualquer plano pago, a comissão já é sua.
                    </p>
                  </div>
                  
                  <div className="bg-[#050505] border border-[var(--color-primary)]/20 p-2 pl-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-inner">
                    <code className="text-[var(--color-primary)] font-mono font-bold select-all w-full md:w-auto truncate text-sm md:text-base">
                      {affiliateLink}
                    </code>
                    <button 
                      onClick={handleCopy}
                      className="w-full md:w-auto bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 text-[var(--color-primary)] px-6 py-3 rounded-xl font-black flex items-center justify-center gap-2 transition-colors border border-[var(--color-primary)]/20 shadow-[0_0_15px_rgba(0,223,100,0.1)] hover:shadow-[0_0_20px_rgba(0,223,100,0.2)]"
                    >
                      {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Link Copiado!" : "Copiar Link"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-b from-[#151519] to-[#111114] border border-[#2A2A2E] p-6 lg:p-8 rounded-[2rem] flex flex-col justify-between shadow-xl">
                <div>
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-emerald-500" />
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Taxa de Comissão Fixa</p>
                  <p className="text-5xl font-black text-white tracking-tighter mt-1">30%</p>
                  <p className="text-xs text-emerald-500 font-medium mt-2 bg-emerald-500/10 px-2 py-1 rounded w-fit">+ Ganhos Recorrentes Mensais</p>
                </div>
              </div>
            </div>

            {/* Dashboard Stats & Ranking */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:col-span-2">
                 <div className="bg-[#111114] border border-[#222226] p-6 rounded-3xl flex flex-col relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors blur-xl rounded-full"></div>
                   <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Ganhos Acumulados</p>
                   <p className="text-3xl font-black text-white">R$ 570,00</p>
                   <p className="text-xs text-slate-500 mt-2">Total recebido desde o início</p>
                 </div>
                 
                 <div className="bg-[#111114] border border-[#222226] p-6 rounded-3xl flex flex-col relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors blur-xl rounded-full"></div>
                   <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Pendente P/ Saque</p>
                   <p className="text-3xl font-black text-amber-500">R$ 0,00</p>
                   <p className="text-xs text-slate-500 mt-2">Saldo pronto para PIX</p>
                 </div>

                 <div className="bg-[#111114] border border-[#222226] p-6 rounded-3xl flex flex-col">
                   <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Cliques no Link</p>
                   <p className="text-3xl font-black text-white">0</p>
                   <p className="text-xs text-slate-500 mt-2">Visitantes nos últimos 30 dias</p>
                 </div>

                 <div className="bg-[#111114] border border-[#222226] p-6 rounded-3xl flex flex-col">
                   <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Conversões Ativas</p>
                   <p className="text-3xl font-black text-white">0</p>
                   <p className="text-xs text-slate-500 mt-2">Assinantes que você trouxe</p>
                 </div>
               </div>

               {/* Ranking */}
               <div className="bg-[#111114] border border-[#222226] rounded-3xl flex flex-col overflow-hidden">
                 <div className="p-5 border-b border-[#222226] flex items-center justify-between bg-[#151519]">
                   <h3 className="text-sm font-black text-white flex items-center gap-2">
                     <Trophy className="h-4 w-4 text-amber-500" />
                     Top Partners Globais
                   </h3>
                 </div>
                 <div className="p-3">
                   {rankings.map((r, i) => (
                     <div key={i} className={cn(
                       "flex items-center justify-between p-3 rounded-xl mb-1",
                       r.isCurrent ? "bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20" : "hover:bg-[#1A1A1E]"
                     )}>
                        <div className="flex items-center gap-3">
                           <div className={cn(
                             "w-6 h-6 rounded-full flex items-center justify-center text-xs font-black",
                             r.rank === 1 ? "bg-amber-500 text-black shadow-[0_0_10px_#f59e0b_inset]" : r.rank <= 3 ? "bg-slate-300 text-black" : "bg-[#222226] text-slate-400"
                           )}>
                             {r.rank}
                           </div>
                           <div className="flex flex-col">
                             <span className={cn("text-sm font-bold", r.isCurrent ? "text-[var(--color-primary)]" : "text-white")}>
                               {r.name} {r.isCurrent && "(Você)"}
                             </span>
                             <span className="text-[10px] text-slate-500">{r.refs} assinantes ativos</span>
                           </div>
                        </div>
                        <div className="text-right">
                          <span className={cn("text-xs font-black block", r.isCurrent ? "text-[var(--color-primary)]" : "text-emerald-500")}>
                            R$ {r.rev.toFixed(0)}/mês
                          </span>
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="space-y-6">
            <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-3xl flex items-start gap-4">
              <Gift className="h-6 w-6 text-blue-500 shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-bold mb-1">Kit de Expansão (Mídia)</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Baixe nossos pacotes de mídias prontos para WhatsApp, Instagram e Facebook. Já deixamos o copy e as imagens validadas com alta conversão. Basta colocar seu link.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { name: "Pack Instagram Stories", desc: "6 Imagens verticais com prova social e convite", size: "12 MB" },
                { name: "Copies para WhatsApp", desc: "Textos de alta persuasão prontos para disparo", size: "Arquivo TXT" },
                { name: "Banners Linkedin", desc: "Foco em B2B e donos de assistência técnica", size: "8 MB" },
                { name: "Logoteca Meu Lucro", desc: "Logos em alta resolução png e svg", size: "2 MB" }
              ].map((mat, i) => (
                <div key={i} className="bg-[#111114] border border-[#222226] p-6 rounded-3xl hover:border-[#3A3A3E] transition-colors group">
                  <div className="w-12 h-12 bg-[#1A1A1E] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[var(--color-primary)]/10 transition-colors">
                    <Download className="h-5 w-5 text-slate-400 group-hover:text-[var(--color-primary)] transition-colors" />
                  </div>
                  <h4 className="text-white font-bold mb-1">{mat.name}</h4>
                  <p className="text-xs text-slate-500 mb-4">{mat.desc}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[10px] font-bold text-slate-600 bg-[#1A1A1E] px-2 py-1 rounded">{mat.size}</span>
                    <button className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1">
                      Baixar Agora <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#111114] border border-[#222226] p-8 rounded-[2rem] shadow-xl">
                <h3 className="text-xl font-black text-white mb-2">Painel de Saques</h3>
                <p className="text-sm text-slate-400 mb-8">
                  Verifique seu saldo disponível e solicite saques diretamente para sua chave PIX. Pagamentos realizados em até 48 horas úteis.
                </p>

                <div className="bg-[#0A0A0B] border border-[#222226] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Liberado para Retirada</p>
                    <p className="text-4xl font-black text-white">R$ 0,00</p>
                  </div>
                  <button className="w-full md:w-auto bg-[#222226] text-slate-400 px-6 py-3 rounded-xl font-bold cursor-not-allowed flex items-center justify-center gap-2">
                    <DollarSign className="h-4 w-4" /> Solicitar PIX
                  </button>
                </div>
                
                <div className="flex items-center gap-2 text-xs font-medium text-amber-500 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  O valor mínimo para criar uma solicitação de saque é de R$ 100,00.
                </div>
              </div>

              {/* Histórico */}
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-widest mb-4 ml-1">Histórico de Transações</h4>
                <div className="bg-[#111114] border border-[#222226] rounded-3xl overflow-hidden">
                  {withdrawals.length > 0 ? withdrawals.map(w => (
                    <div key={w.id} className="flex items-center justify-between p-5 border-b border-[#222226] last:border-0 hover:bg-[#151519] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-500/10 p-2 rounded-xl">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Saque via PIX aprovado</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {w.date}
                          </p>
                        </div>
                      </div>
                      <p className="text-lg font-black text-white">R$ {w.amount.toFixed(2)}</p>
                    </div>
                  )) : (
                    <div className="p-8 text-center text-slate-500">Nenhum saque realizado ainda.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-b from-[#151519] to-[#111114] border border-[#222226] p-6 rounded-[2rem]">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[var(--color-primary)]" />
                  Regras de Comissionamento
                </h3>
                <ul className="space-y-4 text-sm text-slate-400">
                  <li className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 shrink-0" />
                    Você recebe 30% do valor pago pelo usuário todo mês em que ele estiver adimplente.
                  </li>
                  <li className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 shrink-0" />
                    Os cookies de rastreamento do link duram por 90 dias após o último clique.
                  </li>
                  <li className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 shrink-0" />
                    As contas ativadas são atreladas para sempre, enquanto durar o convênio da plataforma.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
