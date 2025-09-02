import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment } from "react";
import { Box, Card, Grid, Radio, styled, Button, Divider, TextField, IconButton, RadioGroup, FormControlLabel, } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ErrorMessage, FieldArray, Formik, } from "formik";
import * as Yup from "yup";
// CUSTOM COMPONENTS
import { FlexBetween } from "@/components/flexbox";
import { H6, Paragraph, Small } from "@/components/typography";
// CUSTOM DEFINED HOOK
import useNavigate from "@/hooks/useNavigate";
// CUSTOM ICON COMPONENT
import Delete from "@/icons/Delete";
// STYLED COMPONENTS
const StyledFormControl = styled(FormControlLabel)(({ theme }) => ({
    "& .MuiTypography-root": {
        fontSize: 14,
        fontWeight: 600,
        color: theme.palette.text.secondary,
    },
    ":has(.Mui-checked) .MuiTypography-root": {
        color: theme.palette.text.primary,
    },
}));
const StyledFlexBox = styled(FlexBetween)(({ theme }) => ({
    marginBottom: 30,
    [theme.breakpoints.down(750)]: {
        "& .MuiFormGroup-root": { marginBottom: 10 },
    },
}));
const CreateInvoicePageView = () => {
    const navigate = useNavigate();
    const handleCancel = () => navigate("/dashboard/invoice-list");
    const initialValues = {
        orderNo: 204,
        billTo: "",
        billFrom: "",
        billToPhone: "",
        billToAddress: "",
        billFromPhone: "",
        status: "Pending",
        billFromAddress: "",
        orderDate: new Date(),
        items: [{ id: 1, itemName: "", itemPrice: 0, itemQuantity: 0 }],
    };
    const validationSchema = Yup.object().shape({
        billTo: Yup.string().required("Bill To is Required!"),
        billToAddress: Yup.string().required("Address is Required!"),
        billToPhone: Yup.number().positive().required("Phone is Required!"),
        billFrom: Yup.string().required("Bill From is Required!"),
        billFromAddress: Yup.string().required("Address is Required!"),
        billFromPhone: Yup.number().positive().required("Phone is Required!"),
        status: Yup.string().default(() => "Pending"),
        items: Yup.array().of(Yup.object().shape({
            itemName: Yup.string().required("Item Name Required"),
            itemPrice: Yup.number().required("Item Name Required"),
            itemQuantity: Yup.number().required("Item Name Required"),
        })),
    });
    const handleSubmit = (values) => {
        console.log(values);
    };
    const handleAddItem = (arrayHelper) => () => {
        arrayHelper.push({
            id: Date.now(),
            itemName: "",
            itemPrice: 0,
            itemQuantity: 0,
        });
    };
    return (_jsx(Box, { pt: 2, pb: 4, children: _jsxs(Card, { sx: { padding: 3 }, children: [_jsx(H6, { fontSize: 16, mb: 2, children: "Order Status" }), _jsx(Formik, { onSubmit: handleSubmit, initialValues: initialValues, validationSchema: validationSchema, children: ({ values, errors, touched, handleChange, handleSubmit, setFieldValue, }) => {
                        return (_jsxs("form", { onSubmit: handleSubmit, children: [_jsxs(StyledFlexBox, { flexWrap: "wrap", children: [_jsx(RadioGroup, { row: true, name: "status", onChange: handleChange, defaultValue: values.status, children: ["Pending", "Processing", "Delivered"].map((item) => (_jsx(StyledFormControl, { value: item, label: item, control: _jsx(Radio, {}) }, item))) }), _jsxs(Box, { className: "buttonWrapper", children: [_jsx(Button, { color: "secondary", variant: "outlined", onClick: handleCancel, sx: { mr: 1 }, children: "Cancel" }), _jsx(Button, { type: "submit", variant: "contained", children: "Save" })] })] }), _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, md: 4, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "orderNo", label: "Order Number", value: values.orderNo, onChange: handleChange }) }), _jsx(Grid, { item: true, md: 4, sm: 6, xs: 12, children: _jsx(DatePicker, { label: "Order Date", value: values.orderDate, onChange: (newValue) => setFieldValue("orderDate", newValue), renderInput: (params) => (_jsx(TextField, { ...params, fullWidth: true })) }) })] }), _jsx(Divider, { sx: { my: 4 } }), _jsxs(Grid, { container: true, spacing: 3, children: [_jsxs(Grid, { item: true, md: 4, sm: 6, xs: 12, children: [_jsx(Box, { marginBottom: 2, children: _jsx(TextField, { fullWidth: true, name: "billTo", label: "Bill to", value: values.billTo, onChange: handleChange, helperText: touched.billTo && errors.billTo, error: Boolean(touched.billTo && errors.billTo) }) }), _jsx(Box, { marginBottom: 2, children: _jsx(TextField, { fullWidth: true, name: "billToAddress", label: "Bill to Address", onChange: handleChange, value: values.billToAddress, helperText: touched.billToAddress && errors.billToAddress, error: Boolean(touched.billToAddress && errors.billToAddress) }) }), _jsx("div", { children: _jsx(TextField, { fullWidth: true, type: "number", name: "billToPhone", label: "Bill to Phone", onChange: handleChange, value: values.billToPhone, helperText: touched.billToPhone && errors.billToPhone, error: Boolean(touched.billToPhone && errors.billToPhone) }) })] }), _jsxs(Grid, { item: true, md: 4, sm: 6, xs: 12, children: [_jsx(Box, { marginBottom: 2, children: _jsx(TextField, { fullWidth: true, name: "billFrom", label: "Bill From", value: values.billFrom, onChange: handleChange, helperText: touched.billFrom && errors.billFrom, error: Boolean(touched.billFrom && errors.billFrom) }) }), _jsx(Box, { marginBottom: 2, children: _jsx(TextField, { fullWidth: true, name: "billFromAddress", label: "Bill from Address", onChange: handleChange, value: values.billFromAddress, helperText: touched.billFromAddress && errors.billTo, error: Boolean(touched.billFromAddress && errors.billFromAddress) }) }), _jsx("div", { children: _jsx(TextField, { fullWidth: true, type: "number", name: "billFromPhone", label: "Bill from Phone", onChange: handleChange, value: values.billFromPhone, helperText: touched.billFromPhone && errors.billFromPhone, error: Boolean(touched.billFromPhone && errors.billFromPhone) }) })] })] }), _jsx(Divider, { sx: { my: 4 } }), _jsx(Grid, { container: true, spacing: 2, alignItems: "flex-end", children: _jsx(FieldArray, { name: "items", render: (arrayHelper) => {
                                            return (_jsxs(Fragment, { children: [_jsx(Grid, { item: true, xs: 12, children: _jsx(Button, { variant: "contained", onClick: handleAddItem(arrayHelper), sx: { marginBottom: 2 }, children: "Add New Item" }) }), values.items.map((item, index) => (_jsxs(Grid, { item: true, container: true, spacing: 1, children: [_jsxs(Grid, { item: true, md: 4, sm: 4, xs: 12, children: [_jsx(TextField, { fullWidth: true, size: "small", label: "Item Name", name: `items.${index}.itemName`, value: item.itemName, onChange: handleChange }), _jsx(ErrorMessage, { name: `items.${index}.itemName`, render: (msg) => (_jsx(Small, { color: "secondary.red", mx: 2, children: msg })) })] }), _jsx(Grid, { item: true, md: 2, sm: 3, xs: 5, children: _jsx(TextField, { fullWidth: true, label: "Item Price", size: "small", type: "number", name: `items.${index}.itemPrice`, value: item.itemPrice, onChange: handleChange }) }), _jsx(Grid, { item: true, md: 2, sm: 3, xs: 5, children: _jsx(TextField, { type: "number", fullWidth: true, size: "small", label: "Item Quantity", name: `items.${index}.itemQuantity`, value: item.itemQuantity, onChange: handleChange }) }), _jsx(Grid, { item: true, md: 2, sm: 2, xs: 2, children: _jsx(IconButton, { onClick: () => arrayHelper.remove(index), children: _jsx(Delete, { sx: { color: "text.secondary" } }) }) })] }, item.id)))] }));
                                        } }) }), _jsx(Divider, { sx: { my: 4 } }), _jsxs(Box, { maxWidth: 320, children: [_jsx(H6, { fontSize: 16, children: "Amount" }), _jsxs(FlexBetween, { my: 1, children: [_jsx(Paragraph, { fontWeight: 500, children: "Subtotal" }), _jsx(Paragraph, { fontWeight: 500, children: "$428.00" })] }), _jsxs(FlexBetween, { my: 1, children: [_jsx(Paragraph, { fontWeight: 500, children: "Discount (BLACKFRIDAY)" }), _jsx(Paragraph, { fontWeight: 500, children: "-$8.00" })] }), _jsxs(FlexBetween, { my: 1, children: [_jsx(Paragraph, { fontWeight: 500, children: "VAT" }), _jsx(Paragraph, { fontWeight: 500, children: "$20.00" })] }), _jsx(Divider, { sx: { my: 2 } }), _jsxs(FlexBetween, { my: 1, children: [_jsx(H6, { fontSize: 16, children: "Total" }), _jsx(H6, { fontSize: 16, children: "$20.00" })] })] })] }));
                    } })] }) }));
};
export default CreateInvoicePageView;
