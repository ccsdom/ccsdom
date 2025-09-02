import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Box, Grid, Stack, Button } from "@mui/material";
// CUSTOM COMPONENTS
import { Modal } from "@/components/modal";
import { H6 } from "@/components/typography";
import { FlexBetween } from "@/components/flexbox";
// CUSTOM DEFINED HOOK
import useNavigate from "@/hooks/useNavigate";
// CUSTOM ICON COMPONENTS
import Add from "@/icons/Add";
import ChevronLeft from "@/icons/ChevronLeft";
// CUSTOM PAGE SECTION COMPONENTS
import Stepper from "../Stepper";
import OrderSummery from "../OrderSummery";
import BillingAddressCard from "../BillingAddressCard";
import AddBillingAddressForm from "../AddBillingAddressForm";
const BillingAddressPageView = () => {
    const navigate = useNavigate();
    const [openModal, setOpenModal] = useState(false);
    const handleClose = () => setOpenModal(false);
    return (_jsx(Box, { pt: 2, pb: 4, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, children: _jsx(Box, { mt: 3, mb: 1, maxWidth: 700, children: _jsx(Stepper, { stepNo: 1 }) }) }), _jsxs(Grid, { item: true, md: 8, xs: 12, children: [_jsxs(FlexBetween, { flexWrap: "wrap", gap: 1.5, mb: 3, children: [_jsx(H6, { fontSize: 16, children: "Billing & address" }), _jsx(Button, { variant: "contained", startIcon: _jsx(Add, {}), onClick: () => setOpenModal(true), children: "Add New Address" })] }), _jsx(Modal, { open: openModal, handleClose: handleClose, children: _jsx(AddBillingAddressForm, { handleCancel: handleClose }) }), _jsxs(Stack, { gap: 2, children: [_jsx(BillingAddressCard, { selected: true }), _jsx(BillingAddressCard, {}), _jsx(BillingAddressCard, {})] }), _jsx(Box, { mt: 2, children: _jsx(Button, { disableRipple: true, variant: "text", startIcon: _jsx(ChevronLeft, {}), onClick: () => navigate("/dashboard/cart"), children: "Back" }) })] }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsx(OrderSummery, { buttonText: "Payment", handleClick: () => navigate("/dashboard/payment") }) })] }) }));
};
export default BillingAddressPageView;
