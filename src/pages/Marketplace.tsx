import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Store, Search, Filter, Star, ShieldCheck, MapPin, MessageCircle, ChevronRight, BadgePercent, Plus, X } from "lucide-react";
import { collection, query, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { useBusiness } from "../contexts/BusinessContext";
import { cn } from "../lib/utils";

export function MarketplacePage() {
  const { currentBusiness, openUpgradeModal } = useBusiness();
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [condition, setCondition] = useState("Novo Lacrado");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("iPhones");
  const [isLot, setIsLot] = useState(false);
  const [unitPrice, setUnitPrice] = useState("");

  const categories = ["Todos", "iPhones", "Xiaomi", "Acessórios", "Lotes", "Peças"];

  useEffect(() => {
    // Fetch marketplace listings (open to all users)
    const qListings = query(collection(db, "marketplace_listings"));
    
    const unsubscribe = onSnapshot(qListings, (snapshot) => {
      let data: any[] = [];
      snapshot.forEach(docSnap => data.push({ id: docSnap.id, ...docSnap.data() }));
      setProducts(data);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "marketplace_listings"));

    return () => unsubscribe();
  }, []);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    try {
      await addDoc(collection(db, "marketplace_listings"), {
        uid: auth.currentUser.uid,
        businessId: currentBusiness?.id || null,
        vendor: currentBusiness?.name || auth.currentUser.displayName || 'Lojista',
        name,
        condition,
        category,
        price: Number(price),
        isLot,
        unitPrice: isLot ? Number(unitPrice) : null,
        rating: 5.0,
        state: "SP", // Hardcoded for demo
        image: "https://images.unsplash.com/photo-1605236453806-6ff36851218e?q=80&w=600&auto=format&fit=crop", // generic
        verified: false,
        createdAt: serverTimestamp()
      });
      setIsModalOpen(false);
      // reset form
      setName(""); setPrice(""); setUnitPrice("");
    } catch (error) {
      console.error("Error creating listing", error);
      alert("Erro ao criar anúncio. Verifique suas permissões.");
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.vendor?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory || (activeCategory === 'Lotes' && p.isLot);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      <header className="mb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Marketplace B2B</h1>
            <span className="bg-[var(--color-primary)] text-slate-900 border font-black text-[10px] uppercase tracking-widest px-2 py-1 rounded-md">Atacado</span>
          </div>
          <p className="text-slate-400 max-w-xl text-sm md:text-base">
            Compre produtos com margem real e escalabilidade. Negocie direto com os maiores fornecedores e atacadistas verificados do Brasil.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button onClick={() => openUpgradeModal('Chat Direto', 'Premium')} className="flex-1 lg:flex-none bg-[#111114] text-white border border-[#222226] font-bold px-5 py-3 rounded-xl hover:bg-[#1A1A1E] transition-colors flex justify-center items-center gap-2">
             <MessageCircle className="h-4 w-4" /> Meus Chats
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex-1 lg:flex-none bg-gradient-to-r from-[var(--color-primary)] to-emerald-500 text-slate-900 font-black px-5 py-3 rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap shadow-[0_0_20px_rgba(0,223,100,0.2)]">
            Anunciar Estoque
          </button>
        </div>
      </header>

      {/* Buscar & Filtros */}
      <div className="bg-[#111114] border border-[#222226] p-4 rounded-[2rem] flex flex-col md:flex-row gap-4 mb-8 shadow-xl">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por modelos, fornecedores ou categorias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#151519] border border-[#2A2A2E] text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-[var(--color-primary)] transition-colors text-sm font-medium"
          />
        </div>
        
        <div className="flex gap-2 items-center overflow-x-auto scrollbar-hide py-1">
          {categories.map((cat) => (
             <button 
               key={cat} 
               onClick={() => setActiveCategory(cat)}
               className={cn(
                 "px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors",
                 activeCategory === cat 
                   ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20" 
                   : "bg-[#151519] text-slate-400 border border-[#2A2A2E] hover:text-white"
               )}
             >
               {cat}
             </button>
          ))}
          <div className="w-[1px] h-6 bg-[#222226] mx-1 shrink-0"></div>
          <button onClick={() => openUpgradeModal('Filtros Avançados', 'Premium')} className="bg-[#151519] border border-[#2A2A2E] text-slate-300 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:text-white hover:border-[#333336] transition-colors whitespace-nowrap text-xs">
            <Filter className="h-4 w-4" /> Filtros
          </button>
        </div>
      </div>

      {/* Produtos Grid */}
      <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Feed de Oportunidades ({filteredProducts.length})</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <motion.div 
            key={product.id} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-[#111114] border border-[#222226] rounded-[2rem] overflow-hidden hover:border-[#333336] transition-all group flex flex-col shadow-lg hover:shadow-2xl"
          >
            <div className="aspect-[4/3] bg-[#0A0A0C] relative overflow-hidden">
               <img src={product.image} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" referrerPolicy="no-referrer" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#111114] to-transparent opacity-80"></div>
               
               <div className="absolute top-4 left-4 flex flex-col gap-2">
                 <div className="bg-[#050505]/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black text-white border border-[#2A2A2E] uppercase tracking-wider">
                   {product.condition}
                 </div>
                 {product.isLot && (
                   <div className="bg-amber-500/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black text-black border border-amber-500 uppercase tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                     Lote Atacado
                   </div>
                 )}
               </div>
            </div>

            <div className="p-5 flex flex-col flex-1 relative">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-2">
                <Store className="h-3.5 w-3.5" /> <span className="truncate">{product.vendor}</span>
                {product.verified && <ShieldCheck className="h-3.5 w-3.5 text-[var(--color-primary)] shrink-0" />}
              </div>

              <h3 className="text-white font-bold text-base leading-snug mb-3 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">{product.name}</h3>
              
              <div className="flex items-center justify-between mb-4 mt-auto border-t border-[#222226] pt-4">
                <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-500" /> {product.rating || '5.0'}
                </span>
                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {product.state || 'SP'}
                </span>
              </div>
              
              <div className="bg-[#151519] p-3 rounded-xl border border-[#222226] group-hover:border-[var(--color-primary)]/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">{product.isLot ? 'Valor Total' : 'Preço Atacado'}</p>
                    <p className="text-xl font-black text-white">R$ {(product.price || 0).toLocaleString('pt-BR')}</p>
                  </div>
                  {product.unitPrice && (
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Unidade saí a</p>
                      <p className="text-sm font-black text-[var(--color-primary)]">R$ {product.unitPrice.toLocaleString('pt-BR')}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <button className="w-full mt-4 bg-[#222226] hover:bg-[#2A2A2E] text-white font-bold py-2.5 rounded-xl transition-colors text-sm">
                Negociar
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal para Adicionar Anúncio */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#0A0A0B] border border-[#222226] p-6 rounded-3xl shadow-2xl relative z-10 w-full max-w-lg">
              <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-slate-500 hover:text-white bg-[#111114] p-2 rounded-full"><X className="h-5 w-5" /></button>
              <h2 className="text-2xl font-black text-white mb-6">Novo Anúncio B2B</h2>
              <form onSubmit={handleCreateListing} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Título do Anúncio</label>
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#111114] border border-[#222226] rounded-xl px-4 py-3 text-white focus:border-[var(--color-primary)] outline-none" placeholder="Ex: Lote 10x iPhone 11" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Categoria</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-[#111114] border border-[#222226] rounded-xl px-4 py-3 text-white focus:border-[var(--color-primary)] outline-none">
                      {categories.filter(c => c !== 'Todos').map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Condição</label>
                    <select value={condition} onChange={e => setCondition(e.target.value)} className="w-full bg-[#111114] border border-[#222226] rounded-xl px-4 py-3 text-white focus:border-[var(--color-primary)] outline-none">
                      <option>Novo Lacrado</option>
                      <option>Seminovo</option>
                      <option>Vitrine (Grade A)</option>
                      <option>Vitrine (Grade B)</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-[#111114] border border-[#222226] rounded-xl">
                  <input type="checkbox" id="isLot" checked={isLot} onChange={e => setIsLot(e.target.checked)} className="w-5 h-5 accent-[var(--color-primary)]" />
                  <label htmlFor="isLot" className="text-sm font-bold text-white cursor-pointer">É um lote de produtos?</label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">{isLot ? 'Preço Total' : 'Preço Unitário'}</label>
                    <input required type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-[#111114] border border-[#222226] rounded-xl px-4 py-3 text-white focus:border-[var(--color-primary)] outline-none" placeholder="R$" />
                  </div>
                  {isLot && (
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Sai por (Unidade)</label>
                      <input type="number" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} className="w-full bg-[#111114] border border-[#222226] rounded-xl px-4 py-3 text-white focus:border-[var(--color-primary)] outline-none" placeholder="R$" />
                    </div>
                  )}
                </div>

                <button type="submit" className="w-full bg-[var(--color-primary)] text-black font-black py-4 rounded-xl mt-6 hover:bg-emerald-400 transition-colors">
                  Publicar no Marketplace
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
