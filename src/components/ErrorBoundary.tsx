import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-slate-100">
      <div className="max-w-md w-full bg-[#111114] border border-red-500/20 p-8 rounded-3xl shadow-2xl text-center">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
           <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-black text-white mb-3">Ops! Algo deu errado.</h1>
        <p className="text-slate-400 mb-6 text-sm">
          Encontramos um erro inesperado. Nossa equipe já foi notificada.
        </p>
        <div className="bg-[#0A0A0B] p-4 rounded-xl text-left overflow-hidden border border-[#222226] mb-8">
           <span className="text-xs font-mono text-red-400 break-all truncate block">{error instanceof Error ? error.message : String(error) || "Erro desconhecido"}</span>
        </div>
        <button 
          onClick={() => {
            resetErrorBoundary();
            window.location.reload();
          }}
          className="bg-white text-black font-bold px-6 py-3 rounded-xl w-full flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
        >
          <RefreshCw className="h-4 w-4" /> Atualizar Página
        </button>
      </div>
    </div>
  );
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ReactErrorBoundary>
  );
}
