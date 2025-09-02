import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment } from "react";
import { Box, Button, Card, Divider, Grid, styled, TextField, useTheme, } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import { CameraAlt, KeyboardArrowDown, MoreHoriz } from "@mui/icons-material";
import * as Yup from "yup";
import { useFormik } from "formik";
// CUSTOM ICON COMPONENTS
import DateRange from "@/icons/DateRange";
import Bratislava from "@/icons/Bratislava";
import MapMarkerIcon from "@/icons/MapMarkerIcon";
// CUSTOM COMPONENTS
import { AvatarBadge } from "@/components/avatar-badge";
import { AvatarLoading } from "@/components/avatar-loading";
import { FlexBetween, FlexBox } from "@/components/flexbox";
import { H6, Paragraph, Small } from "@/components/typography";
// STYLED COMPONENTS
const ContentWrapper = styled("div")(({ theme }) => ({
    zIndex: 1,
    marginTop: 55,
    position: "relative",
    [theme.breakpoints.down("sm")]: { paddingLeft: 20, paddingRight: 20 },
}));
const CoverPicWrapper = styled("div")(({ theme }) => ({
    top: 0,
    left: 0,
    height: 125,
    width: "100%",
    overflow: "hidden",
    position: "absolute",
    backgroundColor: theme.palette.background.default,
}));
const BasicInformation = () => {
    const theme = useTheme();
    const initialValues = {
        firstName: "Pixy",
        lastName: "Krovasky",
        email: "uilib@gmail.com",
        phone: "+443322221111",
        organization: "UiLib",
        department: "Develop",
        country: "usa",
        state: "New York",
        address: "Corverview, Michigan",
        zipCode: 4336,
    };
    const validationSchema = Yup.object({
        firstName: Yup.string()
            .min(3, "Must be greater then 3 characters")
            .required("First Name is Required!"),
        lastName: Yup.string().required("Last Name is Required!"),
        email: Yup.string()
            .email("Invalid email address")
            .required("Email is Required!"),
        phone: Yup.string().min(9).required("Phone Number is required!"),
        organization: Yup.string().required("Organization is Required!"),
        department: Yup.string().required("Department is Required!"),
        country: Yup.string().required("Country is Required!"),
        state: Yup.string().required("State is Required!"),
        address: Yup.string().required("Address is Required!"),
        zipCode: Yup.number().required("Zip Code is Required!"),
    });
    const { values, errors, handleSubmit, handleChange, handleBlur, touched } = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values) => console.log(values),
    });
    return (_jsxs(Fragment, { children: [_jsxs(Card, { sx: { padding: 3, position: "relative" }, children: [_jsx(CoverPicWrapper, { children: _jsx("img", { width: "100%", height: "100%", alt: "Team Member", src: "/static/cover/user-cover-pic.png", style: { objectFit: "cover" } }) }), _jsxs(ContentWrapper, { children: [_jsx(FlexBox, { justifyContent: "center", children: _jsx(AvatarBadge, { badgeContent: _jsxs("label", { htmlFor: "icon-button-file", children: [_jsx("input", { type: "file", accept: "image/*", id: "icon-button-file", style: { display: "none" } }), _jsx(IconButton, { "aria-label": "upload picture", component: "span", children: _jsx(CameraAlt, { sx: { fontSize: 16, color: "grey.400" } }) })] }), children: _jsx(AvatarLoading, { borderSize: 2, percentage: 60, alt: "Team Member", src: "/static/user/user-11.png", sx: { width: 100, height: 100 } }) }) }), _jsxs(Box, { mt: 2, children: [_jsx(H6, { fontSize: 18, textAlign: "center", children: "Pixy Krovasky" }), _jsxs(FlexBetween, { maxWidth: 360, flexWrap: "wrap", margin: "auto", mt: 1, children: [_jsxs(FlexBox, { alignItems: "center", gap: 1, color: "grey.500", children: [_jsx(Bratislava, { sx: { fontSize: 18 } }), _jsx(Paragraph, { children: "Developer" })] }), _jsxs(FlexBox, { alignItems: "center", gap: 1, color: "grey.500", children: [_jsx(MapMarkerIcon, { sx: { fontSize: 18 } }), _jsx(Paragraph, { children: "New York" })] }), _jsxs(FlexBox, { alignItems: "center", gap: 1, color: "grey.500", children: [_jsx(DateRange, { sx: { fontSize: 18 } }), _jsx(Paragraph, { children: "Joined March 17" })] })] }), _jsxs(FlexBetween, { marginTop: 6, flexWrap: "wrap", children: [_jsxs(Box, { minWidth: 200, color: "grey.500", sx: {
                                                    [theme.breakpoints.down(600)]: { minWidth: "100%", mb: 2 },
                                                }, children: [_jsx(Paragraph, { mb: 0.5, children: "Profile Completion" }), _jsxs(FlexBox, { alignItems: "center", gap: 1, children: [_jsx(LinearProgress, { value: 60, color: "success", variant: "determinate" }), _jsx(Small, { fontWeight: 500, children: "60%" })] })] }), _jsxs(FlexBox, { gap: 1, children: [_jsx(Button, { size: "small", color: "secondary", children: "Follow" }), _jsx(Button, { size: "small", children: "Hire Me" }), _jsx(Button, { size: "small", color: "secondary", sx: { minWidth: 0 }, children: _jsx(MoreHoriz, { fontSize: "small" }) })] })] })] })] })] }), _jsxs(Card, { sx: { mt: 3 }, children: [_jsx(H6, { fontSize: 14, px: 3, py: 2, children: "Basic Information" }), _jsx(Divider, {}), _jsx("form", { onSubmit: handleSubmit, children: _jsx(Box, { margin: 3, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "firstName", label: "First Name", variant: "outlined", onBlur: handleBlur, onChange: handleChange, value: values.firstName, helperText: touched.firstName && errors.firstName, error: Boolean(touched.firstName && errors.firstName) }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "lastName", label: "Last Name", variant: "outlined", onBlur: handleBlur, onChange: handleChange, value: values.lastName, helperText: touched.lastName && errors.lastName, error: Boolean(touched.lastName && errors.lastName) }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "email", label: "Email", variant: "outlined", onBlur: handleBlur, onChange: handleChange, value: values.email, helperText: touched.email && errors.email, error: Boolean(touched.email && errors.email) }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "phone", label: "Phone", variant: "outlined", onBlur: handleBlur, onChange: handleChange, value: values.phone, helperText: touched.phone && errors.phone, error: Boolean(touched.phone && errors.phone) }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "organization", variant: "outlined", label: "Organization", onBlur: handleBlur, onChange: handleChange, value: values.organization, helperText: touched.organization && errors.organization, error: Boolean(touched.organization && errors.organization) }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "department", variant: "outlined", label: "Department", onBlur: handleBlur, onChange: handleChange, value: values.department, helperText: touched.department && errors.department, error: Boolean(touched.department && errors.department) }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsxs(TextField, { select: true, fullWidth: true, name: "country", label: "Country", variant: "outlined", placeholder: "Country", SelectProps: {
                                                native: true,
                                                IconComponent: KeyboardArrowDown,
                                            }, onBlur: handleBlur, onChange: handleChange, value: values.country, helperText: touched.country && errors.country, error: Boolean(touched.country && errors.country), children: [_jsx("option", { value: "usa", children: "United States" }), _jsx("option", { value: "uk", children: "United Kingdom" }), _jsx("option", { value: "uae", children: "United Arab Emirates" })] }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "state", label: "State", variant: "outlined", onBlur: handleBlur, onChange: handleChange, value: values.state, helperText: touched.state && errors.state, error: Boolean(touched.state && errors.state) }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "address", label: "Address", variant: "outlined", onBlur: handleBlur, onChange: handleChange, value: values.address, helperText: touched.address && errors.address, error: Boolean(touched.address && errors.address) }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, type: "number", name: "zipCode", label: "Zip Code", variant: "outlined", onBlur: handleBlur, onChange: handleChange, value: values.zipCode, helperText: touched.zipCode && errors.zipCode, error: Boolean(touched.zipCode && errors.zipCode) }) }), _jsxs(Grid, { item: true, xs: 12, children: [_jsx(Button, { type: "submit", variant: "contained", children: "Save Changes" }), _jsx(Button, { variant: "outlined", sx: { ml: 2 }, children: "Cancel" })] })] }) }) })] })] }));
};
export default BasicInformation;
