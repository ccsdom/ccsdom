import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Card from "@mui/material/Card";
// CUSTOM COMPONENTS
import { MoreButton } from "@/components/more-button";
import { H6, Paragraph } from "@/components/typography";
import FlexBetween from "@/components/flexbox/FlexBetween";
const Summery = () => {
    return (_jsxs(Card, { sx: { padding: 3 }, children: [_jsxs(FlexBetween, { children: [_jsx(H6, { fontSize: 16, children: "Summary" }), _jsx(MoreButton, { size: "small" })] }), _jsxs(Paragraph, { color: "text.secondary", mt: 2, fontWeight: 400, children: ["The new iPad combines the power and capability of a computer with the ease of use and versatility you\u2019d never expect from one. ", _jsx("br", {}), " ", _jsx("br", {}), " ", "And now it\u2019s even more versatile, with a larger 10.2\u2011inch Retina display, support he new iPad combines the power and capability of a computer with the ease of use and versatility you\u2019d never expect"] })] }));
};
export default Summery;
