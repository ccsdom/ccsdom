# Recette Beta Client CCS DOM

## Objectif

Ce document organise la phase beta avant ouverture plus large de la plateforme.

La beta doit valider que CCS DOM est utilisable par des personnes non techniques :

- un super admin pilote le reseau sans gerer les clients au quotidien ;
- un manager exploite son centre sans fuite de donnees ;
- une secretaire traite les courriers et relances simplement ;
- un client consulte ses documents, factures et courriers sans assistance ;
- le tunnel public transforme une inscription en dossier exploitable.

Les tests detailles restent dans `docs/recette-saas-v1.md`.
Ce document sert de protocole terrain pour les testeurs.

Supports pratiques :

- `docs/kit-beta-testeurs.md` : version courte a transmettre aux testeurs.
- `docs/beta-incident-log-template.csv` : registre incidents ouvrable dans Excel.

## Regles De Recette

- Chaque testeur note les blocages au moment ou ils arrivent.
- Une capture est demandee pour tout incident visuel, droit, paiement, PDF ou mail.
- Un incident `P0` bloque la beta elargie.
- Un incident `P1` peut etre accepte temporairement s'il est documente.
- Un incident `P2` est une amelioration de confort.
- Aucun testeur ne doit utiliser de vraies cartes bancaires tant que Stripe est en mode test.

## Definition Des Priorites

| Niveau | Signification | Exemple |
| --- | --- | --- |
| `P0` | Bloquant produit | Paiement impossible, fuite Orly / Paris, PDF vide, 403 sur document autorise |
| `P1` | Important mais contournable | Bouton mal place mobile, libelle ambigu, filtre peu clair |
| `P2` | Confort / finition | Texte a reformuler, espacement, micro-animation |

## Equipe De Beta

| Profil | Nombre minimal | Mission |
| --- | --- | --- |
| Super admin | 1 | Gouvernance reseau, centres, supervision |
| Manager Orly | 1 | Validation, clients, facturation et courrier Orly |
| Manager Paris | 1 | Validation, clients, facturation et courrier Paris |
| Secretaire | 1 par centre si possible | Scan, courrier, relances |
| Client test | 2 par centre | Portail client, documents, factures, courriers |
| Prospect test | 2 | Inscription publique creation et transfert |

## Donnees A Preparer

| Donnee | Minimum attendu |
| --- | --- |
| Centres actifs | Orly et Paris 12e |
| Clients actifs | 2 par centre |
| Clients importes legacy | au moins 5 par centre pour verifier invitation / migration |
| Demandes inscription | 1 creation Paris, 1 transfert Orly |
| Factures | au moins 1 facture par centre |
| Courriers scan | 1 courrier normal, 1 courrier urgent, 1 document non image |
| Documents client | contrat, attestation, pieces upload, facture PDF |

## Phase 0 - Preparation Interne

Objectif : verifier que l'environnement est propre avant d'impliquer les testeurs.

Checklist :

- Confirmer que `https://ccsdom.fr` pointe vers le dernier deploiement attendu.
- Confirmer que Stripe est bien en mode test.
- Confirmer que les centres de test archives ne sont pas visibles dans l'inscription publique.
- Confirmer que les comptes de test existent et que leurs roles sont corrects.
- Confirmer que Kaspersky, extensions ou bloqueurs ne perturbent pas Stripe lors des tests paiement.
- Executer localement les commandes de qualite avant gel :

```bash
npm run typecheck
npm --prefix functions run build
npm run build
```

Critere de sortie :

- aucune erreur technique connue ne bloque l'ouverture de la beta.

## Phase 1 - Super Admin

Objectif : valider le cockpit SaaS.

Checklist :

- Se connecter en super admin.
- Ouvrir le tableau de bord admin.
- Verifier que la vue est reseau et non orientee traitement quotidien des clients.
- Ouvrir la gestion des centres.
- Verifier Orly, Paris 12e et les centres archives.
- Creer un centre brouillon non publie.
- Verifier qu'il n'apparait pas dans l'inscription publique.
- Archiver un centre test sans client actif.
- Tenter d'archiver un centre avec client actif.
- Ouvrir la facturation centres.
- Ouvrir les statistiques et activites reseau.

Validation attendue :

- le super admin supervise les centres sans casser les operations ;
- aucune action client quotidienne critique n'est exposee comme mission principale ;
- les centres archives restent hors parcours public.

## Phase 2 - Manager De Centre

Objectif : valider l'exploitation centre par centre.

Checklist commune :

- Se connecter comme manager Orly puis manager Paris.
- Verifier que le menu affiche le bon centre.
- Ouvrir `Clients`.
- Verifier que seuls les clients du centre courant apparaissent.
- Creer un client direct.
- Verifier centre, abonnement, facture et documents.
- Ouvrir `Validation`.
- Ouvrir un dossier en attente.
- Regenerer contrat et attestation.
- Verifier que les PDF sont remplis et accessibles.
- Valider un dossier paye.
- Tenter de valider un dossier non paye.
- Ouvrir `Facturation`.
- Telecharger une facture.
- Regenerer une facture.
- Ouvrir `Mails`.
- Verifier que les courriers du centre seulement apparaissent.
- Ouvrir `Activites` et `Notifications`.
- Verifier l'isolation Orly / Paris.

