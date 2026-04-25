import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { 
  Home, 
  Package, 
  BarChart2, 
  Settings, 
  Menu, 
  X, 
  LogOut, 
  Plus, 
  LayoutGrid, 
  DollarSign, 
  Users, 
  PieChart, 
  TrendingUp, 
  Store, 
  Smartphone,
  Crown,
  ChevronDown,
  Sparkles,
  MonitorSmartphone,
  Tag,
  BookOpen,
  ShoppingCart,
  Wallet,
  Calculator,
  Target,
  MessageSquarePlus,
  GraduationCap,
  ShieldCheck,
  LifeBuoy,
  Handshake,
  Bell,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useBusiness } from "../contexts/BusinessContext";
import { UpgradeModal } from "./UpgradeModal";

type BusinessProfile = "revenda" | "loja" | "misto" | null;

interface UserProfile {
  businessProfile: BusinessProfile;
  plan: string;
  email?: string;
  role?: string;
  isAdmin?: boolean;
  isApproved?: boolean;
  hasPaid?: boolean;
  subscriptionStatus?: string;
  paymentStatus?: string;
}

// Configuration constant for master admins. 
// Used to cleanly identify system administrators.
const MASTER_ADMIN_EMAILS = [
  'fernandouuo3@gmail.com',
  'hanktecnologia@gmail.com'
];

