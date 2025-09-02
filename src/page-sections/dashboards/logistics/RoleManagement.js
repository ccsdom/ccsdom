import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar, Box, Card, Stack, useTheme } from "@mui/material";
import ManageAccounts from "@mui/icons-material/ManageAccounts";
import { nanoid } from "nanoid";
// CUSTOM COMPONENTS
import { MoreButton } from "@/components/more-button";
import { Paragraph, Small } from "@/components/typography";
import { FlexBetween, FlexBox, FlexRowAlign } from "@/components/flexbox";
// CUSTOM UTILS METHOD
import { isDark } from "@/utils/constants";
// CUSTOM DUMMY DATA SET
const DATA = [
    {
        id: nanoid(),
        title: "Material sourcing",
        image: "/static/role/1.png",
        subtitle: "Material sourcing involves",
    },
    {
        id: nanoid(),
        title: "Transportation",
        image: "/static/role/2.png",
        subtitle: "The best carrier based cost",
    },
    {
        id: nanoid(),
        title: "Order fulfillment",
        image: "/static/role/3.png",
        subtitle: "The process comprise order",
    },
    {
        id: nanoid(),
        title: "Warehousing",
        image: "/static/role/4.png",
        subtitle: "Planners consider warehouse",
    },
    {
        id: nanoid(),
        title: "Supply management",
        image: "/static/role/5.png",
        subtitle: "Logistics is an important link",
    },
];
const RoleManagement = () => {
    const theme = useTheme();
    return (_jsxs(Card, { sx: { p: 3, height: "100%" }, children: [_jsxs(FlexBetween, { mb: 4, children: [_jsxs("div", { children: [_jsx(Paragraph, { ellipsis: true, lineHeight: 1.3, fontSize: 18, fontWeight: 500, children: "Role Management" }), _jsx(Small, { fontWeight: 500, color: "text.secondary", children: "The important 5 logistics role" })] }), _jsx(MoreButton, { size: "small" })] }), _jsx(Stack, { spacing: 3, children: DATA.map(({ id, image, title, subtitle }) => (_jsxs(FlexBetween, { children: [_jsxs(FlexBox, { gap: 1.5, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", children: [_jsx(Avatar, { variant: "rounded", alt: title, src: image }), _jsxs(Box, { textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden", children: [_jsx(Paragraph, { ellipsis: true, fontSize: 16, lineHeight: 1, fontWeight: 600, children: title }), _jsx(Small, { ellipsis: true, fontWeight: 500, color: "text.secondary", children: subtitle })] })] }), _jsx(FlexRowAlign, { sx: {
                                width: 25,
                                height: 25,
                                flexShrink: 0,
                                borderRadius: 1,
                                backgroundColor: isDark(theme) ? "grey.700" : "grey.100",
                            }, children: _jsx(ManageAccounts, { sx: { fontSize: 17, color: "grey.400" } }) })] }, id))) })] }));
};
export default RoleManagement;
