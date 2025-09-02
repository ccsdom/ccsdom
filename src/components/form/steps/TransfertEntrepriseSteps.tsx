import React, { useState } from "react";
import StepRechercheEntreprise from "./transfert/StepRechercheEntreprise";
import StepCoordinates from "./StepCoordinates"; // Étape représentant légal
import StepSummaryTransfert from "./transfert/StepSummaryTransfert"; // Résumé spécifique transfert
import { EntrepriseData, SectionEditable } from "./types/form";
import { Box, Typography, Paper, Button } from "@mui/material";

const TransfertEntrepriseSteps: React.FC = () => {
  const [step, setStep] = useState(0);

  // Données partagées entre étapes
  const [data, setData] = useState<EntrepriseData>({
    siren: "",
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresseComplete: "",
    codePostal: "",
    ville: "",
  });

  const handleChange = (updatedData: Partial<EntrepriseData>) => {
    setData((prev) => ({ ...prev, ...updatedData }));
  };

  const handleNext = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 0));

  const steps: React.ReactNode[] = [
    <StepRechercheEntreprise
      key="recherche"
      data={data}
      onChange={handleChange}
      onNext={handleNext}
    />,
    <StepCoordinates
      key="representant"
      data={data}
      onChange={handleChange}
      onNext={handleNext}
      onBack={handleBack}
    />,
    <StepSummaryTransfert
      key="recap"
      data={data}
      onBack={handleBack}
      onNext={() => alert("Validation finale du transfert !")}
      onEdit={(section: SectionEditable) => {
        switch (section) {
          case "siren":
            setStep(0);
            break;
          case "representant":
            setStep(1);
            break;
          default:
            break;
        }
      }}
    />,
  ];

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Transfert d'entreprise
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
        {steps[step]}
      </Paper>

      <Box mt={3} display="flex" justifyContent="space-between">
        <Button onClick={handleBack} disabled={step === 0}>
          Précédent
        </Button>
        {step < steps.length - 1 && (
          <Button onClick={handleNext}>
            Suivant
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default TransfertEntrepriseSteps;
