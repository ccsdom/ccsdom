import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Box, Button, Container } from "@mui/material";
import OtpInput from "react-otp-input";
// CUSTOM COMPONENTS
import { H1, Paragraph, Span } from "@/components/typography";
import ChevronLeft from "@/icons/ChevronLeft";
// CUSTOM UTILS METHOD
import { isDark } from "@/utils/constants";
const VerifyCodePageView = () => {
    const [otp, setOtp] = useState("5");
    return (_jsx(Container, { children: _jsxs(Box, { textAlign: "center", py: { sm: 6, xs: 4 }, children: [_jsx(Box, { maxWidth: 120, margin: "auto", children: _jsx("img", { src: "/static/pages/email.svg", alt: "email", width: "100%" }) }), _jsx(H1, { mt: { sm: 4, xs: 2 }, mb: 2, fontSize: { sm: 52, xs: 36 }, children: "Check your email!" }), _jsx(Paragraph, { mt: 0.5, margin: "auto", maxWidth: 650, color: "text.secondary", fontSize: { sm: 18, xs: 14 }, children: "Please check your email inbox for a 5-digit verification code we have sent to your registered email address. Enter the code in the field below to confirm your email and complete the verification process." }), _jsxs(Box, { maxWidth: 450, margin: "auto", mt: 6, children: [_jsx(OtpInput, { value: otp, numInputs: 5, onChange: setOtp, placeholder: "-----", renderInput: (props) => (_jsx(Box, { component: "input", ...props, sx: {
                                    all: "unset",
                                    width: 70,
                                    height: 70,
                                    fontSize: 18,
                                    flexBasis: 70,
                                    borderRadius: 4,
                                    fontWeight: 600,
                                    backgroundColor: (theme) => isDark(theme) ? "grey.800" : "white",
                                    input: { textAlign: "center" },
                                    "::placeholder": { color: "text.primary" },
                                } })), containerStyle: {
                                gap: "1rem",
                                justifyContent: "center",
                                marginBottom: "3rem",
                            } }), _jsx(Button, { fullWidth: true, children: "Verify" })] }), _jsxs(Paragraph, { mt: 4, fontSize: 16, children: ["Don\u2019t have a code?", " ", _jsx(Span, { color: "error.main", fontWeight: 500, children: "Resend code" })] }), _jsxs(Button, { variant: "text", disableRipple: true, children: [_jsx(ChevronLeft, {}), " Return to sign in"] })] }) }));
};
export default VerifyCodePageView;
