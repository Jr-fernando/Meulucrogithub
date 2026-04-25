import React, { useState } from "react";
import { MessageSquare, Users, TrendingUp, HelpCircle, ArrowRight, Share2, Heart, MessageCircle, MoreHorizontal, Image as ImageIcon, Briefcase, Zap, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useBusiness } from "../contexts/BusinessContext";
import { auth } from "../lib/firebase";
import { cn } from "../lib/utils";

export function CommunityPage() {
  const { openUpgradeModal } = useBusiness();
  const [activeTab, setActiveTab] = useState<'feed' | 'groups' | 'opportunities'>('feed');

  const categories = ["Todos", "Dúvidas Técnicas", "Fornecedores", "Marketing", "Resultados"];

  const posts = [
    {
      id: 1,
      author: { name: "Marcos Silva", handle: "@marcos_imports", avatar: "M", plan: "PRO", color: "bg-blue-500" },
      content: "Alguém tem contato de um bom fornecedor de telas Originais China para a linha 13 e 14? Os que eu peguei ultimamente tão dando muito retorno.",
      category: "Fornecedores",
      time: "Há 45 min",
      likes: 12,
      comments: 8,
      liked: false
    },
    {
      id: 2,
      author: { name: "Loja Tech SC", handle: "@tech_sc", avatar: "L", plan: "VIP", color: "bg-amber-500" },
      content: "Batemos 50K de faturamento no primeiro mês usando as estratégias de anúncios focadas em trade-in! 🔥🍎 O segredo foi parar de brigar por preço e focar na avaliação rápida do usado do cliente.",
      category: "Resultados",
      time: "Há 2 horas",
      likes: 85,
      comments: 34,
      liked: true,
      image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 3,
      author: { name: "Tech Import", handle: "@tech_import_oficial", avatar: "T", plan: "PREMIUM", color: "bg-rose-500" },
      content: "Como vocês configuram os preços de seminovos? Eu uso a planilha do sistema, mas queria saber qual margem vocês costumam jogar em cima do grade A x grade B.",
      category: "Dúvidas Técnicas",
      time: "Há 5 horas",
      likes: 5,
      comments: 14,
      liked: false
    }
  ];

  const groups = [
    { name: "Apple Imports SUL", members: 124, icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "Eletrônicos & Acessórios", members: 342, icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
    { name: "Fórum de Assistências Técnicas", members: 56, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" }
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 pb-10">
      
      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        <header className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[var(--color-primary)]/10 p-2 rounded-xl border border-[var(--color-primary)]/20 shadow-[0_0_15px_rgba(0,223,100,0.15)]">
               <Users className="h-6 w-6 text-[var(--color-primary)]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Comunidade PRO</h1>
          </div>
          <p className="text-slate-400 font-medium max-w-2xl text-sm md:text-base">
            O hub de inteligência e networking para quem respira tecnologia. Fóruns de alto nível, parcerias B2B e resultados exponenciais.
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-2 bg-[#111114] p-1.5 rounded-2xl w-fit border border-[#222226]">
          {[
            { id: 'feed', label: 'Feed & Fórum' },
            { id: 'groups', label: 'Meus Grupos' },
            { id: 'opportunities', label: 'Parcerias (B2B)' }
          ].map(t => (
            <button 
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
                activeTab === t.id 
                  ? "bg-[#222226] text-white shadow-sm" 
                  : "text-slate-500 hover:text-slate-300 hover:bg-[#1A1A1E]"
              )}
            >
              <span className="hidden md:inline">{t.label}</span>
              <span className="md:hidden">{t.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {activeTab === 'feed' && (
          <div className="space-y-6">
            
            {/* Create Post Input */}
            <div className="bg-[#111114] border border-[#222226] p-4 rounded-3xl flex gap-4 items-start shadow-xl focus-within:border-[var(--color-primary)]/50 transition-colors">
               <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center font-bold text-white shrink-0">
                  {auth.currentUser?.displayName?.[0]?.toUpperCase() || 'U'}
               </div>
               <div className="flex-1">
                 <textarea 
                   placeholder="Qual a boa hoje? Compartilhe um resultado, dúvida ou novidade..."
                   className="w-full bg-transparent text-white placeholder-slate-500 resize-none outline-none min-h-[60px] text-sm md:text-base"
                 />
                 <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#222226]">
                    <div className="flex gap-2">
                      <button className="p-2 text-slate-500 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-xl transition-colors"><ImageIcon className="h-4 w-4" /></button>
                      <button className="p-2 text-slate-500 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-xl transition-colors"><MessageSquare className="h-4 w-4" /></button>
                    </div>
                    <button onClick={openUpgradeModal} className="bg-[var(--color-primary)] text-slate-900 font-bold px-5 py-2 rounded-xl text-sm hover:bg-[var(--color-primary-dark)] transition-colors shadow-lg">
                      Publicar
                    </button>
                 </div>
               </div>
            </div>

            {/* Categories Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat, i) => (
                <button key={i} className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors",
                  i === 0 ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20" : "bg-[#1A1A1E] text-slate-400 border border-[#2A2A2E] hover:bg-[#222226] hover:text-white"
                )}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Posts Feed */}
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-[#111114] border border-[#222226] p-5 rounded-3xl shadow-sm hover:border-[#333336] transition-colors">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-black text-white shrink-0 shadow-inner", post.author.color)}>
                        {post.author.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm hover:underline cursor-pointer">{post.author.name}</span>
                          <span className={cn(
                            "text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md",
                            post.author.plan === 'VIP' ? "bg-amber-500/20 text-amber-500 border border-amber-500/20" : 
                            post.author.plan === 'PREMIUM' ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                          )}>
                            {post.author.plan}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                          {post.author.handle} • {post.time}
                        </div>
                      </div>
                    </div>
                    <button className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-[#222226]"><MoreHorizontal className="h-4 w-4" /></button>
                  </div>

                  {/* Post Content */}
                  <div className="pl-[52px]">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-[#1A1A1E] border border-[#2A2A2E] text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      {post.category}
                    </span>
                    <p className="text-slate-300 text-sm leading-relaxed mb-4">{post.content}</p>
                    
                    {post.image && (
                      <div className="rounded-2xl overflow-hidden border border-[#222226] mb-4 max-h-[300px] bg-[#0A0A0B]">
                        <img src={post.image} alt="Op" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}

                    {/* Post Actions */}
                    <div className="flex items-center gap-6 mt-4">
                      <button className={cn("flex items-center gap-1.5 text-xs font-bold transition-colors group", post.liked ? "text-rose-500" : "text-slate-500 hover:text-rose-500")}>
                        <div className={cn("p-1.5 rounded-lg group-hover:bg-rose-500/10 transition-colors", post.liked && "bg-rose-500/10")}>
                          <Heart className={cn("h-4 w-4", post.liked && "fill-rose-500 text-rose-500")} />
                        </div>
                        {post.likes}
                      </button>
                      <button onClick={openUpgradeModal} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-500 transition-colors group">
                        <div className="p-1.5 rounded-lg group-hover:bg-blue-500/10 transition-colors">
                          <MessageCircle className="h-4 w-4" />
                        </div>
                        {post.comments} Discussões
                      </button>
                      <button className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[var(--color-primary)] transition-colors group ml-auto">
                        <div className="p-1.5 rounded-lg group-hover:bg-[var(--color-primary)]/10 transition-colors">
                          <Share2 className="h-4 w-4" />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Right Sidebar (Desktop only) */}
      <div className="hidden lg:flex flex-col w-[320px] shrink-0 space-y-6">
        
        {/* VIP Invite */}
        <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/20 blur-2xl rounded-full"></div>
          <Star className="h-6 w-6 text-amber-500 mb-3" />
          <h3 className="text-white font-black text-lg mb-2">Comunidade VIP Elite</h3>
          <p className="text-sm text-slate-400 mb-4 leading-relaxed">
            Tenha acesso ao grupo exclusivo no WhatsApp apenas com lojistas verificados (+ R$100K/mês).
          </p>
          <button onClick={openUpgradeModal} className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 py-2.5 rounded-xl text-sm font-bold transition-colors">
            Solicitar Acesso (VIP)
          </button>
        </div>

        {/* Niche Groups Widget */}
        <div className="bg-[#111114] border border-[#222226] rounded-3xl p-6">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Grupos em Destaque</h3>
          <div className="space-y-4">
            {groups.map((g, i) => (
              <div key={i} className="flex items-center gap-3 cursor-pointer group">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-transparent group-hover:border-current transition-colors", g.bg, g.color)}>
                  <g.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:underline">{g.name}</h4>
                  <p className="text-xs text-slate-500">{g.members} membros</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={openUpgradeModal} className="w-full mt-5 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">
            Ver Todos os Fóruns &rarr;
          </button>
        </div>

      </div>
    </div>
  );
}
