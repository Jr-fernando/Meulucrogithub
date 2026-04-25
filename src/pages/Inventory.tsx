import React, { useState, useEffect, useRef, useMemo } from "react";
import { collection, query, addDoc, onSnapshot, deleteDoc, doc, serverTimestamp, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage, handleFirestoreError, OperationType } from "../lib/firebase";
import { Plus, Search, Smartphone, Edit, Trash2, X, Package, Clock, Filter, Camera, ArrowRight, TrendingUp, Copy, Share2, Printer } from "lucide-react";
import { cn } from "../lib/utils";
import { motion } from "motion/react";
import imageCompression from "browser-image-compression";
import Barcode from "react-barcode";

interface Device {
  id: string;
  imei: string;
  serial?: string;
  brand: string;
  model: string;
  condition: string;
  purchasePrice: number;
  expectedSellPrice: number;
  status: string;
  supplier?: string;
  observations?: string;
  createdAt?: any;
  businessId?: string;
  imageUrl?: string | null;
}

import { useBusiness } from "../contexts/BusinessContext";

export function InventoryPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const { currentBusiness, openUpgradeModal } = useBusiness();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [labelDevice, setLabelDevice] = useState<Device | null>(null);

  const [formData, setFormData] = useState({
    imei: "", serial: "", brand: "", model: "", condition: "used", purchasePrice: "", expectedSellPrice: "", supplier: "", observations: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, "devices"), where("uid", "==", auth.currentUser.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data: Device[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Device);
      });
      if (currentBusiness) {
        data = data.filter(d => d.businessId === currentBusiness.id || !d.businessId);
      }
      
      data.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setDevices(data);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "devices");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentBusiness?.id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    try {
      setIsUploading(true);
      let imageUrl = null;

      if (imageFile) {
        const compressedFile = await imageCompression(imageFile, { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true });
        const storageRef = ref(storage, `devices/${auth.currentUser.uid}/${Date.now()}_${compressedFile.name}`);
        const snapshot = await uploadBytes(storageRef, compressedFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      await addDoc(collection(db, "devices"), {
        uid: auth.currentUser.uid,
        businessId: currentBusiness?.id || null,
        imei: formData.imei,
        serial: formData.serial,
        brand: formData.brand,
        model: formData.model,
        condition: formData.condition,
        purchasePrice: Number(formData.purchasePrice),
        expectedSellPrice: Number(formData.expectedSellPrice),
        supplier: formData.supplier,
        observations: formData.observations,
        status: "in_stock",
        createdAt: serverTimestamp(),
        imageUrl: imageUrl
      });
      
      setIsModalOpen(false);
      setImageFile(null);
      setImagePreview(null);
      setFormData({ imei: "", serial: "", brand: "", model: "", condition: "used", purchasePrice: "", expectedSellPrice: "", supplier: "", observations: "" });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "devices");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Tem certeza que deseja excluir este aparelho?")) return;
    try {
      await deleteDoc(doc(db, "devices", id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `devices/${id}`);
    }
  };

  const handleShare = (device: Device) => {
    const text = `*Vendo:* ${device.brand} ${device.model}\n*Condição:* ${device.condition === 'new' ? 'Novo Lacrado' : device.condition === 'used' ? 'Seminovo' : 'Com Detalhes'}\n*Valor:* R$ ${device.expectedSellPrice.toFixed(2).replace('.', ',')}\nGarantia e segurança na negociação!`;
    if (navigator.share) {
      navigator.share({ title: `Aparelho à venda`, text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Texto do anúncio copiado para a área de transferência!');
    }
  };

  const handleDuplicate = (device: Device) => {
    const userPlan = window.localStorage.getItem('userPlan') || 'Free';
    if (userPlan === 'Free' && devices.length >= 30) {
      openUpgradeModal("Estoque Ilimitado", "Pro");
      return;
    }
    setFormData({
      imei: "",
      serial: "",
      brand: device.brand,
      model: device.model,
      condition: device.condition,
      purchasePrice: device.purchasePrice.toString(),
      expectedSellPrice: device.expectedSellPrice.toString(),
      supplier: device.supplier || "",
      observations: device.observations || ""
    });
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const getDaysInStock = (createdAt: any) => {
    if (!createdAt || !createdAt.seconds) return 0;
    const createdDate = new Date(createdAt.seconds * 1000);
    const diffTime = Math.abs(new Date().getTime() - createdDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const { filteredDevices, activeDevices, totalInvested, totalExpected, projectedProfit } = useMemo(() => {
    const filtered = devices.filter(d => {
      const matchesSearch = d.model.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            d.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            d.imei.includes(searchTerm);
      const matchesStatus = filterStatus === "todos" || d.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    const active = devices.filter(d => d.status === 'in_stock');
    const invested = active.reduce((acc, d) => acc + d.purchasePrice, 0);
    const expected = active.reduce((acc, d) => acc + d.expectedSellPrice, 0);
    const profit = expected - invested;

    return { filteredDevices: filtered, activeDevices: active, totalInvested: invested, totalExpected: expected, projectedProfit: profit };
  }, [devices, searchTerm, filterStatus]);

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <div className="space-y-6 h-full flex flex-col relative w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Estoque</h1>
          <p className="text-slate-400 text-sm mt-0.5">Gerencie seus aparelhos e margens.</p>
        </div>
        <button 
          onClick={() => {
            const userPlan = window.localStorage.getItem('userPlan') || 'Free';
            if (userPlan === 'Free' && devices.length >= 30) {
              openUpgradeModal("Estoque Ilimitado", "Pro");
            } else {
              setIsModalOpen(true);
            }
          }}
          className="bg-[var(--color-primary)] text-slate-900 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(0,223,100,0.2)] hover:shadow-[0_0_25px_rgba(0,223,100,0.3)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" /> Cadastrar Aparelho
        </button>
      </div>

      {/* Metric Cards Banner */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <motion.div variants={itemVariants} className="bg-[#111114] border border-[#222226] rounded-2xl p-4 sm:p-5 flex flex-col justify-between group hover:border-slate-600 transition-colors">
          <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">Itens Ativos</p>
          <div className="flex items-end justify-between">
            <p className="font-black text-2xl sm:text-3xl text-slate-100">{activeDevices.length}</p>
            <div className="bg-slate-800/50 p-1.5 rounded-lg"><Package className="h-4 w-4 text-slate-300" /></div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[#111114] border border-[#222226] rounded-2xl p-4 sm:p-5 flex flex-col justify-between group hover:border-[var(--color-primary)]/50 transition-colors relative overflow-hidden">
          <div className="absolute -inset-1 bg-[var(--color-primary)] opacity-0 group-hover:opacity-5 blur-xl rounded-2xl transition-opacity"></div>
          <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold relative z-10">Lucro Projetado</p>
          <div className="flex items-end justify-between relative z-10">
            <p className="font-black text-xl sm:text-2xl text-[var(--color-primary)]">R$ {projectedProfit.toFixed(2).replace('.', ',')}</p>
            <div className="bg-[var(--color-primary)]/10 p-1.5 rounded-lg"><TrendingUp className="h-4 w-4 text-[var(--color-primary)]" /></div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[#111114] border border-[#222226] rounded-2xl p-4 sm:p-5 flex flex-col justify-between group hover:border-slate-600 transition-colors">
          <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">Capital Investido</p>
          <div className="flex items-end justify-between">
             <p className="font-black text-xl sm:text-2xl text-slate-100">R$ {totalInvested.toFixed(2).replace('.', ',')}</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[#111114] border border-[#222226] rounded-2xl p-4 sm:p-5 flex flex-col justify-between group hover:border-slate-600 transition-colors">
          <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">Giro Médio</p>
          <div className="flex items-end justify-between">
             <p className="font-black text-xl sm:text-2xl text-slate-100">14 <span className="text-sm font-medium text-slate-400">dias</span></p>
             <div className="bg-amber-500/10 p-1.5 rounded-lg"><Clock className="h-4 w-4 text-amber-500" /></div>
          </div>
        </motion.div>
      </motion.div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Buscar por modelo, marca ou IMEI..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111114] border border-[#222226] text-slate-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-slate-600"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#111114] border border-[#222226] text-sm text-slate-300 rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primary)] hover:border-slate-600 transition-colors appearance-none"
          >
             <option value="todos">Todos os status</option>
             <option value="in_stock">Em Estoque</option>
             <option value="reserved">Reservado</option>
             <option value="sold">Vendido</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pb-8 custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" /></div>
        ) : filteredDevices.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-64 text-center px-4 bg-[#111114] border border-[#222226] border-dashed rounded-3xl"
          >
            <div className="h-16 w-16 bg-[#222226] rounded-full flex items-center justify-center mb-4 text-slate-500">
              <Package className="h-8 w-8" />
            </div>
            <p className="text-slate-200 font-bold text-lg">Seu estoque está vazio</p>
            <p className="text-slate-500 text-sm mt-1 max-w-sm mb-6">Comece cadastrando seu primeiro aparelho para acompanhar seus ganhos e investimentos.</p>
            <button onClick={() => {
              const userPlan = window.localStorage.getItem('userPlan') || 'Free';
              if (userPlan === 'Free' && devices.length >= 30) {
                openUpgradeModal("Estoque Ilimitado", "Pro");
              } else {
                setIsModalOpen(true);
              }
            }} className="flex items-center gap-2 text-[var(--color-primary)] font-bold hover:underline">
               <Plus className="h-4 w-4" /> Cadastrar Aparelho
            </button>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filteredDevices.map((device) => {
              const daysInStock = getDaysInStock(device.createdAt);
              const isStagnant = daysInStock > 30 && device.status === 'in_stock';
              
              return (
                <motion.div variants={itemVariants} key={device.id} className="bg-[#111114] border border-[#222226] hover:border-slate-600 transition-colors rounded-2xl p-4 sm:p-5 flex flex-col relative overflow-hidden group">
                  
                  {/* Status Ribbon */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    {isStagnant && (
                      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2 py-1 rounded-md text-[10px] uppercase font-bold flex items-center gap-1">
                         <Clock className="h-3 w-3" /> Parado há {daysInStock} dias
                      </div>
                    )}
                    <div className={cn(
                      "px-2 py-1 rounded-md text-[10px] uppercase font-bold flex items-center gap-1 border",
                      device.status === 'in_stock' ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20 text-[var(--color-primary)]" : "",
                      device.status === 'reserved' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "",
                      device.status === 'sold' ? "bg-slate-800 border-[#222226] text-slate-400" : ""
                    )}>
                       <div className={cn("w-1.5 h-1.5 rounded-full",
                         device.status === 'in_stock' ? "bg-[var(--color-primary)]" : "",
                         device.status === 'reserved' ? "bg-blue-400" : "",
                         device.status === 'sold' ? "bg-slate-500" : ""
                       )}></div>
                       {device.status === 'in_stock' ? 'Em Estoque' : device.status === 'reserved' ? 'Reservado' : 'Vendido'}
                    </div>
                  </div>

                  <div className="flex items-start gap-4 flex-1">
                    {/* Media Area (Photo) */}
                    <div className="h-28 w-24 rounded-xl bg-[#0A0A0B] border border-[#222226] flex flex-col items-center justify-center text-slate-600 shrink-0 overflow-hidden relative group-hover:border-slate-500 transition-colors">
                      {device.imageUrl ? (
                        <img src={device.imageUrl} alt={device.model} className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Camera className="h-6 w-6 mb-1 opacity-50" />
                          <span className="text-[9px] font-bold uppercase tracking-wider">Sem Foto</span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex-1 pt-1 min-w-0 pr-24">
                      <h3 className="font-bold text-lg text-slate-100 leading-tight truncate">{device.brand} {device.model}</h3>
                      <div className="flex items-center gap-2 mt-1">
                         <p className="text-xs text-slate-500 capitalize">{device.condition === 'new' ? 'Novo' : device.condition === 'used' ? 'Usado' : 'Defeito'}</p>
                         <span className="text-slate-700 text-xs">•</span>
                         <p className="text-xs text-slate-500 uppercase tracking-widest">{device.imei.slice(-4) || 'S/N'}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-2 mt-4 bg-[#0A0A0B] p-3 rounded-xl border border-[#222226]">
                         <div>
                            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Custo</p>
                            <p className="text-xs font-black text-slate-300 mt-0.5">R$ {device.purchasePrice.toFixed(2)}</p>
                         </div>
                         <div>
                            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Venda Estimada</p>
                            <p className="text-xs font-black text-slate-300 mt-0.5">R$ {device.expectedSellPrice.toFixed(2)}</p>
                         </div>
                         <div className="col-span-2 sm:col-span-1 border-t border-[#222226] sm:border-0 pt-2 sm:pt-0">
                            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 flex items-center justify-between">
                              Lucro Previsto
                              <span className="text-[9px] bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-1 rounded ml-1">
                                {(((device.expectedSellPrice - device.purchasePrice) / (device.purchasePrice || 1)) * 100).toFixed(1)}%
                              </span>
                            </p>
                            <p className="text-xs font-black text-[var(--color-primary)] mt-0.5">R$ {(device.expectedSellPrice - device.purchasePrice).toFixed(2)}</p>
                         </div>
                      </div>
                      
                      {device.observations && (
                         <p className="text-xs text-slate-400 mt-3 italic bg-[#0A0A0B] p-2 rounded-lg border border-[#222226]">"{device.observations}"</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-4 border-t border-[#222226]">
                    <div className="flex gap-2">
                       <button onClick={() => handleShare(device)} className="h-9 w-9 flex items-center justify-center text-blue-400/80 border border-[#222226] hover:text-blue-400 hover:border-blue-400/30 hover:bg-blue-400/10 rounded-lg transition-colors">
                         <Share2 className="h-4 w-4" />
                       </button>
                       <button onClick={() => setLabelDevice(device)} className="h-9 w-9 flex items-center justify-center text-amber-500/80 border border-[#222226] hover:text-amber-500 hover:border-amber-500/30 hover:bg-amber-500/10 rounded-lg transition-colors">
                         <Printer className="h-4 w-4" />
                       </button>
                       <button onClick={() => handleDuplicate(device)} className="h-9 w-9 flex items-center justify-center text-slate-400 border border-[#222226] hover:text-slate-200 hover:bg-[#222226] rounded-lg transition-colors">
                         <Copy className="h-4 w-4" />
                       </button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleDelete(device.id)} className="h-9 w-9 flex items-center justify-center text-rose-500/70 border border-[#222226] hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/10 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="h-9 px-3 flex items-center justify-center gap-1.5 text-slate-300 border border-[#222226] hover:bg-[#222226] hover:text-white rounded-lg text-[11px] uppercase font-bold tracking-wider transition-colors">
                          <Edit className="h-3.5 w-3.5" /> Editar
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Modal Add Device */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in transition-all">
          <div className="bg-[#111114] border border-[#222226] rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-[#222226] flex items-center justify-between bg-[#111114]">
              <h2 className="font-extrabold text-xl text-slate-100 flex items-center gap-2">
                <Package className="h-5 w-5 text-[var(--color-primary)]" />
                Novo Aparelho
              </h2>
              <button onClick={() => setIsModalOpen(false)} disabled={isUploading} className="text-slate-500 hover:text-slate-300 p-2 rounded-xl hover:bg-[#222226] transition-colors disabled:opacity-50">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="deviceForm" onSubmit={handleCreate} className="space-y-5">
                
                <div className="flex gap-4">
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                  <div onClick={() => fileInputRef.current?.click()} className="h-24 w-24 rounded-2xl bg-[#0A0A0B] border border-[#222226] flex flex-col items-center justify-center text-slate-500 shrink-0 cursor-pointer hover:border-[var(--color-primary)]/50 transition-colors group overflow-hidden relative">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Camera className="h-6 w-6 mb-1 group-hover:text-[var(--color-primary)] transition-colors" />
                        <span className="text-[9px] font-bold uppercase tracking-wider group-hover:text-[var(--color-primary)] transition-colors">Adicionar</span>
                      </>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-sm font-bold text-slate-200">Foto do Produto</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">As imagens serão comprimidas automaticamente para não consumir espaço. Adicione uma foto nítida do aparelho.</p>
                  </div>
                </div>

                <div className="w-full h-px bg-[#222226]"></div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">IMEI 1</label>
                    <input required type="text" value={formData.imei} onChange={e => setFormData({...formData, imei: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#222226] text-slate-100 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-slate-600" placeholder="Ex: 3512..." />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Série / IMEI 2 (Opc.)</label>
                    <input type="text" value={formData.serial} onChange={e => setFormData({...formData, serial: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#222226] text-slate-100 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-slate-600" placeholder="Nº de série" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Marca</label>
                     <input required type="text" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#222226] text-slate-100 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-slate-600" placeholder="Apple, Samsung..." />
                  </div>
                  <div>
                     <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Modelo</label>
                     <input required type="text" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#222226] text-slate-100 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-slate-600" placeholder="iPhone 14 Pro" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Condição</label>
                    <select value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#222226] text-slate-100 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors appearance-none">
                      <option value="new">Novo (Lacrado)</option>
                      <option value="used">Seminovo / Usado</option>
                      <option value="defective">Com Defeito</option>
                    </select>
                  </div>
                  <div className="col-span-1">
                     <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Fornecedor (Opc.)</label>
                     <input type="text" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#222226] text-slate-100 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-slate-600" placeholder="Nome do fornecedor" />
                  </div>
                </div>

                <div className="w-full h-px bg-[#222226]"></div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Valor de Custo (R$)</label>
                     <input required type="number" step="0.01" value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#222226] text-slate-100 rounded-xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:border-rose-500 transition-colors" placeholder="0,00" />
                  </div>
                  <div>
                     <label className="block text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-wider mb-2">Venda Sugerida (R$)</label>
                     <input required type="number" step="0.01" value={formData.expectedSellPrice} onChange={e => setFormData({...formData, expectedSellPrice: e.target.value})} className="w-full bg-[#0A0A0B] border border-[var(--color-primary)]/50 text-[var(--color-primary)] rounded-xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:border-[var(--color-primary)] transition-colors" placeholder="0,00" />
                  </div>
                </div>

                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Observações / Histórico de Reparos</label>
                   <textarea value={formData.observations} onChange={e => setFormData({...formData, observations: e.target.value})} rows={2} className="w-full bg-[#0A0A0B] border border-[#222226] text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-slate-600 resize-none" placeholder="Ex: Tela trocada, bateria 85%, marcas de uso na borda..." />
                </div>
              </form>
            </div>
            <div className="p-5 border-t border-[#222226] bg-[#0A0A0B] flex justify-end gap-3 rounded-b-3xl">
              <button type="button" onClick={() => setIsModalOpen(false)} disabled={isUploading} className="px-5 py-3 text-slate-300 font-bold text-sm hover:bg-[#222226] rounded-xl transition-colors disabled:opacity-50">Cancelar</button>
              <button type="submit" form="deviceForm" disabled={isUploading} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-slate-900 px-6 py-3 rounded-xl font-black text-sm transition-all shadow-[0_0_20px_rgba(0,223,100,0.3)] active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:scale-100">
                {isUploading ? "Salvando..." : "Salvar Produto"} {!isUploading && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Print Label */}
      {labelDevice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in transition-all">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full relative">
            <button onClick={() => setLabelDevice(null)} className="absolute top-4 right-4 text-slate-400 hover:text-black">
              <X className="h-5 w-5" />
            </button>
            <div className="text-center mb-4">
              <h3 className="font-bold text-black text-lg">Etiqueta de Estoque</h3>
              <p className="text-slate-500 text-sm">Pronto para imprimir</p>
            </div>
            
            <div id="barcode-print-area" className="border-2 border-dashed border-slate-300 p-4 flex flex-col items-center justify-center rounded-lg bg-white">
               <p className="font-black text-black text-sm mb-1 uppercase text-center">{labelDevice.brand} {labelDevice.model}</p>
               <Barcode value={labelDevice.imei || "0000000000"} height={50} width={1.5} displayValue={true} background="#ffffff" lineColor="#000000" fontSize={14} />
               <p className="text-xs text-black mt-2 font-bold">{currentBusiness?.name || 'Meu Lucro'}</p>
            </div>
            
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => {
                const printContent = document.getElementById('barcode-print-area');
                if (printContent) {
                  const originalContents = document.body.innerHTML;
                  document.body.innerHTML = printContent.innerHTML;
                  window.print();
                  document.body.innerHTML = originalContents;
                  window.location.reload(); // Reload to restore React bindings
                }
              }} className="w-full bg-black text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2">
                <Printer className="h-4 w-4" /> Imprimir Etiqueta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
