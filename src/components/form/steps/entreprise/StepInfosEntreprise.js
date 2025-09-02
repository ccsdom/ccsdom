import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { Box, Button, Grid, TextField } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
const StepInfosEntreprise = ({ data, onChange, onNext, onBack, }) => {
    const formik = useFormik({
        initialValues: {
            siren: data.siren || "",
            nomEntreprise: data.nomEntreprise || "",
            adresseEntreprise: data.adresseEntreprise || "",
            codePostal: data.codePostal || "",
            ville: data.ville || "",
        },
        validationSchema: Yup.object({
            siren: Yup.string()
                .matches(/^\d{9}$/, "Le numéro SIREN doit contenir 9 chiffres")
                .required("Le numéro SIREN est requis"),
            nomEntreprise: Yup.string().required("Le nom de l'entreprise est requis"),
            adresseEntreprise: Yup.string().required("L'adresse est requise"),
            codePostal: Yup.string()
                .matches(/^\d{5}$/, "Code postal invalide")
                .required("Le code postal est requis"),
            ville: Yup.string().required("La ville est requise"),
        }),
        onSubmit: (values) => {
            onChange(values);
            onNext();
        },
        enableReinitialize: true,
    });
    useEffect(() => {
        onChange(formik.values);
    }, [formik.values, onChange]);
    return (_jsxs("form", { onSubmit: formik.handleSubmit, noValidate: true, children: [_jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, label: "Num\u00E9ro SIREN", name: "siren", value: formik.values.siren, onChange: formik.handleChange, onBlur: formik.handleBlur, error: formik.touched.siren && Boolean(formik.errors.siren), helperText: formik.touched.siren && formik.errors.siren, autoComplete: "off" }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, label: "Nom de l'entreprise", name: "nomEntreprise", value: formik.values.nomEntreprise, onChange: formik.handleChange, onBlur: formik.handleBlur, error: formik.touched.nomEntreprise && Boolean(formik.errors.nomEntreprise), helperText: formik.touched.nomEntreprise && formik.errors.nomEntreprise, autoComplete: "organization" }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, label: "Adresse", name: "adresseEntreprise", value: formik.values.adresseEntreprise, onChange: formik.handleChange, onBlur: formik.handleBlur, error: formik.touched.adresseEntreprise && Boolean(formik.errors.adresseEntreprise), helperText: formik.touched.adresseEntreprise && formik.errors.adresseEntreprise, autoComplete: "street-address" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { fullWidth: true, label: "Code postal", name: "codePostal", value: formik.values.codePostal, onChange: formik.handleChange, onBlur: formik.handleBlur, error: formik.touched.codePostal && Boolean(formik.errors.codePostal), helperText: formik.touched.codePostal && formik.errors.codePostal, autoComplete: "postal-code" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { fullWidth: true, label: "Ville", name: "ville", value: formik.values.ville, onChange: formik.handleChange, onBlur: formik.handleBlur, error: formik.touched.ville && Boolean(formik.errors.ville), helperText: formik.touched.ville && formik.errors.ville, autoComplete: "address-level2" }) })] }), _jsxs(Box, { sx: { mt: 3, display: "flex", justifyContent: "space-between" }, children: [_jsx(Button, { variant: "outlined", onClick: onBack, children: "Pr\u00E9c\u00E9dent" }), _jsx(Button, { type: "submit", variant: "contained", children: "Suivant" })] })] }));
};
export default StepInfosEntreprise;
