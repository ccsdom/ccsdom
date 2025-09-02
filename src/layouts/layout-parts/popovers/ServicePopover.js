import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment, useRef, useState } from "react";
import { Badge, IconButton } from "@mui/material";
// CUSTOM COMPONENTS
import PopoverLayout from "./PopoverLayout";
import { FlexBox } from "@/components/flexbox";
import { Paragraph, Small } from "@/components/typography";
// Icônes MUI parlantes
import BusinessIcon from '@mui/icons-material/Business'; // Création d’entreprise
import EditIcon from '@mui/icons-material/Edit'; // Modification d’entreprise
import HighlightOffIcon from '@mui/icons-material/HighlightOff'; // Liquidation d’entreprise
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'; // Comptabilité
import PaymentIcon from '@mui/icons-material/Payment'; // Gestion de paie
import Apps from "@/icons/duotone/Apps";
const SERVICES = [
    {
        id: 1,
        title: "Création d'entreprises",
        body: "Accompagnement complet pour la création de votre société",
        icon: BusinessIcon,
    },
    {
        id: 2,
        title: "Modification d'entreprises",
        body: "Gestion des modifications statutaires et administratives",
        icon: EditIcon,
    },
    {
        id: 3,
        title: "Liquidation d'entreprises",
        body: "Processus simplifié pour la liquidation et clôture",
        icon: HighlightOffIcon,
    },
    {
        id: 4,
        title: "Comptabilité",
        body: "Tenue et suivi comptable rigoureux pour votre entreprise",
        icon: ReceiptLongIcon,
    },
    {
        id: 5,
        title: "Gestion de paie",
        body: "Gestion complète des bulletins de paie et déclarations sociales",
        icon: PaymentIcon,
    },
];
const ServicePopover = () => {
    const anchorRef = useRef(null);
    const [open, setOpen] = useState(false);
    return (_jsxs(Fragment, { children: [_jsx(IconButton, { ref: anchorRef, onClick: () => setOpen(true), "aria-label": "Afficher les services", children: _jsx(Badge, { color: "error", badgeContent: 0, children: _jsx(Apps, { sx: { color: "grey.400", fontSize: 18 } }) }) }), _jsx(PopoverLayout, { hiddenViewButton: true, popoverOpen: open, anchorRef: anchorRef, title: "Services", popoverClose: () => setOpen(false), children: SERVICES.map(({ id, title, body, icon: Icon }) => (_jsx(ListItem, { title: title, body: body, Icon: Icon }, id))) })] }));
};
function ListItem({ title, body, Icon, }) {
    return (_jsxs(FlexBox, { p: 2, gap: 2, alignItems: "center", sx: { cursor: "pointer", "&:hover": { backgroundColor: "action.hover" } }, children: [_jsx(Icon, { sx: { fontSize: 30, color: 'primary.main' } }), _jsxs("div", { children: [_jsx(Paragraph, { fontWeight: 500, children: title }), _jsx(Small, { display: "block", color: "text.secondary", children: body })] })] }));
}
export default ServicePopover;
