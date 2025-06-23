import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type TabContextType = {
  activeTab: string;
  changeTab: (tabId: string) => void;
};

const TabContext = createContext<TabContextType | null>(null);

export const TabProvider = ({ children }: { children: ReactNode }) => {
  const [activeTab, setActiveTab] = useState<string>('all-cats');
  
  const changeTab = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <TabContext.Provider value={{ activeTab, changeTab }}>
      {children}
    </TabContext.Provider>
  );
};

export const useTabs = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTabs must be used within a TabProvider');
  }
  return context;
};