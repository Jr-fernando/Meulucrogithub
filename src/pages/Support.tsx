import React, { useState } from "react";
import { Headphones, MessageCircle, Mail, Book, ArrowRight, PlayCircle, Search, HelpCircle, PhoneCall, Sparkles } from "lucide-react";
import { useBusiness } from "../contexts/BusinessContext";
import { cn } from "../lib/utils";

export function SupportPage() {
  const { openUpgradeModal } = useBusiness();
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    { q: "Como adiciono um segundo comércio?", a: "Para assinantes Premium ou VIP, basta ir ao Menu Superior Mágico, clicar sobre o nome da sua loja e clicar em 'Adicionar Comércio'." },
    { q: "A exportação Excel funciona no celular?", a: "Sim, porém é necessário um plano Premium para liberar a exportação de dados DRE." },
    { q: "Onde vejo o ranqueamento de afiliados?", a: "Na página 'Programa de Sócios' existe uma aba visão geral separando o Top 10 e seus ganhos." }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
       <header className="mb-10 text-center pt-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--color-primary)]/10 blur-[100px] rounded-full pointer-events-none" />
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 relative z-10">Como podemos <span className="text-[var(--color-primary)]">ajudar?</span></h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto relative z-10 font-medium">Nossa equipe de Customer Success está pronta para resolver qualquer bucha. Sério, pode chamar.</p>
        
        <div className="max-w-2xl mx-auto mt-8 relative z-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Pesquise por tutoriais, erros ou dicas de vendas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111114] border border-[#222226] text-white pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:border-[var(--color-primary)] transition-colors text-base shadow-xl"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="md:col-span-2 bg-gradient-to-br from-[#151519] to-[#0A0A0B] border border-[#2A2A2E] p-8 rounded-[2rem] group hover:border-[var(--color-primary)]/30 transition-all flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
           <div className="flex-1 text-center md:text-left">
             <div className="inline-flex items-center gap-2 bg-[#222226] text-white px-3 py-1.5 rounded-xl font-bold text-xs mb-4">
               <PhoneCall className="h-4 w-4 text-[var(--color-primary)]" /> Atendimento Humano
             </div>
             <h3 className="text-3xl font-black text-white mb-2 tracking-tight">WhatsApp Instantâneo</h3>
             <p className="text-slate-400 mb-6 text-sm max-w-sm mx-auto md:mx-0">
               Nossos especialistas respondem em até 3 minutos no horário comercial. Exclusivo para gestão e dúvidas vitais.
             </p>
             <button onClick={() => openUpgradeModal('Suporte WhatsApp Prioritário', 'Premium')} className="bg-[var(--color-primary)] text-slate-900 font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(0,223,100,0.2)] mx-auto md:mx-0 hover:scale-105 transition-transform">
               Abrir Chat <ArrowRight className="h-4 w-4" />
             </button>
           </div>
           <div className="bg-[#111114] p-6 rounded-full shrink-0 border border-[#222226] shadow-2xl relative">
             <div className="absolute inset-0 bg-[var(--color-primary)] animate-pulse opacity-20 blur-xl rounded-full"></div>
             <MessageCircle className="h-20 w-20 text-[var(--color-primary)] relative z-10" />
           </div>
        </div>

        <div className="space-y-6 flex flex-col justify-between">
          <div className="bg-[#111114] border border-[#222226] p-6 rounded-[2rem] hover:bg-[#151519] transition-colors cursor-pointer flex items-center gap-4 group">
             <div className="bg-[#1A1A1E] p-3.5 rounded-xl group-hover:bg-blue-500/10 transition-colors"><Mail className="h-6 w-6 text-slate-400 group-hover:text-blue-500 transition-colors" /></div>
             <div>
               <h4 className="text-white font-bold text-lg">E-mail Especialista</h4>
               <p className="text-slate-500 text-sm">suporte@meulucro.app</p>
             </div>
          </div>
          
          <div className="bg-gradient-to-r from-indigo-500/10 to-transparent border border-indigo-500/20 p-6 rounded-[2rem] hover:bg-indigo-500/10 transition-colors cursor-pointer flex flex-col items-start gap-4 flex-1">
             <div className="bg-indigo-500/20 p-3 rounded-xl"><Sparkles className="h-6 w-6 text-indigo-400" /></div>
             <div>
               <h4 className="text-indigo-400 font-black text-lg flex items-center gap-2">Onboarding Inteligente</h4>
               <p className="text-slate-400 text-sm mt-1">Refaça seu tour guiado e ative atalhos ocultos adaptados para o seu perfil (Revenda vs Loja).</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
           <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
             <PlayCircle className="h-5 w-5 text-[var(--color-primary)]" /> Aulas Rápidas
           </h3>
           <div className="space-y-4">
             {[
               "Como cadastrar meu primeiro produto e configurar margem",
               "Lendo o Dashboard de Lucro Líquido sem ser contador",
               "Diferença entre PDV dinâmico e Pedidos Web para afiliados"
             ].map((vid, i) => (
               <div key={i} className="flex items-center gap-4 bg-[#111114] border border-[#222226] p-4 rounded-2xl hover:border-[#333336] cursor-pointer group transition-colors">
                  <div className="w-20 h-14 bg-[#1A1A1E] rounded-xl flex items-center justify-center shrink-0 border border-[#2A2A2E] group-hover:border-[var(--color-primary)]/50 transition-colors">
                    <PlayCircle className="h-6 w-6 text-slate-500 group-hover:text-[var(--color-primary)] transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm leading-tight group-hover:underline">{vid}</h4>
                    <p className="text-xs text-slate-500 mt-1">3 min • Básico</p>
                  </div>
               </div>
             ))}
           </div>
        </div>

        <div>
           <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
             <HelpCircle className="h-5 w-5 text-amber-500" /> Dúvidas Frequentes
           </h3>
           <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-[#111114] border border-[#222226] p-5 rounded-2xl hover:bg-[#151519] transition-colors cursor-pointer group">
                  <h4 className="text-white font-bold text-sm mb-2 group-hover:text-[var(--color-primary)] transition-colors">{faq.q}</h4>
                  <p className="text-sm text-slate-400">{faq.a}</p>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
