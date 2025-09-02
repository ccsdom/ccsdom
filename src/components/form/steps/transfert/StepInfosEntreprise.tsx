import React from "react";
import { Box, Button, Grid, TextField } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  TransfertEntrepriseStepProps,
  EntrepriseData,
} from "../types/form";

const StepInfosEntreprise: React.FC<TransfertEntrepriseStepProps> = ({
  data,
  onChange,
  onNext,
  onBack,
}) => {
  const formik = useFormik<EntrepriseData>({
    initialValues: {
      siren: data.siren || "",
      nom: data.nom || "",
      adresse: data.adresse || "",
      codePostal: data.codePostal || "",
      ville: data.ville || "",
    },
    validationSchema: Yup.object({
      adresse: Yup.string().required("L'adresse est requise"),
      codePostal: Yup.string()
        .matches(/^\d{5}$/, "Code postal invalide")
        .required("Le code postal est requis"),
      ville: Yup.string().required("La ville est requise"),
    }),
    onSubmit: (values) => {
      // Mise à jour des données en conservant siret et nom
      onChange({ ...data, ...values });
      onNext();
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Numéro SIRET"
            value={formik.values.siren}
            disabled
            margin="normal"
            autoComplete="off"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Nom de l'entreprise"
            value={formik.values.nom}
            disabled
            margin="normal"
            autoComplete="organization"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Adresse"
            name="adresse"
            value={formik.values.adresse}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.adresse && Boolean(formik.errors.adresse)}
            helperText={formik.touched.adresse && formik.errors.adresse}
            margin="normal"
            autoComplete="address-line1"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Code postal"
            name="codePostal"
            value={formik.values.codePostal}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.codePostal && Boolean(formik.errors.codePostal)}
            helperText={formik.touched.codePostal && formik.errors.codePostal}
            margin="normal"
            autoComplete="postal-code"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Ville"
            name="ville"
            value={formik.values.ville}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.ville && Boolean(formik.errors.ville)}
            helperText={formik.touched.ville && formik.errors.ville}
            margin="normal"
            autoComplete="address-level2"
          />
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

export default StepInfosEntreprise;
