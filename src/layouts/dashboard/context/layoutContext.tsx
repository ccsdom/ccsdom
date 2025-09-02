import { useState, createContext, PropsWithChildren, ReactNode } from "react";

// ==============================================================
// Interface pour le contexte de layout
interface LayoutContextProps {
  sidebarCompact: boolean;
  showMobileSideBar: boolean;
  handleSidebarCompactToggle: () => void;
  handleCloseMobileSidebar: () => void;
  handleOpenMobileSidebar: () => void;
}
// ==============================================================

// Création du contexte avec le type défini
export const LayoutContext = createContext<LayoutContextProps>({} as LayoutContextProps);

// Provider qui englobe l'application
const LayoutProvider = ({ children }: PropsWithChildren<ReactNode>) => {
  const [sidebarCompact, setSidebarCompact] = useState(false);
  const [showMobileSideBar, setShowMobileSideBar] = useState(false);

  // Toggle sidebar compacte pour grands écrans
  const handleSidebarCompactToggle = () => setSidebarCompact((prev) => !prev);

  // Ouvre sidebar mobile
  const handleOpenMobileSidebar = () => setShowMobileSideBar(true);

  // Ferme sidebar mobile
  const handleCloseMobileSidebar = () => setShowMobileSideBar(false);

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
