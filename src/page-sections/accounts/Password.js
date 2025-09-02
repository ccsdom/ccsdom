import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Button, Card, Divider, Grid, Stack, styled, TextField, } from "@mui/material";
import * as Yup from "yup";
import { useFormik } from "formik";
// CUSTOM COMPONENTS
import FlexBox from "@/components/flexbox/FlexBox";
import { H6, Paragraph, Small } from "@/components/typography";
// STYLED COMPONENT
const Dot = styled("div")(({ theme }) => ({
    width: 8,
    height: 8,
    flexShrink: 0,
    borderRadius: "50%",
    backgroundColor: theme.palette.primary.main,
}));
const Password = () => {
    const initialValues = {
        newPassword: "123456",
        currentPassword: "12345",
        confirmNewPassword: "123456",
    };
    const validationSchema = Yup.object({
        currentPassword: Yup.string()
            .min(3, "Must be greater then 3 characters")
            .required("Current Password is Required!"),
        newPassword: Yup.string().min(8).required("New Password is Required!"),
        confirmNewPassword: Yup.string().oneOf([Yup.ref("newPassword"), null], "Password doesn't matched"),
    });
    const { values, errors, handleSubmit, handleChange, handleBlur, touched } = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values) => console.log(values),
    });
    return (_jsxs(Card, { children: [_jsx(H6, { fontSize: 14, p: 3, children: "Change Your Password" }), _jsx(Divider, {}), _jsx(Box, { p: 3, children: _jsxs(Grid, { container: true, spacing: 5, children: [_jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs(Stack, { spacing: 4, children: [_jsx(TextField, { fullWidth: true, type: "password", variant: "outlined", name: "currentPassword", label: "Current Password", onBlur: handleBlur, onChange: handleChange, value: values.currentPassword, helperText: touched.currentPassword && errors.currentPassword, error: Boolean(touched.currentPassword && errors.currentPassword) }), _jsx(TextField, { fullWidth: true, type: "password", name: "newPassword", variant: "outlined", label: "New Password", onBlur: handleBlur, onChange: handleChange, value: values.newPassword, helperText: touched.newPassword && errors.newPassword, error: Boolean(touched.newPassword && errors.newPassword) }), _jsx(TextField, { fullWidth: true, type: "password", variant: "outlined", name: "confirmNewPassword", label: "Confirm Password", onBlur: handleBlur, onChange: handleChange, value: values.confirmNewPassword, helperText: touched.confirmNewPassword && errors.confirmNewPassword, error: Boolean(touched.confirmNewPassword && errors.confirmNewPassword) })] }), _jsxs(Stack, { direction: "row", spacing: 2, mt: 4, children: [_jsx(Button, { type: "submit", variant: "contained", children: "Save Changes" }), _jsx(Button, { variant: "outlined", children: "Cancel" })] })] }) }), _jsxs(Grid, { item: true, xs: 12, children: [_jsx(Paragraph, { fontWeight: 500, children: "Password requirements:" }), _jsx(Small, { color: "grey.500", children: "Ensure that these requirements are met:" }), _jsx(Stack, { spacing: 1, mt: 2, children: REQUIREMENTS.map((item) => (_jsxs(FlexBox, { alignItems: "center", gap: 1, children: [_jsx(Dot, {}), _jsx(Small, { children: item })] }, item))) })] })] }) })] }));
};
const REQUIREMENTS = [
    "Minimum 8 characters long - the more, the better",
    "At least one lowercase character",
    "At least one uppercase character",
    "At least one number, symbol, or whitespace character",
];
export default Password;
