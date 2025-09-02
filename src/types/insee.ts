// types/insee.ts

export interface UniteLegale {
  siren: string;
  denominationUniteLegale?: string;
  periodesUniteLegale?: {
    nom?: string;
    nomUsage?: string;
    prenom?: string;
    prenomUsuel?: string;
  }[];
}

export interface AdresseEtablissement {
  libelleVoieEtablissement?: string;
  codePostalEtablissement?: string;
  libelleCommuneEtablissement?: string;
}

export interface InseeApiResponse {
  header: {
    statut: number;
    message: string;
  };
  uniteLegale: UniteLegale;
  etablissementSiege?: {
    adresseEtablissement?: AdresseEtablissement;
  };
}
