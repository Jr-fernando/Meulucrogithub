import React, { useState } from "react";
import { Search, ShieldAlert, CheckCircle2, XCircle, AlertTriangle, Fingerprint, Info } from "lucide-react";
import { cn } from "../lib/utils";

// Mock verification function since real IMEI check requires paid APIs (Checkmend, GSMA)
const mockVerifyImei = async (imei: string) => {
  return new Promise<{ status: string, model: string, details: string }>((resolve) => {
    setTimeout(() => {
      const lastDigit = parseInt(imei.slice(-1) || "0");
      if (lastDigit < 3) {
        resolve({ status: "BLACKLISTED", model: "Apple iPhone 13 Pro", details: "Registro de perda/roubo na Anatel. Aparelho bloqueado pelas operadoras." });
      } else if (lastDigit > 7) {
        resolve({ status: "FINANCED", model: "Samsung Galaxy S23", details: "Aparelho vinculado a plano pós-pago ativo. Restrição de transferência." });
      } else {
        resolve({ status: "CLEAN", model: "Motorola Edge 40", details: "Nenhuma restrição encontrada na base nacional e internacional." });
      }
    }, 2000); // Simulate network delay
  });
};

export function ImeiCheckPage() {
  const [imei, setImei] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<{ status: string, model: string, details: string } | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imei.length < 14) return;
    
    setIsChecking(true);
    setResult(null);
    try {
      const res = await mockVerifyImei(imei);
      setResult(res);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-2xl font-bold text-[var(--color-text-main)]">Consulta de IMEI</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-1">Verifique o status do aparelho antes de negociar.</p>
      </div>

      <div className="bg-[var(--color-card-bg)] rounded-3xl shadow-sm border border-[var(--color-card-border)] overflow-hidden">
        <div className="bg-[#1f2b24] p-6 border-b border-[var(--color-card-border)] relative overflow-hidden">
          <div className="absolute top-0 right-0 -tr-translate-y-4 translate-x-4 opacity-[0.03]">
            <Search className="h-48 w-48 text-[var(--color-text-main)]" />
          </div>
          <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-4 relative z-10">
            <div className="flex-1 relative">
              <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
              <input 
                type="text" 
                maxLength={15}
                value={imei}
                onChange={e => setImei(e.target.value.replace(/\D/g, ''))}
                placeholder="Digite o IMEI (15 dígitos)" 
                className="w-full bg-[var(--color-app-bg)] pl-12 pr-4 py-4 border border-[var(--color-card-border)] rounded-xl text-lg font-mono text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-primary)] focus:shadow-[0_0_15px_rgba(0,223,100,0.1)] transition-all placeholder:text-slate-600 focus:bg-black/20"
              />
            </div>
            <button 
              disabled={isChecking || imei.length < 14}
              type="submit"
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-slate-900 px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-[0_0_15px_rgba(0,223,100,0.3)]"
            >
              {isChecking ? (
                <><div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"/> Verificando...</>
              ) : (
                <><Search className="h-5 w-5" /> Consultar IMEI</>
              )}
            </button>
          </form>
        </div>

        {/* Info Box Before Search */}
        {!result && !isChecking && (
          <div className="p-8 text-center flex flex-col items-center">
             <div className="h-16 w-16 bg-[#1f2b24] rounded-full flex items-center justify-center mb-4 border border-[var(--color-card-border)]">
               <ShieldAlert className="h-8 w-8 text-[var(--color-text-muted)]" />
             </div>
             <h3 className="text-lg font-bold text-[var(--color-text-main)] mb-2">Por que consultar o IMEI?</h3>
             <p className="text-[var(--color-text-muted)] text-sm max-w-md mx-auto leading-relaxed">
               A consulta previne a compra de aparelhos com registro de roubo, furto, ou com bloqueio por operadoras, garantindo a procedência do seu estoque.
             </p>
          </div>
        )}

        {/* Loading State */}
        {isChecking && (
          <div className="p-12 flex flex-col items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--color-primary)] rounded-full animate-ping opacity-20"></div>
              <div className="h-16 w-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,223,100,0.5)] relative animate-pulse">
                <Search className="h-8 w-8 text-slate-900" />
              </div>
            </div>
            <p className="mt-6 text-[var(--color-text-main)] font-bold animate-pulse">Cruzando dados em bases nacionais e internacionais...</p>
            <p className="text-[var(--color-text-muted)] text-xs mt-2 font-mono tracking-wider">Processando {imei}...</p>
          </div>
        )}

        {/* Results */}
        {result && !isChecking && (
          <div className="p-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-6">
              <h3 className="font-bold border-b border-[var(--color-card-border)] pb-2 flex-1 flex items-center gap-2 text-[var(--color-text-main)] uppercase tracking-wider text-xs">
                Relatório de Consulta <span className="font-mono bg-[var(--color-app-bg)] border border-[var(--color-card-border)] text-[var(--color-primary)] px-2 py-1 rounded ml-auto text-xs">{imei}</span>
              </h3>
            </div>

            <div className={cn(
              "rounded-2xl p-6 border flex flex-col sm:flex-row gap-6 items-start relative overflow-hidden",
              result.status === 'CLEAN' ? "bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)]" :
              result.status === 'BLACKLISTED' ? "bg-[rgba(239,68,68,0.05)] border-[rgba(239,68,68,0.2)]" :
              "bg-[rgba(245,158,11,0.05)] border-[rgba(245,158,11,0.2)]"
            )}>
              {/* Colored blur effect behind icon */}
              <div className={cn(
                  "absolute top-1/2 left-8 -translate-y-1/2 w-24 h-24 blur-3xl rounded-full opacity-20",
                  result.status === 'CLEAN' ? "bg-emerald-500" :
                  result.status === 'BLACKLISTED' ? "bg-red-500" :
                  "bg-amber-500"
              )}></div>

              <div className="shrink-0 relative z-10">
                {result.status === 'CLEAN' ? <CheckCircle2 className="h-12 w-12 text-emerald-500" /> :
                 result.status === 'BLACKLISTED' ? <XCircle className="h-12 w-12 text-red-500" /> :
                 <AlertTriangle className="h-12 w-12 text-amber-500" />}
              </div>
              <div className="relative z-10 w-full">
                <h4 className={cn(
                  "text-xl font-bold mb-1",
                   result.status === 'CLEAN' ? "text-emerald-400" :
                   result.status === 'BLACKLISTED' ? "text-red-400" : "text-amber-400"
                )}>
                  {result.status === 'CLEAN' ? 'Aparelho Regular (Limpo)' :
                   result.status === 'BLACKLISTED' ? 'Aparelho com Restrição (Bloqueado)' :
                   'Atenção (Vínculo à Plano)'}
                </h4>
                <p className={cn("mt-2 text-sm",
                  result.status === 'CLEAN' ? "text-emerald-200/70" :
                  result.status === 'BLACKLISTED' ? "text-red-200/70" : "text-amber-200/70"
                )}>{result.details}</p>
                
                <div className="mt-6 space-y-3 p-4 bg-black/20 rounded-xl border border-white/5">
                  <div className="grid grid-cols-3 text-sm">
                    <span className="font-medium text-[var(--color-text-muted)]">Modelo Identificado:</span>
                    <span className="col-span-2 font-bold text-[var(--color-text-main)]">{result.model}</span>
                  </div>
                  <div className="grid grid-cols-3 text-sm">
                    <span className="font-medium text-[var(--color-text-muted)]">Status Nacional:</span>
                    <span className={cn("col-span-2 font-bold", result.status === 'BLACKLISTED' ? 'text-red-400' : 'text-[var(--color-text-main)]')}>{result.status === 'BLACKLISTED' ? 'Restrição Ativa' : 'Nada Consta'}</span>
                  </div>
                  <div className="grid grid-cols-3 text-sm">
                    <span className="font-medium text-[var(--color-text-muted)]">Status Global (GSMA):</span>
                    <span className={cn("col-span-2 font-bold", result.status === 'BLACKLISTED' ? 'text-red-400' : 'text-[var(--color-text-main)]')}>{result.status === 'BLACKLISTED' ? 'Na Blacklist' : 'Limpo'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex items-start gap-3 p-4 bg-black/20 rounded-xl border border-[var(--color-card-border)]">
              <Info className="h-5 w-5 text-[var(--color-text-muted)] shrink-0 mt-0.5" />
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                As informações deste relatório refletem a situação do IMEI nas bases de dados no momento exato da consulta. Registros de furto e roubo podem levar algumas horas ou dias para constarem publicamente. Integração anti-fraude Meu Lucro™.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
