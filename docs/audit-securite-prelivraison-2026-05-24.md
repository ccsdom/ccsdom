# Audit Securite Pre-livraison - 24 mai 2026

## Objectif

Verifier les droits et l'isolation multi-centres avant la beta terrain CCS DOM.

Perimetre audite :

- regles Firestore ;
- regles Storage ;
- acces par role : super admin, manager, secretaire, client ;
- isolation Orly / Paris ;
- collections sensibles : clients, demandes, courriers, activites, factures.

## Synthese

Le socle applicatif filtre deja les donnees par centre dans les interfaces critiques.

Point de vigilance principal avant correction :

- plusieurs regles Firestore autorisaient encore un acces global a tout `staff`, en comptant sur les filtres cote interface.

Correction appliquee localement :

- durcissement Firestore pour que les collections sensibles verifient aussi le centre cote serveur.

Statut :

- regles Firestore compilees en dry-run ;
- `npm run qa:critical` valide ;
- `npm run qa:multitenant` valide ;
- pas encore deploye en production.

## Tests Locaux Executes

- `npm run qa:critical` : 25 controles critiques passes, 0 echec.
- `npm run qa:multitenant` : 13 controles d'isolation passes, 0 echec.
- `npx -y firebase-tools@latest deploy --project bizhome-hub --only firestore:rules --dry-run` : compilation Firestore reussie, aucun deploiement effectue.

## Corrections Firestore Preparees

### `client_requests`

Avant :

- un staff pouvait mettre a jour ou supprimer une demande hors centre.

Apres :

- update staff autorise uniquement si le staff appartient au centre du document existant et du document cible ;
- delete staff limite au centre ;
- super admin conserve le droit reseau.

### `clients`

Avant :

- create, update, delete ouverts a tout staff.

Apres :

- creation limitee au centre du staff ;
- update limite au centre existant et au centre cible ;
- delete limite au centre ;
- super admin conserve le droit reseau.

### `mails`

Avant :

- tous les courriers etaient lisibles/modifiables par tout staff si la personne connaissait la requete.

Apres :

- lecture staff limitee au centre du courrier ;
- creation limitee au centre du staff ;
- update limitee au centre existant et au centre cible ;
- delete limitee au centre ;
- client conserve l'acces a ses propres courriers.

### `clients/{uid}/mails`

Avant :

- tout staff pouvait lire/ecrire les sous-courriers d'un client.

Apres :

- staff autorise uniquement si le client parent appartient a son centre ;
- client conserve l'acces a son propre espace.

### `activity_logs` et `audit_logs`

Avant :

- tout staff pouvait lire les activites reseau.

Apres :

- super admin voit le reseau ;
- manager/secretaire voient uniquement les logs de leur centre ;
- prise en compte de `centerId`, `centerKey`, `addressKey`, `locationKey` et `centerIds`.

### `courriers`

Avant :

- list ouverte a tout staff.

Apres :

- list limitee au centre du courrier ;
- client conserve l'acces a ses propres courriers.

## Verification Technique

Commande executee :

```bash
npx -y firebase-tools@latest deploy --project bizhome-hub --only firestore:rules --dry-run
```

Resultat :

```text
rules file firestore.rules compiled successfully
Dry run complete
```

## Risques Restants A Surveiller

### Storage

Les regles Storage sont deja strictes sur les chemins centres pour plusieurs dossiers :

- `courriers/{centerKey}/...`
- `incoming-mails/{centerKey}/...`
- `mailroom/{centerKey}/...`
- `formalites/{centerKey}/...`
- attestations, contrats et factures par centre.

Points a revoir ensuite :

- les chemins legacy `mails/{uid}/{mailId}/{fileName}` et `contracts/{uid}/{fileName}` dependent du rattachement Firestore ;
- les ecritures staff Storage sont encore plus larges que les lectures ;
- un chantier dedie Storage est recommande apres validation Firestore.

### Users / Customers

Les collections `users` et `customers` restent volontairement peu modifiees dans ce patch prudent.

Raison :

- elles peuvent etre liees a des workflows Auth/Stripe et a des fonctions admin ;
- un durcissement trop rapide peut casser la creation d'operateurs ou la synchronisation paiement.

Recommandation :

- traiter `users` et `customers` dans un lot separe avec tests de creation operateur, Google login, Stripe, portail client.

## Decision Recommandee

Ne pas deployer immediatement pendant que les testeurs commencent leur beta.

Ordre prudent :

1. garder ce patch local ;
2. tester localement ou en production controlee les pages `clients`, `validation`, `mails`, `scan`, `activity`, `billing` ;
3. deployer `firestore:rules` seulement apres validation rapide ;
4. surveiller les erreurs `permission-denied` pendant 24 heures.
