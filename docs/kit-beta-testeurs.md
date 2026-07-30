# Kit Beta Testeurs CCS DOM

## Objectif

Ce kit est le document court a transmettre aux testeurs metier : manager Orly, secretaire Orly, manager Paris et clients pilotes.

Le but n'est pas de tester "comme un developpeur", mais de verifier que la plateforme est claire, utile et fiable dans une journee de travail reelle.

## Regles Simples

- Tester avec son vrai role : manager, secretaire ou client.
- Ne jamais tester avec une vraie carte bancaire tant que Stripe est en mode test.
- Faire une capture ecran des anomalies.
- Noter l'URL exacte de la page.
- Noter l'action realisee juste avant le probleme.
- Signaler immediatement tout probleme de confidentialite : client d'un autre centre visible, document d'un autre client, facture inaccessible ou mauvais centre.

## Priorites

| Priorite | Quand l'utiliser |
| --- | --- |
| `P0` | Bloque le travail ou cree un risque : fuite de donnees, paiement impossible, document vide, erreur 403 sur document autorise |
| `P1` | Important mais contournable : bouton peu visible, filtre confus, action lente, affichage mobile gene |
| `P2` | Confort : texte a reformuler, alignement, couleur, wording, petite finition |

## Message A Envoyer Aux Testeurs

```text
Bonjour,

Nous lancons une phase de test terrain de la plateforme CCS DOM.

Merci de tester uniquement avec votre role habituel :
- manager : clients, validation, factures, courriers, notifications ;
- secretaire : scan courrier, mails, relances, selection client ;
- client : portail, courriers, documents, factures, abonnement.

Pour chaque probleme, merci d'envoyer :
1. une capture ecran ;
2. l'URL de la page ;
3. ce que vous avez fait ;
4. ce que vous attendiez ;
5. ce qui s'est passe.

Important : n'utilisez pas de vraie carte bancaire. Stripe reste en test.

Merci de tester comme dans une vraie journee de travail.
```

## Parcours Manager Orly / Paris

Tester dans cet ordre :

- Connexion au compte manager.
- Verification du centre affiche.
- Page clients : liste, recherche, creation client, ouverture dossier.
- Onglet demandes : ouvrir, approuver, rejeter si pertinent.
- Validation : ouvrir dossier, verifier documents, generer contrat, generer attestation.
- Facturation : voir factures, telecharger PDF, regenerer.
- Mails : voir courriers du centre uniquement.
- Notifications : verifier que seules les notifications du centre apparaissent.
- Activites : verifier que seules les activites du centre apparaissent.
- Mobile : verifier que les boutons importants restent visibles.

Points critiques :

- Manager Orly ne doit jamais voir les clients Paris.
- Manager Paris ne doit jamais voir les clients Orly.
- Les PDF doivent etre remplis et telechargeables.
- Aucun bouton critique ne doit rester sans effet.

## Parcours Secretaire

Tester dans cet ordre :

- Connexion au compte secretaire.
- Verification du menu : pas d'acces inutile a la gouvernance SaaS.
- Page scan : selection client, upload courrier, envoi.
- Tester un client autorise au scan.
- Tester un client Classic si present : le comportement doit etre clair.
- Page mails : courrier visible apres scan.
- Relances : filtre, creation ou suivi d'une relance.
- Mobile / tablette : scanner et traiter un courrier sans gene.

Points critiques :

- La liste client doit correspondre au centre de la secretaire.
- Les clients non eligibles au scan ne doivent pas creer de confusion.
- Les notifications doivent respecter le forfait client.

## Parcours Client

Tester dans cet ordre :

- Connexion au portail client.
- Tableau de bord : comprehension generale.
- Courriers : ouvrir un courrier, telecharger le fichier.
- Documents : ouvrir contrat, attestation et pieces upload.
- Factures : ouvrir et telecharger une facture.
- Abonnement : verifier le forfait.
- Support : poser une question simple.
- Mobile : verifier que tout reste lisible.

Points critiques :

- Le client ne doit voir que ses propres donnees.
- Les documents autorises doivent s'ouvrir sans erreur.
- Les textes doivent etre comprehensibles sans assistance.

## Parcours Inscription Publique

Tester si demande par l'equipe projet :

- Ouvrir le site public.
- Lancer une inscription creation.
- Choisir un centre.
- Remplir les informations.
- Aller jusqu'au paiement Stripe avec carte test.
- Refaire le parcours en transfert.

Points critiques :

- Le centre choisi doit etre conserve.
- Le paiement doit etre rattache au bon dossier.
- La demande doit arriver chez le bon manager.

## Modele De Retour Incident

```text
Priorite : P0 / P1 / P2
Role :
Centre :
Page / URL :
Action faite :
Resultat attendu :
Resultat obtenu :
Capture :
Commentaire :
```

## Exemples De Bons Retours

```text
Priorite : P0
Role : manager Paris
Centre : Paris 12e
Page / URL : https://ccsdom.fr/admin/notifications
Action faite : ouvrir les notifications
Resultat attendu : voir uniquement Paris
Resultat obtenu : une notification Orly apparait
Capture : jointe
Commentaire : fuite inter-centres a verifier
```

```text
Priorite : P1
Role : secretaire Orly
Centre : Orly
Page / URL : https://ccsdom.fr/admin/scan
Action faite : ouvrir la selection client sur mobile
Resultat attendu : choisir facilement un client
Resultat obtenu : la liste est lisible mais trop basse sur ecran iPhone
Capture : jointe
Commentaire : utilisable mais a ameliorer
```
