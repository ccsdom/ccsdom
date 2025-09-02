import React from "react";
import { Box, Button, Grid, TextField, MenuItem } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FormData } from "./types/form";

interface StepRepresentativeInfoProps {
  data: Partial<FormData>;
  onChange: (data: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const STATUTS = [
  { value: "gerant", label: "Gérant" },
  { value: "president", label: "Président" },
  { value: "autre", label: "Autre" },
];

const StepRepresentativeInfo: React.FC<StepRepresentativeInfoProps> = ({
  data,
  onChange,
  onNext,
  onBack,
}) => {
  const formik = useFormik<Partial<FormData>>({
    initialValues: {
      nom: data.nom || "",
      prenom: data.prenom || "",
      email: data.email || "",
      telephone: data.telephone || "",
      statutRepr: data.statutRepr || "",
    },
    validationSchema: Yup.object({
      nom: Yup.string().required("Le nom est requis"),
      prenom: Yup.string().required("Le prénom est requis"),
      email: Yup.string().email("Email invalide").required("Email requis"),
      telephone: Yup.string().required("Le téléphone est requis"),
      statutRepr: Yup.string().required("Le statut est requis"),
    }),
    onSubmit: (values) => {
      onChange(values);
      onNext();
    },
    enableReinitialize: true,
  });

  React.useEffect(() => {
    onChange(formik.values);
  }, [formik.values, onChange]);

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nom"
            name="nom"
            value={formik.values.nom}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.nom && Boolean(formik.errors.nom)}
            helperText={formik.touched.nom && formik.errors.nom}
            autoComplete="family-name"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Prénom"
            name="prenom"
            value={formik.values.prenom}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.prenom && Boolean(formik.errors.prenom)}
            helperText={formik.touched.prenom && formik.errors.prenom}
            autoComplete="given-name"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            autoComplete="email"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Téléphone"
            name="telephone"
            value={formik.values.telephone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.telephone && Boolean(formik.errors.telephone)}
            helperText={formik.touched.telephone && formik.errors.telephone}
            autoComplete="tel"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            label="Statut du représentant légal"
            name="statutRepr"
            value={formik.values.statutRepr}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.statutRepr && Boolean(formik.errors.statutRepr)}
            helperText={formik.touched.statutRepr && formik.errors.statutRepr}
          >
            {STATUTS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
        <Button variant="outlined" onClick={onBack}>
          Précédent
        </Button>
        <Button type="submit" variant="contained">
          Suivant
        </Button>
      </Box>
    </form>
  );
};

export default StepRepresentativeInfo;
