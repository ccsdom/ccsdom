// src/pages/client/abonnement/Abonnement.tsx
import React from "react";
import {
  Box,
  Card,
  Grid,
  Stack,
  Table,
  Alert,
  Button,
  Avatar,
  Divider,
  TableRow,
  TableBody,
  TableHead,
  TableCell,
  IconButton,
  AlertTitle,
  LinearProgress,
  Chip,
  Typography,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const Abonnement = () => {
  return (
    <Card>
      {/* Titre */}
      <Typography variant="h6" p={3}>
        Abonnement
      </Typography>

      <Divider />

      {/* Alerte d'information sur le paiement */}
      <Box padding={3}>
        <Alert
          severity="info"
          variant="outlined"
          icon={<InfoIcon />}
          action={<Button variant="contained">Ajouter un moyen de paiement</Button>}
        >
          <AlertTitle>Attention requise</AlertTitle>
          Votre paiement a été refusé. Pour continuer à utiliser les services, veuillez ajouter un moyen de paiement.
        </Alert>

        {/* Progression et informations sur l'abonnement */}
        <Stack spacing={2.5} maxWidth={400} py={4}>
          <Box mb={1}>
            <Box display="flex" justifyContent="space-between" mb={0.5}>
              <Typography fontWeight={500}>Utilisateurs</Typography>
              <Typography fontWeight={500} color="primary.main">
                50%
              </Typography>
            </Box>

            <LinearProgress value={50} variant="determinate" />

            <Typography fontSize={13} mt={1} color="text.secondary">
              14 utilisateurs restants avant la mise à jour de votre abonnement
            </Typography>
          </Box>

          <Box>
            <Typography fontWeight={500}>Abonnement actif jusqu’au 09 Décembre 2021</Typography>
            <Typography fontSize={13} mt={0.5} color="text.secondary">
              Nous vous enverrons une notification avant l’expiration de votre abonnement
            </Typography>
          </Box>

          <Box>
            <Typography fontWeight={500}>24,99 € par mois</Typography>
            <Typography fontSize={13} mt={0.5} color="text.secondary">
              Pack Pro étendu. Jusqu’à 100 agents & 25 projets
            </Typography>
          </Box>
        </Stack>

        {/* Boutons abonnement */}
        <Stack direction="row" spacing={3}>
          <Button variant="contained" color="primary">
            Mettre à jour l'abonnement
          </Button>
          <Button variant="outlined" color="error">
            Annuler l'abonnement
          </Button>
        </Stack>
      </Box>

      {/* Moyens de paiement */}
      <Box my={2} p={3}>
        <Typography variant="h6" mb={2}>
          Moyens de paiement enregistrés
        </Typography>

        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell>Carte</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Date d’expiration</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {[1, 2, 3].map((item) => (
              <TableRow key={item}>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Avatar
                      src="/static/payment/paypal-with-bg.svg"
                      sx={{ borderRadius: "4px", height: 27 }}
                      alt="Moyen de paiement"
                    />
                    <Typography fontWeight={500}>Paypal **** 1679</Typography>
                  </Stack>
                </TableCell>

                <TableCell>Marcus Morris</TableCell>

                <TableCell>09/24/2022</TableCell>

                <TableCell>
                  <IconButton size="small" aria-label="éditer moyen de paiement">
                    <EditIcon fontSize="small" />
                  </IconButton>

                  <IconButton size="small" aria-label="supprimer moyen de paiement">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {/* Adresse de facturation */}
      <Box padding={3}>
        <Typography variant="h6" mb={3}>
          Adresse de facturation
        </Typography>

        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid item md={6} xs={12} key={item}>
              <Box
                p={2}
                boxShadow={1}
                borderRadius={2}
                bgcolor="background.paper"
                sx={{ minHeight: 120 }}
              >
                <Typography fontWeight={600}>Entreprise {item}</Typography>
                <Typography>123 rue Exemple, 75000 Paris</Typography>
                <Typography>France</Typography>
              </Box>
            </Grid>
          ))}

          <Grid item md={6} xs={12}>
            <Box
              p={2}
              boxShadow={1}
              borderRadius={2}
              bgcolor="background.paper"
              sx={{
                minHeight: 120,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                border: "2px dashed",
                borderColor: "primary.main",
                color: "primary.main",
                fontWeight: "bold",
              }}
            >
              Ajouter une nouvelle adresse
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Historique des paiements */}
      <Box mb={2} p={3}>
        <Typography variant="h6" mb={2}>
          Historique des paiements
        </Typography>

        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell>Montant</TableCell>
              <TableCell>Facture</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {historiquePaiements.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.montant} €</TableCell>

                <TableCell>
                  <Chip label={item.facture} color="secondary" size="small" />
                </TableCell>

                <TableCell>{item.date}</TableCell>

                <TableCell>
                  <IconButton aria-label="éditer paiement">
                    <EditIcon fontSize="small" sx={{ color: "text.secondary" }} />
                  </IconButton>

                  <IconButton aria-label="supprimer paiement">
                    <DeleteIcon fontSize="small" sx={{ color: "text.secondary" }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Card>
  );
};

const historiquePaiements = [
  {
    id: 1,
    montant: 890,
    facture: "PDF",
    date: "12 Nov 2021",
    description: "Paiement Octavia",
  },
  {
    id: 2,
    montant: 420,
    facture: "DOC",
    date: "10 Nov 2021",
    description: "Paiement Uko",
  },
  {
    id: 3,
    montant: 590,
    facture: "PDF",
    date: "24 Nov 2021",
    description: "Paiement Stocky",
  },
  {
    id: 4,
    montant: 750,
    facture: "DOC",
    date: "19 Nov 2021",
    description: "Paiement Aatrox",
  },
  {
    id: 5,
    montant: 890,
    facture: "PDF",
    date: "12 Nov 2021",
    description: "Paiement Octavia",
  },
];

export default Abonnement;
