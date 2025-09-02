import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Button, Card, Grid, IconButton, styled, Switch, TextField, } from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import * as Yup from "yup";
import { useFormik } from "formik";
// CUSTOM COMPONENTS
import { Paragraph, Small } from "@/components/typography";
import { FlexBetween, FlexRowAlign } from "@/components/flexbox";
// CUSTOM UTILS METHOD
import { isDark } from "@/utils/constants";
// STYLED COMPONENTS
const SwitchWrapper = styled(FlexBetween)({
    width: "100%",
    marginTop: 10,
});
const StyledCard = styled(Card)({
    padding: 24,
    minHeight: 400,
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
});
const ButtonWrapper = styled(FlexRowAlign)(({ theme }) => ({
    width: 100,
    height: 100,
    borderRadius: "50%",
    backgroundColor: theme.palette.grey[isDark(theme) ? 700 : 100],
}));
const UploadButton = styled(FlexRowAlign)(({ theme }) => ({
    width: 50,
    height: 50,
    borderRadius: "50%",
    backgroundColor: theme.palette.grey[isDark(theme) ? 600 : 200],
    border: `1px solid ${theme.palette.background.paper}`,
}));
const AddNewUserPageView = () => {
    const initialValues = {
        fullName: "",
        email: "",
        phone: "",
        country: "",
        state: "",
        city: "",
        address: "",
        zip: "",
        about: "",
    };
    const validationSchema = Yup.object().shape({
        fullName: Yup.string().required("Name is Required!"),
        email: Yup.string().email().required("Email is Required!"),
        phone: Yup.number().min(8).required("Phone is Required!"),
        country: Yup.string().required("Country is Required!"),
        state: Yup.string().required("State is Required!"),
        city: Yup.string().required("City is Required!"),
        address: Yup.string().required("Address is Required!"),
        zip: Yup.string().required("Zip is Required!"),
        about: Yup.string().required("About is Required!"),
    });
    const { values, errors, handleChange, handleSubmit, touched } = useFormik({
        initialValues,
        validationSchema,
        onSubmit: () => { },
    });
    return (_jsx(Box, { pt: 2, pb: 4, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, md: 4, xs: 12, children: _jsxs(StyledCard, { children: [_jsx(ButtonWrapper, { children: _jsx(UploadButton, { children: _jsxs("label", { htmlFor: "upload-btn", children: [_jsx("input", { accept: "image/*", id: "upload-btn", type: "file", style: { display: "none" } }), _jsx(IconButton, { component: "span", children: _jsx(PhotoCamera, { sx: { fontSize: 26, color: "grey.400" } }) })] }) }) }), _jsx(Paragraph, { marginTop: 2, maxWidth: 200, display: "block", textAlign: "center", color: "text.secondary", children: "Allowed *.jpeg, *.jpg, *.png, *.gif max size of 3.1 MB" }), _jsxs(Box, { maxWidth: 250, marginTop: 5, marginBottom: 1, children: [_jsxs(SwitchWrapper, { children: [_jsx(Paragraph, { display: "block", fontWeight: 600, children: "Public Profile" }), _jsx(Switch, { defaultChecked: true })] }), _jsxs(SwitchWrapper, { children: [_jsx(Paragraph, { display: "block", fontWeight: 600, children: "Banned" }), _jsx(Switch, { defaultChecked: true })] }), _jsx(Small, { display: "block", color: "text.secondary", children: "Apply disable account" }), _jsxs(SwitchWrapper, { children: [_jsx(Paragraph, { display: "block", fontWeight: 600, children: "Email Verified" }), _jsx(Switch, { defaultChecked: true })] }), _jsx(Small, { display: "block", color: "text.secondary", children: "Disabling this will automatically send the user a verification email" })] })] }) }), _jsx(Grid, { item: true, md: 8, xs: 12, children: _jsx(Card, { sx: { padding: 3 }, children: _jsx("form", { onSubmit: handleSubmit, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "fullName", label: "Full Name", value: values.fullName, onChange: handleChange, helperText: touched.fullName && errors.fullName, error: Boolean(touched.fullName && errors.fullName) }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "email", label: "Email Address", value: values.email, onChange: handleChange, helperText: touched.email && errors.email, error: Boolean(touched.email && errors.email) }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "phone", label: "Phone Number", value: values.phone, onChange: handleChange, helperText: touched.phone && errors.phone, error: Boolean(touched.phone && errors.phone) }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "country", label: "Country", value: values.country, onChange: handleChange, helperText: touched.country && errors.country, error: Boolean(touched.country && errors.country) }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "state", label: "State/Region", value: values.state, onChange: handleChange, helperText: touched.state && errors.state, error: Boolean(touched.state && errors.state) }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "city", label: "City", value: values.city, onChange: handleChange, helperText: touched.city && errors.city, error: Boolean(touched.city && errors.city) }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "address", label: "Address", value: values.address, onChange: handleChange, helperText: touched.address && errors.address, error: Boolean(touched.address && errors.address) }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "zip", label: "Zip/Code", value: values.zip, onChange: handleChange, helperText: touched.zip && errors.zip, error: Boolean(touched.zip && errors.zip) }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { multiline: true, fullWidth: true, rows: 10, name: "about", label: "About", value: values.about, onChange: handleChange, helperText: touched.about && errors.about, error: Boolean(touched.about && errors.about), sx: { "& .MuiOutlinedInput-root textarea": { padding: 0 } } }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(Button, { type: "submit", variant: "contained", children: "Create User" }) })] }) }) }) })] }) }));
};
export default AddNewUserPageView;
