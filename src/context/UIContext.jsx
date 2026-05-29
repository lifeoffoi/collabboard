import { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(o => !o);

  return (
    <UIContext.Provider value={{ sidebarOpen, toggleSidebar }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);
