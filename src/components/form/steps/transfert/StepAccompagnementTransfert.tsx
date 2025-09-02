import React from "react";
import {
  Box,
  Button,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Grid,
  FormHelperText,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";

import { useFormik } from "formik";
import * as Yup from "yup";

interface StepAccompagnementTransfertProps {
  data: {
    transferOption?: string;
  };
  onChange: (values: { transferOption: string }) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepAccompagnementTransfert: React.FC<StepAccompagnementTransfertProps> = ({
  data,
  onChange,
  onNext,
  onBack,
}) => {
  const formik = useFormik({
    initialValues: {
      transferOption: data.transferOption || "",
    },
    validationSchema: Yup.object({
      transferOption: Yup.string().required("Veuillez faire un choix."),
    }),
    onSubmit: (values) => {
      onChange(values);
      onNext();
    },
  });

  const handlePaperClick = (value: string) => {
    formik.setFieldValue("transferOption", value);
  };

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <Typography variant="h5" fontWeight="bold" mb={1}>
        Choisissez votre accompagnement pour le transfert d’entreprise
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>
        Sélectionnez l’option d’accompagnement qui vous convient pour sécuriser et faciliter la procédure de transfert de votre entreprise.
      </Typography>

      <RadioGroup
        name="transferOption"
        value={formik.values.transferOption}
        onChange={formik.handleChange}
      >
        <Grid container spacing={3}>
          {/* Option Accompagnement Expert */}
          <Grid item xs={12} md={6}>
            <Paper
              role="radio"
              aria-checked={formik.values.transferOption === "expert"}
              tabIndex={0}
              variant="outlined"
              sx={{
                p: 3,
                border:
                  formik.values.transferOption === "expert"
                    ? "2px solid #7C3AED"
                    : "1px solid #ccc",
                transition: "0.3s",
                cursor: "pointer",
                "&:hover": {
                  borderColor: "#7C3AED",
                  boxShadow: 3,
                },
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
              }}
              onClick={() => handlePaperClick("expert")}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  handlePaperClick("expert");
                }
              }}
            >
              <FormControlLabel
                value="expert"
                control={<Radio />}
                label={
                  <Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <BusinessCenterIcon color="primary" sx={{ mr: 1 }} />
                      <Typography fontWeight="bold">
                        Accompagnement expert au transfert
                      </Typography>
                    </Box>
                    <Box ml={4}>
                      {[
                        "Analyse personnalisée de votre dossier",
                        "Gestion complète des démarches administratives",
                        "Assistance juridique incluse (abonnement 1 an+)",
                      ].map((text) => (
                        <Box key={text} display="flex" alignItems="center" mb={1}>
                          <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                          <Typography variant="body2">{text}</Typography>
                        </Box>
                      ))}
                    </Box>
                    <Box mt={2} ml={4}>
                      <Typography variant="body2" color="text.secondary" mb={0.5}>
                        Frais supplémentaires (à votre charge) :
                      </Typography>
                      <Typography fontWeight="bold" color="error">
                        350€ HT
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </Paper>
          </Grid>

          {/* Option Autonome */}
          <Grid item xs={12} md={6}>
            <Paper
              role="radio"
              aria-checked={formik.values.transferOption === "self"}
              tabIndex={0}
              variant="outlined"
              sx={{
                p: 3,
                border:
                  formik.values.transferOption === "self"
                    ? "2px solid #7C3AED"
                    : "1px solid #ccc",
                transition: "0.3s",
                cursor: "pointer",
                "&:hover": {
                  borderColor: "#7C3AED",
                  boxShadow: 3,
                },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
              onClick={() => handlePaperClick("self")}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  handlePaperClick("self");
                }
              }}
            >
              <FormControlLabel
                value="self"
                control={<Radio />}
                label={
                  <Typography fontWeight="bold" variant="body1" sx={{ ml: 1 }}>
                    Je souhaite gérer le transfert seul·e
                  </Typography>
                }
                sx={{ m: 0 }}
              />
            </Paper>
          </Grid>
        </Grid>
      </RadioGroup>

      {formik.touched.transferOption && formik.errors.transferOption && (
        <FormHelperText error sx={{ mt: 2 }}>
          {formik.errors.transferOption}
        </FormHelperText>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Button variant="outlined" onClick={onBack}>
          Précédent
        </Button>
        <Button type="submit" variant="contained" disabled={!formik.isValid}>
          Suivant
        </Button>
      </Box>
    </form>
  );
};

export default StepAccompagnementTransfert;
