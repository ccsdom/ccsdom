import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Box, Grid, Radio, Button, styled, Checkbox, TextField, RadioGroup, FormControlLabel, } from "@mui/material";
// CUSTOM COMPONENTS
import { H6, Paragraph } from "@/components/typography";
import { FlexBox } from "@/components/flexbox";
//  STYLED COMPONENT
const StyledFormControlLabel = styled(FormControlLabel)({
    "& .MuiTypography-root": { fontSize: 14, fontWeight: 500 },
});
// ==============================================================
const AddBillingAddressForm = ({ handleCancel }) => {
    const [selectedValue, setSelectedValue] = useState("home");
    const handleChange = (event) => {
        setSelectedValue(event.target.value);
    };
    return (_jsxs("form", { children: [_jsx(H6, { fontSize: 16, children: "Add new address" }), _jsx(Box, { py: 2, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, children: _jsxs(RadioGroup, { row: true, value: selectedValue, onChange: handleChange, children: [_jsx(StyledFormControlLabel, { value: "home", control: _jsx(Radio, {}), label: "Home" }), _jsx(StyledFormControlLabel, { value: "office", control: _jsx(Radio, {}), label: "Office" })] }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, size: "small", label: "Full Name" }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, size: "small", label: "Phone" }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, size: "small", label: "Address" }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, size: "small", label: "City" }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, size: "small", label: "Country" }) }), _jsx(Grid, { item: true, xs: 12, children: _jsxs(FlexBox, { alignItems: "center", gap: 1, children: [_jsx(Checkbox, { sx: { p: 0 } }), _jsx(Paragraph, { children: "Use this address as default" })] }) })] }) }), _jsxs(FlexBox, { alignItems: "center", justifyContent: "end", gap: 1, mt: 1, children: [_jsx(Button, { variant: "outlined", color: "secondary", onClick: handleCancel, children: "Cancel" }), _jsx(Button, { variant: "contained", children: "Deliver to this address" })] })] }));
};
export default AddBillingAddressForm;
