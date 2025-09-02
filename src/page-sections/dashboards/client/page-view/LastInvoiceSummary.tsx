import React from "react";
import { Card, CardContent, Typography, Button } from "@mui/material";

interface Facture {
  id: string;
  datePaiement: string;
  montant: number;
  numero: string;
  url?: string; // URL facultative pour téléchargement
}

interface Props {
  facture: Facture | null;
}

const LastInvoiceSummary: React.FC<Props> = ({ facture }) => {
  if (!facture) {
    return (
      <Typography variant="body1" color="text.secondary">
        Aucune facture réglée récemment.
      </Typography>
    );
  }

  const formattedDate = new Date(facture.datePaiement).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Dernière facture réglée
        </Typography>
        <Typography variant="body1">
          Facture N°{facture.numero}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Payée le {formattedDate}
        </Typography>
        <Typography variant="body1" fontWeight="bold" sx={{ mt: 2 }}>
          Montant : {facture.montant} €
        </Typography>

        {facture.url ? (
          <Button
            sx={{ mt: 2 }}
            variant="contained"
            component="a"
            href={facture.url}
            target="_blank"
            rel="noopener noreferrer"
            download
          >
            Télécharger la facture
          </Button>
        ) : (
          <Button
            sx={{ mt: 2 }}
            variant="contained"
            disabled
          >
            Télécharger la facture
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default LastInvoiceSummary;
