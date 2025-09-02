import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar, Box } from "@mui/material";
// CUSTOM COMPONENTS
import FlexBox from "@/components/flexbox/FlexBox";
import { Paragraph, Span } from "@/components/typography";
const OutgoingMsg = () => {
    return (_jsxs(Box, { maxWidth: { md: "60%", sm: "70%", xs: "80%" }, alignSelf: "end", children: [_jsxs(FlexBox, { justifyContent: "end", alignItems: "center", mb: 1, gap: 1.5, children: [_jsxs(Paragraph, { fontWeight: 600, lineHeight: 1, children: [_jsx(Span, { ml: 0.5, fontSize: 12, fontWeight: 400, color: "text.secondary", children: "11:29 AM" }), " ", "You"] }), _jsx(Avatar, { src: "/static/user/user-11.png", sx: { width: 27, height: 27 } })] }), _jsx(Box, { sx: {
                    fontSize: 14,
                    marginLeft: 5,
                    color: "white",
                    textAlign: "right",
                    padding: "1rem 1.5rem",
                    backgroundColor: "primary.main",
                    borderRadius: "0px 1rem 1rem 1rem",
                }, children: "Sure! Ready to help." })] }));
};
export default OutgoingMsg;
