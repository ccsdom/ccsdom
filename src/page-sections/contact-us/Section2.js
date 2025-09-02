import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Button, Card, Container, Grid, Stack, TextField, styled, } from "@mui/material";
import Iframe from "react-iframe";
// CUSTOM COMPONENTS
import { H1 } from "@/components/typography";
// STYLED COMPONENT
const StyledTextField = styled(TextField)({
    ".MuiOutlinedInput-root": { backgroundColor: "white", borderRadius: 8 },
});
const Section2 = () => {
    return (_jsx(Box, { py: 12, mt: 12, bgcolor: ({ palette: { mode } }) => mode === "dark" ? "grey.800" : "grey.50", children: _jsx(Container, { maxWidth: "lg", children: _jsxs(Grid, { container: true, spacing: 6, children: [_jsxs(Grid, { item: true, md: 6, xs: 12, children: [_jsx(H1, { mb: 5, fontSize: { sm: 52, xs: 42 }, children: "Say Hello!" }), _jsxs("form", { children: [_jsxs(Stack, { spacing: 3, sx: { mb: 5 }, children: [_jsx(StyledTextField, { fullWidth: true, placeholder: "Name", name: "name" }), _jsx(StyledTextField, { fullWidth: true, placeholder: "Email", name: "email", type: "email" }), _jsx(StyledTextField, { fullWidth: true, placeholder: "Subject", name: "subject" }), _jsx(StyledTextField, { multiline: true, fullWidth: true, rows: 4, name: "message", placeholder: "Message" })] }), _jsx(Button, { children: "Submit" })] })] }), _jsx(Grid, { item: true, md: 6, xs: 12, children: _jsx(Card, { children: _jsx(Iframe, { url: "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d10171.65762602485!2d-74.04850673629463!3d40.71687384971685!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sbd!4v1683481372848!5m2!1sen!2sbd", width: "100%", height: "450", loading: "lazy", allowFullScreen: true, styles: {
                                    border: 0,
                                    display: "block",
                                    padding: 3,
                                    borderRadius: 16,
                                } }) }) })] }) }) }));
};
export default Section2;
