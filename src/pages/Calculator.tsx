import { useState, useEffect } from "react";
import { Calculator as CalcIcon, Percent, DollarSign, TrendingUp, Save, History, PlusCircle, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export function CalculatorPage() {
  const [purchasePrice, setPurchasePrice] = useState("");
  const [expectedSellPrice, setExpectedSellPrice] = useState("");
  const [cardFeePercent, setCardFeePercent] = useState("");
  const [installments, setInstallments] = useState("1");
  const [otherCosts, setOtherCosts] = useState("");
  
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, "simulations"), where("uid", "==", auth.currentUser.uid));
    const unsub = onSnapshot(q, (snap) => {
      let data: any[] = [];
      snap.forEach(d => data.push({ id: d.id, ...d.data() }));
      setHistory(data.sort((a,b) => b.createdAt - a.createdAt));
    });
    return () => unsub();
  }, []);

  const purchase = Number(purchasePrice) || 0;
  const sell = Number(expectedSellPrice) || 0;
  const cardFee = Number(cardFeePercent) || 0;
  const others = Number(otherCosts) || 0;
  const inst = Number(installments) || 1;

  // Lógica aprimorada considerando a taxa sobre a venda
  const cardFeeAmount = sell * (cardFee / 100);
  const totalCosts = purchase + cardFeeAmount + others;
  const profit = sell - totalCosts;
  const margin = sell > 0 ? (profit / sell) * 100 : 0;
  const markup = purchase > 0 ? (profit / purchase) * 100 : 0;
  const installmentValue = sell / inst;

  const handleSave = async () => {
    if (!auth.currentUser) return;
    if (sell === 0 || purchase === 0) return alert("Preencha os valores de compra e venda antes de salvar!");
    
    try {
      await addDoc(collection(db, "simulations"), {
        uid: auth.currentUser.uid,
        purchase,
        sell,
        cardFee,
        others,
        installments: inst,
        profit,
        margin,
        markup,
        createdAt: serverTimestamp()
      });
      alert("Simulação salva com sucesso!");
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar simulação.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "simulations", id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col relative w-full overflow-x-hidden pb-10" translate="no">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight flex items-center gap-2 mb-2">
             <CalcIcon className="h-8 w-8 text-[var(--color-primary)]" /> Calculadora de Margem Pro
          </h1>
          <p className="text-slate-400 text-sm">Simule preços de venda, taxas de cartão, maquininha e descubra seu lucro real.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
         
         {/* Input Form */}
         <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-[#111114] border border-[#222226] rounded-[2rem] p-6 shadow-xl">
            <h2 className="font-bold text-slate-100 mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
               Dados da Negociação
            </h2>
            
            <div className="space-y-5">
               <div>
                 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Valor de Compra / Custo</label>
                 <div className="relative">
                   <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-rose-500" />
                   <input type="number" step="0.01" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#222226] text-slate-100 rounded-xl pl-12 pr-4 py-3.5 text-lg font-black focus:outline-none focus:border-rose-500 transition-colors placeholder:text-slate-700" placeholder="0.00" />
                 </div>
               </div>
               
               <div>
                 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Custos Extras (Frete, Reparo)</label>
                 <div className="relative">
                   <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-rose-500/50" />
                   <input type="number" step="0.01" value={otherCosts} onChange={e => setOtherCosts(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#222226] text-slate-100 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-rose-500 transition-colors placeholder:text-slate-700" placeholder="0.00" />
                 </div>
               </div>

               <div className="w-full h-px bg-[#222226] my-2"></div>

               <div>
                 <label className="block text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-wider mb-2">Valor de Venda (Preço Final)</label>
                 <div className="relative">
                   <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-primary)]" />
                   <input type="number" step="0.01" value={expectedSellPrice} onChange={e => setExpectedSellPrice(e.target.value)} className="w-full bg-[#0A0A0B] border border-[var(--color-primary)]/40 text-[var(--color-primary)] rounded-xl pl-12 pr-4 py-4 text-xl font-black focus:outline-none focus:border-[var(--color-primary)] focus:shadow-[0_0_15px_rgba(0,223,100,0.15)] transition-all placeholder:text-[var(--color-primary)]/30" placeholder="0.00" />
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Taxa Maquininha (%)</label>
                   <div className="relative">
                     <Percent className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                     <input type="number" step="0.1" value={cardFeePercent} onChange={e => setCardFeePercent(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#222226] text-slate-100 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-slate-500 transition-colors placeholder:text-slate-700" placeholder="Ex: 5.4" />
                   </div>
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Parcelas (Vezes)</label>
                   <select value={installments} onChange={e => setInstallments(e.target.value)} className="w-full bg-[#0A0A0B] border border-[#222226] text-slate-100 rounded-xl px-4 py-3.5 focus:outline-none focus:border-slate-500 transition-colors">
                     {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                       <option key={n} value={n}>{n}x</option>
                     ))}
                   </select>
                 </div>
               </div>
            </div>
         </motion.div>

         {/* Result Display */}
         <div className="space-y-6">
           <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-gradient-to-br from-[#1f2b24] to-[#111114] border border-[var(--color-primary)]/30 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 opacity-[0.05]">
                <TrendingUp className="h-64 w-64 text-[var(--color-text-main)]" />
              </div>

              <h2 className="font-bold text-slate-100 mb-6 uppercase tracking-wider text-sm relative z-10 flex items-center justify-between">
                 Resumo da Operação
                 <button onClick={handleSave} className="flex items-center gap-1.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 px-3 py-1.5 rounded-lg hover:bg-[var(--color-primary)]/20 transition-colors">
                   <Save className="h-4 w-4" /> Salvar
                 </button>
              </h2>

              <div className="space-y-4 relative z-10">
                 <div className="flex justify-between items-center bg-[#0A0A0B]/50 p-4 rounded-xl border border-[#222226]">
                    <span className="text-sm font-medium text-slate-400">Receita Bruta (Venda)</span>
                    <span className="font-bold text-slate-200 text-lg">R$ <span>{sell.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span></span>
                 </div>

                 {inst > 1 && (
                   <div className="flex justify-between items-center px-4">
                      <span className="text-xs font-bold text-slate-500 uppercase">Valor da Parcela ({inst}x)</span>
                      <span className="font-bold text-slate-300">R$ <span>{installmentValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span></span>
                   </div>
                 )}
                 
                 <div className="flex justify-between items-center pt-2 px-4 border-t border-[#222226]">
                    <span className="text-sm font-medium text-rose-500/70">Custo de Compra</span>
                    <span className="font-bold text-rose-500/70">- R$ <span>{purchase.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span></span>
                 </div>
                 
                 <div className="flex justify-between items-center px-4">
                    <span className="text-sm font-medium text-rose-500/70">Custos Extras</span>
                    <span className="font-bold text-rose-500/70">- R$ <span>{others.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span></span>
                 </div>
                 
                 <div className="flex justify-between items-center px-4">
                    <span className="text-sm font-medium text-rose-500/70">Taxas ({cardFee}%)</span>
                    <span className="font-bold text-rose-500/70">- R$ <span>{cardFeeAmount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span></span>
                 </div>

                 <div className="w-full h-px bg-[var(--color-primary)]/20 my-4"></div>

                 <div className="flex justify-between items-end p-5 bg-[#0A0A0B] rounded-2xl border border-[var(--color-primary)]/30 shadow-[0_0_20px_rgba(0,223,100,0.05)]">
                    <span className="text-xs font-black uppercase tracking-wider text-[var(--color-primary)]">Lucro Líquido Real</span>
                    <span className="text-4xl font-black text-[var(--color-primary)] tracking-tighter">R$ <span>{profit.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span></span>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4 mt-4">
                   <div className="bg-[#0A0A0B] p-4 rounded-xl border border-[#222226] text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Margem Líquida</p>
                      <p className="font-black text-xl text-blue-400"><span>{margin.toFixed(1)}</span>%</p>
                   </div>
                   <div className="bg-[#0A0A0B] p-4 rounded-xl border border-[#222226] text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Markup (Retorno)</p>
                      <p className="font-black text-xl text-amber-400"><span>{markup.toFixed(1)}</span>%</p>
                   </div>
                 </div>
              </div>
           </motion.div>

           {/* Histórico */}
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111114] border border-[#222226] rounded-[2rem] p-6 shadow-xl">
             <h3 className="font-bold text-slate-100 mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
               <History className="h-4 w-4" /> Histórico de Simulações
             </h3>
             <div className="space-y-3">
               {history.length === 0 ? (
                 <p className="text-center text-slate-500 text-sm py-4">Nenhuma simulação salva ainda.</p>
               ) : (
                 history.slice(0, 3).map((item) => (
                   <div key={item.id} className="flex justify-between items-center bg-[#151519] p-3 rounded-xl border border-[#222226]">
                     <div>
                       <p className="text-xs font-bold text-white mb-0.5">Venda: R$ <span>{(item.sell || 0).toLocaleString('pt-BR')}</span></p>
                       <p className="text-[10px] text-slate-500">Custo: R$ <span>{(item.purchase || 0).toLocaleString('pt-BR')}</span></p>
                     </div>
                     <div className="text-right flex items-center gap-3">
                       <div>
                         <p className="text-xs font-black text-[var(--color-primary)]">+R$ <span>{(item.profit || 0).toLocaleString('pt-BR')}</span></p>
                         <p className="text-[10px] text-slate-500"><span>{item.installments}</span>x</p>
                       </div>
                       <button onClick={() => handleDelete(item.id)} className="text-rose-500/50 hover:text-rose-500 transition-colors p-1">
                         <Trash2 className="h-4 w-4" />
                       </button>
                     </div>
                   </div>
                 ))
               )}
             </div>
           </motion.div>
         </div>
      </div>
    </div>
  );
}