export function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isBusinessMenuOpen, setIsBusinessMenuOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const { currentBusiness, businesses, isUpgradeModalOpen, openUpgradeModal, closeUpgradeModal, setCurrentBusiness, addBusiness } = useBusiness();
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsQuickActionsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    async function loadProfile() {
      if (!auth.currentUser) return;
      try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setUserProfile(data);
          window.localStorage.setItem('userPlan', data.plan || 'Pro');
        } else {
           const isMasterAdmin = auth.currentUser?.email ? MASTER_ADMIN_EMAILS.includes(auth.currentUser.email) : false;
           const newProfile = {
              email: auth.currentUser.email,
              role: isMasterAdmin ? 'admin' : 'user',
              isAdmin: isMasterAdmin,
              isApproved: true, // Freemium starts approved
              hasPaid: isMasterAdmin,
              plan: isMasterAdmin ? "VIP" : "Free",
              subscriptionStatus: isMasterAdmin ? 'active' : 'inactive',
              paymentStatus: isMasterAdmin ? 'paid' : 'pending',
              createdAt: serverTimestamp(),
              uid: auth.currentUser.uid,
              businessProfile: null
           };
           await setDoc(userRef, newProfile);
           setUserProfile(newProfile as UserProfile);
           window.localStorage.setItem('userPlan', newProfile.plan);
        }
      } catch (error) {
         console.error('Error fetching profile (Provavelmente regras de segurança bloqueando):', error);
         // Fallback otimista para não travar a tela caso o Firebase bloqueie (regras não deployadas)
         const isMasterAdmin = auth.currentUser?.email ? MASTER_ADMIN_EMAILS.includes(auth.currentUser.email) : false;
         setUserProfile({
            email: auth.currentUser?.email,
            role: isMasterAdmin ? 'admin' : 'user',
            isAdmin: isMasterAdmin,
            isApproved: true, // Freemium fallback
            hasPaid: isMasterAdmin,
            plan: isMasterAdmin ? "VIP" : "Free",
            subscriptionStatus: isMasterAdmin ? 'active' : 'inactive',
            paymentStatus: isMasterAdmin ? 'paid' : 'pending',
            businessProfile: null
         } as UserProfile); 
      } finally {
        setIsLoadingProfile(false);
      }
    }
    loadProfile();
  }, []);

  const handleSelectProfile = async (profile: BusinessProfile) => {
    if (!auth.currentUser) return;
    
    // Atualização otimista (Performance)
    const newProfile = userProfile ? { ...userProfile, businessProfile: profile } : { businessProfile: profile, isAdmin: true, hasPaid: true, isApproved: true } as UserProfile;
    setUserProfile(newProfile as UserProfile);

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userRef, { businessProfile: profile, updatedAt: serverTimestamp() }, { merge: true });
    } catch (error) {
      console.error("Error setting profile (Regras de segurança bloqueando):", error);
      // Mantemos o estado otimista para não travar o usuário
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // --- GATEKEEPER REMOVED FOR FREEMIUM MODEL ---

  const baseNavGroups = [
    {
      title: "VISÃO GERAL",
      items: [
        { name: "Dashboard", path: "/", icon: LayoutGrid },
        { name: "Insights AI", path: "/insights", icon: Sparkles, badge: "PREMIUM" },
      ]
    },
    {
      title: "OPERAÇÃO",
      items: [
        { name: "Caixa (PDV)", path: "/cash", icon: MonitorSmartphone },
        { name: "Estoque", path: "/inventory", icon: Package },
        { name: "Etiquetas", path: "/labels", icon: Tag },
        { name: "Catálogo", path: "/catalog", icon: BookOpen },
        { name: "Pedidos Web", path: "/orders", icon: ShoppingCart },
        { name: "Vendas", path: "/sales", icon: DollarSign },
      ]
    },
    {
      title: "FINANCEIRO",
      items: [
        { name: "Painel Financeiro", path: "/capital", icon: Wallet, badge: "PRO" },
        { name: "Calculadora de Lucro", path: "/calculator", icon: Calculator },
        { name: "Relatórios", path: "/reports", icon: PieChart, badge: "PRO" },
      ]
    },
    {
      title: "GESTÃO",
      items: [
        { name: "Clientes CRM", path: "/customers", icon: Users },
        { name: "Equipe", path: "/users", icon: Users, badge: "PREMIUM" },
        { name: "Metas Táticas", path: "/goals", icon: Target, badge: "PRO" },
        { name: "Programa de Sócios", path: "/partner", icon: Handshake, badge: "PRO" },
      ]
    },
    {
      title: "EXPANSÃO",
      items: [
        { name: "Marketplace B2B", path: "/marketplace", icon: Store, badge: "VIP" },
        { name: "Comunidade PRO", path: "/community", icon: MessageSquarePlus, badge: "PRO" },
        { name: "Treinamentos", path: "/classes", icon: GraduationCap, badge: "PRO" },
        { name: "Consulta IMEI", path: "/imei", icon: ShieldCheck, badge: "VIP" },
      ]
    },
    {
      title: "SISTEMA",
      items: [
        { name: "Avançar de Plano", path: "/plans", icon: Crown },
        { name: "Configurações", path: "/settings", icon: Settings },
        { name: "Suporte", path: "/support", icon: LifeBuoy },
      ]
    }
  ];

  const adminGroup = {
    title: "ADMINISTRAÇÃO",
    items: [
      { name: "Aprovar Usuários", path: "/admin-users", icon: ShieldCheck, badge: "ADMIN" }
    ]
  };

  const isMasterAdmin = auth.currentUser?.email ? MASTER_ADMIN_EMAILS.includes(auth.currentUser.email) : false;
  const isAdmin = userProfile?.isAdmin || isMasterAdmin;
  const navGroups = isAdmin ? [...baseNavGroups, adminGroup] : baseNavGroups;

  const handleNavClick = (e: any, item: any) => {
    // Check if user has master admin rights
    const isMasterAdmin = auth.currentUser?.email ? MASTER_ADMIN_EMAILS.includes(auth.currentUser.email) : false;
    const isUserAdmin = userProfile?.isAdmin || isMasterAdmin;
    if (isUserAdmin) return; // Admins bypass all navigation locks
    
    const userPlan = window.localStorage.getItem('userPlan') || userProfile?.plan || 'Free';
    const hierarchy = { "Free": 0, "Pro": 1, "Premium": 2, "VIP": 3 };
    const currentLevel = hierarchy[userPlan as keyof typeof hierarchy] || 0;

    const requiresVip = ["/imei", "/marketplace"];
    const requiresPremium = ["/insights", "/users"];
    const requiresPro = ["/reports", "/goals", "/community", "/classes", "/partner", "/capital"];

    if (requiresVip.includes(item.path) && currentLevel < 3) {
      e.preventDefault();
      openUpgradeModal(item.name, "VIP");
      return;
    }

    if (requiresPremium.includes(item.path) && currentLevel < 2) {
      e.preventDefault();
      openUpgradeModal(item.name, "Premium");
      return;
    }

    if (requiresPro.includes(item.path) && currentLevel < 1) {
      e.preventDefault();
      openUpgradeModal(item.name, "Pro");
      return;
    }
    
    setIsMobileMenuOpen(false);
  };

  if (isLoadingProfile) {
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin"></div></div>;
  }

  // --- ONBOARDING INTELIGENTE ---
  if (!userProfile?.businessProfile) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center p-6 text-slate-100 font-sans selection:bg-[var(--color-primary)] selection:text-black">
        <div className="max-w-4xl w-full">
          <div className="flex justify-center mb-10">
            <div className="bg-[var(--color-primary)]/10 p-4 rounded-3xl border border-[var(--color-primary)]/20 shadow-[0_0_40px_rgba(0,223,100,0.15)] flex items-center gap-3">
              <Package className="h-10 w-10 text-[var(--color-primary)]" />
              <span className="text-2xl font-black tracking-tighter">Meu Lucro</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-center tracking-tight mb-4">Como deseja usar o <span className="text-[var(--color-primary)]">sistema</span>?</h1>
          <p className="text-slate-400 text-center mb-12 text-base md:text-lg max-w-2xl mx-auto">
            Vamos reorganizar a interface para o seu modelo de negócio, garantindo que tudo fique a 1 clique de distância.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button onClick={() => handleSelectProfile("revenda")} className="bg-[#111114] border border-[#222226] hover:border-[var(--color-primary)] p-8 rounded-3xl text-left transition-all hover:-translate-y-2 group shadow-xl">
              <div className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Smartphone className="h-7 w-7" /></div>
              <h3 className="text-xl font-bold text-white mb-3">Revenda / Brick</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Foco em lucro líquido, ROI, vendas de aparelhos seminovos e inteligência de estoque rápido.</p>
            </button>

            <button onClick={() => handleSelectProfile("loja")} className="bg-[#111114] border border-[#222226] hover:border-blue-500 p-8 rounded-3xl text-left transition-all hover:-translate-y-2 group shadow-xl">
              <div className="bg-blue-500/10 text-blue-500 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Store className="h-7 w-7" /></div>
              <h3 className="text-xl font-bold text-white mb-3">Loja Físca / Comércio</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Foco em ponto de venda (PDV), categorias, emissão de recibos, controle de acessórios diários.</p>
            </button>

            <button onClick={() => handleSelectProfile("misto")} className="bg-[#111114] border border-[#222226] hover:border-amber-500 p-8 rounded-3xl text-left transition-all hover:-translate-y-2 group shadow-xl">
              <div className="bg-amber-500/10 text-amber-500 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><LayoutGrid className="h-7 w-7" /></div>
              <h3 className="text-xl font-bold text-white mb-3">Uso Misto (Tudo)</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Mostramos todos os recursos de forma equilibrada. Perfeito para crescimento e digitalização total.</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col md:flex-row font-sans text-slate-100">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <aside 
        onMouseEnter={() => setIsDesktopCollapsed(false)}
        onMouseLeave={() => setIsDesktopCollapsed(true)}
        className={cn(
          "hidden md:flex flex-col fixed inset-y-0 left-0 z-40 bg-[#0A0A0B] border-r border-[#222226] transition-all duration-300 shadow-2xl",
          isDesktopCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="relative border-b border-[#222226]/50 flex items-center pr-3">
          <button 
            onClick={() => !isDesktopCollapsed && setIsBusinessMenuOpen(!isBusinessMenuOpen)}
            className="h-20 flex items-center px-5 shrink-0 hover:bg-[#111114] transition-colors flex-1 min-w-0"
          >
            <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center shrink-0 border border-[var(--color-primary)]/20 shadow-[0_0_15px_rgba(0,223,100,0.1)]">
               <Package className="h-6 w-6 text-[var(--color-primary)]" />
            </div>
            <div className={cn("ml-4 flex flex-col items-start transition-opacity duration-200 overflow-hidden whitespace-nowrap flex-1", isDesktopCollapsed && "opacity-0 invisible")}>
               <div className="flex items-center gap-2 w-full">
                 <span className="font-black text-lg text-white truncate">{currentBusiness?.name || 'Meu Lucro'}</span>
                 <ChevronDown className={cn("h-4 w-4 text-slate-500 transition-transform shrink-0", isBusinessMenuOpen && "rotate-180")} />
               </div>
               <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1"><Crown className="h-3 w-3"/> Plano {userProfile.plan}</span>
            </div>
          </button>
          
          <button 
             onClick={() => openUpgradeModal('Notificações Inteligentes', 'Premium')}
             className={cn("p-2 shrink-0 rounded-full bg-[#111114] border border-[#222226] text-slate-400 hover:bg-[#1A1A1E] hover:text-white transition-all relative", isDesktopCollapsed && "hidden")}
          >
             <Bell className="h-4 w-4" />
             <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 border border-[#0A0A0B] rounded-full"></span>
          </button>
          
          <AnimatePresence>
            {isBusinessMenuOpen && !isDesktopCollapsed && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 w-full bg-[#111114] border-b border-[#222226] z-50 py-2 shadow-2xl"
              >
                {businesses.map((b) => (
                  <button 
                    key={b.id}
                    onClick={() => { setCurrentBusiness(b); setIsBusinessMenuOpen(false); }}
                    className={cn(
                      "w-full text-left px-5 py-3 text-sm font-bold transition-colors hover:bg-[#1A1A1E] flex items-center justify-between",
                      currentBusiness?.id === b.id ? "text-[var(--color-primary)]" : "text-slate-300"
                    )}
                  >
                    <span className="truncate">{b.name}</span>
                    {currentBusiness?.id === b.id && <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]"></div>}
                  </button>
                ))}
                
                <button 
                  onClick={() => {
                    setIsBusinessMenuOpen(false);
                    // Check limits
                    if (!isAdmin && userProfile.plan === "Pro" && businesses.length >= 1) return openUpgradeModal("Criar 2º Comércio", "Premium");
                    if (!isAdmin && userProfile.plan === "Premium" && businesses.length >= 3) return openUpgradeModal("Lojas Ilimitadas", "VIP");
                    
                    const name = prompt("Nome do novo comércio:");
                    if (name) addBusiness(name, userProfile.businessProfile || 'loja');
                  }}
                  className="w-full text-left px-5 py-3 text-sm font-bold text-slate-500 hover:text-white hover:bg-[#1A1A1E] transition-colors flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Adicionar Comércio
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-6 space-y-6 custom-scrollbar pb-20">
           {navGroups.map((group, groupIdx) => (
             <div key={groupIdx} className="flex flex-col">
               <div className={cn("px-4 mb-2 transition-all duration-200", isDesktopCollapsed ? "opacity-0 invisible h-0 mb-0" : "opacity-100")}>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{group.title}</span>
               </div>
               
               <div className="space-y-1">
                 {group.items.map((item, i) => (
                   <NavLink 
                      key={i} 
                      to={item.path}
                      onClick={(e) => handleNavClick(e, item)}
                      onMouseEnter={() => {
                        switch (item.path) {
                          case '/': import('../pages/Dashboard'); break;
                          case '/inventory': import('../pages/Inventory'); break;
                          case '/sales': import('../pages/Sales'); break;
                          case '/customers': import('../pages/Customers'); break;
                          case '/capital': import('../pages/Capital'); break;
                          case '/reports': import('../pages/Reports'); break;
                          case '/calculator': import('../pages/Calculator'); break;
                          case '/plans': import('../pages/Plans'); break;
                          case '/users': import('../pages/Users'); break;
                          case '/marketplace': import('../pages/Marketplace'); break;
                          case '/community': import('../pages/Community'); break;
                          case '/classes': import('../pages/Classes'); break;
                          case '/imei': import('../pages/ImeiCheck'); break;
                          case '/cash': import('../pages/Cash'); break;
                          case '/labels': import('../pages/Labels'); break;
                          case '/catalog': import('../pages/Catalog'); break;
                          case '/orders': import('../pages/Orders'); break;
                          case '/goals': import('../pages/Goals'); break;
                          case '/partner': import('../pages/Partner'); break;
                          case '/insights': import('../pages/Insights'); break;
                          case '/settings': import('../pages/Settings'); break;
                          case '/support': import('../pages/Support'); break;
                        }
                      }}
                      className={({isActive}) => cn(
                        "flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all relative group cursor-pointer overflow-hidden outline-none",
                        isActive ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "text-slate-400 hover:bg-[#1A1A1E] hover:text-white"
                      )}
                   >
                      {({isActive}) => (
                        <>
                          <item.icon className="h-5 w-5 shrink-0 relative z-10" />
                          <div className={cn("flex flex-1 items-center justify-between min-w-0 transition-opacity duration-200", isDesktopCollapsed && "opacity-0 invisible w-0")}>
                            <span className="font-semibold text-sm whitespace-nowrap truncate">{item.name}</span>
                            {item.badge && (
                              <span className={cn(
                                "text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md",
                                isActive ? "bg-[var(--color-primary)]/20 text-[var(--color-primary)]" : "bg-amber-500/20 text-amber-500"
                              )}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {isActive && <motion.div layoutId="sidebar-active" className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 bg-[var(--color-primary)] rounded-r-lg" />}
                          
                          {/* Tooltip for collapsed mode */}
                          {isDesktopCollapsed && (
                            <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#1A1A1E] border border-[#2A2A2E] text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl z-50 flex items-center gap-2">
                              {item.name}
                              {item.badge && <span className="bg-amber-500/20 text-amber-500 text-[9px] px-1 rounded uppercase">{item.badge}</span>}
                            </div>
                          )}
                        </>
                      )}
                   </NavLink>
                 ))}
               </div>
             </div>
           ))}
        </div>

        <div className="p-4 border-t border-[#222226]/50">
           <button onClick={handleLogout} className={cn("flex items-center gap-4 px-3.5 py-3 rounded-2xl text-slate-500 hover:bg-rose-500/10 hover:text-rose-500 transition-colors w-full", isDesktopCollapsed && "justify-center")}>
              <LogOut className="h-5 w-5 shrink-0" />
              <span className={cn("font-semibold text-sm whitespace-nowrap", isDesktopCollapsed && "hidden")}>Sair da Conta</span>
           </button>
        </div>
      </aside>

      {/* --- MOBILE MAIN TOP BAR --- */}
      <header className="md:hidden bg-[#0A0A0B]/80 backdrop-blur-2xl border-b border-[#222226]/80 sticky top-0 z-30 flex items-center justify-between px-5 h-[72px] shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-white active:scale-95 transition-transform">
             <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2 text-white font-black text-xl tracking-tighter">
            <Package className="h-6 w-6 text-[var(--color-primary)] drop-shadow-[0_0_10px_rgba(0,223,100,0.5)]" />
            <span>Meu Lucro</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={() => openUpgradeModal('Notificações', 'Premium')} className="relative text-slate-400 p-1 active:scale-95 transition-transform">
             <Bell className="h-6 w-6" />
             <span className="absolute top-0 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#0A0A0B]"></span>
           </button>
           <button className="bg-amber-500/10 px-3 py-1.5 rounded-lg text-amber-500 font-extrabold text-[11px] uppercase tracking-widest flex items-center gap-1.5 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)] active:scale-95 transition-transform">
              <Crown className="h-4 w-4" /> PRO
           </button>
        </div>
      </header>

      {/* --- CONTENT WORKSPACE --- */}
      <main className={cn(
        "flex-1 transition-all duration-300 w-full min-w-0 bg-[#050505]",
        isDesktopCollapsed ? "md:ml-20" : "md:ml-64"
      )}>
        <div className="p-4 md:p-8 lg:p-10 pb-28 md:pb-10 max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)]">
          <Outlet />
        </div>
      </main>

      {/* --- NEW MOBILE BOTTOM NAVIGATION --- */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 z-40 bg-[#111114]/80 backdrop-blur-3xl border border-[#222226]/80 shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-3xl h-[76px] flex items-center justify-between px-2">
         {/* Fab background helper block */}
         <div className="absolute left-1/2 -top-1/2 -translate-x-1/2 w-[88px] h-[88px] bg-transparent rounded-full border-t border-[#222226]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }} />

         <div className="flex-1 flex justify-evenly h-full relative z-10">
           <NavLink to="/" className={({isActive}) => cn("flex flex-col items-center justify-center gap-1 transition-all h-full w-full", isActive ? "text-[var(--color-primary)]" : "text-slate-500 hover:text-slate-300")}>
             {({isActive}) => <><Home className={cn("h-6 w-6 transition-transform", isActive && "fill-[var(--color-primary)]/10 scale-110")} strokeWidth={isActive ? 2.5 : 2} /><span className="text-[10px] font-bold">Início</span></>}
           </NavLink>
           <NavLink to="/inventory" className={({isActive}) => cn("flex flex-col items-center justify-center gap-1 transition-all h-full w-full", isActive ? "text-[var(--color-primary)]" : "text-slate-500 hover:text-slate-300")}>
             {({isActive}) => <><Package className={cn("h-6 w-6 transition-transform", isActive && "fill-[var(--color-primary)]/10 scale-110")} strokeWidth={isActive ? 2.5 : 2} /><span className="text-[10px] font-bold">Estoque</span></>}
           </NavLink>
         </div>

         {/* CENTRAL SUPER BUTTON */}
         <div className="w-[88px] px-2 shrink-0 flex justify-center relative z-20">
           <button 
             onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
             className={cn(
               "absolute -top-[36px] h-[72px] w-[72px] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,223,100,0.4)] transition-all border-[8px] border-[#0A0A0B] active:scale-95",
               isQuickActionsOpen 
                ? "bg-[#222226] text-white rotate-45 shadow-none border-[#111114]" 
                : "bg-[var(--color-primary)] text-[#050505]"
             )}
           >
             <Plus className="h-8 w-8" strokeWidth={3} />
           </button>
         </div>

         <div className="flex-1 flex justify-evenly h-full relative z-10">
           <NavLink to="/sales" className={({isActive}) => cn("flex flex-col items-center justify-center gap-1 transition-all h-full w-full", isActive ? "text-[var(--color-primary)]" : "text-slate-500 hover:text-slate-300")}>
             {({isActive}) => <><DollarSign className={cn("h-6 w-6 transition-transform", isActive && "fill-[var(--color-primary)]/10 scale-110")} strokeWidth={isActive ? 2.5 : 2} /><span className="text-[10px] font-bold">Vendas</span></>}
           </NavLink>
           <NavLink to="/reports" className={({isActive}) => cn("flex flex-col items-center justify-center gap-1 transition-all h-full w-full", isActive ? "text-[var(--color-primary)]" : "text-slate-500 hover:text-slate-300")}>
             {({isActive}) => <><BarChart2 className={cn("h-6 w-6 transition-transform", isActive && "fill-[var(--color-primary)]/10 scale-110")} strokeWidth={isActive ? 2.5 : 2} /><span className="text-[10px] font-bold">Painel</span></>}
           </NavLink>
         </div>
      </nav>

      {/* --- QUICK ACTION OVERLAYS --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)} 
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div 
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-[#0A0A0B] border-r border-[#222226] z-50 flex flex-col md:hidden shadow-2xl"
            >
              <div className="p-5 border-b border-[#222226] flex flex-col gap-4">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-[#1A1A1E] border border-[#2A2A2E] rounded-full flex items-center justify-center text-[var(--color-primary)] font-bold text-lg">
                         {(auth.currentUser?.displayName || auth.currentUser?.email || 'U')[0].toUpperCase()}
                       </div>
                       <div className="flex flex-col min-w-0">
                         <span className="text-white font-bold text-sm truncate w-32">{auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Usuário'}</span>
                         <div className="flex items-center gap-1.5 mt-0.5">
                            {isAdmin && <span className="bg-red-500/20 text-red-500 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1"><ShieldCheck className="h-2.5 w-2.5" /> Admin</span>}
                            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                              <Crown className="h-3 w-3 text-amber-500 shrink-0" /> {userProfile?.plan || 'Pro'}
                            </span>
                         </div>
                       </div>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 p-2 bg-[#222226] rounded-full active:scale-95">
                       <X className="h-4 w-4" />
                    </button>
                 </div>

                 {/* Business Dropdown for Mobile */}
                 <div className="bg-[#111114] rounded-xl border border-[#222226] p-1 flex flex-col relative overflow-visible">
                    <button 
                      onClick={() => setIsBusinessMenuOpen(!isBusinessMenuOpen)}
                      className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg hover:bg-[#1A1A1E] transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Store className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="text-sm font-semibold text-white truncate w-32 text-left">{currentBusiness?.name || 'Meu Lucro'}</span>
                      </div>
                      <ChevronDown className={cn("h-4 w-4 text-slate-500 transition-transform shrink-0", isBusinessMenuOpen && "rotate-180")} />
                    </button>
                    
                    <AnimatePresence>
                      {isBusinessMenuOpen && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex flex-col pt-1 border-t border-[#2A2A2E]/50 mt-1 overflow-hidden"
                        >
                          {businesses.map((b) => (
                            <button 
                              key={b.id}
                              onClick={() => { setCurrentBusiness(b); setIsBusinessMenuOpen(false); setIsMobileMenuOpen(false); }}
                              className={cn(
                                "w-full text-left px-3 py-2.5 text-xs font-bold transition-colors hover:bg-[#1A1A1E] rounded-lg flex items-center justify-between",
                                currentBusiness?.id === b.id ? "text-[var(--color-primary)]" : "text-slate-400"
                              )}
                            >
                              <span className="truncate">{b.name}</span>
                              {currentBusiness?.id === b.id && <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] shrink-0"></div>}
                            </button>
                          ))}
                          <button 
                            onClick={() => {
                              setIsBusinessMenuOpen(false);
                              if (!isAdmin && userProfile?.plan === "Pro" && businesses.length >= 1) { setIsMobileMenuOpen(false); return openUpgradeModal("Criar 2º Comércio", "Premium"); }
                              if (!isAdmin && userProfile?.plan === "Premium" && businesses.length >= 3) { setIsMobileMenuOpen(false); return openUpgradeModal("Lojas Ilimitadas", "VIP"); }
                              const name = prompt("Nome do novo comércio:");
                              if (name) addBusiness(name, userProfile?.businessProfile || 'loja');
                            }}
                            className="w-full text-left px-3 py-2.5 text-xs font-bold text-slate-500 hover:text-white rounded-lg flex items-center gap-2"
                          >
                            <Plus className="h-3 w-3" /> Adicionar Comércio
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                 </div>

                 <button 
                   onClick={() => { setIsMobileMenuOpen(false); navigate('/plans'); }}
                   className="w-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-[var(--color-primary)]/20 active:scale-95 transition-all"
                 >
                   <Crown className="h-4 w-4" strokeWidth={2.5} /> Fazer Upgrade
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar pb-32">
                 {navGroups.map((group, groupIdx) => (
                   <div key={groupIdx} className="flex flex-col">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 px-2">{group.title}</span>
                     <div className="space-y-1">
                       {group.items.map((item, i) => (
                         <NavLink 
                            key={i} 
                            to={item.path}
                            onClick={(e) => {
                               if (isAdmin) {
                                  setIsMobileMenuOpen(false);
                                  return;
                               }
                               if ((item.badge === "VIP" && userProfile?.plan !== "VIP") || (item.path === "/marketplace" && userProfile?.plan !== "VIP")) {
                                  e.preventDefault();
                                  setIsMobileMenuOpen(false);
                                  openUpgradeModal(item.name, "VIP");
                               } else {
                                  setIsMobileMenuOpen(false);
                               }
                            }}
                            className={({isActive}) => cn(
                              "flex items-center justify-between gap-4 px-3 py-3 rounded-xl transition-all",
                              isActive ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "text-slate-400 hover:bg-[#1A1A1E] hover:text-white"
                            )}
                         >
                            {({isActive}) => (
                              <>
                                <div className="flex items-center gap-3">
                                  <item.icon className="h-5 w-5 shrink-0" />
                                  <span className="font-semibold text-sm">{item.name}</span>
                                </div>
                                {item.badge && (
                                  <span className={cn(
                                    "text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md",
                                    isActive ? "bg-[var(--color-primary)]/20 text-[var(--color-primary)]" : "bg-amber-500/20 text-amber-500"
                                  )}>
                                    {item.badge}
                                  </span>
                                )}
                              </>
                            )}
                         </NavLink>
                       ))}
                     </div>
                   </div>
                 ))}
                 <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 hover:bg-rose-500/10 hover:text-rose-500 transition-colors w-full mt-4">
                    <LogOut className="h-5 w-5 shrink-0" />
                    <span className="font-semibold text-sm">Sair da Conta</span>
                 </button>
              </div>
            </motion.div>
          </>
        )}

        {isQuickActionsOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-[110px] left-4 right-4 bg-[#111114] border border-[#222226] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 p-4 md:auto md:left-auto md:right-10 md:bottom-10 md:w-80"
          >
            <h4 className="text-white font-black mb-4 px-2 tracking-tight">O que deseja fazer?</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { n: "Venda Rápida", i: DollarSign, c: "text-[var(--color-primary)]", bg: "bg-[var(--color-primary)]/10", p: "/sales" },
                { n: "Novo Aparelho", i: Smartphone, c: "text-blue-400", bg: "bg-blue-400/10", p: "/inventory" },
                { n: "+ Despesa", i: TrendingUp, c: "text-rose-400", bg: "bg-rose-400/10", p: "/capital" },
                { n: "Novo Cliente", i: Users, c: "text-amber-400", bg: "bg-amber-400/10", p: "/customers" }
              ].map((act, i) => (
                <button key={i} onClick={() => {setIsQuickActionsOpen(false); navigate(act.p);}} className="bg-[#1A1A1E] border border-[#2A2A2E] p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-colors active:bg-[#222226]">
                   <div className={cn("p-3 rounded-full", act.bg)}>
                      <act.i className={cn("h-6 w-6", act.c)} />
                   </div>
                   <span className="text-white font-bold text-xs">{act.n}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {isQuickActionsOpen && <div onClick={() => setIsQuickActionsOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />}
      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={closeUpgradeModal} />
    </div>
  );
}
