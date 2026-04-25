import React from "react";
import { motion } from "motion/react";
import { CreditCard, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useBusiness } from "../contexts/BusinessContext";

export function PaymentsPage() {
  const { openUpgradeModal } = useBusiness();

  const pending = [
    { customer: "João Silva", value: 450, due: "Hoje", status: "urgent", type: "Fiado" },
    { customer: "Maria Luiza", value: 1200, due: "Em 3 dias", status: "warning", type: "Boleto/Promissória" },
    { customer: "Carlos Eduardo", value: 150, due: "Em 5 dias", status: "normal", type: "Fiado" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Pagamentos Pendentes</h1>
        <p className="text-slate-400">Controle suas vendas a prazo, fiado e promissórias.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#111114] border border-[#222226] p-6 rounded-3xl">
          <p className="text-sm font-medium text-slate-400 mb-1">Total a Receber</p>
          <p className="text-3xl font-black text-white">R$ 1.800,00</p>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-3xl">
          <p className="text-sm font-bold text-rose-400 mb-1">Vencidos</p>
          <p className="text-3xl font-black text-rose-500">R$ 0,00</p>
        </div>
        <div className="bg-[#111114] border border-[#222226] p-6 rounded-3xl flex items-center justify-center">
          <button onClick={openUpgradeModal} className="bg-[#222226] hover:bg-[#2A2A2E] text-white w-full py-3 rounded-xl font-bold transition-colors">
            Registrar Nova Conta
          </button>
        </div>
      </div>

      <div className="bg-[#111114] border border-[#222226] rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-[#222226] flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-bold text-white">Boletos & Promissórias Abertas</h2>
        </div>
        <div className="divide-y divide-[#222226]">
          {pending.map((item, i) => (
            <div key={i} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#151519] transition-colors">
              <div>
                <p className="font-bold text-white text-lg">{item.customer}</p>
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> {item.type}
                </p>
              </div>
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between">
                <p className="text-xl font-black text-white">R$ {item.value}</p>
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                  item.status === 'urgent' ? 'bg-rose-500/10 text-rose-500' :
                  item.status === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                  'bg-[#222226] text-slate-400'
                }`}>
                  Vence: {item.due}
                </span>
              </div>
              <button onClick={openUpgradeModal} className="bg-[var(--color-primary)] text-slate-900 px-4 py-2 rounded-xl font-bold border-2 border-[var(--color-primary)] hover:bg-transparent hover:text-[var(--color-primary)] transition-colors w-full sm:w-auto mt-2 sm:mt-0 shadow-lg">
                Dar Baixa
              </button>
            </div>
          ))}
          {pending.length === 0 && (
            <div className="p-8 text-center text-slate-500 font-medium">
              Nenhum pagamento pendente.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
