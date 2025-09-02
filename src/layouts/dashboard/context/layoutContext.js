import { jsx as _jsx } from "react/jsx-runtime";
import { useState, createContext } from "react";
// ==============================================================
// Création du contexte avec le type défini
export const LayoutContext = createContext({});
// Provider qui englobe l'application
const LayoutProvider = ({ children }) => {
    const [sidebarCompact, setSidebarCompact] = useState(false);
    const [showMobileSideBar, setShowMobileSideBar] = useState(false);
    // Toggle sidebar compacte pour grands écrans
    const handleSidebarCompactToggle = () => setSidebarCompact((prev) => !prev);
    // Ouvre sidebar mobile
    const handleOpenMobileSidebar = () => setShowMobileSideBar(true);
    // Ferme sidebar mobile
    const handleCloseMobileSidebar = () => setShowMobileSideBar(false);
    return (_jsx(LayoutContext.Provider, { value: {
            sidebarCompact,
            showMobileSideBar,
            handleSidebarCompactToggle,
            handleCloseMobileSidebar,
            handleOpenMobileSidebar,
        }, children: children }));
};
export default LayoutProvider;
