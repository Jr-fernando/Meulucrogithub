import { useState, useEffect } from "react";
import { collection, query, getDocs, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { ShieldCheck, CheckCircle, XCircle, Search, Edit2 } from "lucide-react";

export function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "users"));
      const snapshot = await getDocs(q);
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleApprove = async (userId: string, currentStatus: boolean | undefined) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        isApproved: !currentStatus
      });
      loadUsers(); // refresh
    } catch (error) {
      console.error("Error approving", error);
    }
  };

  const handleMakeAdmin = async (userId: string, currentAdminStatus: boolean | undefined) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        isAdmin: !currentAdminStatus,
        role: !currentAdminStatus ? 'admin' : 'user'
      });
      loadUsers();
    } catch (error) {
      console.error("Error setting admin", error);
    }
  };

  const handleSetPaid = async (userId: string, currentStatus: boolean | undefined) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        hasPaid: !currentStatus,
        subscriptionStatus: !currentStatus ? 'active' : 'inactive'
      });
      loadUsers();
    } catch (error) {
      console.error("Error changing payment status", error);
    }
  };

  const handleChangePlan = async (userId: string) => {
    const newPlan = prompt("Digite o novo plano (Pro, Premium, VIP):");
    if (!newPlan) return;
    try {
      await updateDoc(doc(db, "users", userId), {
        plan: newPlan
      });
      loadUsers();
    } catch (error) {
      console.error("Error changing plan", error);
    }
  };

  const filteredUsers = users.filter((u) => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-white p-8">Carregando usuários...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
             <ShieldCheck className="h-8 w-8 text-[var(--color-primary)]" />  
             Aprovação de Usuários
           </h1>
           <p className="text-slate-400 mt-2">Painel de gerenciamento do SaaS (Admin Only).</p>
        </div>
      </div>

      <div className="bg-[#111114] border border-[#222226] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#222226]">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar por email..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#1A1A1E] border border-[#2A2A2E] text-white pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs text-slate-500 uppercase bg-[#0A0A0B] border-b border-[#222226]">
              <tr>
                <th className="px-6 py-4 font-bold">Usuário (Email)</th>
                <th className="px-6 py-4 font-bold">Plano</th>
                <th className="px-6 py-4 font-bold">Pagamento</th>
                <th className="px-6 py-4 font-bold">Acesso Liberado</th>
                <th className="px-6 py-4 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-[#222226] hover:bg-[#1A1A1E] transition-colors">
                  <td className="px-6 py-4 font-medium flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-white shrink-0">
                       {(u.email?.[0] || 'U').toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-bold">{u.email}</div>
                      <div className="text-xs text-slate-500">ID: {u.id.slice(0, 8)}...</div>
                    </div>
                    {u.isAdmin && <span className="bg-red-500/20 text-red-500 text-[10px] px-2 py-0.5 rounded font-bold ml-2">ADMIN</span>}
                  </td>
                  <td className="px-6 py-4">
                     <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-1 rounded font-bold text-xs">{u.plan || 'Pro'}</span>
                  </td>
                  <td className="px-6 py-4">
                     {u.hasPaid ? (
                        <span className="text-emerald-500 font-bold flex items-center gap-1"><CheckCircle className="h-4 w-4"/> Confirmado</span>
                     ) : (
                        <span className="text-rose-500 font-bold flex items-center gap-1"><XCircle className="h-4 w-4"/> Pendente</span>
                     )}
                  </td>
                  <td className="px-6 py-4">
                     {u.isApproved ? (
                        <span className="text-emerald-500 font-bold flex items-center gap-1"><CheckCircle className="h-4 w-4"/> Aprovado</span>
                     ) : (
                        <span className="text-slate-500 font-bold flex items-center gap-1"><XCircle className="h-4 w-4"/> Bloqueado</span>
                     )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                     <button onClick={() => handleChangePlan(u.id)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors" title="Mudar Plano">
                        <Edit2 className="h-4 w-4" />
                     </button>
                     <button onClick={() => handleMakeAdmin(u.id, u.isAdmin)} className={`px-3 py-2 rounded-lg font-bold text-xs transition-colors ${u.isAdmin ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                        {u.isAdmin ? 'Remover Admin' : 'Make Admin'}
                     </button>
                     <button onClick={() => handleSetPaid(u.id, u.hasPaid)} className={`px-3 py-2 rounded-lg font-bold text-xs transition-colors ${u.hasPaid ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}`}>
                        {u.hasPaid ? 'Marcar Pendente' : 'Marcar Pago'}
                     </button>
                     <button onClick={() => handleApprove(u.id, u.isApproved)} className={`px-3 py-2 rounded-lg font-bold text-xs transition-colors ${u.isApproved ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20'}`}>
                        {u.isApproved ? 'Bloquear' : 'Aprovar'}
                     </button>
                  </td>
                </tr>
              ))}
              
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
