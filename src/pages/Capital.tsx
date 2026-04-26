import React, { useState, useEffect } from "react";
import { collection, query, where, addDoc, onSnapshot, serverTimestamp, doc, deleteDoc } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { TrendingUp, TrendingDown, ArrowRight, ArrowLeft, ArrowDownRight, ArrowUpRight, DollarSign, Wallet, Plus, X, Search, Filter, Trash2 } from "lucide-react";
import { cn } from "../lib/utils";
import { motion } from "motion/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useBusiness } from "../contexts/BusinessContext";

interface Transaction {
  id: string;
  type: 'in' | 'out'; // in = aporte/venda, out = retirada/compra
  category: 'aporte' | 'retirada' | 'venda' | 'compra' | 'despesa';
  amount: number;
  description: string;
  date: any; // Firestore timestamp
  businessId?: string | null;
}

export function CapitalPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [transactionType, setTransactionType] = useState<'in' | 'out'>('in');
  const { currentBusiness } = useBusiness();
  
  const [formData, setFormData] = useState({
    amount: "", category: "aporte", description: ""
  });

  useEffect(() => {
    if (!auth.currentUser) return;
    
    // In a real app we might combine 'sales' collection data with custom 'transactions' (aportes)
    // For simplicity, we are combining it into a 'capital_transactions' collection.
    const q = query(collection(db, "capital_transactions"), where("uid", "==", auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data: Transaction[] = [];
      snapshot.forEach(docSnap => {
        data.push({ id: docSnap.id, ...docSnap.data() } as Transaction);
      });
      // Soft filter to business context
      if (currentBusiness) {
        data = data.filter(d => d.businessId === currentBusiness.id || !d.businessId);
      }
      data.sort((a, b) => b.date?.seconds - a.date?.seconds);
      setTransactions(data);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "capital_transactions");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentBusiness?.id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      await addDoc(collection(db, "capital_transactions"), {
        uid: auth.currentUser.uid,
        businessId: currentBusiness?.id || null, // Attach to current business context
        type: transactionType,
        category: formData.category,
        amount: Number(formData.amount),
        description: formData.description,
        date: serverTimestamp()
      });
      setIsModalOpen(false);
      setFormData({ amount: "", category: transactionType === 'in' ? 'aporte' : 'retirada', description: "" });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "capital_transactions");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta transação?")) return;
    try {
      await deleteDoc(doc(db, "capital_transactions", id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `capital_transactions/${id}`);
    }
  };

  const openModal = (type: 'in' | 'out') => {
    setTransactionType(type);
    setFormData({ amount: "", category: type === 'in' ? 'aporte' : 'retirada', description: "" });
    setIsModalOpen(true);
  };

  const filteredData = transactions.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalIn = transactions.filter(t => t.type === 'in').reduce((acc, t) => acc + t.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'out').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIn - totalOut;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'aporte': return 'text-emerald-500 bg-emerald-500/10';
      case 'venda': return 'text-[var(--color-primary)] bg-[var(--color-primary)]/10';
      case 'retirada': return 'text-amber-500 bg-amber-500/10';
      case 'compra': return 'text-blue-500 bg-blue-500/10';
      case 'despesa': return 'text-rose-500 bg-rose-500/10';
      default: return 'text-slate-400 bg-slate-800';
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <div className="space-y-6 h-full flex flex-col relative w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Meu Capital</h1>
          <p className="text-slate-400 text-sm mt-0.5">Fluxo de caixa, aportes e saúde financeira.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => openModal('out')} className="bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all border border-rose-500/20 flex items-center justify-center gap-2">
               <ArrowLeft className="h-4 w-4" /> Saída
            </button>
            <button onClick={() => openModal('in')} className="bg-[var(--color-primary)] text-slate-900 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(0,223,100,0.2)] hover:shadow-[0_0_25px_rgba(0,223,100,0.3)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
              <ArrowRight className="h-4 w-4" /> Entrada
            </button>
        </div>
      </div>

      <motion.div variants={containerVariants} initial="show" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Saldo Atual */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#111114] to-[#1a1f1c] border border-[var(--color-primary)]/30 rounded-3xl p-6 relative overflow-hidden group shadow-[0_4px_30px_rgba(0,223,100,0.05)]">
           <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 opacity-5">
              <Wallet className="h-32 w-32 text-[var(--color-primary)]" />
           </div>
           <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-bold relative z-10">Saldo em Caixa</p>
           <p className="font-black text-3xl sm:text-4xl text-[var(--color-primary)] relative z-10">R$ {balance.toFixed(2).replace('.', ',')}</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 md:col-span-2">
           <motion.div variants={itemVariants} className="bg-[#111114] border border-[#222226] rounded-3xl p-5 flex flex-col justify-center gap-2 group hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-500/10 p-1.5 rounded-lg"><ArrowUpRight className="h-4 w-4 text-emerald-500" /></div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Total Entradas</p>
              </div>
              <p className="font-black text-2xl text-slate-100">R$ {totalIn.toFixed(2).replace('.', ',')}</p>
           </motion.div>

           <motion.div variants={itemVariants} className="bg-[#111114] border border-[#222226] rounded-3xl p-5 flex flex-col justify-center gap-2 group hover:border-rose-500/30 transition-colors">
              <div className="flex items-center gap-2">
                <div className="bg-rose-500/10 p-1.5 rounded-lg"><ArrowDownRight className="h-4 w-4 text-rose-500" /></div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Total Saídas</p>
              </div>
              <p className="font-black text-2xl text-slate-100">R$ {totalOut.toFixed(2).replace('.', ',')}</p>
           </motion.div>
        </div>
      </motion.div>

      <div className="bg-[#111114] border border-[#222226] rounded-3xl flex-1 flex flex-col overflow-hidden">
         <div className="p-4 border-b border-[#222226] flex gap-3">
             <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input type="text" placeholder="Buscar operação..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#222226] text-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-slate-600" />
             </div>
         </div>

         <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
            {isLoading ? (
               <div className="flex justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" /></div>
            ) : filteredData.length === 0 ? (
               <div className="flex flex-col items-center justify-center p-12 text-center h-64">
                  <div className="h-16 w-16 bg-[#222226] rounded-full flex items-center justify-center mb-4 text-slate-500">
                     <Wallet className="h-8 w-8" />
                  </div>
                  <p className="text-slate-200 font-bold text-lg">Caixa Vazio</p>
                  <p className="text-slate-500 text-sm mt-1 max-w-sm mb-6">Registre seu capital inicial (Aporte) ou suas primeiras receitas e despesas.</p>
               </div>
            ) : (
               <div className="divide-y divide-[#222226]">
                  {filteredData.map(tx => (
                     <div key={tx.id} className="p-4 sm:px-6 hover:bg-[#222226]/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                        <div className="flex items-start sm:items-center gap-4">
                           <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0", tx.type === 'in' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500')}>
                              {tx.type === 'in' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                           </div>
                           <div>
                              <p className="font-bold text-slate-200 text-sm md:text-base capitalize">{tx.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                 <span className={cn("px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest", getCategoryColor(tx.category))}>{tx.category}</span>
                                 <span className="text-xs text-slate-500">• {tx.date ? format(tx.date.toDate(), "dd/MM/yyyy 'às' HH:mm") : '...'}</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-4 self-end sm:self-auto">
                           <p className={cn("text-lg font-black", tx.type === 'in' ? 'text-emerald-500' : 'text-slate-200')}>
                              {tx.type === 'in' ? '+' : '-'} R$ {tx.amount.toFixed(2).replace('.', ',')}
                           </p>
                           <button onClick={() => handleDelete(tx.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-all">
                              <Trash2 className="h-4 w-4" />
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>

      {/* Modal Nova Transação */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in transition-all">
          <div className="bg-[#111114] border border-[#222226] rounded-3xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-[#222226] flex items-center justify-between">
              <h2 className="font-extrabold text-xl text-slate-100 flex items-center gap-2">
                {transactionType === 'in' ? (
                   <><ArrowUpRight className="h-5 w-5 text-emerald-500" /> Nova Entrada</>
                ) : (
                   <><ArrowDownRight className="h-5 w-5 text-rose-500" /> Nova Saída</>
                )}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-300 p-2 rounded-xl hover:bg-[#222226] transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <form id="txForm" onSubmit={handleCreate} className="space-y-4">
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Valor (R$)</label>
                    <input required type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className={cn("w-full bg-[#0A0A0B] border border-[#222226] rounded-xl px-4 py-4 text-xl font-black focus:outline-none transition-colors", transactionType === 'in' ? "text-emerald-500 focus:border-emerald-500" : "text-rose-500 focus:border-rose-500")} placeholder="0,00" />
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Categoria</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})} className="w-full bg-[#0A0A0B] border border-[#222226] text-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors appearance-none">
                       {transactionType === 'in' ? (
                          <>
                             <option value="aporte">Aporte (Investimento)</option>
                             <option value="venda">Venda Avulsa</option>
                          </>
                       ) : (
                          <>
                             <option value="despesa">Despesa (Geral)</option>
                             <option value="retirada">Retirada / Lucro</option>
                             <option value="compra">Compra de Estoque (Avulsa)</option>
                          </>
                       )}
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Descrição Curta</label>
                    <input required type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#222226] text-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors" placeholder={transactionType === 'in' ? 'Ex: Coloquei dinhero...' : 'Ex: Gasolina, Aluguel...'} />
                 </div>
              </form>
            </div>
            <div className="p-5 border-t border-[#222226] bg-[#0A0A0B] flex justify-end gap-3 rounded-b-3xl">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-3 text-slate-300 font-bold text-sm hover:bg-[#222226] rounded-xl transition-colors">Cancelar</button>
              <button type="submit" form="txForm" className={cn("px-6 py-3 rounded-xl font-black text-sm transition-all shadow-lg active:scale-95 flex items-center gap-2", transactionType === 'in' ? "bg-emerald-500 text-slate-900 hover:bg-emerald-400 shadow-emerald-500/20" : "bg-rose-600 text-white hover:bg-rose-500 shadow-rose-500/20")}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
