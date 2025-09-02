import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Button, Container, TextField } from "@mui/material";
// CUSTOM COMPONENTS
import { H1, Paragraph } from "@/components/typography";
const ComingSoonPageView = () => {
    return (_jsx(Container, { children: _jsxs(Box, { textAlign: "center", py: 6, children: [_jsx(H1, { fontSize: { sm: 52, xs: 42 }, children: "Coming Soon!" }), _jsx(Paragraph, { mt: 0.5, fontSize: 18, color: "text.secondary", children: "Stay tuned for the big reveal" }), _jsx(Box, { py: 10, maxWidth: 700, margin: "auto", children: _jsx("img", { src: "/static/pages/coming-soon.svg", alt: "maintenance", width: "100%" }) }), _jsx(TextField, { placeholder: "Enter your email", InputProps: { endAdornment: _jsx(Button, { children: "Notify Me" }) }, sx: {
                        maxWidth: 500,
                        width: "100%",
                        ".MuiInputBase-root": { padding: 1 },
                        ".MuiButtonBase-root": { flexBasis: 120 },
                    } })] }) }));
};
export default ComingSoonPageView;
