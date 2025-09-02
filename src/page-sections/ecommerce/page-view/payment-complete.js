import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Button, Card, Divider, useMediaQuery, } from "@mui/material";
// CUSTOM COMPONENTS
import { H6, Paragraph } from "@/components/typography";
import FlexBox from "@/components/flexbox/FlexBox";
// CUSTOM DEFINED HOOK
import useNavigate from "@/hooks/useNavigate";
// CUSTOM ICON COMPONENTS
import ChevronLeft from "@/icons/ChevronLeft";
import DownloadTo from "@/icons/DownloadTo";
const PaymentCompletePageView = () => {
    const navigate = useNavigate();
    const down500 = useMediaQuery((theme) => theme.breakpoints.down(512));
    return (_jsx(Card, { sx: {
            mt: 1,
            padding: 4,
            minHeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        }, children: _jsxs(Box, { maxWidth: 400, textAlign: "center", children: [_jsx("img", { src: "/static/illustration/payment-complete.svg", width: "100%", alt: "Payment Complete" }), _jsx(H6, { mt: 4, children: "Thanks for placing order \uD83C\uDF89" }), _jsx(Paragraph, { color: "primary.main", my: 1, fontSize: 16, children: "#AOSIDY2" }), _jsxs(Paragraph, { fontSize: 16, children: ["We will contact you soon ", _jsx("br", {}), " when the shipment arrives"] }), _jsx(Divider, { sx: { my: 3 } }), _jsxs(FlexBox, { gap: 2, flexWrap: "wrap", children: [_jsx(Button, { color: "secondary", variant: "outlined", fullWidth: down500, startIcon: _jsx(ChevronLeft, {}), onClick: () => navigate("/dashboard/shop"), children: "Continue Shopping" }), _jsx(Button, { color: "success", variant: "contained", fullWidth: down500, startIcon: _jsx(DownloadTo, {}), children: "Download as PDF" })] })] }) }));
};
export default PaymentCompletePageView;
