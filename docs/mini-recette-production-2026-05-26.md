# Mini-recette Production - 26 mai 2026

## Objectif

Valider les corrections deployees autour de la boite courrier client et du menu de simulation super admin.

## Controle Technique Effectue

| Controle | Resultat |
| --- | --- |
| `https://ccsdom.fr/login` | HTTP 200 |
| `https://ccsdom.fr/admin` | HTTP 200 |
| `https://ccsdom.fr/dashboard/mail` | HTTP 200 |
| `npm run qa:critical` | 26 controles OK |

## Tests Client - Courrier

Compte : client beta avec au moins un courrier visible.

| Test | Resultat attendu | Statut |
| --- | --- | --- |
| Ouvrir `/dashboard/mail` | La liste des courriers s'affiche | A tester |
| Selectionner un courrier `Nouveau` | Il passe visuellement en `Lu` | A tester |
| Action groupée `Marquer non lu` | Le badge devient `Nouveau` | A tester |
| Action groupée `Marquer comme urgent` | Le badge devient `Urgent` et se colore en ambre | A tester |
| Action groupée `Archiver` | Le courrier quitte la vue `Non archives` | A tester |
| Filtrer sur `Archive` | Le courrier archive est visible | A tester |
| Telecharger le document | Le fichier s'ouvre ou se telecharge | A tester |

## Tests Super Admin - Changer de Vue

Compte : super admin.

| Test | Resultat attendu | Statut |
| --- | --- | --- |
| Ouvrir `/admin` | La sidebar s'affiche sans debordement | A tester |
| Ouvrir `Changer de vue` | Le menu est compact, lisible, sans depasser | A tester |
| Choisir `Paris` | L'interface passe en simulation Paris | A tester |
| Choisir `Orly` | L'interface passe en simulation Orly | A tester |
| Revenir `Super admin` | La simulation se desactive | A tester |

## Tests Manager / Secretaire

Comptes : manager Orly, secretaire Orly, manager Paris.

| Test | Resultat attendu | Statut |
| --- | --- | --- |
| Ouvrir `/admin` | Navigation stable, pas de menu super admin inutile | A tester |
| Ouvrir `/admin/mails` | Les courriers du centre uniquement sont visibles | A tester |
| Ouvrir `/admin/scan` | La liste client du centre se charge | A tester |
| Ouvrir `/admin/clients` | Les clients du centre uniquement sont visibles | A tester |

## Decision

Si tous les tests ci-dessus sont valides :

- cloturer le lot `courrier client + changer de vue` ;
- lancer la beta terrain avec suivi dans `docs/beta-feedback-tracker.csv` ;
- traiter ensuite uniquement les retours P0/P1 avant les finitions.

