import React, { useState, useEffect, useMemo } from "react";
import { collection, query, where, addDoc, updateDoc, doc, onSnapshot, serverTimestamp, limit } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DollarSign, Search, ShoppingBag, ArrowRight, User, TrendingUp, BarChart, Smartphone, X, Percent, CreditCard, Banknote, Package, FileText } from "lucide-react";
import { cn } from "../lib/utils";
import { motion } from "motion/react";
import { generateReceiptPDF } from "../lib/pdf";

interface Device {
  id: string;
  imei: string;
  brand: string;
  model: string;
  status: string;
  purchasePrice: number;
  businessId?: string;
}

interface Sale {
  id: string;
  deviceId: string;
  deviceString: string;
  imei?: string;
  customerName: string;
  customerPhone: string;
  salePrice: number;
  discount: number;
  paymentMethod: string;
  installments: number;
  profit: number;
  saleDate: Date;
  businessId?: string;
}

import { useBusiness } from "../contexts/BusinessContext";

export function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [availableDevices, setAvailableDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { currentBusiness } = useBusiness();

  const [formData, setFormData] = useState({
    deviceId: "", customerName: "", customerPhone: "", salePrice: "", discount: "0", paymentMethod: "pix", installments: "1"
  });

  useEffect(() => {
    if (!auth.currentUser) return;
    
    // Performance: limitamos para as últimas 50 vendas inicialmente (paginação nativa simplificada)
    const qSales = query(collection(db, "sales"), where("uid", "==", auth.currentUser.uid), limit(50));
    const unsubSales = onSnapshot(qSales, (snapshot) => {
      let data: Sale[] = [];
      snapshot.forEach(docSnap => {
        data.push({ 
          id: docSnap.id, 
          ...docSnap.data(),
          saleDate: docSnap.data().saleDate?.toDate() || new Date()
        } as Sale);
      });
      if (currentBusiness) {
        data = data.filter(d => d.businessId === currentBusiness.id || !d.businessId);
      }
      setSales(data.sort((a, b) => b.saleDate.getTime() - a.saleDate.getTime()));
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "sales");
      setIsLoading(false);
    });

    const qDevices = query(
      collection(db, "devices"), 
      where("uid", "==", auth.currentUser.uid),
      where("status", "==", "in_stock")
    );
    const unsubDevices = onSnapshot(qDevices, (snapshot) => {
      let data: Device[] = [];
      snapshot.forEach(docSnap => {
        data.push({ id: docSnap.id, ...docSnap.data() } as Device);
      });
      if (currentBusiness) {
         data = data.filter(d => d.businessId === currentBusiness.id || !d.businessId);
      }
      setAvailableDevices(data);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "devices"));

    return () => {
      unsubSales();
      unsubDevices();
    };
  }, [currentBusiness?.id]);

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !formData.deviceId) return;
    
    const device = availableDevices.find(d => d.id === formData.deviceId);
    if (!device) return;

    try {
      const price = Number(formData.salePrice);
      const discount = Number(formData.discount) || 0;
      const finalPrice = price - discount;
      const profit = finalPrice - device.purchasePrice;

      await addDoc(collection(db, "sales"), {
        uid: auth.currentUser.uid,
        businessId: currentBusiness?.id || null,
        deviceId: device.id,
        deviceString: `${device.brand} ${device.model}`,
        imei: device.imei,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        salePrice: finalPrice,
        discount: discount,
        paymentMethod: formData.paymentMethod,
        installments: Number(formData.installments),
        profit: profit,
        saleDate: serverTimestamp()
      });

      await updateDoc(doc(db, "devices", device.id), {
        status: "sold"
      });

      await addDoc(collection(db, "capital_transactions"), {
        uid: auth.currentUser.uid,
        businessId: currentBusiness?.id || null,
        type: 'in',
        category: 'venda',
        amount: finalPrice,
        description: `Venda: ${device.brand} ${device.model}`,
        date: serverTimestamp()
      });

      setIsModalOpen(false);
      setFormData({ deviceId: "", customerName: "", customerPhone: "", salePrice: "", discount: "0", paymentMethod: "pix", installments: "1" });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "sales");
    }
  };

  const handleGeneratePDF = (sale: Sale) => {
    generateReceiptPDF({
      businessName: currentBusiness?.name || "Meu Lucro B2B",
      customerName: sale.customerName,
      customerPhone: sale.customerPhone,
      deviceString: sale.deviceString,
      imei: sale.imei || "Não registrado na venda antiga",
      salePrice: sale.salePrice,
      saleDate: sale.saleDate,
      paymentMethod: sale.paymentMethod,
      installments: sale.installments
    });
  };

  const { filteredSales, totalSalesValue, totalProfit, mainMargin, avgTicket } = useMemo(() => {
    const filtered = sales.filter(s => 
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.deviceString.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalSales = sales.reduce((acc, s) => acc + s.salePrice, 0);
    const profit = sales.reduce((acc, s) => acc + s.profit, 0);
    const margin = totalSales > 0 ? (profit / totalSales) * 100 : 0;
    const ticket = sales.length > 0 ? totalSales / sales.length : 0;

    return { filteredSales: filtered, totalSalesValue: totalSales, totalProfit: profit, mainMargin: margin, avgTicket: ticket };
  }, [sales, searchTerm]);

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.substring(0, 2).toUpperCase();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-6 h-full flex flex-col relative w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Vendas Realizadas</h1>
          <p className="text-slate-400 text-sm mt-0.5">Acompanhe seu desempenho e clientes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[var(--color-primary)] text-slate-900 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(0,223,100,0.2)] hover:shadow-[0_0_25px_rgba(0,223,100,0.3)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
        >
          <DollarSign className="h-4 w-4" /> Registrar Venda
        </button>
      </div>

       <motion.div 
        variants={containerVariants} initial="hidden" animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
      >
        <motion.div variants={itemVariants} className="bg-[#111114] border border-[#222226] rounded-2xl p-4 sm:p-5 flex flex-col justify-between group hover:border-slate-600 transition-colors">
          <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">Total Vendido</p>
          <div className="flex items-end justify-between">
            <p className="font-black text-xl sm:text-2xl text-slate-100">R$ {totalSalesValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
            <div className="bg-slate-800/50 p-1.5 rounded-lg"><ShoppingBag className="h-4 w-4 text-slate-300" /></div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[#111114] border border-[#222226] rounded-2xl p-4 sm:p-5 flex flex-col justify-between group hover:border-[var(--color-primary)]/50 transition-colors relative overflow-hidden">
          <div className="absolute -inset-1 bg-[var(--color-primary)] opacity-0 group-hover:opacity-5 blur-xl rounded-2xl transition-opacity"></div>
          <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold relative z-10">Lucro Real</p>
          <div className="flex items-end justify-between relative z-10">
            <p className="font-black text-xl sm:text-2xl text-[var(--color-primary)]">R$ {totalProfit.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
            <div className="bg-[var(--color-primary)]/10 p-1.5 rounded-lg"><TrendingUp className="h-4 w-4 text-[var(--color-primary)]" /></div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[#111114] border border-[#222226] rounded-2xl p-4 sm:p-5 flex flex-col justify-between group hover:border-slate-600 transition-colors">
          <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">Margem Média</p>
          <div className="flex items-end justify-between">
             <p className="font-black text-xl sm:text-2xl text-blue-400">{mainMargin.toFixed(1)}%</p>
             <div className="bg-blue-500/10 p-1.5 rounded-lg"><BarChart className="h-4 w-4 text-blue-500" /></div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[#111114] border border-[#222226] rounded-2xl p-4 sm:p-5 flex flex-col justify-between group hover:border-slate-600 transition-colors">
          <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">Ticket Médio</p>
          <div className="flex items-end justify-between">
             <p className="font-black text-xl sm:text-2xl text-slate-100">R$ {avgTicket.toFixed(0)}</p>
             <div className="bg-amber-500/10 p-1.5 rounded-lg"><DollarSign className="h-4 w-4 text-amber-500" /></div>
          </div>
        </motion.div>
      </motion.div>

      <div className="relative w-full max-w-lg mb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
        <input 
          type="text" 
          placeholder="Buscar cliente ou modelo vendido..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#111114] pl-10 pr-4 py-3.5 border border-[#222226] rounded-2xl text-sm text-slate-100 focus:outline-none focus:border-[var(--color-primary)] placeholder:text-slate-600 transition-colors"
        />
      </div>

      <div className="flex-1 overflow-y-auto pb-8 custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" /></div>
        ) : filteredSales.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-10 h-64 text-center bg-[#111114] border border-[#222226] border-dashed rounded-3xl"
          >
            <div className="h-16 w-16 bg-[#222226] rounded-full flex items-center justify-center mb-4 text-slate-500">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <p className="text-slate-200 font-bold text-lg">Nenhuma venda registrada</p>
            <p className="text-slate-500 text-sm mt-1 max-w-md">Suas vendas finalizadas e o histórico dos clientes aparecerão nesta área.</p>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filteredSales.map(sale => (
              <motion.div variants={itemVariants} key={sale.id} className="bg-[#111114] p-5 rounded-2xl border border-[#222226] hover:border-slate-600 transition-colors flex flex-col justify-between gap-4 group">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-full bg-[#222226] border border-slate-700 flex items-center justify-center text-slate-300 font-black text-sm shrink-0 group-hover:border-[var(--color-primary)]/50 transition-colors">
                    {getInitials(sale.customerName) !== "?" ? getInitials(sale.customerName) : <User className="h-5 w-5 opacity-50" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-100 flex items-center gap-2">
                       {sale.customerName || "Cliente não informado"}
                       {sale.customerName && <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">Novo</span>}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><Smartphone className="h-3 w-3" /> {sale.deviceString} {sale.imei && `(Final: ${sale.imei.slice(-4)})`}</p>
                    <p className="text-[10px] text-slate-600 mt-1 uppercase font-semibold">
                      {format(sale.saleDate, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })} • {sale.paymentMethod === 'pix' ? 'PIX' : sale.paymentMethod === 'credit' ? `Cartão (${sale.installments}x)` : 'Dinheiro'}
                    </p>
                  </div>
                  
                  {/* Botão de PDF */}
                  <button onClick={() => handleGeneratePDF(sale)} className="h-9 px-3 flex items-center gap-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg text-xs font-bold transition-all border border-blue-500/20 whitespace-nowrap">
                    <FileText className="h-4 w-4" /> Recibo PDF
                  </button>
                  
                </div>
                
                <div className="bg-[#0A0A0B] border border-[#222226] rounded-xl p-3 flex items-center justify-between mt-auto">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Valor da Venda</p>
                    <p className="text-sm font-black text-slate-100 mt-0.5">R$ {sale.salePrice.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 flex items-center justify-end gap-1">
                      <TrendingUp className="h-3 w-3 text-[var(--color-primary)]" /> Lucro
                    </p>
                    <p className={cn("text-sm font-black mt-0.5", sale.profit > 0 ? "text-[var(--color-primary)]" : "text-rose-500")}>
                      + R$ {sale.profit.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in transition-all">
          <div className="bg-[#111114] border border-[#222226] rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-[#222226] flex items-center justify-between">
              <h2 className="font-extrabold text-xl text-slate-100 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[var(--color-primary)]" /> Nova Venda
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-300 p-2 rounded-xl hover:bg-[#222226] transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              {availableDevices.length === 0 ? (
                <div className="text-center py-8">
                  <div className="h-16 w-16 bg-[#222226] rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                    <Package className="h-8 w-8" />
                  </div>
                  <p className="text-slate-300 font-bold mb-2">Sem aparelhos disponíveis</p>
                  <p className="text-slate-500 text-sm mb-6 max-w-[250px] mx-auto">Você não tem aparelhos com status "Em Estoque" no momento.</p>
                  <button onClick={() => setIsModalOpen(false)} className="bg-[#222226] text-slate-300 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-700 transition-colors">Concluir</button>
                </div>
              ) : (
                <form id="saleForm" onSubmit={handleCreateSale} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Aparelho Vendido</label>
                    <select required value={formData.deviceId} onChange={e => setFormData({...formData, deviceId: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#222226] text-slate-100 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors appearance-none">
                      <option value="" disabled className="text-slate-500">Selecione o aparelho em estoque...</option>
                      {availableDevices.map(d => (
                        <option key={d.id} value={d.id}>{d.brand} {d.model} • IMEI final: {d.imei.slice(-4) || 'S/N'}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="w-full h-px bg-[#222226] my-2"></div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Cliente (Nome)</label>
                    <input required type="text" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#222226] text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-slate-600" placeholder="Ex: Maria Antonieta" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Contato / WhatsApp</label>
                    <input required type="text" value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#222226] text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-slate-600" placeholder="(11) 99999-9999" />
                  </div>
                  
                  <div className="w-full h-px bg-[#222226] my-2"></div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-wider mb-2">Valor (R$)</label>
                      <input required type="number" step="0.01" value={formData.salePrice} onChange={e => setFormData({...formData, salePrice: e.target.value})} className="w-full bg-[#0A0A0B] border border-[var(--color-primary)]/50 text-[var(--color-primary)] rounded-xl px-4 py-3 text-lg font-black focus:outline-none focus:border-[var(--color-primary)] transition-colors" placeholder="0.00" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Desconto (R$)</label>
                      <input type="number" step="0.01" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#222226] text-rose-500 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:border-rose-500 transition-colors" placeholder="0.00" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pagamento</label>
                      <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#222226] text-slate-100 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors appearance-none">
                        <option value="pix">PIX</option>
                        <option value="credit">Cartão de Crédito</option>
                        <option value="debit">Cartão de Débito</option>
                        <option value="cash">Dinheiro</option>
                      </select>
                    </div>
                    {formData.paymentMethod === 'credit' && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Parcelas</label>
                        <select value={formData.installments} onChange={e => setFormData({...formData, installments: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#222226] text-slate-100 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors appearance-none">
                          {[...Array(12)].map((_, i) => (
                            <option key={i+1} value={i+1}>{i+1}x</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </form>
              )}
            </div>
            {availableDevices.length > 0 && (
              <div className="p-5 border-t border-[#222226] bg-[#0A0A0B] flex justify-end gap-3 rounded-b-3xl">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-3 text-slate-300 font-bold text-sm hover:bg-[#222226] rounded-xl transition-colors">Cancelar</button>
                <button type="submit" form="saleForm" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-slate-900 px-6 py-3 rounded-xl font-black text-sm transition-all shadow-[0_0_20px_rgba(0,223,100,0.3)] active:scale-95 flex items-center gap-2">
                  Confirmar <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
