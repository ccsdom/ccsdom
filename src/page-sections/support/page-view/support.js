import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import Search from "@mui/icons-material/Search";
import { Box, Button, Card, Grid, TextField, useTheme } from "@mui/material";
// CUSTOM DEFINED HOOK
import useNavigate from "@/hooks/useNavigate";
// CUSTOM COMPONENTS
import TabButton from "../TabButton";
import { H6 } from "@/components/typography";
import { FlexBetween, FlexBox } from "@/components/flexbox";
// CUSTOM PAGE SECTION COMPONENTS
import Faq from "../Faq";
import Tickets from "../Tickets";
import Contact from "../Contact";
import Overview from "../Overview";
// CUSTOM UTILS METHOD
import { isDark } from "@/utils/constants";
const SupportPageView = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [active, setActive] = useState("OVERVIEW");
    const handleChange = (value) => () => setActive(value);
    return (_jsxs(Box, { py: 3, children: [_jsxs(Card, { sx: { p: 3, mb: 3 }, children: [_jsxs(Grid, { container: true, spacing: 3, alignItems: "center", children: [_jsx(Grid, { item: true, xs: 12, md: 5, lg: 4, children: _jsx(Box, { textAlign: "center", children: _jsx("img", { src: "/static/illustration/support.svg", alt: "support" }) }) }), _jsx(Grid, { item: true, xs: 12, md: 5, lg: 4, children: _jsxs("div", { children: [_jsx(H6, { mb: 2, fontSize: 20, children: "How Can We Help You?" }), _jsx(TextField, { fullWidth: true, placeholder: "Ask your questions", InputProps: { startAdornment: _jsx(Search, {}) } })] }) })] }), _jsxs(FlexBetween, { p: 2, mt: 4, gap: 2, flexWrap: "wrap", borderRadius: 4, bgcolor: isDark(theme) ? "grey.700" : "grey.100", children: [_jsxs(FlexBox, { flexWrap: "wrap", rowGap: 2, columnGap: 8, children: [_jsx(TabButton, { title: "OVERVIEW", active: active, handleChange: handleChange }), _jsx(TabButton, { title: "TICKETS", active: active, handleChange: handleChange }), _jsx(TabButton, { title: "FAQ", active: active, handleChange: handleChange }), _jsx(TabButton, { title: "CONTACT", active: active, handleChange: handleChange })] }), _jsx(Button, { size: "small", onClick: () => navigate("/dashboard/create-ticket"), children: "Create Ticket" })] })] }), active === "OVERVIEW" && _jsx(Overview, {}), active === "TICKETS" && _jsx(Tickets, {}), active === "FAQ" && _jsx(Faq, {}), active === "CONTACT" && _jsx(Contact, {})] }));
};
export default SupportPageView;
