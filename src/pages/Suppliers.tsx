import React, { useState, useEffect } from "react";
import { collection, query, where, addDoc, onSnapshot, serverTimestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { Truck, Search, Phone, MapPin, ArrowRight, Plus, Edit, Trash2, X, Star, ExternalLink } from "lucide-react";
import { cn } from "../lib/utils";
import { motion } from "motion/react";
import { useBusiness } from "../contexts/BusinessContext";

interface Supplier {
  id: string;
  name: string;
  category: string;
  phone: string;
  location: string;
  rating: number;
  notes: string;
  createdAt: any;
  businessId?: string | null;
}

export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { currentBusiness } = useBusiness();
  
  const [formData, setFormData] = useState({
    name: "", category: "Atacado Apple", phone: "", location: "", rating: "5", notes: ""
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const q = query(collection(db, "suppliers"), where("uid", "==", auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data: Supplier[] = [];
      snapshot.forEach(docSnap => {
        data.push({ id: docSnap.id, ...docSnap.data() } as Supplier);
      });
      if (currentBusiness) {
         data = data.filter(d => d.businessId === currentBusiness.id || !d.businessId);
      }
      data.sort((a, b) => b.rating - a.rating);
      setSuppliers(data);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "suppliers");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentBusiness?.id]);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      if (editingId) {
        await updateDoc(doc(db, "suppliers", editingId), {
          name: formData.name,
          category: formData.category,
          phone: formData.phone,
          location: formData.location,
          rating: Number(formData.rating),
          notes: formData.notes,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, "suppliers"), {
          uid: auth.currentUser.uid,
          businessId: currentBusiness?.id || null,
          name: formData.name,
          category: formData.category,
          phone: formData.phone,
          location: formData.location,
          rating: Number(formData.rating),
          notes: formData.notes,
          createdAt: serverTimestamp()
        });
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, "suppliers");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este fornecedor?")) return;
    try {
      await deleteDoc(doc(db, "suppliers", id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `suppliers/${id}`);
    }
  };

  const openEdit = (supplier: Supplier) => {
    setEditingId(supplier.id);
    setFormData({
      name: supplier.name,
      category: supplier.category,
      phone: supplier.phone,
      location: supplier.location || "",
      rating: supplier.rating.toString(),
      notes: supplier.notes || ""
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "", category: "Atacado Apple", phone: "", location: "", rating: "5", notes: "" });
  };

  const filteredData = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <div className="space-y-6 h-full flex flex-col relative w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Fornecedores</h1>
          <p className="text-slate-400 text-sm mt-0.5">Sua rede de networking e abastecimento de estoque.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-[var(--color-primary)] text-slate-900 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(0,223,100,0.2)] hover:shadow-[0_0_25px_rgba(0,223,100,0.3)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" /> Novo Fornecedor
        </button>
      </div>

      <div className="relative w-full max-w-lg mb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
        <input 
          type="text" 
          placeholder="Buscar por nome ou categoria..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#111114] border border-[#222226] text-slate-100 rounded-xl pl-10 pr-4 py-3.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-slate-600"
        />
      </div>

      <div className="flex-1 overflow-y-auto pb-8 custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" /></div>
        ) : filteredData.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center p-10 h-64 text-center bg-[#111114] border border-[#222226] border-dashed rounded-3xl">
            <div className="h-16 w-16 bg-[#222226] rounded-full flex items-center justify-center mb-4 text-slate-500">
              <Truck className="h-8 w-8" />
            </div>
            <p className="text-slate-200 font-bold text-lg">Nenhum fornecedor registrado</p>
            <p className="text-slate-500 text-sm mt-1 max-w-md">Cadastre atacadistas de confiança, grupos VIP e importadores para facilitar sua recompra de estoque.</p>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.map(supplier => (
              <motion.div variants={itemVariants} key={supplier.id} className="bg-[#111114] p-5 rounded-2xl border border-[#222226] hover:border-slate-600 transition-colors flex flex-col justify-between group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-[#222226] rounded-xl flex items-center justify-center group-hover:bg-[var(--color-primary)]/10 group-hover:text-[var(--color-primary)] transition-colors text-slate-400">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100">{supplier.name}</h3>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-[#222226] px-2 py-0.5 rounded-full">{supplier.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-[#F59E0B]/10 text-[#F59E0B] px-2 py-1 rounded text-xs font-bold">
                    <Star className="h-3 w-3 fill-[#F59E0B]" />
                    {supplier.rating}.0
                  </div>
                </div>

                <div className="space-y-2 mb-4 flex-1">
                  {supplier.phone && (
                     <p className="text-sm text-slate-400 flex items-center gap-2">
                       <Phone className="h-4 w-4 text-slate-500" /> {supplier.phone}
                     </p>
                  )}
                  {supplier.location && (
                     <p className="text-sm text-slate-400 flex items-center gap-2">
                       <MapPin className="h-4 w-4 text-slate-500" /> {supplier.location}
                     </p>
                  )}
                </div>

                {supplier.notes && (
                  <div className="bg-[#0A0A0B] border border-[#222226] p-3 rounded-lg mb-4 text-xs text-slate-500 italic">
                    "{supplier.notes}"
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-[#222226] pt-4 mt-auto">
                   <div className="flex gap-2">
                     <button onClick={() => handleDelete(supplier.id)} className="h-8 w-8 flex items-center justify-center text-rose-500/70 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors">
                        <Trash2 className="h-4 w-4" />
                     </button>
                     <button onClick={() => openEdit(supplier)} className="h-8 px-3 flex items-center justify-center gap-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#222226] text-[11px] uppercase font-bold tracking-wider transition-colors">
                        <Edit className="h-3.5 w-3.5" /> Editar
                     </button>
                   </div>
                   {supplier.phone && (
                     <a href={`https://wa.me/55${supplier.phone.replace(/\\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="h-8 px-3 bg-[#222226] hover:bg-[#2e2e33] text-slate-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5">
                       Chamar <ExternalLink className="h-3.5 w-3.5" />
                     </a>
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
                <Truck className="h-5 w-5 text-[var(--color-primary)]" />
                {editingId ? "Editar Fornecedor" : "Novo Fornecedor"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-300 p-2 rounded-xl hover:bg-[#222226] transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="supplierForm" onSubmit={handleCreateOrUpdate} className="space-y-4">
                 <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nome / Empresa</label>
                   <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#222226] text-slate-100 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-slate-600" placeholder="Ex: Importadora SP..." />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Categoria</label>
                     <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#222226] text-slate-100 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors appearance-none">
                       <option value="Atacado Apple">Atacado Apple</option>
                       <option value="Atacado Android">Atacado Android</option>
                       <option value="Acessórios">Acessórios / Capas</option>
                       <option value="Peças">Peças / Telas</option>
                       <option value="Logística">Logística / Freteiro</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nota / Confiabilidade</label>
                     <select value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#222226] text-[#F59E0B] font-bold rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors appearance-none">
                       <option value="5">⭐⭐⭐⭐⭐ (Excelente)</option>
                       <option value="4">⭐⭐⭐⭐ (Bom)</option>
                       <option value="3">⭐⭐⭐ (Médio)</option>
                       <option value="2">⭐⭐ (Alerta)</option>
                       <option value="1">⭐ (Ruim)</option>
                     </select>
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">WhatsApp</label>
                     <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#222226] text-slate-100 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-slate-600" placeholder="(11) 9..." />
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Localização</label>
                     <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#222226] text-slate-100 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-slate-600" placeholder="Cidade / Estado" />
                   </div>
                 </div>

                 <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Anotações / Termos / Garantia</label>
                   <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={3} className="w-full bg-[#0A0A0B] border border-[#222226] text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-slate-600 resize-none" placeholder="Ex: Dá 30 dias de garantia, paga o frete a partir de 5 peças..." />
                 </div>
              </form>
            </div>
            <div className="p-5 border-t border-[#222226] bg-[#0A0A0B] flex justify-end gap-3 rounded-b-3xl">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-3 text-slate-300 font-bold text-sm hover:bg-[#222226] rounded-xl transition-colors">Cancelar</button>
              <button type="submit" form="supplierForm" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-slate-900 px-6 py-3 rounded-xl font-black text-sm transition-all shadow-lg active:scale-95 flex items-center gap-2">
                Salvar Fornecedor <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
