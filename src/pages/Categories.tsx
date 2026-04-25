import React from "react";
import { Folder, Plus, Edit2, Trash2 } from "lucide-react";
import { useBusiness } from "../contexts/BusinessContext";

export function CategoriesPage() {
  const { openUpgradeModal } = useBusiness();

  const categories = [
    { name: "Smartphones", count: 24 },
    { name: "Capinhas", count: 120 },
    { name: "Películas", count: 350 },
    { name: "Carregadores", count: 45 },
    { name: "Fones de Ouvido", count: 18 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Categorias</h1>
          <p className="text-slate-400">Organize seu estoque por departamentos estruturados.</p>
        </div>
        <button onClick={openUpgradeModal} className="bg-[var(--color-primary)] text-slate-900 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[var(--color-primary-dark)] transition-colors">
          <Plus className="h-5 w-5" /> Nova Categoria
        </button>
      </header>

      <div className="bg-[#111114] border border-[#222226] rounded-3xl overflow-hidden">
        <ul className="divide-y divide-[#222226]">
          {categories.map((cat, i) => (
            <li key={i} className="p-5 flex items-center justify-between hover:bg-[#1A1A1E] transition-colors group">
              <div className="flex items-center gap-4">
                <div className="bg-[#222226] p-3 rounded-xl text-slate-400 group-hover:text-[var(--color-primary)] group-hover:bg-[var(--color-primary)]/10 transition-colors">
                  <Folder className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-white text-lg">{cat.name}</p>
                  <p className="text-xs text-slate-500 font-medium">{cat.count} produtos vinculados</p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={openUpgradeModal} className="p-2 text-slate-400 hover:text-white bg-[#222226] rounded-lg hover:bg-[#2A2A2E] transition-colors"><Edit2 className="h-4 w-4"/></button>
                <button onClick={openUpgradeModal} className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 rounded-lg hover:bg-rose-500/20 transition-colors"><Trash2 className="h-4 w-4"/></button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
