import React from "react";
import { UserCog, Plus, Shield, ShieldAlert, Edit2, Trash2 } from "lucide-react";
import { useBusiness } from "../contexts/BusinessContext";

export function UsersPage() {
  const { openUpgradeModal } = useBusiness();

  const users = [
    { name: "Você (Administrador)", email: "admin@loja.com", role: "admin", status: "active" },
    { name: "Vendedor 1", email: "vendas1@loja.com", role: "sales", status: "active" },
    { name: "Caixa Auxiliar", email: "caixa@loja.com", role: "cashier", status: "inactive" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Usuários & Equipe</h1>
          <p className="text-slate-400">Gerencie quem acessa o seu sistema e quais permissões eles possuem.</p>
        </div>
        <button onClick={openUpgradeModal} className="bg-[var(--color-primary)] text-slate-900 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[var(--color-primary-dark)] transition-colors">
          <Plus className="h-5 w-5" /> Convidar Membro
        </button>
      </header>

      <div className="bg-[#111114] border border-[#222226] rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#222226] bg-[#1A1A1E]">
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Usuário</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Acesso</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222226]">
              {users.map((u, i) => (
                <tr key={i} className="hover:bg-[#151519] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-[#222226] rounded-full flex items-center justify-center text-slate-300 font-bold uppercase">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {u.role === 'admin' ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg w-fit"><ShieldAlert className="h-3.5 w-3.5" /> Acesso Total (Admin)</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg w-fit"><Shield className="h-3.5 w-3.5" /> Limitado ({u.role})</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded ${u.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>
                      {u.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    {u.role !== 'admin' && (
                      <>
                        <button onClick={openUpgradeModal} className="p-2 text-slate-400 hover:text-white bg-[#222226] rounded-lg hover:bg-[#2A2A2E] transition-colors"><Edit2 className="h-4 w-4"/></button>
                        <button onClick={openUpgradeModal} className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 rounded-lg hover:bg-rose-500/20 transition-colors"><Trash2 className="h-4 w-4"/></button>
                      </>
                    )}
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
