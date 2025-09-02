import { useState, createContext, PropsWithChildren, useCallback } from "react";

// Interface des propriétés du contexte
interface ContextProps {
  sidebarCompact: boolean;
  showMobileSideBar: boolean;
  handleSidebarCompactToggle: () => void;
  handleCloseMobileSidebar: () => void;
  handleOpenMobileSidebar: () => void;
}

// Création du contexte avec un cast vers ContextProps pour éviter les erreurs de typage
export const LayoutContext = createContext<ContextProps>({} as ContextProps);

const LayoutProvider = ({ children }: PropsWithChildren) => {
  const [sidebarCompact, setSidebarCompact] = useState(false);
  const [showMobileSideBar, setShowMobileSideBar] = useState(false);

  // Utilisation de useCallback pour éviter de recréer les fonctions à chaque rendu
  const handleSidebarCompactToggle = useCallback(() => {
    setSidebarCompact(prev => !prev);
  }, []);

  const handleOpenMobileSidebar = useCallback(() => {
    setShowMobileSideBar(true);
  }, []);

  const handleCloseMobileSidebar = useCallback(() => {
    setShowMobileSideBar(false);
  }, []);

  return (
    <LayoutContext.Provider
      value={{
        sidebarCompact,
        showMobileSideBar,
        handleSidebarCompactToggle,
        handleCloseMobileSidebar,
        handleOpenMobileSidebar,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export default LayoutProvider;
