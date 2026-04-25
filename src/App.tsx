import { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { AppLayout } from "./components/AppLayout";
import { BusinessProvider } from "./contexts/BusinessContext";

// Lazy loading pages
const LoginPage = lazy(() => import("./pages/Login").then(module => ({ default: module.LoginPage })));
const DashboardPage = lazy(() => import("./pages/Dashboard").then(module => ({ default: module.DashboardPage })));
const InventoryPage = lazy(() => import("./pages/Inventory").then(module => ({ default: module.InventoryPage })));
const SalesPage = lazy(() => import("./pages/Sales").then(module => ({ default: module.SalesPage })));
const ImeiCheckPage = lazy(() => import("./pages/ImeiCheck").then(module => ({ default: module.ImeiCheckPage })));
const CalculatorPage = lazy(() => import("./pages/Calculator").then(module => ({ default: module.CalculatorPage })));
const PlansPage = lazy(() => import("./pages/Plans").then(module => ({ default: module.PlansPage })));
const CustomersPage = lazy(() => import("./pages/Customers").then(module => ({ default: module.CustomersPage })));
const CapitalPage = lazy(() => import("./pages/Capital").then(module => ({ default: module.CapitalPage })));
const SuppliersPage = lazy(() => import("./pages/Suppliers").then(module => ({ default: module.SuppliersPage })));
const ReportsPage = lazy(() => import("./pages/Reports").then(module => ({ default: module.ReportsPage })));
const AnnualReportPage = lazy(() => import("./pages/AnnualReport").then(module => ({ default: module.AnnualReportPage })));
const MarketplacePage = lazy(() => import("./pages/Marketplace").then(module => ({ default: module.MarketplacePage })));
const ClassesPage = lazy(() => import("./pages/Classes").then(module => ({ default: module.ClassesPage })));
const CommunityPage = lazy(() => import("./pages/Community").then(module => ({ default: module.CommunityPage })));
const PartnerPage = lazy(() => import("./pages/Partner").then(module => ({ default: module.PartnerPage })));
const InsightsPage = lazy(() => import("./pages/Insights").then(module => ({ default: module.InsightsPage })));
const GoalsPage = lazy(() => import("./pages/Goals").then(module => ({ default: module.GoalsPage })));
const OrdersPage = lazy(() => import("./pages/Orders").then(module => ({ default: module.OrdersPage })));
const CashPage = lazy(() => import("./pages/Cash").then(module => ({ default: module.CashPage })));
const PaymentsPage = lazy(() => import("./pages/Payments").then(module => ({ default: module.PaymentsPage })));
const CategoriesPage = lazy(() => import("./pages/Categories").then(module => ({ default: module.CategoriesPage })));
const UsersPage = lazy(() => import("./pages/Users").then(module => ({ default: module.UsersPage })));
const LabelsPage = lazy(() => import("./pages/Labels").then(module => ({ default: module.LabelsPage })));
const PrintPage = lazy(() => import("./pages/Print").then(module => ({ default: module.PrintPage })));
const CatalogPage = lazy(() => import("./pages/Catalog").then(module => ({ default: module.CatalogPage })));
const SettingsPage = lazy(() => import("./pages/Settings").then(module => ({ default: module.SettingsPage })));
const SupportPage = lazy(() => import("./pages/Support").then(module => ({ default: module.SupportPage })));
const AdminUsersPage = lazy(() => import("./pages/AdminUsers").then(module => ({ default: module.AdminUsersPage })));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B]">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent"/>
  </div>
);

export default function App() {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  if (!isAuthReady) {
    return <PageLoader />;
  }

  return (
    <BusinessProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route 
              path="/login" 
              element={!user ? <LoginPage /> : <Navigate to="/" replace />} 
            />
            
            <Route element={user ? <AppLayout /> : <Navigate to="/login" replace />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/capital" element={<CapitalPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/imei" element={<ImeiCheckPage />} />
              <Route path="/calculator" element={<CalculatorPage />} />
              <Route path="/plans" element={<PlansPage />} />
              
              {/* Stubs for Coming Soon Pages mapped in AppLayout */}
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/goals" element={<GoalsPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              
              <Route path="/cash" element={<CashPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/annual-report" element={<AnnualReportPage />} />

              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/users" element={<UsersPage />} />
              
              <Route path="/labels" element={<LabelsPage />} />
              <Route path="/print" element={<PrintPage />} />
              <Route path="/catalog" element={<CatalogPage />} />

              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/classes" element={<ClassesPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/partner" element={<PartnerPage />} />
              
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/admin-users" element={<AdminUsersPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </BusinessProvider>
  );
}
