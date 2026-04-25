import React from "react";
import { motion } from "motion/react";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, ArrowRight, BarChart } from "lucide-react";
import { useBusiness } from "../contexts/BusinessContext";

export function InsightsPage() {
  const { openUpgradeModal } = useBusiness();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-[var(--color-primary)]" />
            Insights AI
          </h1>
          <p className="text-slate-400">Nossa inteligência artificial analisa seus dados para recomendar as melhores ações.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-[var(--color-primary)]/10 to-[#111114] border border-[var(--color-primary)]/20 p-6 rounded-3xl relative overflow-hidden group">
          <div className="flex items-start gap-4">
            <div className="bg-[var(--color-primary)]/20 p-3 rounded-xl">
              <TrendingUp className="h-6 w-6 text-[var(--color-primary)]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Aumente o preço do iPhone 13</h3>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                Notamos que o seu estoque de iPhone 13 está girando 40% mais rápido que a média da sua região. Recomendamos um ajuste de +5% no preço para maximizar a margem.
              </p>
              <button onClick={openUpgradeModal} className="text-[var(--color-primary)] font-bold text-sm flex items-center gap-1 hover:underline">
                Ajustar Preços Agora <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-rose-500/10 to-[#111114] border border-rose-500/20 p-6 rounded-3xl relative overflow-hidden group">
          <div className="flex items-start gap-4">
            <div className="bg-rose-500/20 p-3 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-rose-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Estoque Parado: Capas MagSafe</h3>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                Você tem 45 unidades paradas há mais de 60 dias. Sugerimos criar um combo promocional oferecendo as capas com 50% de desconto na compra de qualquer aparelho Vitrine.
              </p>
              <button onClick={openUpgradeModal} className="text-rose-400 font-bold text-sm flex items-center gap-1 hover:underline">
                Criar Promoção <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-blue-500/10 to-[#111114] border border-blue-500/20 p-6 rounded-3xl relative overflow-hidden group md:col-span-2">
          <div className="flex items-start gap-4">
            <div className="bg-blue-500/20 p-3 rounded-xl">
              <Lightbulb className="h-6 w-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">Resumo da Inteligência Competitiva</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-2xl leading-relaxed">
                Seu ticket médio subiu 12% este mês, impulsionado pela venda de linha Pro Max. No entanto, sua recompra de clientes antigos caiu. É hora de ativar seu funil de WhatsApp para clientes de mais de 6 meses oferecerendo upgrades.
              </p>
              
              <div className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl p-4 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <BarChart className="h-5 w-5 text-slate-500" />
                    <div>
                      <p className="text-sm font-bold text-white">Análise de Cohort</p>
                      <p className="text-xs text-slate-500">Veja o comportamento de retenção completo.</p>
                    </div>
                 </div>
                 <button onClick={openUpgradeModal} className="bg-[#222226] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#2A2A2E] transition-colors">
                   Ver Relatório
                 </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
