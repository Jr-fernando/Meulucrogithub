import React, { useState } from "react";
import { Globe, Copy, Store, Image as ImageIcon, ToggleLeft, ArrowRight, Share2, Check } from "lucide-react";
import { useBusiness } from "../contexts/BusinessContext";

export function CatalogPage() {
  const { currentBusiness } = useBusiness();
  const [copied, setCopied] = useState(false);
  const [useWhatsApp, setUseWhatsApp] = useState(true);

  const slug = currentBusiness?.name ? currentBusiness.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : "loja";
  const url = `vitrine.meulucro.app/${slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Catálogo Digital</h1>
          <p className="text-slate-400">Sua vitrine online 100% sincronizada com o estoque.</p>
        </div>
        <button onClick={handleCopy} className="bg-[var(--color-primary)] text-slate-900 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[var(--color-primary-dark)] transition-colors">
          <Share2 className="h-5 w-5" /> Compartilhar Link
        </button>
      </header>

      <div className="bg-[#111114] border border-[#222226] p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Seu Link Público</p>
          <a href={`https://${url}`} target="_blank" rel="noreferrer" className="text-xl font-black text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-2">
            {url} <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={handleCopy} className="bg-[#222226] hover:bg-[#2A2A2E] text-white p-3 rounded-xl transition-colors font-bold flex-1 flex justify-center items-center gap-2">
             {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copiado!" : "Copiar Link"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-[#111114] border border-[#222226] p-6 rounded-3xl">
             <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Store className="h-5 w-5 text-slate-400" /> Configuração da Vitrine</h3>
             <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-400 block mb-1">Nome da Loja</label>
                  <input type="text" readOnly value={currentBusiness?.name || "Minha Loja"} className="w-full bg-[#1A1A1E] border border-[#2A2A2E] text-white p-3 rounded-xl focus:border-[var(--color-primary)] outline-none" />
                </div>
                <div>
                 <label className="text-sm font-medium text-slate-400 block mb-1">Mensagem de Boas-vindas</label>
                 <textarea rows={2} defaultValue="Os melhores seminovos estão aqui! 🚚 Entrega via Motoboy." className="w-full bg-[#1A1A1E] border border-[#2A2A2E] text-white p-3 rounded-xl focus:border-[var(--color-primary)] outline-none resize-none" />
                </div>
                <div className="pt-2 flex items-center justify-between cursor-pointer" onClick={() => setUseWhatsApp(!useWhatsApp)}>
                  <div>
                    <p className="text-sm font-bold text-white">Receber Pedidos no WhatsApp</p>
                    <p className="text-xs text-slate-500">Ao clicar em comprar, vai pro seu zap.</p>
                  </div>
                  <div className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${useWhatsApp ? 'bg-[var(--color-primary)]' : 'bg-[#2A2A2E]'}`}>
                     <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${useWhatsApp ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </div>
             </div>
          </div>
        </div>

        <div className="bg-[#111114] border border-[#222226] p-4 rounded-3xl flex items-center justify-center min-h-[400px]">
          <div className="w-[300px] h-[550px] bg-black border-[8px] border-[#222226] rounded-[2.5rem] relative overflow-hidden shadow-2xl">
             {/* Mock de app mobile no frame */}
             <div className="bg-[#0A0A0B] h-full w-full">
               <div className="bg-[var(--color-primary)]/10 h-32 flex flex-col items-center justify-center p-4 text-center">
                  <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-lg mb-2"><ImageIcon className="h-5 w-5 text-slate-300" /></div>
                  <h3 className="text-white font-bold text-sm">{currentBusiness?.name || "Minha Loja"}</h3>
               </div>
               <div className="p-4 grid grid-cols-2 gap-2">
                 <div className="bg-[#111114] rounded-xl overflow-hidden shadow-sm">
                   <div className="h-24 bg-[#1A1A1E] m-1 rounded-lg" />
                   <div className="p-2">
                     <p className="text-[10px] text-white font-bold leading-tight">iPhone 14 Pro Max</p>
                     <p className="text-xs font-black text-[var(--color-primary)] mt-1">R$ 5.900</p>
                   </div>
                 </div>
                 <div className="bg-[#111114] rounded-xl overflow-hidden shadow-sm">
                   <div className="h-24 bg-[#1A1A1E] m-1 rounded-lg" />
                   <div className="p-2">
                     <p className="text-[10px] text-white font-bold leading-tight">MacBook Air M1</p>
                     <p className="text-xs font-black text-[var(--color-primary)] mt-1">R$ 4.200</p>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
