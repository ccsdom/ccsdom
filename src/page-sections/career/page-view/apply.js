import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { KeyboardArrowDown } from "@mui/icons-material";
import { Box, Button, Card, Grid, TextField } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
// CUSTOM DEFINED HOOK
import useNavigate from "@/hooks/useNavigate";
// CUSTOM COMPONENTS
import { FlexBox } from "@/components/flexbox";
import { DropZone } from "@/components/dropzone";
import { H6, Paragraph } from "@/components/typography";
const CareerApplyPageView = () => {
    const navigate = useNavigate();
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
    return (_jsx(Box, { maxWidth: 900, margin: "auto", py: 3, children: _jsxs(Card, { sx: { p: 3 }, children: [_jsx(H6, { fontSize: 18, children: "Apply for this Job" }), _jsx(Paragraph, { color: "text.secondary", mb: 3, children: "You sit down. You stare at your screen. The cursor blinks" }), _jsx("form", { onSubmit: handleSubmit, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, md: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "firstName", onBlur: handleBlur, onChange: handleChange, value: values.firstName, placeholder: "First Name*", helperText: touched.firstName && errors.firstName, error: Boolean(touched.firstName && errors.firstName) }) }), _jsx(Grid, { item: true, md: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "lastName", onBlur: handleBlur, onChange: handleChange, value: values.lastName, placeholder: "Last Name*", helperText: touched.lastName && errors.lastName, error: Boolean(touched.lastName && errors.lastName) }) }), _jsx(Grid, { item: true, md: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "email", onBlur: handleBlur, value: values.email, placeholder: "Email*", onChange: handleChange, helperText: touched.email && errors.email, error: Boolean(touched.email && errors.email) }) }), _jsx(Grid, { item: true, md: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "phone", onBlur: handleBlur, value: values.phone, placeholder: "Phone*", onChange: handleChange, helperText: touched.phone && errors.phone, error: Boolean(touched.phone && errors.phone) }) }), _jsx(Grid, { item: true, xs: 12, children: _jsxs(TextField, { select: true, fullWidth: true, SelectProps: { native: true, IconComponent: KeyboardArrowDown }, children: [_jsx("option", { value: "ui-ux", children: "UI/UX Designer" }), _jsx("option", { value: "front-end", children: "Front End Developer" }), _jsx("option", { value: "software", children: "Software Engineer" })] }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, placeholder: "Website (if any)" }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, placeholder: "Portfolio*" }) }), _jsx(Grid, { item: true, md: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, type: "number", placeholder: "Age*" }) }), _jsx(Grid, { item: true, md: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, placeholder: "Expected Salary*" }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(DropZone, { onDrop: () => { } }) }), _jsx(Grid, { item: true, xs: 12, children: _jsxs(FlexBox, { alignItems: "center", gap: 2, children: [_jsx(Button, { type: "submit", children: "Apply" }), _jsx(Button, { color: "secondary", variant: "outlined", onClick: () => navigate("/dashboard/career"), children: "Cancel" })] }) })] }) })] }) }));
};
export default CareerApplyPageView;
