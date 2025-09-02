import { jsx as _jsx } from "react/jsx-runtime";
import { useState, createContext, useCallback } from "react";
// Création du contexte avec un cast vers ContextProps pour éviter les erreurs de typage
export const LayoutContext = createContext({});
const LayoutProvider = ({ children }) => {
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
    return (_jsx(LayoutContext.Provider, { value: {
            sidebarCompact,
            showMobileSideBar,
            handleSidebarCompactToggle,
            handleCloseMobileSidebar,
            handleOpenMobileSidebar,
        }, children: children }));
};
export default LayoutProvider;
