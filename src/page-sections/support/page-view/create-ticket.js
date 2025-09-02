import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Button, Card, Grid, TextField } from "@mui/material";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import { useFormik } from "formik";
import * as Yup from "yup";
// CUSTOM COMPONENTS
import { FlexBox } from "@/components/flexbox";
import { H6, Paragraph } from "@/components/typography";
const CreateTicketPageView = () => {
    const DATA = [
        "Screenshots/Screen Recording is very helpful.",
        "You can use snipboard.io to share screenshots.",
        "And loom.com for screen recording.",
    ];
    const validationSchema = Yup.object({
        firstName: Yup.string().required("First Name is Required!"),
        lastName: Yup.string().required("Last Name is Required!"),
        email: Yup.string().email().required("Email is Required!"),
        phone: Yup.string().min(9).required("Phone is required!"),
    });
    const initialValues = {
        firstName: "",
        lastName: "",
        email: "",
        position: "",
        phone: "",
    };
    const { values, errors, touched, handleBlur, handleChange, handleSubmit } = useFormik({
        initialValues,
        validationSchema,
        onSubmit: () => { },
    });
    return (_jsx(Box, { py: 3, children: _jsxs(Card, { sx: { p: 3, maxWidth: 900, margin: "auto" }, children: [_jsx(H6, { fontSize: 18, children: "Create Ticket" }), _jsx(Paragraph, { color: "text.secondary", mb: 3, children: "Please include as many details as possible about your question or problem." }), _jsx(Box, { component: "ul", pl: 2, mb: 4, children: DATA.map((item) => (_jsx(Box, { component: "li", fontSize: 14, pb: 0.5, children: item }, item))) }), _jsx("form", { onSubmit: handleSubmit, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, md: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "firstName", onBlur: handleBlur, onChange: handleChange, value: values.firstName, placeholder: "First Name*", helperText: touched.firstName && errors.firstName, error: Boolean(touched.firstName && errors.firstName) }) }), _jsx(Grid, { item: true, md: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "lastName", onBlur: handleBlur, onChange: handleChange, value: values.lastName, placeholder: "Last Name*", helperText: touched.lastName && errors.lastName, error: Boolean(touched.lastName && errors.lastName) }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "email", onBlur: handleBlur, value: values.email, placeholder: "Email*", onChange: handleChange, helperText: touched.email && errors.email, error: Boolean(touched.email && errors.email) }) }), _jsx(Grid, { item: true, xs: 12, children: _jsxs(TextField, { select: true, fullWidth: true, SelectProps: { native: true, IconComponent: KeyboardArrowDown }, children: [_jsx("option", { value: "biponi", children: "Biponi" }), _jsx("option", { value: "bazaar", children: "Bazaar" }), _jsx("option", { value: "stocky", children: "Stocky" })] }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, placeholder: "Subject*" }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { multiline: true, rows: 6, fullWidth: true, placeholder: "Message*" }) }), _jsx(Grid, { item: true, xs: 12, children: _jsxs(FlexBox, { alignItems: "center", gap: 2, children: [_jsx(Button, { type: "submit", children: "Submit" }), _jsx(Button, { variant: "outlined", color: "secondary", children: "Cancel" })] }) })] }) })] }) }));
};
export default CreateTicketPageView;
