# Rapport QA Complet - CCS DOM

Date : 29 juillet 2026  
Perimetre : application publique, SaaS super admin, manager, secretaire, client, facturation, documents, courrier, IA, securite et preparation beta.

## 1. Conclusion Executive

CCS DOM est dans un etat avance et coherent pour une beta terrain serieuse avec les managers, secretaires et clients pilotes. Les grands blocs metier sont presents : inscription publique, gestion multi-centres, validation, generation de documents, facturation, scan courrier, notifications, portail client, migration des clients historiques et supervision SaaS.

La plateforme n'est pas encore a considerer comme prete pour un lancement commercial complet. La raison principale est volontaire et connue : Stripe reste configure en mode test. Trois points de durcissement doivent aussi rester sous surveillance avant ouverture large : App Check non configure, capacite App Hosting limitee a une instance, et recette humaine multi-roles encore a finaliser.

Decision QA actuelle : Go beta controlee, No go production commerciale live.

## 2. Resultats Des Controles Automatises

| Controle | Resultat | Lecture QA |
| --- | --- | --- |
| `npm run typecheck` | OK | Le typage applicatif passe. |
| `npm --prefix functions run build` | OK | Les Cloud Functions compilent. |
| `npm run build` | OK | Le build Next.js production passe, 49 routes generees. |
| `npm run qa:critical` | OK | Flux critiques, isolation multi-centres et identite centre valides. |
| `npm run qa:production` | KO attendu | Stripe est encore en test. 3 avertissements de durcissement. |

Analyse de l'echec `qa:critical` :

Le controle initial sur la creation client directe a ete corrige. Le formulaire manager expose maintenant explicitement la periodicite mensuelle/annuelle, transmet les champs de centre canoniques et compatibles, et le script QA verifie la logique actuelle.

## 3. Couverture Fonctionnelle

### Site Public

Etat : bon niveau de maturite.

Points valides par historique projet et build :

- page d'accueil modernisee, positionnement plus general que Paris/Orly uniquement ;
- pages SEO locales Orly et Paris 12e presentes ;
- contact fonctionnel via API/Fallback mail ;
- chatbot public fonctionnel et structure ;
- tunnel d'inscription isole du layout public, ce qui reste le bon choix UX.

Risques restants :

- verifier en conditions reelles que les CTA "choisir ce centre" routent toujours vers le bon `addressId` ;
- enrichir progressivement le blog et le maillage local ;
- confirmer que les cartes Google s'affichent sur domaines autorises, pas uniquement en production.

### Authentification

Etat : robuste pour beta.

Points forts :

- login email/mot de passe ;
- connexion Google verrouillee aux profils applicatifs existants ;
- managers proteges contre la confusion d'alias Google ;
- page d'action Firebase Auth personnalisee ;
- reset password fonctionne et ne tombe plus en spam apres configuration du domaine.

Risques restants :

- verifier dans Firebase Console que tous les templates Auth pointent bien vers `https://ccsdom.fr/auth/action` ;
- preparer MFA d'abord pour super admin, puis eventuellement pour managers.

### Super Admin SaaS

Etat : logique metier saine.

Role attendu respecte :

- piloter centres, reseau, quotas, facturation SaaS et statistiques ;
- ne pas devenir un poste quotidien de traitement client ;
- pouvoir superviser, auditer et tester via prise de vue/role si necessaire.

Risques restants :

- les vrais contrats centres, quotas, limites d'usage et alertes capacite restent une couche SaaS a brancher plus tard ;
- la suppression definitive d'un centre doit rester evitee : archivage/desactivation est le bon comportement.

### Manager De Centre

Etat : fonctionnel, avec vigilance sur les donnees centre.

Points forts :

- isolation Orly/Paris corrigee sur clients et pages principales ;
- creation client directe fonctionne cote serveur ;
- facture initiale, contrat et attestation sont declenches ;
- gestion des clients importes et invitation au portail en place ;
- manager peut corriger email/telephone clients importes.

Points a retester imperativement :

- manager Orly ne voit jamais Paris dans clients, validation, mails, notifications, activites ;
- manager Paris ne voit jamais Orly ;
- creation client directe : email d'activation recu, documents remplis, facture accessible ;
- choix mensuel/annuel a rendre visible si non encore disponible.

### Secretaire

Etat : bon pour poste de production courrier.

Points forts :

- acces limite et coherent ;
- scan/courrier disponible ;
- selection client avec exclusion ou alerte selon forfait ;
- relances et mails presents ;
- notifications email courrier fonctionnelles.

