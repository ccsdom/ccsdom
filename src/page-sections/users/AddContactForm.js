import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Grid, Stack, Button, Avatar, TextField, IconButton, useMediaQuery, } from "@mui/material";
import { CameraAlt } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useFormik } from "formik";
import * as Yup from "yup";
// CUSTOM COMPONENTS
import { H5 } from "@/components/typography";
import { Scrollbar } from "@/components/scrollbar";
import { AvatarBadge } from "@/components/avatar-badge";
// ==========================================================================
const AddContactForm = ({ handleCancel, data }) => {
    const downSm = useMediaQuery((theme) => theme.breakpoints.down("sm"));
    const initialValues = {
        firstName: data?.name || "",
        lastName: "",
        birthday: "",
        company: data?.company || "",
        email: data?.email || "",
        phone: data?.phone || "",
    };
    const validationSchema = Yup.object({
        firstName: Yup.string()
            .min(3, "Must be greater then 3 characters")
            .required("First Name is Required!"),
        lastName: Yup.string().required("Last Name is Required!"),
        email: Yup.string()
            .email("Invalid email address")
            .required("Email is Required!"),
        birthday: Yup.date().required("Date of Birth is Required!"),
        phone: Yup.number().min(9).required("Phone Number is required!"),
        company: Yup.string().required("Company is Required!"),
    });
    const { values, errors, handleSubmit, handleChange, handleBlur, touched, setFieldValue, } = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values) => console.log(values),
    });
    return (_jsxs("div", { children: [_jsx(H5, { fontSize: 16, mb: 4, children: "Add Contact" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs(Scrollbar, { autoHide: false, style: { maxHeight: downSm ? 300 : "" }, children: [_jsx(Stack, { direction: "row", justifyContent: "center", mb: 6, children: _jsx(AvatarBadge, { badgeContent: _jsxs("label", { htmlFor: "icon-button-file", children: [_jsx("input", { type: "file", accept: "image/*", id: "icon-button-file", style: { display: "none" } }), _jsx(IconButton, { "aria-label": "upload picture", component: "span", children: _jsx(CameraAlt, { sx: { fontSize: 16, color: "background.paper" } }) })] }), children: _jsx(Avatar, { src: data?.avatar || "/static/avatar/001-man.svg", sx: { width: 80, height: 80, backgroundColor: "grey.100" } }) }) }), _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "firstName", label: "First Name", variant: "outlined", onBlur: handleBlur, value: values.firstName, onChange: handleChange, error: Boolean(errors.firstName && touched.firstName), helperText: (touched.firstName && errors.firstName) }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "lastName", label: "Last Name", variant: "outlined", onBlur: handleBlur, value: values.lastName, onChange: handleChange, error: Boolean(errors.lastName && touched.lastName), helperText: touched.lastName && errors.lastName }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(DatePicker, { label: "Birthday", value: values.birthday, onChange: (date) => setFieldValue("birthday", date), renderInput: (params) => (_jsx(TextField, { ...params, fullWidth: true, name: "birthday", onBlur: handleBlur, error: Boolean(errors.birthday && touched.birthday), helperText: (touched.birthday && errors.birthday) })) }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "company", label: "Company", variant: "outlined", onBlur: handleBlur, value: values.company, onChange: handleChange, error: Boolean(errors.company && touched.company), helperText: (touched.company && errors.company) }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "email", type: "email", label: "Email", variant: "outlined", onBlur: handleBlur, value: values.email, onChange: handleChange, error: Boolean(errors.email && touched.email), helperText: (touched.email && errors.email) }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "phone", label: "Phone Number", variant: "outlined", onBlur: handleBlur, value: values.phone, onChange: handleChange, error: Boolean(errors.phone && touched.phone), helperText: (touched.phone && errors.phone) }) })] })] }), _jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, mt: 4, children: [_jsx(Button, { type: "submit", size: "small", children: "Save" }), _jsx(Button, { variant: "outlined", size: "small", color: "secondary", onClick: handleCancel, children: "Cancel" })] })] })] }));
};
export default AddContactForm;
