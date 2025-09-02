import React, { useState } from "react";
import {
  Box,
  Typography,
} from "@mui/material";

import StepStatutJuridique from "./StepStatutJuridique";
import StepInfosEntreprise from "./entreprise/StepInfosEntreprise";
import StepRepresentativeInfo from "./StepRepresentativeInfo";
import StepCoordinatesWrapper from "./entreprise/StepCoordinatesWrapper";
import StepCourrierOptions from "./StepMailHandling";
import StepPaymentFrequency from "./StepPaymentFrequency";
import StepSummary from "./StepSummary";

import { FormData, SectionEditable } from "./types/form";

// Offres courrier proposées
const offers = [
  { id: "starter", title: "Offre Starter", price: 0 },
  { id: "business", title: "Offre Business", price: 10 },
  { id: "premium", title: "Offre Premium", price: 40 },
];

const CreationEntrepriseSteps: React.FC = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresseComplete: "",
    siren: "",
    nomEntreprise: "",
    adresseEntreprise: "",
    codePostal: "",
    ville: "",
    statutJuridique: "",
    autreStatut: "",
    courrierOption: "",
    libelleOffreCourrier: "",
    prixOffreCourrier: "",
    prixCourrier: 0, // Prix numérique lié à l'offre courrier
    projet: "creation",
    frequencePaiement: "mensuelle",
  });

  // Met à jour les données du formulaire
  const handleChange = (newData: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  // Navigation entre étapes
  const handleNext = () => setStep((s) => Math.min(s + 1, 6));
  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  // Navigation via édition dans résumé
  const handleEdit = (section: SectionEditable) => {
    switch (section) {
      case "statut":
      case "projet":
        setStep(0);
        break;
      case "nomEntreprise":
      case "adresseEntreprise":
      case "representant":
        setStep(1);
        break;
      case "adresse":
        setStep(3);
        break;
      case "courrier":
        setStep(4);
        break;
      case "frequencePaiement":
        setStep(5);
        break;
      default:
        break;
    }
  };

  return (
    <Box sx={{ mt: 3, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h6" gutterBottom>
        Étape {step + 1} / 7
      </Typography>

      {step === 0 && (
        <StepStatutJuridique
          data={{
            statutJuridique: formData.statutJuridique || "",
            projet: formData.projet,
            autreStatut: formData.autreStatut,
          }}
          onChange={(data) => {
            const finalStatut =
              data.statutJuridique === "autre" ? data.autreStatut || "" : data.statutJuridique;
            handleChange({ statutJuridique: finalStatut, autreStatut: data.autreStatut });
          }}
          onNext={handleNext}
          onBack={() => {}}
        />
      )}

      {step === 1 && (
        <StepInfosEntreprise
          data={{
            siren: formData.siren,
            nom: formData.nomEntreprise,
            adresseEntreprise: formData.adresseEntreprise,
            codePostal: formData.codePostal || "",
            ville: formData.ville || "",
          }}
          onChange={(data) => {
            handleChange({
              siren: data.siren,
              nomEntreprise: data.nom,
              adresseEntreprise: data.adresseEntreprise,
              codePostal: data.codePostal,
              ville: data.ville,
            });
          }}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}

      {step === 2 && (
        <StepRepresentativeInfo
          data={{
            nom: formData.nom,
            prenom: formData.prenom,
            email: formData.email,
            telephone: formData.telephone,
          }}
          onChange={handleChange}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}

      {step === 3 && (
        <StepCoordinatesWrapper
          data={formData}
          onChange={handleChange}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}

      {step === 4 && (
        <StepCourrierOptions
          data={{ courrierOption: formData.courrierOption || "" }}
          onChange={(data) => {
            const offer = offers.find((o) => o.id === data.courrierOption);
            handleChange({
              courrierOption: data.courrierOption,
              libelleOffreCourrier: offer?.title || "",
              prixOffreCourrier: offer ? offer.price.toString() : "",
              prixCourrier: offer ? offer.price : 0,
            });
          }}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}

      {step === 5 && (
        <StepPaymentFrequency
          data={{
            frequencePaiement: formData.frequencePaiement,
            prixOffreCourrierNum: formData.prixCourrier, // Prix numérique uniquement
          }}
          onChange={handleChange}
          onBack={handleBack}
          onNext={handleNext}
          onEdit={handleEdit}
        />
      )}

      {step === 6 && (
        <StepSummary
          data={formData}
          onBack={handleBack}
          onNext={() => alert("Validation finale")}
          onEdit={handleEdit}
        />
      )}
    </Box>
  );
};

export default CreationEntrepriseSteps;
