import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Calculator, ShoppingCart, DollarSign, CreditCard, LayoutGrid, Search, ArrowRight, User, Trash2 } from "lucide-react";
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { useBusiness } from "../contexts/BusinessContext";

export function CashPage() {
  const { currentBusiness } = useBusiness();
  const [devices, setDevices] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    const qDevices = query(
      collection(db, "devices"), 
      where("uid", "==", auth.currentUser.uid),
      where("status", "==", "in_stock")
    );
    
    const unsubscribe = onSnapshot(qDevices, (snapshot) => {
      let data: any[] = [];
      snapshot.forEach(docSnap => data.push({ id: docSnap.id, ...docSnap.data() }));
      if (currentBusiness) data = data.filter(d => d.businessId === currentBusiness.id || !d.businessId);
      setDevices(data);
    });

    return () => unsubscribe();
  }, [currentBusiness?.id]);

  const addToCart = (device: any) => {
    if (cart.find(item => item.id === device.id)) return;
    setCart([...cart, device]);
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + (Number(item.expectedSellPrice) || 0), 0);

  const handleCheckout = async (method: string) => {
    if (cart.length === 0 || !auth.currentUser) return;
    setIsProcessing(true);

    try {
      // Create batch or sequential writes (simplified sequential here)
      for (const item of cart) {
        const finalPrice = Number(item.expectedSellPrice) || 0;
        const profit = finalPrice - (Number(item.purchasePrice) || 0);

        await addDoc(collection(db, "sales"), {
          uid: auth.currentUser.uid,
          businessId: currentBusiness?.id || null,
          deviceId: item.id,
          deviceString: `${item.brand} ${item.model}`,
          customerName: "Venda Rápida (PDV)",
          salePrice: finalPrice,
          paymentMethod: method,
          profit: profit,
          saleDate: serverTimestamp()
        });

        await updateDoc(doc(db, "devices", item.id), { status: "sold" });

        await addDoc(collection(db, "capital_transactions"), {
          uid: auth.currentUser.uid,
          businessId: currentBusiness?.id || null,
          type: 'in',
          category: 'venda',
          amount: finalPrice,
          description: `Venda PDV: ${item.model}`,
          date: serverTimestamp()
        });
      }
      
      setCart([]);
      alert("Venda concluída com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao processar venda.");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredDevices = devices.filter(d => 
    d.model.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.imei && d.imei.includes(searchTerm))
  );

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col lg:flex-row gap-6">
      {/* Esquerda: Itens rápidos e Catálogo */}
      <div className="flex-1 flex flex-col gap-4">
        <header>
          <h1 className="text-3xl font-black text-white tracking-tight">Frente de Caixa</h1>
          <p className="text-slate-400">Ponto de Venda (PDV) rápido.</p>
        </header>

        <div className="relative mb-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Buscar aparelho no estoque..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111114] border border-[#222226] text-white pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:border-[var(--color-primary)] transition-colors text-lg font-medium shadow-sm"
          />
        </div>

        <div className="flex-1 overflow-auto bg-[#111114] border border-[#222226] rounded-3xl p-4 custom-scrollbar">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Estoque Disponível</h3>
          {filteredDevices.length === 0 ? (
            <p className="text-slate-500 text-center py-10">Nenhum aparelho disponível no momento.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredDevices.map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => addToCart(item)}
                  className="bg-[#1A1A1E] border border-[#2A2A2E] hover:border-[var(--color-primary)] p-4 rounded-2xl text-left transition-all active:scale-95 group flex flex-col justify-between min-h-[120px]"
                >
                  <div>
                    <p className="text-slate-300 font-bold text-sm leading-tight group-hover:text-white transition-colors">{item.brand} {item.model}</p>
                    <p className="text-xs text-slate-500 mt-1 uppercase">IMEI: {...item.imei?.slice(-4) || 'S/N'}</p>
                  </div>
                  <p className="text-[var(--color-primary)] font-black mt-2">R$ {Number(item.expectedSellPrice).toFixed(2).replace('.', ',')}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Direita: Carrinho e Checkout */}
      <div className="w-full lg:w-[400px] flex flex-col gap-4">
        <div className="bg-[#111114] border border-[#222226] rounded-3xl p-5 flex flex-col flex-1 h-full max-h-full">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#222226]">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><ShoppingCart className="h-5 w-5" /> Carrinho</h2>
            <span className="bg-[#1A1A1E] px-2 py-1 rounded text-xs font-bold text-slate-400">{cart.length} itens</span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 custom-scrollbar">
            {cart.length === 0 ? (
              <p className="text-slate-500 text-sm text-center mt-10">Adicione itens para continuar.</p>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex justify-between items-start group">
                  <div>
                    <p className="text-slate-200 font-bold text-sm">{item.model}</p>
                    <p className="text-slate-500 text-xs">Imei: {item.imei?.slice(-4)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-white font-bold">R$ {Number(item.expectedSellPrice).toFixed(2).replace('.', ',')}</p>
                    <button onClick={() => removeFromCart(item.id)} className="text-slate-600 hover:text-rose-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-auto pt-4 border-t border-[#222226]">
            <div className="bg-[#1A1A1E] rounded-xl p-3 mb-4 flex items-center gap-3 cursor-pointer hover:bg-[#222226] border border-[#2A2A2E] hover:border-[#333336]">
               <div className="bg-[#222226] p-2 rounded-lg"><User className="h-4 w-4 text-slate-400" /></div>
               <div>
                 <p className="text-xs font-bold text-slate-300">Cliente (PDV Rápido)</p>
                 <p className="text-[10px] text-slate-500">Sem vínculo de cadastro</p>
               </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="text-slate-400 font-medium">Total a Pagar</span>
              <span className="text-3xl font-black text-white">R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                disabled={cart.length === 0 || isProcessing}
                onClick={() => handleCheckout('cartao')}
                className="bg-[#222226] hover:bg-[#2A2A2E] disabled:opacity-50 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold transition-colors"
              >
                <CreditCard className="h-6 w-6 text-blue-400" /> Cartão
              </button>
              <button 
                disabled={cart.length === 0 || isProcessing}
                onClick={() => handleCheckout('pix')}
                className="bg-[var(--color-primary)] disabled:opacity-50 hover:bg-[var(--color-primary-dark)] text-black p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-black transition-colors shadow-[0_0_20px_rgba(0,223,100,0.2)]"
              >
                <DollarSign className="h-6 w-6" /> PIX / Dinheiro
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
