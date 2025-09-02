// src/pages/api/insee/[siren].ts

import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const INSEE_CLIENT_ID = process.env.INSEE_CLIENT_ID!;
const INSEE_CLIENT_SECRET = process.env.INSEE_CLIENT_SECRET!;
const TOKEN_URL = "https://api.insee.fr/token";
const SIRENE_URL = "https://api.insee.fr/entreprises/sirene/V3";

async function getAccessToken() {
  const credentials = Buffer.from(`${INSEE_CLIENT_ID}:${INSEE_CLIENT_SECRET}`).toString("base64");

  const response = await axios.post(
    TOKEN_URL,
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data.access_token;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { siren } = req.query;

  if (!siren || typeof siren !== "string" || !/^\d{9}$/.test(siren)) {
    return res.status(400).json({ error: "Numéro SIREN invalide." });
  }

  try {
    const accessToken = await getAccessToken();

    const legalUnitResponse = await axios.get(`${SIRENE_URL}/unitesLegales/${siren}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const establishmentsResponse = await axios.get(`${SIRENE_URL}/etablissements`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        numeroSiren: siren,
        etatAdministratifEtablissement: "A",
        siege: true,
      },
    });

    return res.status(200).json({
      uniteLegale: legalUnitResponse.data,
      etablissementSiege: establishmentsResponse.data?.etablissements?.[0],
    });
  } catch (error: any) {
    console.error("Erreur INSEE API :", error?.response?.data || error.message);
    return res.status(500).json({
      error: "Impossible de récupérer les données de l'INSEE.",
    });
  }
}
