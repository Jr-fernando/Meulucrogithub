import React from "react";
import { QrCode, Printer, CheckCircle, Tag } from "lucide-react";
import { useBusiness } from "../contexts/BusinessContext";

export function LabelsPage() {
  const { openUpgradeModal } = useBusiness();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Etiquetas Geniais</h1>
          <p className="text-slate-400">Gere e imprima etiquetas profissionais para gôndolas com QR Code.</p>
        </div>
        <button onClick={openUpgradeModal} className="bg-[var(--color-primary)] text-slate-900 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[var(--color-primary-dark)] transition-colors">
          <Printer className="h-5 w-5" /> Imprimir Selecionadas
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-[#111114] border border-[#222226] p-4 rounded-2xl">
            <h3 className="font-bold text-white mb-4">Configuração da Etiqueta</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Tamanho</label>
                <select className="w-full bg-[#1A1A1E] border border-[#2A2A2E] text-white rounded-xl p-2.5 outline-none">
                  <option>Padrão 3x5cm</option>
                  <option>Gôndola 4x7cm</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" defaultChecked className="rounded border-[#2A2A2E] bg-[#1A1A1E] text-[var(--color-primary)]" /> Imprimir Preço
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" defaultChecked className="rounded border-[#2A2A2E] bg-[#1A1A1E] text-[var(--color-primary)]" /> Incluir QR Code Pagamento
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" defaultChecked className="rounded border-[#2A2A2E] bg-[#1A1A1E] text-[var(--color-primary)]" /> Exibir Logo da Loja
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-3 bg-[#111114] border border-[#222226] rounded-3xl p-8 min-h-[500px] flex items-center justify-center">
            <div onClick={openUpgradeModal} className="w-64 h-32 bg-white rounded flex items-center shadow-xl relative cursor-pointer hover:ring-4 hover:ring-[var(--color-primary)] transition-all">
               <div className="absolute top-2 right-2"><CheckCircle className="h-5 w-5 text-[var(--color-primary)]" /></div>
               <div className="p-3 border-r border-gray-200 flex flex-col justify-center items-center gap-1 w-20 shrink-0">
                  <QrCode className="h-10 w-10 text-gray-800" />
                  <span className="text-[6px] text-gray-500 font-bold uppercase tracking-widest leading-tight">Pagar PIX</span>
               </div>
               <div className="p-3 flex-1">
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Meu Lucro Store</p>
                  <h4 className="text-sm font-black text-black leading-tight mb-2">iPhone 14 Pro Max 256GB - Vitrine</h4>
                  <p className="text-xl font-black text-gray-900 leading-none">R$ 5.900,00</p>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
}
