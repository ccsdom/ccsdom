# Tableau de Suivi Beta - CCS DOM

## Objectif

Centraliser les retours terrain des managers, secretaires et clients pendant la recette beta.

Le but n'est pas de collecter beaucoup de messages, mais de transformer chaque retour en decision claire :

- corriger immediatement ;
- planifier apres beta ;
- classer sans action si le comportement est normal ;
- demander une preuve ou une reproduction.

## Roles Testeurs

| Role | Priorite de test | Exemples de modules |
| --- | --- | --- |
| Manager Orly | Production centre Orly | Clients, validation, scan, courriers, factures |
| Secretaire Orly | Traitement quotidien | Scan, courriers, relances, dossiers incomplets |
| Manager Paris | Isolation Paris | Clients Paris, validation Paris, facturation centre |
| Client beta | Experience client | Connexion, documents, courrier, abonnement, support |
| Super admin | Pilotage SaaS | Centres, abonnements centres, stats, quotas, activite |

## Grille de Priorite

| Priorite | Definition | Delai cible |
| --- | --- | --- |
| P0 - Bloquant | Paiement, connexion, validation ou acces impossible | Correction immediate |
| P1 - Critique | Fonction majeure degradee, contournement difficile | Sous 24 h |
| P2 - Important | Gene reelle mais contournement possible | Sprint beta |
| P3 - Confort | Texte, ergonomie, finition visuelle | Avant livraison finale |

## Statuts

| Statut | Sens |
| --- | --- |
| Nouveau | Retour recu, pas encore analyse |
| A reproduire | Il manque une capture, un compte ou une etape |
| Confirme | Le probleme est reproduit |
| En cours | Correction en cours |
| Pret a tester | Correctif pret localement ou deploye |
| Valide | Testeur confirme que c'est corrige |
| Sans action | Comportement normal ou demande reportee |

## Champs Obligatoires

Chaque retour doit contenir :

- date ;
- testeur ;
- role utilise ;
- module ;
- environnement : local, production, mobile, desktop ;
- description courte ;
- etapes pour reproduire ;
- resultat attendu ;
- resultat observe ;
- capture ou video si possible ;
- priorite ;
- statut.

## Modules a Suivre

| Module | Points de vigilance |
| --- | --- |
| Connexion | Google, email/mot de passe, reset password, redirection par role |
| Inscription publique | Centre choisi, paiement Stripe, contrat, attestation, notifications |
| Clients manager | Creation directe, abonnement, documents, factures, isolation centre |
| Validation | Dossiers visibles par centre, actions manager/secretaire |
| Scan courrier | Selection client, forfait autorise, upload, analyse IA, notification |
| Courrier client | Lu, non lu, urgent, archive, telechargement |
| Facturation | Facture initiale, changement forfait, mensualite/annuel |
| Super admin | Centres, suspension, abonnement centre, quotas, activite |

## Routine Quotidienne Beta

1. Recuperer les retours terrain.
2. Classer chaque retour en P0, P1, P2 ou P3.
3. Corriger seulement les P0/P1 en urgence.
4. Regrouper les P2 par module pour eviter les corrections dispersees.
5. Demander une confirmation testeur avant de passer en `Valide`.

## Regle de Prudence

Ne jamais corriger en production sans savoir :

- quel role est impacte ;
- quel centre est impacte ;
- si la correction touche les droits Firestore/Storage ;
- si un test local ou QA existe ;
- si le correctif doit etre deploye cote app, rules ou functions.

## Fichier de Saisie

Utiliser le modele CSV :

`docs/beta-feedback-tracker.csv`
