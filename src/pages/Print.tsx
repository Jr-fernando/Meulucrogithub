import React from "react";
import { Printer, FileText, Search, Download } from "lucide-react";
import { useBusiness } from "../contexts/BusinessContext";

export function PrintPage() {
  const { openUpgradeModal } = useBusiness();

  const prints = [
    { type: "Recibo Térmica 80mm", target: "Venda #1023", date: "Hoje, 10:45" },
    { type: "Garantia A4", target: "Carlos Silva", date: "Ontem, 16:20" },
    { type: "Romaneio de Entrega", target: "Motoboy João", date: "Segunda, 09:00" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="mb-8">
         <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Impressões Rápidas</h1>
         <p className="text-slate-400">Central de reemissão de recibos, termos de garantia e notas de serviço.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Buscar por ID da Venda ou Cliente..."
            className="w-full bg-[#111114] border border-[#222226] text-white pl-12 pr-4 py-3 rounded-2xl focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
        </div>
      </div>

      <div className="bg-[#111114] border border-[#222226] rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#222226] bg-[#1A1A1E]">
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Documento</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Referência</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Data</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222226]">
              {prints.map((p, i) => (
                <tr key={i} className="hover:bg-[#151519] transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                       <FileText className="h-5 w-5 text-slate-500 group-hover:text-[var(--color-primary)] transition-colors" />
                       <span className="font-bold text-white">{p.type}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-300 font-medium">{p.target}</td>
                  <td className="p-4 text-slate-400 text-sm">{p.date}</td>
                  <td className="p-4 flex justify-end gap-2">
                    <button onClick={openUpgradeModal} className="bg-[#222226] hover:bg-[#2A2A2E] text-white font-bold p-2.5 rounded-xl transition-colors shrink-0">
                       <Download className="h-4 w-4" />
                    </button>
                    <button onClick={openUpgradeModal} className="bg-[var(--color-primary)] text-slate-900 font-bold p-2.5 rounded-xl flex items-center justify-center transition-colors shadow-lg hover:bg-[var(--color-primary-dark)] shrink-0">
                       <Printer className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}
