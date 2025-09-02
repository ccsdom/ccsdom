import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card } from "@mui/material";
// CUSTOM COMPONENTS
import { H6, Paragraph } from "@/components/typography";
// =====================================================================
const DocumentCard = ({ file, img, title, Icon }) => {
    return (_jsxs(Card, { sx: {
            padding: 3,
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            justifyContent: "center",
        }, children: [Icon && _jsx(Icon, { sx: { fontSize: 74, color: "text.secondary" } }), img && (_jsx("img", { src: img, alt: title, width: 74, style: { marginBottom: 8 } })), _jsx(H6, { fontSize: 14, children: title }), _jsxs(Paragraph, { color: "text.secondary", children: [file, " files"] })] }));
};
export default DocumentCard;
