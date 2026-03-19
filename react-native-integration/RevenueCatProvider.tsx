import React, { useEffect, createContext, useContext, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { LogLevel, CustomerInfo } from 'react-native-purchases';

const REVENUECAT_API_KEY = 'test_iVFOghuVDvIbTlAqOpUNQhQEAqo';
const ENTITLEMENT_ID = 'premium_access';

interface RevenueCatContextState {
  isPro: boolean;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
}

const RevenueCatContext = createContext<RevenueCatContextState>({
  isPro: false,
  isLoading: true,
  customerInfo: null,
});

export const useRevenueCat = () => useContext(RevenueCatContext);

export const RevenueCatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPro, setIsPro] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initRevenueCat = async () => {
      try {
        Purchases.setLogLevel(LogLevel.DEBUG);

        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          Purchases.configure({ apiKey: REVENUECAT_API_KEY });
        }

        const info = await Purchases.getCustomerInfo();
        setCustomerInfo(info);
        setIsPro(typeof info.entitlements.active[ENTITLEMENT_ID] !== "undefined");
      } catch (e) {
        console.error("Error initializing RevenueCat:", e);
      } finally {
        setIsLoading(false);
      }
    };

    initRevenueCat();

    const customerInfoListener = Purchases.addCustomerInfoUpdateListener((info) => {
      setCustomerInfo(info);
      setIsPro(typeof info.entitlements.active[ENTITLEMENT_ID] !== "undefined");
    });

    return () => {
      Purchases.removeCustomerInfoUpdateListener(customerInfoListener);
    };
  }, []);

  return (
    <RevenueCatContext.Provider value={{ isPro, isLoading, customerInfo }}>
      {children}
    </RevenueCatContext.Provider>
  );
};
