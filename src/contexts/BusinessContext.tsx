import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, query, where, onSnapshot, addDoc, doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export interface Business {
  id: string;
  name: string;
  type: string;
}

interface BusinessContextType {
  businesses: Business[];
  currentBusiness: Business | null;
  setCurrentBusiness: (business: Business) => void;
  isLoading: boolean;
  addBusiness: (name: string, type: string) => Promise<void>;
  isUpgradeModalOpen: boolean;
  upgradeModalContext: { featureName: string; requiredPlan: 'Premium' | 'Pro' | 'VIP' } | null;
  openUpgradeModal: (featureName?: any, requiredPlan?: 'Premium' | 'Pro' | 'VIP') => void;
  closeUpgradeModal: () => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeModalContext, setUpgradeModalContext] = useState<{ featureName: string; requiredPlan: 'Premium' | 'Pro' | 'VIP' } | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'businesses'),
      where('uid', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Business[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Business));
      
      setBusinesses(data);
      if (data.length > 0 && !currentBusiness) {
        setCurrentBusiness(data[0]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth.currentUser?.uid]);

  const addBusiness = async (name: string, type: string) => {
    if (!auth.currentUser) return;
    
    const currentPlan = window.localStorage.getItem('userPlan') || 'Free';
    const maxBusinesses = currentPlan === 'VIP' ? 999 
                        : currentPlan === 'Premium' ? 10 
                        : currentPlan === 'Pro' ? 3 
                        : 1;

    if (businesses.length >= maxBusinesses) {
       const requiredPlan = currentPlan === 'Free' ? 'Pro' : currentPlan === 'Pro' ? 'Premium' : 'VIP';
       openUpgradeModal("Múltiplos Comércios", requiredPlan as any);
       return;
    }

    const docRef = await addDoc(collection(db, 'businesses'), {
      uid: auth.currentUser.uid,
      name,
      type,
      createdAt: new Date()
    });
    const newBusiness = { id: docRef.id, name, type };
    setCurrentBusiness(newBusiness);
  };

  const openUpgradeModal = (featureName?: any, requiredPlan: any = 'Premium') => {
    let name = "Recurso Exclusivo";
    let plan = 'Premium';
    if (typeof featureName === 'string' && featureName.trim() !== '') {
        name = featureName;
    }
    if (typeof requiredPlan === 'string' && requiredPlan !== '') {
        plan = requiredPlan;
    }
    setUpgradeModalContext({ featureName: name, requiredPlan: plan as any });
    setIsUpgradeModalOpen(true);
  };
  
  const closeUpgradeModal = () => {
    setIsUpgradeModalOpen(false);
    // Add small delay to keep context for exist animation
    setTimeout(() => setUpgradeModalContext(null), 300);
  };

  return (
    <BusinessContext.Provider value={{ 
      businesses, 
      currentBusiness, 
      setCurrentBusiness, 
      isLoading, 
      addBusiness,
      isUpgradeModalOpen,
      upgradeModalContext,
      openUpgradeModal,
      closeUpgradeModal
    }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}
