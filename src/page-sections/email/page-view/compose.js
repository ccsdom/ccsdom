import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Button, Divider, Grid, TextField } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
// CUSTOM COMPONENTS
import { H6 } from "@/components/typography";
import { FlexBox } from "@/components/flexbox";
import { DropZone } from "@/components/dropzone";
// CUSTOM LAYOUT COMPONENT
import Layout from "../Layout";
const ComposeMailPageView = () => {
    const validationSchema = Yup.object({
        toEmail: Yup.string().email().required("Email is Required!"),
        subject: Yup.string().required("Subject is Required!"),
        message: Yup.string().required("Message is required!"),
    });
    const initialValues = {
        cc: "",
        toEmail: "",
        subject: "",
        message: "",
    };
    const { values, errors, touched, handleBlur, handleChange, handleSubmit } = useFormik({
        initialValues,
        validationSchema,
        onSubmit: () => { },
    });
    return (_jsxs(Layout, { showTopActions: false, children: [_jsx(H6, { p: 3, fontSize: 18, children: "Compose Mail" }), _jsx(Divider, {}), _jsx(Box, { p: 3, children: _jsx("form", { onSubmit: handleSubmit, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "toEmail", onBlur: handleBlur, value: values.toEmail, onChange: handleChange, placeholder: "To email*", helperText: touched.toEmail && errors.toEmail, error: Boolean(touched.toEmail && errors.toEmail) }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "cc", value: values.cc, onBlur: handleBlur, onChange: handleChange, placeholder: "CC (If any)", helperText: touched.cc && errors.cc, error: Boolean(touched.cc && errors.cc) }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "subject", onBlur: handleBlur, value: values.subject, placeholder: "Subject*", onChange: handleChange, helperText: touched.subject && errors.subject, error: Boolean(touched.subject && errors.subject) }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "message", onBlur: handleBlur, value: values.message, placeholder: "Message*", onChange: handleChange, helperText: touched.message && errors.message, error: Boolean(touched.message && errors.message) }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(DropZone, { onDrop: () => { } }) }), _jsx(Grid, { item: true, xs: 12, children: _jsxs(FlexBox, { alignItems: "center", gap: 2, children: [_jsx(Button, { type: "submit", children: "Send" }), _jsx(Button, { variant: "outlined", color: "secondary", children: "Save as Draft" })] }) })] }) }) })] }));
};
export default ComposeMailPageView;
