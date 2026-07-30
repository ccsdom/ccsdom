# Recette SaaS V1 CCS DOM

## Objectif

Cette recette valide que la plateforme est prete pour un test SaaS complet en conditions proches du reel.

La recette doit confirmer quatre points :

- les roles sont coherents et limites ;
- les centres sont isoles ;
- les parcours client, manager, secretaire et super admin fonctionnent de bout en bout ;
- aucun blocage critique n'apparait sur paiement, PDF, mails, scan, documents ou droits.

Pour la beta terrain avec managers, secretaires et clients pilotes, utiliser aussi :

- `docs/recette-beta-client.md`

## Regle De Decision

La V1 est prete pour test elargi si :

- tous les tests `P0` sont conformes ;
- aucune fuite Orly / Paris n'est constatee ;
- aucun PDF critique n'est vide ou inaccessible ;
- aucun bouton critique ne reste sans effet ;
- aucun `403` n'apparait sur les documents autorises ;
- `npm run qa:release` passe localement avant le gel de version.

## Environnement De Recette

| Element | Valeur attendue |
| --- | --- |
| Domaine | `https://ccsdom.fr` |
| Projet Firebase | `bizhome-hub` |
| Stripe | mode test tant que les cles live ne sont pas configurees |
| Centres actifs minimum | Orly, Paris 12e |
| Centres archives possibles | centres de test uniquement |
| Donnees obligatoires | au moins un client actif Orly, un client actif Paris, une demande creation, une demande transfert |

## Comptes A Preparer

| Role | Centre | Usage |
| --- | --- | --- |
| `super_admin` | reseau | gouvernance SaaS, centres, quotas, facturation centres |
| `manager` | Orly | validation, clients, factures, courriers Orly |
| `manager` | Paris | validation, clients, factures, courriers Paris |
| `secretary` | Orly | scan, mails, relances Orly |
| `secretary` | Paris | scan, mails, relances Paris |
| `client` | Orly | portail client, documents, factures, courrier |
| `client` | Paris | portail client, documents, factures, courrier |

## P0 - Tests Bloquants

### 1. Acces Et Roles

| ID | Role | Action | Resultat attendu | Preuve |
| --- | --- | --- | --- | --- |
| P0-ACC-01 | super_admin | Connexion email/mot de passe | Acces au cockpit SaaS | Capture `/admin` |
| P0-ACC-02 | manager Orly | Connexion | Menu centre sans donnees Paris | Capture menu + clients |
| P0-ACC-03 | manager Paris | Connexion | Menu centre sans donnees Orly | Capture menu + clients |
| P0-ACC-04 | secretaire | Connexion | Acces operationnel limite, pas gouvernance SaaS | Capture menu |
| P0-ACC-05 | client | Connexion | Acces uniquement au portail client | Capture `/dashboard` |
| P0-ACC-06 | compte inconnu Google | Tentative connexion Google | Connexion refusee si aucun profil applicatif | Message d'erreur |

### 2. Gouvernance Centres

| ID | Role | Action | Resultat attendu | Preuve |
| --- | --- | --- | --- | --- |
| P0-CEN-01 | super_admin | Ouvrir reseau / adresses | Orly et Paris visibles, centres archives masques par defaut | Capture liste |
| P0-CEN-02 | super_admin | Creer un centre test | Creation sans perte de focus, adresse autocomplete OK | Capture formulaire |
| P0-CEN-03 | super_admin | Laisser voyants publication a Non | Centre absent de l'inscription publique | Capture signup |
| P0-CEN-04 | super_admin | Mettre centre actif + 3 voyants Oui | Centre visible dans l'inscription publique | Capture signup |
| P0-CEN-05 | super_admin | Archiver centre sans client actif | Centre masque, historique conserve | Capture archives |
| P0-CEN-06 | super_admin | Archiver centre avec client actif | Operation bloquee | Toast / message |
| P0-CEN-07 | super_admin | Suspendre puis reactiver centre | Etat mis a jour, bouton redevient disponible | Capture gouvernance |

### 3. Inscription Publique

| ID | Parcours | Action | Resultat attendu | Preuve |
| --- | --- | --- | --- | --- |
| P0-SIGN-01 | transfert Orly | Inscription complete avec paiement | Client cree au centre Orly, paiement associe, PDFs generes | Firestore + UI |
| P0-SIGN-02 | creation Paris | Inscription complete avec paiement | Client cree au centre Paris, paiement associe, PDFs generes | Firestore + UI |
| P0-SIGN-03 | centre explicite | Adresse client hors centre choisi | Le centre choisi prime sur l'adresse libre du client | Fiche client |
| P0-SIGN-04 | paiement retour perdu | Paiement Stripe valide sans retour navigateur | Webhook associe paiement au bon client | Stripe + Firestore |
| P0-SIGN-05 | compte deja existant | Nouvelle inscription meme email/SIRET | Blocage ou message clair, pas de doublon dangereux | Message |

### 4. Validation Manager

| ID | Role | Action | Resultat attendu | Preuve |
| --- | --- | --- | --- | --- |
| P0-VAL-01 | manager Orly | Ouvrir validation | Seulement demandes Orly | Capture |
| P0-VAL-02 | manager Paris | Ouvrir validation | Seulement demandes Paris | Capture |
| P0-VAL-03 | manager | Ouvrir dossier | Donnees client, documents, paiement, statut visibles | Capture dossier |
| P0-VAL-04 | manager | Generer / regenerer contrat | PDF rempli, accessible, pas de `403` | PDF ouvert |
| P0-VAL-05 | manager | Generer / regenerer attestation | PDF rempli, accessible, pas de `403` | PDF ouvert |
| P0-VAL-06 | manager | Approuver dossier paye | Client active, acces provisionne | Statut client |
| P0-VAL-07 | manager | Approuver dossier non paye | Validation bloquee ou message coherent | Message |

