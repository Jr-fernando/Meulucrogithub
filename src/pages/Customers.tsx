import React, { useState, useEffect } from "react";
import { collection, query, where, addDoc, onSnapshot, serverTimestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { Users, Search, Phone, Star, Calendar, ArrowRight, Plus, Edit, Trash2, X, MessageSquare, TrendingUp, Filter } from "lucide-react";
import { cn } from "../lib/utils";
import { motion } from "motion/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useBusiness } from "../contexts/BusinessContext";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  isVip: boolean;
  totalSpent: number;
  purchasesCount: number;
  lastPurchaseDate?: any;
  createdAt: any;
  businessId?: string | null;
}

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVip, setFilterVip] = useState(false);
  const { currentBusiness } = useBusiness();
  
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", notes: "", isVip: false
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const q = query(collection(db, "customers"), where("uid", "==", auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data: Customer[] = [];
      snapshot.forEach(docSnap => {
        data.push({ id: docSnap.id, ...docSnap.data() } as Customer);
      });
      if (currentBusiness) {
         data = data.filter(d => d.businessId === currentBusiness.id || !d.businessId);
      }
      data.sort((a, b) => b.totalSpent - a.totalSpent); // Sort by highest spender
      setCustomers(data);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "customers");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentBusiness?.id]);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      if (editingId) {
        await updateDoc(doc(db, "customers", editingId), {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          notes: formData.notes,
          isVip: formData.isVip,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, "customers"), {
          uid: auth.currentUser.uid,
          businessId: currentBusiness?.id || null,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          notes: formData.notes,
          isVip: formData.isVip,
          totalSpent: 0,
          purchasesCount: 0,
          createdAt: serverTimestamp()
        });
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, "customers");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return;
    try {
      await deleteDoc(doc(db, "customers", id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `customers/${id}`);
    }
  };

  const openEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
      notes: customer.notes || "",
      isVip: customer.isVip || false
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "", phone: "", email: "", notes: "", isVip: false });
  };

  const handleWhatsApp = (phone: string) => {
    const numericPhone = phone.replace(/\\D/g, '');
    if (numericPhone) {
      window.open(`https://wa.me/55${numericPhone}`, '_blank');
    }
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm);
    const matchesVip = filterVip ? c.isVip : true;
    return matchesSearch && matchesVip;
  });

  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : "?";

  const totalClients = customers.length;
  const vipClients = customers.filter(c => c.isVip).length;
  const totalRevenue = customers.reduce((acc, c) => acc + (c.totalSpent || 0), 0);

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <div className="space-y-6 h-full flex flex-col relative w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Gestão de Clientes</h1>
          <p className="text-slate-400 text-sm mt-0.5">Fidelize e aumente suas vendas recorrentes.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-[var(--color-primary)] text-slate-900 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(0,223,100,0.2)] hover:shadow-[0_0_25px_rgba(0,223,100,0.3)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" /> Novo Cliente
        </button>
      </div>

      {/* Metric Cards Banner */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <motion.div variants={itemVariants} className="bg-[#111114] border border-[#222226] rounded-2xl p-4 sm:p-5 flex flex-col justify-between group hover:border-slate-600 transition-colors">
          <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">Total de Clientes</p>
          <div className="flex items-end justify-between">
            <p className="font-black text-2xl sm:text-3xl text-slate-100">{totalClients}</p>
            <div className="bg-slate-800/50 p-1.5 rounded-lg"><Users className="h-4 w-4 text-slate-300" /></div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[#111114] border border-[#222226] rounded-2xl p-4 sm:p-5 flex flex-col justify-between group hover:border-[#F59E0B]/50 transition-colors relative overflow-hidden">
          <div className="absolute -inset-1 bg-[#F59E0B] opacity-0 group-hover:opacity-5 blur-xl rounded-2xl transition-opacity"></div>
          <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold relative z-10">Clientes VIP ⭐</p>
          <div className="flex items-end justify-between relative z-10">
            <p className="font-black text-2xl sm:text-3xl text-[#F59E0B]">{vipClients}</p>
            <div className="bg-[#F59E0B]/10 p-1.5 rounded-lg"><Star className="h-4 w-4 text-[#F59E0B]" /></div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[#111114] border border-[#222226] rounded-2xl p-4 sm:p-5 flex flex-col justify-between group hover:border-[var(--color-primary)]/50 transition-colors">
          <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">LTV (Lifetime Value)</p>
          <div className="flex items-end justify-between">
             <p className="font-black text-xl sm:text-2xl text-[var(--color-primary)]">R$ {totalRevenue.toFixed(2).replace('.', ',')}</p>
             <div className="bg-[var(--color-primary)]/10 p-1.5 rounded-lg"><TrendingUp className="h-4 w-4 text-[var(--color-primary)]" /></div>
          </div>
        </motion.div>
      </motion.div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou telefone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111114] border border-[#222226] text-slate-100 rounded-xl pl-10 pr-4 py-3.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-slate-600"
          />
        </div>
        <button 
          onClick={() => setFilterVip(!filterVip)}
          className={cn(
            "flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all border",
            filterVip 
              ? "bg-[#F59E0B]/10 border-[#F59E0B]/50 text-[#F59E0B]" 
              : "bg-[#111114] border-[#222226] text-slate-400 hover:text-slate-200"
          )}
        >
          <Filter className="h-4 w-4" /> Somente VIPs
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pb-8 custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" /></div>
        ) : filteredCustomers.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-64 text-center px-4 bg-[#111114] border border-[#222226] border-dashed rounded-3xl">
            <div className="h-16 w-16 bg-[#222226] rounded-full flex items-center justify-center mb-4 text-slate-500">
              <Users className="h-8 w-8" />
            </div>
            <p className="text-slate-200 font-bold text-lg">Nenhum cliente encontrado</p>
            <p className="text-slate-500 text-sm mt-1 max-w-sm mb-6">Crie seu banco de dados de clientes para ter acesso rápido e enviar novidades do seu estoque.</p>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredCustomers.map((customer) => (
              <motion.div variants={itemVariants} key={customer.id} className="bg-[#111114] border border-[#222226] hover:border-slate-600 transition-colors rounded-2xl p-5 flex flex-col relative group">
                {customer.isVip && (
                  <div className="absolute top-0 right-0 bg-gradient-to-bl from-[#F59E0B]/20 to-transparent p-4 rounded-tr-2xl">
                    <Star className="h-5 w-5 text-[#F59E0B] fill-[#F59E0B]" />
                  </div>
                )}
                
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-full bg-[#222226] border border-slate-700 flex items-center justify-center text-slate-300 font-black text-lg shrink-0 group-hover:border-[var(--color-primary)]/50 transition-colors">
                    {getInitials(customer.name)}
                  </div>
                  <div className="flex-1 pt-1 min-w-0 pr-8">
                    <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2 truncate">
                      {customer.name}
                    </h3>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-slate-400 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {customer.phone || 'Sem número'}</p>
                    </div>
                  </div>
                </div>

                {/* Separator */}
                <div className="w-full h-px bg-[#222226] my-4"></div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2">
                   <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Valor Gasto</p>
                      <p className="text-sm font-black text-[var(--color-primary)] mt-0.5">R$ {(customer.totalSpent || 0).toFixed(2).replace('.', ',')}</p>
                   </div>
                   <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Compras</p>
                      <p className="text-sm font-black text-slate-300 mt-0.5">{customer.purchasesCount || 0} aparelhos</p>
                   </div>
                   <div className="col-span-2 md:col-span-1">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Última Compra</p>
                      <p className="text-sm font-bold text-slate-400 mt-0.5 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {customer.lastPurchaseDate ? format(customer.lastPurchaseDate.toDate(), "dd/MM/yyyy") : 'Nenhuma'}
                      </p>
                   </div>
                </div>

                {customer.notes && (
                  <div className="mt-4 bg-[#0A0A0B] border border-[#222226] p-3 rounded-xl">
                    <p className="text-xs text-slate-400 italic line-clamp-2">"{customer.notes}"</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between gap-2 mt-5">
                  <div className="flex gap-2">
                    <button onClick={() => handleDelete(customer.id)} className="h-10 w-10 flex items-center justify-center text-rose-500/70 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => openEdit(customer)} className="h-10 px-4 flex items-center justify-center gap-1.5 text-slate-300 bg-[#222226] hover:bg-slate-700 rounded-xl text-xs font-bold transition-colors">
                        <Edit className="h-3.5 w-3.5" /> Editar
                    </button>
                  </div>
                  {customer.phone && (
                      <button onClick={() => handleWhatsApp(customer.phone)} className="h-10 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-slate-900 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(37,211,102,0.2)]">
                        <MessageSquare className="h-4 w-4" /> Chamar
                      </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in transition-all">
          <div className="bg-[#111114] border border-[#222226] rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-[#222226] flex items-center justify-between">
              <h2 className="font-extrabold text-xl text-slate-100 flex items-center gap-2">
                <Users className="h-5 w-5 text-[var(--color-primary)]" />
                {editingId ? "Editar Cliente" : "Novo Cliente"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-300 p-2 rounded-xl hover:bg-[#222226] transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="customerForm" onSubmit={handleCreateOrUpdate} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nome Completo</label>
                   <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#222226] text-slate-100 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-slate-600" placeholder="Ex: João da Silva" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">WhatsApp / Telefone</label>
                     <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#222226] text-slate-100 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-slate-600" placeholder="(11) 99999-9999" />
                  </div>
                  <div>
                     <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email (Opcional)</label>
                     <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#222226] text-slate-100 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-slate-600" placeholder="joao@email.com" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Observações / Preferências</label>
                  <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={3} className="w-full bg-[#0A0A0B] border border-[#222226] text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-slate-600 resize-none" placeholder="Ex: Gosta de iPhones modelo Pro, sempre pede desconto à vista..." />
                </div>

                <div className="bg-[#0A0A0B] border border-[#222226] p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-[#F59E0B]/50 transition-colors" onClick={() => setFormData({...formData, isVip: !formData.isVip})}>
                   <div>
                     <p className="font-bold text-slate-200 flex items-center gap-1.5">Cliente VIP <Star className={cn("h-4 w-4", formData.isVip ? "text-[#F59E0B] fill-[#F59E0B]" : "text-slate-600")} /></p>
                     <p className="text-xs text-slate-500 mt-0.5">Destaque este cliente como um excelente comprador.</p>
                   </div>
                   <div className={cn("w-12 h-6 rounded-full transition-colors relative", formData.isVip ? "bg-[#F59E0B]" : "bg-[#222226]")}>
                      <div className={cn("absolute top-1 bottom-1 w-4 rounded-full bg-white transition-all", formData.isVip ? "left-7" : "left-1")}></div>
                   </div>
                </div>
              </form>
            </div>
            <div className="p-5 border-t border-[#222226] bg-[#0A0A0B] flex justify-end gap-3 rounded-b-3xl">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-3 text-slate-300 font-bold text-sm hover:bg-[#222226] rounded-xl transition-colors">Cancelar</button>
              <button type="submit" form="customerForm" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-slate-900 px-6 py-3 rounded-xl font-black text-sm transition-all shadow-[0_0_20px_rgba(0,223,100,0.3)] active:scale-95 flex items-center gap-2">
                Salvar Cliente <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
