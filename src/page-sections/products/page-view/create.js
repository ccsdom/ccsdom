import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useState } from "react";
import { KeyboardArrowDown } from "@mui/icons-material";
import { Box, Button, Card, Grid, TextField } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
// CUSTOM COMPONENTS
import { H6 } from "@/components/typography";
import { DropZone } from "@/components/dropzone";
import FlexBox from "@/components/flexbox/FlexBox";
import { QuillEditor } from "@/components/quill-editor";
import { IconWrapper } from "@/components/icon-wrapper";
// CUSTOM ICON COMPONENT
import ShoppingBasket from "@/icons/ShoppingBasket";
const CreateProductPageView = () => {
    const [files, setFiles] = useState([]);
    const handleChangeDescription = (value) => {
        console.log(value);
    };
    const handleDropFile = useCallback((acceptedFiles) => {
        const files = acceptedFiles.map((file) => Object.assign(file, { preview: URL.createObjectURL(file) }));
        setFiles(files);
    }, []);
    console.log(files);
    const validationSchema = Yup.object({
        manufacturer: Yup.string().required("Manufacturer is Required!"),
        model: Yup.string().required("Model is Required!"),
        id: Yup.string().required("ID Number is Required!"),
        priority: Yup.string().min(9).required("Prority is required!"),
        name: Yup.string().required("Name is Required!"),
        pro_model: Yup.string().required("Model is Required!"),
        meta_title: Yup.string().required("Meta Title is Required!"),
        meta_tags: Yup.string().required("Meta Tags is Required!"),
        address: Yup.string().required("Address is Required!"),
        zipCode: Yup.number().required("Zip Code is Required!"),
    });
    const initialValues = {
        manufacturer: "",
        model: "",
        id: "",
        priority: "",
        name: "",
        pro_model: "",
    };
    const { values, errors, touched, handleBlur, handleChange, handleSubmit } = useFormik({
        initialValues,
        validationSchema,
        onSubmit: () => { },
    });
    return (_jsx(Box, { pt: 2, pb: 4, children: _jsx("form", { onSubmit: handleSubmit, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, children: _jsx(Card, { sx: { p: 3 }, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, children: _jsxs(FlexBox, { gap: 0.5, alignItems: "center", children: [_jsx(IconWrapper, { children: _jsx(ShoppingBasket, { sx: { color: "primary.main" } }) }), _jsx(H6, { fontSize: 16, children: "Create New Product" })] }) }), _jsxs(Grid, { item: true, md: 6, xs: 12, children: [_jsx(H6, { fontSize: 16, mb: 3, children: "Main Parameters" }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "manufacturer", label: "Manufacturer", onBlur: handleBlur, onChange: handleChange, value: values.manufacturer, helperText: touched.manufacturer && errors.manufacturer, error: Boolean(touched.manufacturer && errors.manufacturer) }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, label: "Model", name: "model", onBlur: handleBlur, value: values.model, onChange: handleChange, helperText: touched.model && errors.model, error: Boolean(touched.model && errors.model) }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "id", label: "ID Number", value: values.id, onBlur: handleBlur, onChange: handleChange, helperText: touched.id && errors.id, error: Boolean(touched.id && errors.id) }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, name: "priority", label: "Priority", onBlur: handleBlur, onChange: handleChange, value: values.priority, helperText: touched.priority && errors.priority, error: Boolean(touched.priority && errors.priority) }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsxs(TextField, { select: true, fullWidth: true, label: "Name", SelectProps: {
                                                                native: true,
                                                                IconComponent: KeyboardArrowDown,
                                                            }, children: [_jsx("option", { value: "electronics", children: "Electronics" }), _jsx("option", { value: "gadget", children: "Gadget" }), _jsx("option", { value: "shoes", children: "Shoes" })] }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { fullWidth: true, label: "Model", name: "pro_model", onBlur: handleBlur, onChange: handleChange, value: values.pro_model, helperText: touched.pro_model && errors.pro_model, error: Boolean(touched.pro_model && errors.pro_model) }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { label: "Meta Title", fullWidth: true }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { label: "Meta Tags", fullWidth: true }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { label: "Meta Description", fullWidth: true }) })] })] }), _jsxs(Grid, { item: true, md: 6, xs: 12, children: [_jsx(H6, { fontSize: 16, mb: 3, children: "Prices and Warehouses" }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { label: "Cost", fullWidth: true }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { label: "Extra", fullWidth: true }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { label: "Price", fullWidth: true }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { label: "Availability", fullWidth: true }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(QuillEditor, { value: "", onChange: handleChangeDescription }) })] })] })] }) }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(Card, { children: _jsx(DropZone, { onDrop: handleDropFile }) }) }), _jsx(Grid, { item: true, xs: 12, children: _jsxs(FlexBox, { flexWrap: "wrap", gap: 2, children: [_jsx(Button, { type: "submit", variant: "contained", children: "Create New Product" }), _jsx(Button, { variant: "outlined", color: "secondary", children: "Cancel" })] }) })] }) }) }));
};
export default CreateProductPageView;