### 5. Clients Et Documents

| ID | Role | Action | Resultat attendu | Preuve |
| --- | --- | --- | --- | --- |
| P0-CLI-01 | manager Orly | Ouvrir clients | Aucun client Paris visible | Capture |
| P0-CLI-02 | manager Paris | Ouvrir clients | Aucun client Orly visible | Capture |
| P0-CLI-03 | manager | Creer client direct | Centre correct, abonnement actif, facture preparee | Fiche client |
| P0-CLI-04 | client direct | Connexion | Documents, contrat, attestation accessibles | Portail client |
| P0-CLI-05 | client | Upload justificatif | Upload accepte et visible dans documents client | Capture |
| P0-CLI-06 | client | Telecharger contrat/attestation | Ouverture OK, pas de `403` | PDF ouvert |

### 6. Facturation Client Et SaaS

| ID | Role | Action | Resultat attendu | Preuve |
| --- | --- | --- | --- | --- |
| P0-BILL-01 | client | Ouvrir abonnement/factures | Plan et factures visibles | Capture |
| P0-BILL-02 | client | Telecharger facture | PDF rempli, pas de `403` | PDF ouvert |
| P0-BILL-03 | manager | Regenerer facture client | PDF rempli et lien mis a jour | PDF ouvert |
| P0-BILL-04 | manager Paris | Acceder facture Orly | Acces refuse | Message / absence |
| P0-BILL-05 | super_admin | Ouvrir facturation centres | Vue SaaS centres, pas poste client quotidien | Capture |
| P0-BILL-06 | client | Changer de forfait | Checkout OK, retour/sync coherent apres paiement | Stripe + UI |
| P0-BILL-07 | client | Annuler abonnement | Fin de periode respectee, pas de coupure brutale abusive | Statut |

### 7. Courrier, Scan, IA Et Notifications

| ID | Role | Action | Resultat attendu | Preuve |
| --- | --- | --- | --- | --- |
| P0-MAIL-01 | secretaire Orly | Scanner courrier pour client Orly | Courrier visible client Orly | Client mail |
| P0-MAIL-02 | secretaire Paris | Scanner courrier pour client Paris | Courrier visible client Paris | Client mail |
| P0-MAIL-03 | manager Orly | Verifier mails | Aucun courrier Paris visible | Capture |
| P0-MAIL-04 | client | Recevoir courrier scanne | Notification email recue | Email |
| P0-MAIL-05 | IA courrier | Analyser courrier | Resume et classification renseignes | UI / Firestore |
| P0-MAIL-06 | courrier urgent | Marquer urgent ou detecter urgence | Notification personnalisee claire | Email + UI |
| P0-MAIL-07 | client | Ouvrir boite mail | Liste lisible, document telechargeable | Capture |

### 8. Activites, Notifications Et Isolation

| ID | Role | Action | Resultat attendu | Preuve |
| --- | --- | --- | --- | --- |
| P0-ACT-01 | manager Orly | Ouvrir activites | Activites Orly uniquement | Capture |
| P0-ACT-02 | manager Paris | Ouvrir activites | Activites Paris uniquement | Capture |
| P0-ACT-03 | super_admin | Ouvrir activites | Vue reseau filtree et exploitable | Capture |
| P0-ACT-04 | manager Paris | Ouvrir notifications | Pas d'activites Orly | Capture |
| P0-ACT-05 | client | Ouvrir notifications | Notifications du client uniquement | Capture |

## P1 - Tests Fortement Recommandes

| ID | Zone | Action | Resultat attendu |
| --- | --- | --- | --- |
| P1-UX-01 | mobile manager | Tester clients, mails, validation, facturation | Aucun bouton cache ou debordement |
| P1-UX-02 | mobile secretaire | Tester scan et mails | Flux utilisable sur telephone |
| P1-UX-03 | login | Mot de passe oublie | Email non spam, page custom propre |
| P1-UX-04 | signup | Rafraichir pendant inscription | Etat conserve ou reprise claire |
| P1-UX-05 | docs | Liasse formalites creation | Documents lisibles et coherents |
| P1-UX-06 | docs | Liasse formalites transfert | Documents lisibles et coherents |
| P1-UX-07 | cartes | Pages publiques et admin | Maps visibles sans erreur console |
| P1-UX-08 | email | Notifications systeme | Expediteur et contenu professionnels |

## Commandes Avant Recette

Executer localement :

```bash
npm run typecheck
npm --prefix functions run build
npm run qa:critical
npm run build
```

Avant un gel plus strict :

```bash
npm run qa:release
```

## Journal De Recette

| Date | Testeur | Perimetre | Resultat | Incidents |
| --- | --- | --- | --- | --- |
| | | | | |

## Sortie De Recette

La recette SaaS V1 peut etre signee si :

- tous les `P0` sont valides ;
- les incidents `P1` restants sont acceptes explicitement ;
- les donnees de test sensibles sont nettoyees ou archivees ;
- les centres de test sont archives et non publies ;
- Stripe reste en test tant que le passage live n'est pas decide ;
- un dernier deploiement propre est effectue avec `qa:release` vert.