Risques restants :

- refaire une passe mobile/tablette sur scan et mails ;
- verifier que les clients Classic sont clairement non eligibles au scan digital ou selectionnes avec message explicite selon la politique commerciale finale.

### Client

Etat : portail exploitable.

Points forts :

- documents, factures, courrier, abonnement et support accessibles ;
- actions courrier client corrigees : lu/non lu, urgent, archive ;
- suspension paiement peut griser/restreindre les modules sensibles ;
- factures et PDFs s'ouvrent en nouvel onglet sur les zones corrigees.

Risques restants :

- verifier que la suspension bloque bien le courrier sans bloquer les pages de regularisation ;
- s'assurer que les menus grises expliquent clairement la marche a suivre ;
- valider le parcours de regularisation Stripe apres paiement echoue.

### Facturation Et Stripe

Etat : beta OK, production live non.

Points forts :

- factures PDF generees et remplies apres corrections ;
- renouvellement et gestion abonnement couverts par le code ;
- paiement echoue pris en compte via suspension/notification ;
- changement de forfait et portail Stripe existent.

Blocage production :

- cle publique Stripe encore en mode test ;
- secret Stripe et webhook doivent passer en live au moment du lancement ;
- IDs de prix live a verifier ;
- prix affiches en HT, le TTC doit etre gere dans Stripe ou dans la presentation finale selon decision commerciale.

### Documents, PDF Et Storage

Etat : fortement ameliore.

Points forts :

- contrat, attestation, facture et liasse formalites couverts ;
- liens Storage reparés sur plusieurs zones ;
- documents client uploads fusionnes dans le portail.

Risques restants :

- verifier qu'aucun PDF critique n'est vide ;
- verifier les logos centres CCS/BPC sur tous les templates ;
- faire une revue juridique finale des contrats, attestations, liasses creation/transfert.

### Courrier, IA Et Notifications

Etat : fonctionnel avec dependance aux variables IA.

Points forts :

- notification email client apres courrier scanne ;
- classification et resume IA operationnels quand configuration presente ;
- resume IA reserve au forfait Premium selon derniere decision ;
- urgence visible en badge.

Risques restants :

- verifier les logs d'analyse IA sur fichiers non image ou PDF scannes ;
- definir une politique de relance si l'IA echoue : traitement manuel sans bloquer le courrier.

### Multi-Tenant Et Securite

Etat : bon socle, a durcir avant commercialisation.

Points forts :

- roles et centres normalises ;
- Firestore rules compilees lors des deploiements precedents ;
- plusieurs incidents 403 ont ete traites ;
- serviceAccountKey ignore/non suivi.

Risques restants :

- App Check absent dans `apphosting.yaml` ;
- logs Cloud Functions indiquaient historiquement `app: MISSING`, acceptable en beta mais pas ideal en prod ;
- revue finale des rules Firestore/Storage indispensable avant ouverture large.

### Mobile Et Tablette

Etat : plusieurs pages critiques ont ete retravaillees.

Pages deja ciblees :

- clients ;
- validation ;
- mails ;
- facturation ;
- adresses ;
- profils/parametres ;
- outils ;
- scan.

Risques restants :

- refaire une vraie recette sur iPhone 12, tablette et desktop ;
- verifier tous les boutons d'action visibles sans survol ;
- verifier les modales longues : creation client, creation centre, assignation, revocation.

## 4. Incidents Ou Risques Classes

### P0 - Bloquants Avant Production Commerciale

| ID | Sujet | Constat | Action recommandee |
| --- | --- | --- | --- |
| QA-P0-01 | Stripe live | `qa:production` echoue car la cle publique Stripe est en test. | Passer en `pk_live`, `sk_live`, webhook live et verifier les price IDs live avant encaissement reel. |
| QA-P0-02 | Recette terrain | Les tests reels managers/secretaires/clients ne sont pas encore signes. | Faire executer le kit beta et consigner les incidents. |

### P1 - Important Avant Beta Elargie

