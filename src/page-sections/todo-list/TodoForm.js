import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Box, Button, FormLabel, Radio, RadioGroup, Stack, TextField, } from "@mui/material";
import Add from "@mui/icons-material/Add";
import { useFormik } from "formik";
import * as Yup from "yup";
// CUSTOM COMPONENTS
import { H6 } from "@/components/typography";
import FlexBox from "@/components/flexbox/FlexBox";
// ==================================================================
const TodoForm = ({ show, handleClose, title, handleOpen }) => {
    // form field validation
    const validationSchema = Yup.object().shape({
        title: Yup.string().min(3, "Too Short").required("Title is Required!"),
        date: Yup.date().required("Date is Required!"),
        description: Yup.string()
            .min(10, "Too Short")
            .required("Description is Required!"),
    });
    const initialValues = {
        title: "",
        date: "",
        description: "",
        mentionClient: "",
        statusColor: "#61A9FF",
    };
    const { errors, values, touched, handleChange, handleSubmit, setFieldValue } = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values) => {
            handleClose();
            console.log(values);
        },
    });
    return (_jsxs(Box, { padding: "1rem", children: [_jsx(H6, { fontSize: 16, children: title }), _jsx(Button, { fullWidth: true, variant: "contained", onClick: handleOpen, sx: { my: "1rem", display: show ? "none" : "auto" }, children: _jsx(Add, {}) }), _jsx("form", { onSubmit: handleSubmit, children: _jsxs(Box, { sx: { marginTop: 2, display: show ? "auto" : "none" }, children: [_jsxs(Stack, { spacing: 1, children: [_jsx(TextField, { fullWidth: true, size: "small", name: "title", placeholder: "Title", value: values.title, onChange: handleChange, helperText: touched.title && errors.title, error: Boolean(touched.title && errors.title) }), _jsx(DatePicker, { value: values.date, onChange: (newDate) => setFieldValue("date", newDate), renderInput: (params) => (_jsx(TextField, { fullWidth: true, size: "small", ...params, name: "date", helperText: touched.date && errors.date, error: Boolean(touched.date && errors.date) })) }), _jsx(TextField, { fullWidth: true, size: "small", name: "mentionClient", onChange: handleChange, placeholder: "@mention Client", value: values.mentionClient }), _jsx(TextField, { rows: 5, fullWidth: true, multiline: true, size: "small", name: "description", onChange: handleChange, placeholder: "Description", value: values.description, helperText: touched.description && errors.description, error: Boolean(touched.description && errors.description) }), _jsxs(FlexBox, { alignItems: "center", children: [_jsx(FormLabel, { component: "small", sx: { color: "text.secondary" }, children: "Select Color" }), _jsxs(RadioGroup, { row: true, name: "statusColor", value: values.statusColor, onChange: handleChange, children: [_jsx(Radio, { value: "#61A9FF", size: "small", color: "primary" }), _jsx(Radio, { value: "#2CC5BD", size: "small", color: "success" }), _jsx(Radio, { value: "#FD396D", size: "small", color: "error" }), _jsx(Radio, { value: "#A798FF", size: "small", color: "info" })] })] })] }), _jsxs(FlexBox, { gap: 2, mt: 2, children: [_jsx(Button, { fullWidth: true, type: "submit", children: "Save" }), _jsx(Button, { fullWidth: true, color: "secondary", variant: "outlined", onClick: handleClose, children: "Cancel" })] })] }) })] }));
};
export default TodoForm;
