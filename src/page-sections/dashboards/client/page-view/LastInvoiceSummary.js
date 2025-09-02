import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, Typography, Button } from "@mui/material";
const LastInvoiceSummary = ({ facture }) => {
    if (!facture) {
        return (_jsx(Typography, { variant: "body1", color: "text.secondary", children: "Aucune facture r\u00E9gl\u00E9e r\u00E9cemment." }));
    }
    const formattedDate = new Date(facture.datePaiement).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
    return (_jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "Derni\u00E8re facture r\u00E9gl\u00E9e" }), _jsxs(Typography, { variant: "body1", children: ["Facture N\u00B0", facture.numero] }), _jsxs(Typography, { variant: "body2", color: "text.secondary", children: ["Pay\u00E9e le ", formattedDate] }), _jsxs(Typography, { variant: "body1", fontWeight: "bold", sx: { mt: 2 }, children: ["Montant : ", facture.montant, " \u20AC"] }), facture.url ? (_jsx(Button, { sx: { mt: 2 }, variant: "contained", component: "a", href: facture.url, target: "_blank", rel: "noopener noreferrer", download: true, children: "T\u00E9l\u00E9charger la facture" })) : (_jsx(Button, { sx: { mt: 2 }, variant: "contained", disabled: true, children: "T\u00E9l\u00E9charger la facture" }))] }) }));
};
export default LastInvoiceSummary;
