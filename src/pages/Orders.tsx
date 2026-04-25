import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ShoppingCart, Search, Filter, Phone, Clock, CheckCircle, Truck, AlertCircle } from "lucide-react";
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { cn } from "../lib/utils";
import { useBusiness } from "../contexts/BusinessContext";

export function OrdersPage() {
  const { currentBusiness, openUpgradeModal } = useBusiness();
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!auth.currentUser) return;
    
    // Fetch orders for this user's business
    const qOrders = query(
      collection(db, "orders"),
      where("uid", "==", auth.currentUser.uid)
    );
    
    const unsubscribe = onSnapshot(qOrders, (snapshot) => {
      let data: any[] = [];
      snapshot.forEach(docSnap => data.push({ id: docSnap.id, ...docSnap.data() }));
      
      // Filter by business context
      if (currentBusiness) {
        data = data.filter(o => o.businessId === currentBusiness.id || !o.businessId);
      }
      
      // Sort in memory since we don't have composite indexes created yet
      data.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      
      setOrders(data);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "orders"));

    return () => unsubscribe();
  }, [currentBusiness?.id]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Erro ao atualizar o pedido. Verifique suas permissões.");
    }
  };

  const filteredOrders = orders.filter(o => 
    o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="bg-amber-500/10 text-amber-500 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"><Clock className="h-3.5 w-3.5" /> Aguardando Pagamento</span>;
      case 'paid': return <span className="bg-blue-500/10 text-blue-400 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"><CheckCircle className="h-3.5 w-3.5" /> Pago (Separar)</span>;
      case 'shipped': return <span className="bg-emerald-500/10 text-emerald-400 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"><Truck className="h-3.5 w-3.5" /> Enviado</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Pedidos Web</h1>
          <p className="text-slate-400">Gerencie as reservas e vendas vindas do seu Catálogo Digital.</p>
        </div>
        <div className="bg-[#111114] border border-[#222226] flex items-center px-4 py-2.5 rounded-xl gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-bold text-white">Catálogo Online Conectado</span>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Buscar por ID, cliente ou aparelho..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111114] border border-[#222226] text-white pl-12 pr-4 py-3 rounded-2xl focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
        </div>
        <button onClick={() => openUpgradeModal('Filtros Avançados', 'Premium')} className="bg-[#111114] border border-[#222226] text-white px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#1A1A1E] transition-colors">
          <Filter className="h-4 w-4" /> Filtros
        </button>
      </div>

      <div className="bg-[#111114] border border-[#222226] rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#222226] bg-[#1A1A1E]">
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Pedido</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Cliente</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Aparelho</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Valor</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222226]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">Nenhum pedido encontrado.</td>
                </tr>
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[#151519] transition-colors group">
                  <td className="p-4">
                    <div className="font-bold text-white uppercase text-xs">#{order.id.slice(0,8)}</div>
                    <div className="text-[10px] text-slate-500">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Recente'}</div>
                  </td>
                  <td className="p-4 font-medium text-slate-300">{order.customerName}</td>
                  <td className="p-4 text-slate-300">{order.itemName}</td>
                  <td className="p-4 font-black text-white">R$ {(order.value || 0).toLocaleString()}</td>
                  <td className="p-4">{getStatusBadge(order.status || 'pending')}</td>
                  <td className="p-4 flex gap-2">
                    {order.status === 'pending' && (
                      <button onClick={() => updateOrderStatus(order.id, 'paid')} className="bg-blue-500/10 text-blue-400 p-2 rounded-lg hover:bg-blue-500/20 transition-colors" title="Marcar como Pago">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    {order.status === 'paid' && (
                      <button onClick={() => updateOrderStatus(order.id, 'shipped')} className="bg-emerald-500/10 text-emerald-400 p-2 rounded-lg hover:bg-emerald-500/20 transition-colors" title="Marcar como Enviado">
                        <Truck className="h-4 w-4" />
                      </button>
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
