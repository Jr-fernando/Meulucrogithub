import React, { useState, useEffect } from "react";
import { Settings, Save, Shield, SlidersHorizontal, Moon, Sun, Bell, Database, FileSpreadsheet, Lock } from "lucide-react";
import { useBusiness } from "../contexts/BusinessContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { cn } from "../lib/utils";

export function SettingsPage() {
  const { currentBusiness, openUpgradeModal } = useBusiness();
  const [activeTab, setActiveTab] = useState('geral');
  const [formData, setFormData] = useState({
    name: "",
    document: "",
    address: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentBusiness) {
      setFormData({
        name: currentBusiness.name || "",
        document: currentBusiness.document || "",
        address: currentBusiness.address || ""
      });
    }
  }, [currentBusiness]);

  const handleSave = async () => {
    if (!currentBusiness?.id) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "businesses", currentBusiness.id), {
        name: formData.name,
        document: formData.document,
        address: formData.address,
      });
      alert("Configurações salvas com sucesso!");
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'geral', label: 'Geral', icon: Settings },
    { id: 'seguranca', label: 'Segurança & Backup', icon: Shield },
    { id: 'aparência', label: 'Aparência', icon: Moon },
    { id: 'notificacoes', label: 'Notificações Push', icon: Bell },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Configurações</h1>
          <p className="text-slate-400">Ajuste o comportamento do sistema, backups e sua conta.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[var(--color-primary)] text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50 shadow-[0_0_20px_rgba(0,223,100,0.2)]"
        >
          <Save className="h-5 w-5" /> {isSaving ? "Salvando..." : "Salvar Alterações"}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 hidden lg:block">
           <ul className="space-y-2 sticky top-6">
             {tabs.map((tab) => (
               <li 
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={cn(
                   "font-bold p-3.5 rounded-2xl flex items-center gap-3 cursor-pointer transition-all",
                   activeTab === tab.id 
                     ? "bg-[#1A1A1E] text-white border border-[#2A2A2E]" 
                     : "text-slate-400 hover:bg-[#151519] hover:text-white border border-transparent"
                 )}
               >
                 <tab.icon className="h-4 w-4" /> {tab.label}
               </li>
             ))}
           </ul>
        </div>
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'geral' && (
            <div className="bg-[#111114] border border-[#222226] p-8 rounded-[2rem] shadow-xl">
               <h3 className="text-xl font-black text-white mb-6 border-b border-[#222226] pb-4">Dados da Empresa</h3>
               <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">Nome Fantasia</label>
                     <input 
                       type="text" 
                       value={formData.name} 
                       onChange={(e) => setFormData({...formData, name: e.target.value})}
                       className="w-full bg-[#1A1A1E] border border-[#2A2A2E] text-white p-3.5 rounded-xl outline-none focus:border-[var(--color-primary)] transition-colors font-medium" 
                     />
                   </div>
                   <div>
                     <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">CNPJ / CPF</label>
                     <input 
                       type="text" 
                       value={formData.document}
                       onChange={(e) => setFormData({...formData, document: e.target.value})}
                       className="w-full bg-[#1A1A1E] border border-[#2A2A2E] text-white p-3.5 rounded-xl outline-none focus:border-[var(--color-primary)] transition-colors font-medium" 
                     />
                   </div>
                 </div>
                 <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">Endereço Completo (Sai no Recibo/PDF)</label>
                    <input 
                      type="text" 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full bg-[#1A1A1E] border border-[#2A2A2E] text-white p-3.5 rounded-xl outline-none focus:border-[var(--color-primary)] transition-colors font-medium" 
                    />
                 </div>
               </div>

               <h3 className="text-xl font-black text-white mt-12 mb-6 border-b border-[#222226] pb-4">Exportação de Dados</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="bg-[#151519] border border-[#2A2A2E] p-4 rounded-2xl flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                     <span className="font-bold text-white text-sm">Exportar P/ Excel</span>
                   </div>
                   <button onClick={() => openUpgradeModal('Exportação de Dados', 'Premium')} className="bg-[#222226] text-xs font-bold text-slate-300 px-3 py-1.5 rounded-lg hover:bg-[#2A2A2E] transition-colors flex items-center gap-1">
                     <Lock className="h-3 w-3 text-[var(--color-primary)]" /> PRO
                   </button>
                 </div>
                 <div className="bg-[#151519] border border-[#2A2A2E] p-4 rounded-2xl flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <FileSpreadsheet className="h-5 w-5 text-rose-500" />
                     <span className="font-bold text-white text-sm">Exportar P/ PDF</span>
                   </div>
                   <button onClick={() => openUpgradeModal('Exportação de Dados', 'Premium')} className="bg-[#222226] text-xs font-bold text-slate-300 px-3 py-1.5 rounded-lg hover:bg-[#2A2A2E] transition-colors flex items-center gap-1">
                     <Lock className="h-3 w-3 text-[var(--color-primary)]" /> PRO
                   </button>
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'seguranca' && (
            <div className="bg-[#111114] border border-[#222226] p-8 rounded-[2rem] shadow-xl">
               <h3 className="text-xl font-black text-white mb-6 border-b border-[#222226] pb-4">Segurança & Conformidade</h3>
               <div className="space-y-6">
                 <div className="flex items-start justify-between bg-[#151519] p-5 rounded-2xl border border-[#2A2A2E] group">
                   <div>
                     <p className="font-bold text-white mb-1 flex items-center gap-2"><Database className="h-4 w-4 text-[var(--color-primary)]" /> Backup Automático Cloud</p>
                     <p className="text-sm text-slate-400 max-w-sm">
                       Salva um clone de todo seu inventário e vendas no seu Google Drive diariamente.
                     </p>
                   </div>
                   <button onClick={() => openUpgradeModal('Backup Inteligente', 'VIP')} className="w-12 h-6 bg-[#222226] rounded-full flex items-center justify-start px-1 cursor-pointer relative transition-colors group-hover:bg-[#2A2A2E]">
                     <div className="bg-slate-500 w-4 h-4 rounded-full flex items-center justify-center">
                        <Lock className="h-2 w-2 text-white" />
                     </div>
                   </button>
                 </div>
                 <div className="flex items-start justify-between bg-[#151519] p-5 rounded-2xl border border-[#2A2A2E]">
                   <div>
                     <p className="font-bold text-white mb-1 flex items-center gap-2"><Shield className="h-4 w-4 text-emerald-500" /> Sessões Ativas</p>
                     <p className="text-sm text-slate-400 max-w-sm">
                       Desconecte sua conta de outros dispositivos logados.
                     </p>
                   </div>
                   <button className="bg-rose-500/10 text-rose-500 font-bold text-xs px-4 py-2 rounded-xl border border-rose-500/20 hover:bg-rose-500/20 transition-colors">
                     Deslogar Todos
                   </button>
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'aparência' && (
            <div className="bg-[#111114] border border-[#222226] p-8 rounded-[2rem] shadow-xl">
               <h3 className="text-xl font-black text-white mb-6 border-b border-[#222226] pb-4">Personalização Visual</h3>
               <div className="space-y-6">
                 <div>
                   <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-3">Tema do Sistema</label>
                   <div className="grid grid-cols-2 gap-4">
                     <button className="bg-[var(--color-primary)]/10 border-2 border-[var(--color-primary)] p-4 rounded-2xl flex flex-col items-center gap-2 transition-colors">
                       <Moon className="h-6 w-6 text-[var(--color-primary)]" />
                       <span className="font-bold text-white text-sm">Modo Escuro</span>
                     </button>
                     <button onClick={() => openUpgradeModal('Temas Premium', 'Premium')} className="bg-[#151519] border border-[#2A2A2E] hover:border-[#333336] p-4 rounded-2xl flex flex-col items-center gap-2 transition-colors group relative overflow-hidden">
                       <Sun className="h-6 w-6 text-slate-400 group-hover:text-amber-500 transition-colors" />
                       <span className="font-bold text-slate-400 group-hover:text-amber-500 transition-colors text-sm">Modo Claro</span>
                       <div className="absolute top-2 right-2 bg-amber-500/10 text-amber-500 p-1 rounded-md">
                         <Lock className="h-3 w-3" />
                       </div>
                     </button>
                   </div>
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'notificacoes' && (
            <div className="bg-[#111114] border border-[#222226] p-8 rounded-[2rem] shadow-xl">
               <h3 className="text-xl font-black text-white mb-6 border-b border-[#222226] pb-4">Notificações Inteligentes</h3>
               <div className="space-y-4">
                  {[
                    { label: "Alertas de Estoque Parado", desc: "Seja avisado quando um produto passar de 30 dias na prateleira.", pro: true },
                    { label: "Bater Meta Diária", desc: "Receba mensagens de ânimo e confetes no celular.", pro: false },
                    { label: "Fórum e Comunidade", desc: "Quando alguém responder seu tópico na Comunidade PRO.", pro: false },
                    { label: "Solicitação de Orçamentos", desc: "Quando um cliente B2B enviar mensagem no seu produto.", pro: true }
                  ].map((n, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#151519] p-4 rounded-2xl border border-[#2A2A2E]">
                      <div>
                        <p className="font-bold text-white text-sm flex items-center gap-2">
                          {n.label} {n.pro && <span className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[9px] px-1.5 py-0.5 rounded font-black uppercase">Plus</span>}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{n.desc}</p>
                      </div>
                      {n.pro ? (
                        <button onClick={() => openUpgradeModal('Notificações de Gestão', 'Premium')} className="bg-[#222226] p-1.5 rounded-lg text-slate-500 hover:text-[var(--color-primary)] hover:bg-[#2A2A2E] transition-colors">
                          <Lock className="h-4 w-4" />
                        </button>
                      ) : (
                        <div className="bg-[var(--color-primary)] rounded-full w-10 h-5 flex items-center justify-end px-1 cursor-pointer">
                          <div className="bg-black w-3.5 h-3.5 rounded-full" />
                        </div>
                      )}
                    </div>
                  ))}
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
