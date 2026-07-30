# Contrat D'Identite Centre

Ce document fixe la regle multi-tenant de CCS DOM.

## Principe Directeur

`centerId` est l'identifiant metier canonique d'un centre.

Exemples historiques :

- `paris_12e`
- `orly_ville`

Les champs `addressKey`, `locationKey` et `centerKey` restent acceptes pour compatibilite, templates PDF, stockage et donnees historiques.

## Champs

### centerId

Role :

- identifiant canonique du centre ;
- champ de reference pour l'isolation manager/secretaire ;
- champ a privilegier dans les nouvelles donnees.

Format :

- slug stable, minuscule, sans espace ;
- exemple : `paris_12e`, `orly_ville`, puis a terme `lyon_part_dieu`, `marseille_vieux_port`, etc.

### addressKey / locationKey

Role :

- compatibilite historique ;
- selection des templates PDF ;
- chemins Storage historiques ;
- filtres encore necessaires pendant la migration.

Valeurs historiques :

- `paris`
- `orly`

### centerKey

Role :

- cle courte utile pour les flux courriers, Storage et jobs PDF ;
- peut etre identique a `addressKey` pour les centres historiques.

## Regle D'Ecriture

Tout nouveau client, dossier ou objet facturation doit ecrire au minimum :

- `centerId`
- `addressId` si le workflow historique en depend encore
- `addressKey` ou `centerKey` si PDF/Storage/envoi email en depend

Pour les centres historiques :

| Centre | centerId | addressKey/locationKey/centerKey |
| --- | --- | --- |
| Paris 12e | `paris_12e` | `paris` |
| Orly Ville | `orly_ville` | `orly` |

## Regle De Lecture

Les interfaces staff ne doivent jamais lire une collection sensible sans contrainte centre.

Collections sensibles :

- `clients`
- `client_requests`
- `invoices`
- `mails`
- `courriers`
- jobs PDF par centre

Le frontend peut garder un filtrage de secours, mais la requete Firestore ou Storage doit deja etre bornee par centre.

## Regle De Securite

Les regles Firestore et Storage doivent refuser les lectures globales pour les roles operationnels.

Le super admin conserve une vue globale, mais son interface produit ne doit pas devenir un poste de production client.

## Migration

Les scripts de backfill doivent :

- deduire `centerId` depuis les champs historiques ;
- ecrire `centerId` sans supprimer les champs legacy ;
- marquer les documents indeductibles pour correction manuelle ;
- toujours proposer un mode dry-run avant repair.

## Critere De Sortie

Le contrat est considere respecte si :

- `npm run qa:multitenant` passe ;
- `npm run qa:center-contract` passe ;
- les managers Paris/Orly ne voient jamais les donnees de l'autre centre ;
- les PDF contrats, attestations et factures sont limites au bon centre.