| ID | Sujet | Constat | Action recommandee |
| --- | --- | --- | --- |
| QA-P1-01 | QA creation client directe | Corrige le 29/07/2026. | Controle QA vert, periodicite visible et champs centre transmis explicitement. |
| QA-P1-02 | App Check | Cle reCAPTCHA App Check absente. | Configurer sans enforcement strict, observer, puis renforcer. |
| QA-P1-03 | Capacite | `maxInstances: 1`. | Passer a 3 minimum avant trafic reel. |
| QA-P1-04 | Templates Auth | Verification console manuelle requise. | Confirmer tous les liens d'action Firebase Auth. |
| QA-P1-05 | Donnees test mails | Les collections de test peuvent polluer la recette. | Nettoyer uniquement les donnees test confirmees, apres sauvegarde/export si besoin. |
| QA-P1-06 | Encodage | Des fragments `Ã...` existent dans certains fichiers/functions. | Corriger les textes visibles et emails avant recette externe. |

### P2 - Finition Produit

| ID | Sujet | Constat | Action recommandee |
| --- | --- | --- | --- |
| QA-P2-01 | SEO | Base bonne mais perfectible. | Continuer pages locales, blog, H1/H2 et maillage interne. |
| QA-P2-02 | Observabilite | Les erreurs sont loggees mais pas encore consolidees en cockpit incident. | Ajouter un tableau erreurs critiques apres beta. |
| QA-P2-03 | Emails | Pied de page et ton pro presents mais a uniformiser. | Harmoniser tous les mails sortants. |

## 5. Tests Terrain A Executer

### Super Admin

- creer un centre brouillon ;
- verifier qu'il n'apparait pas dans l'inscription publique ;
- archiver un centre test ;
- verifier stats, quotas, facturation centres ;
- consulter activites et filtrer par centre.

### Manager Orly Et Manager Paris

- ouvrir clients, validation, mails, notifications, activites ;
- confirmer isolation stricte du centre ;
- creer un client direct complet ;
- verifier email activation, facture, contrat, attestation ;
- modifier email/telephone d'un client importe ;
- inviter un client importe au portail.

### Secretaire

- scanner courrier pour client eligible ;
- scanner courrier pour client Classic et verifier message/limite ;
- verifier notification email ;
- verifier classification et resume IA pour Premium ;
- creer et traiter une relance.

### Client

- se connecter ;
- ouvrir courrier ;
- marquer lu/non lu/urgent/archive ;
- telecharger courrier, facture, contrat, attestation ;
- uploader justificatifs ;
- ouvrir abonnement et regulariser si compte suspendu.

### Prospect Public

- inscription creation Paris ;
- inscription transfert Orly ;
- paiement Stripe test ;
- verifier association paiement/dossier meme si retour navigateur interrompu ;
- verifier PDFs et notifications.

## 6. Recommandation Chef De Projet

Ordre recommande :

1. Corriger le petit ecart QA `paymentFrequency` / script `qa:critical`.
2. Nettoyer les textes encodes visibles dans fonctions/emails/pages.
3. Nettoyer les donnees test courrier avant recette, sans supprimer les collections metier utiles.
4. Lancer la beta terrain avec le kit deja prepare.
5. Corriger uniquement les P0/P1 remontes par les utilisateurs.
6. Geler une version stable.
7. Passer Stripe live et durcissement App Check/capacite.

Verdict : CCS DOM est proche d'une version beta professionnelle. Le produit a maintenant une vraie colonne vertebrale SaaS. La priorite n'est plus d'ajouter beaucoup de fonctionnalites, mais de verrouiller la fiabilite, l'isolation, la facturation et la clarte utilisateur.


## 7. Journal De Stabilisation Du 29/07/2026

Corrections implementees :

- Ajout du choix de periodicite mensuelle/annuelle dans la creation client manager/secretaire.
- Transmission explicite des champs `centerId`, `addressId`, `domiciliationAddressId`, `addressKey` et `locationKey` lors de la creation client directe.
- Alignement des scripts QA sur la logique multi-centres factorisee actuellement utilisee.
- Correction TypeScript sur la frequence de changement d'abonnement en attente.
- Nettoyage des textes d'activation client les plus visibles.

Controles apres correction :

| Controle | Resultat |
| --- | --- |
| `npm run typecheck` | OK |
| `npm --prefix functions run build` | OK |
| `npm run build` | OK |
| `npm run qa:critical` | OK |
| `npm run qa:release` | OK |
| `npm run qa:production` | KO attendu : Stripe test + App Check/capacite a durcir |

Decision actualisee : Go beta controlee confirme. No go production commerciale live tant que Stripe live et durcissements production ne sont pas faits.


Note execution : `npm run qa:release` a necessite une relance hors sandbox Windows apres un `spawn EPERM` local des workers Next.js. La relance complete est passee avec succes.