Validation attendue :

- aucune fuite inter-centres ;
- aucun `403` sur les documents autorises ;
- les actions importantes sont visibles sur mobile et desktop ;
- les PDF critiques ne sont jamais vides.

## Phase 3 - Secretaire

Objectif : valider le poste de production courrier.

Checklist :

- Se connecter comme secretaire.
- Verifier que les pages SaaS sensibles ne sont pas accessibles.
- Ouvrir `Scan`.
- Selectionner un client du centre.
- Scanner ou uploader un courrier simple.
- Scanner ou uploader un courrier urgent.
- Scanner ou uploader un document non image.
- Verifier la classification IA lorsque le forfait le permet.
- Verifier le resume IA lorsque le forfait le permet.
- Envoyer une notification au client lorsque le forfait le permet.
- Ouvrir `Mails`.
- Verifier que le courrier apparait dans la boite du centre.
- Ouvrir `Relances`.
- Creer ou traiter une relance.

Validation attendue :

- la secretaire peut traiter le flux quotidien sans passer par le manager ;
- les clients Classic sont geres proprement selon leurs limites ;
- les notifications respectent le forfait.

## Phase 4 - Client

Objectif : verifier que le portail client donne confiance.

Checklist :

- Se connecter avec un client actif Orly.
- Se connecter avec un client actif Paris.
- Ouvrir le tableau de bord.
- Ouvrir la boite courrier.
- Lire un courrier.
- Telecharger le document associe.
- Verifier que le resume IA apparait uniquement si le forfait le permet.
- Ouvrir les documents.
- Telecharger contrat et attestation.
- Uploader une piece justificative.
- Ouvrir les factures.
- Telecharger une facture PDF.
- Ouvrir l'abonnement.
- Verifier le forfait courant.
- Tester une demande de changement de forfait avec carte test.
- Tester la page support.

Validation attendue :

- le client comprend ou sont ses courriers, factures et documents ;
- les documents sont accessibles sans erreur ;
- les limites de forfait sont comprehensibles.

## Phase 5 - Inscription Publique

Objectif : valider l'acquisition client.

Checklist :

- Ouvrir le site public.
- Lancer une inscription `creation`.
- Choisir Paris 12e.
- Remplir representant, statut juridique, adresse et pieces.
- Finaliser le paiement Stripe avec carte test.
- Verifier le retour sur CCS DOM.
- Verifier que la demande est visible chez le manager Paris.
- Repeter avec `transfert` et centre Orly.
- Verifier que le centre choisi prime sur l'adresse personnelle du client.
- Tenter une inscription avec email deja connu.
- Tenter une inscription avec SIRET deja connu.

Validation attendue :

- le paiement reste rattache au bon dossier ;
- les demandes arrivent dans le bon centre ;
- les doublons dangereux sont evites ou explicitement bloques.

## Phase 6 - Migration Clients Existants

Objectif : preparer le passage digital des clients historiques.

Checklist :

- Ouvrir le tableau de bord de migration.
- Verifier les clients importes Orly.
- Verifier les clients importes Paris.
- Verifier leur centre, email, forfait `classic` et frequence `monthly`.
- Inviter un client pilote uniquement apres validation manager.
- Verifier que l'email d'invitation est clair.
- Verifier que le client active son acces sans doublon.
- Verifier que les anciens clients Classic ne recoivent pas de notification IA par defaut.

Validation attendue :

- les imports sont propres ;
- l'invitation est controlee ;
- aucun client historique n'est force dans un parcours payant non voulu.

## Modele De Remontee Incident

Chaque incident doit etre note sous cette forme :

```text
Date :
Testeur :
Role :
Centre :
URL :
Action realisee :
Resultat attendu :
Resultat obtenu :
Priorite : P0 / P1 / P2
Capture ou preuve :
Commentaire :
```

## Tableau De Suivi Beta

| ID | Date | Role | Centre | Zone | Priorite | Statut | Responsable | Commentaire |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BETA-001 | | | | | | A qualifier | | |

Statuts recommandes :

- `A qualifier`
- `Confirme`
- `En correction`
- `Corrige`
- `A retester`
- `Valide`
- `Accepte temporairement`

## Criteres De Sortie Beta

La beta peut etre consideree comme reussie si :

- tous les incidents `P0` sont corriges ou annules apres verification ;
- aucun manager ne voit les donnees d'un autre centre ;
- aucun client ne voit les donnees d'un autre client ;
- Stripe fonctionne hors extensions/bloqueurs connus ;
- les documents critiques sont remplis et telechargeables ;
- les emails importants partent avec le bon expediteur ;
- le scan courrier fonctionne pour au moins deux forfaits differents ;
- les retours des testeurs non techniques confirment que le parcours est comprehensible.

## Decision Finale

| Decision | Condition |
| --- | --- |
| Go beta elargie | Aucun P0, P1 acceptables, parcours majeurs valides |
| Go limite | P0 resolus mais P1 visibles, ouverture a quelques clients pilotes |
| No go | P0 ouvert ou fuite de donnees / paiement / documents |
