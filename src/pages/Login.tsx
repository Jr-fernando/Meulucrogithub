import React, { useState, useEffect } from "react";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider, appleProvider } from "../lib/firebase";
import { Smartphone, AlertCircle, Mail, Loader2, Apple, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingApple, setIsLoadingApple] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    // If the user lands here but is already authenticated, redirect
    if (auth.currentUser) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const translateError = (err: any) => {
    if (err.code === "auth/unauthorized-domain") {
      return "Domínio não autorizado. Adicione a URL da Vercel nos domínios autorizados do Firebase Authentication.";
    } else if (err.code === "auth/popup-closed-by-user") {
      return "O login foi cancelado. Tente novamente.";
    } else if (err.code === "auth/network-request-failed") {
      return "Erro de conexão. Verifique sua rede.";
    } else if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
      return "E-mail não encontrado ou senha incorreta.";
    } else if (err.code === "auth/email-already-in-use") {
      return "Este e-mail já está em uso por outra conta.";
    } else if (err.code === "auth/weak-password") {
      return "A senha deve ter pelo menos 6 caracteres.";
    } else if (err.code === "auth/operation-not-allowed") {
      return "Provedor desativado. Você precisa ir no painel do Firebase > Authentication > Sign-in method e ativar este método de login (E-mail, Google ou Apple).";
    }
    return err.message || "Falha ao processar solicitação. Tente novamente.";
  };

  const handleGoogleLogin = async () => {
    if (isLoadingGoogle) return;
    try {
      setIsLoadingGoogle(true);
      setError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(translateError(err));
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleAppleLogin = async () => {
    if (isLoadingApple) return;
    try {
      setIsLoadingApple(true);
      setError(null);
      await signInWithPopup(auth, appleProvider);
    } catch (err: any) {
      setError(translateError(err));
    } finally {
      setIsLoadingApple(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
       setError("Preencha todos os campos para continuar.");
       return;
    }
    try {
      setIsLoadingEmail(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(translateError(err));
    } finally {
      setIsLoadingEmail(false);
    }
  };

  const handleSignup = async () => {
    if (!email || !password) {
       setError("Preencha E-mail e Senha para criar um novo acesso.");
       return;
    }
    try {
      setIsLoadingEmail(true);
      setError(null);
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(translateError(err));
    } finally {
      setIsLoadingEmail(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans">
      {/* Left Panel - Branding (Desktop) */}
      <div className="hidden lg:flex w-1/2 bg-[#0A0A0B] border-r border-[#222226] flex-col justify-between p-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-primary)] to-emerald-700"></div>
        {/* Decor */}
        <div className="absolute -left-40 -bottom-40 w-96 h-96 bg-[var(--color-primary)]/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-black/50 border border-[#222226] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/10">
              <Smartphone className="h-6 w-6 text-[var(--color-primary)]" />
            </div>
            <span className="text-xl font-bold tracking-tight">Meu Lucro</span>
          </div>

          <h1 className="text-5xl font-black mb-6 tracking-tight leading-tight">
            Controle total do <br/><span className="text-[var(--color-primary)]">seu negócio</span>
          </h1>
          <p className="text-xl text-slate-400 font-medium max-w-md leading-relaxed">
            Estoque, vendas, clientes e crescimento B2B centralizados em um só lugar.
          </p>
        </div>

        <div className="relative z-10">
          <div className="flex gap-6 text-sm font-semibold text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Suporte</a>
            <a href="#" className="hover:text-[var(--color-primary)] transition-colors flex items-center gap-2">WhatsApp Direct</a>
          </div>
        </div>
      </div>

      {/* Right Panel - Login UI */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 relative bg-[#050505]">
        <div className="w-full max-w-[420px]">
          
          <div className="lg:hidden flex items-center justify-start gap-3 mb-10">
            <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-[var(--color-primary)]" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Meu Lucro</span>
          </div>

          <div className="mb-10 lg:mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-3 text-white">Acessar plataforma</h2>
            <p className="text-slate-400 text-sm">Insira suas credenciais para verificar seu status e acessar sua loja.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 text-rose-400 rounded-2xl flex items-start gap-3 border border-rose-500/20">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium leading-snug">{error}</p>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4 mb-8">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Seu E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input 
                  type="email" 
                  placeholder="exemplo@email.com" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#111114] border border-[#222226] text-white pl-12 pr-4 py-3.5 rounded-2xl focus:outline-none focus:border-[var(--color-primary)] transition-colors font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Sua Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#111114] border border-[#222226] text-white pl-12 pr-4 py-3.5 rounded-2xl focus:outline-none focus:border-[var(--color-primary)] transition-colors font-medium"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoadingEmail}
              className="w-full bg-[var(--color-primary)] text-[#050505] font-black tracking-wide py-3.5 rounded-2xl hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isLoadingEmail ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Começar a Faturar'}
            </button>
            <div className="text-center mt-6">
              <button type="button" onClick={handleSignup} className="text-sm text-slate-400 hover:text-white transition-colors font-semibold">
                Não encontrou seu E-mail? <span className="text-[var(--color-primary)] underline">Solicitar Acesso Novo</span>
              </button>
            </div>
          </form>

          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-[#222226] flex-1"></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Acesso Rápido</span>
            <div className="h-px bg-[#222226] flex-1"></div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={handleGoogleLogin} disabled={isLoadingGoogle}
              className="w-full bg-[#111114] border border-[#222226] text-white py-3.5 rounded-2xl font-bold hover:bg-[#1A1A1E] transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {isLoadingGoogle ? "Conectando..." : "Entrar com Google"}
            </button>

            <button 
              onClick={handleAppleLogin} disabled={isLoadingApple}
              className="w-full bg-[#111114] border border-[#222226] text-white py-3.5 rounded-2xl font-bold hover:bg-[#1A1A1E] transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <Apple className="h-5 w-5" />
              {isLoadingApple ? "Conectando..." : "Entrar com Apple"}
            </button>
          </div>
          
          <div className="lg:hidden mt-12 pt-8 border-t border-[#222226] text-center space-x-4 text-xs font-semibold text-slate-500 flex justify-center">
            <a href="#" className="hover:text-white transition-colors">Termos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Suporte</a>
          </div>

        </div>
      </div>
    </div>
  );
}
