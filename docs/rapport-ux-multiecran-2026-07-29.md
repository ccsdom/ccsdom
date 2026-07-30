# Rapport UX multi-ecrans - CCS DOM

Date : 29 juillet 2026

## Synthese executive

L'application CCS DOM a deja une base UX solide : separation claire des roles, navigation mobile dediee, tableaux remplaces par des cartes sur mobile, modales globalement scrollables et interfaces recentes plus sobres qu'au debut du projet.

Le produit est utilisable en beta, mais il doit encore gagner en coherence visuelle et en confort mobile/tablette avant une recette client intensive. Les points les plus importants ne sont pas des refontes lourdes : il s'agit surtout de densite, hierarchie visuelle, libelles metier, modales longues, filtres et feedback d'action.

Priorite recommandee : consolider les interfaces de production manager/secretaire, car ce sont elles qui porteront l'usage quotidien : clients, validation, scan, mails, facturation.

## Points forts actuels

- La structure responsive est bien posee : sidebar desktop/tablette, menu mobile, barre de navigation basse sur telephone.
- Les pages critiques ont deja des variantes mobiles : clients, validation, mails, facturation et scan ne reposent plus uniquement sur de grandes tables.
- Les fonds clairs et cartes blanches ameliorent nettement la lisibilite par rapport aux anciens panneaux sombres/transparents.
- Les modales importantes utilisent souvent des limites de hauteur et du scroll interne, ce qui evite les debordements majeurs sur telephone.
- Le cloisonnement par centre est integre dans l'UX : les managers et secretaires voient leur perimetre, ce qui reduit les erreurs operationnelles.
- Les workflows principaux sont de plus en plus explicites : invitation portail, regeneration PDF, activation/suspension, scan courrier, relances.

## Risques UX transverses

### 1. Densite mobile encore elevee

Certaines pages affichent beaucoup d'informations tres vite : KPI, filtres, listes, statuts, details, boutons. Sur ordinateur c'est acceptable, mais sur iPhone ou tablette portrait cela peut donner une impression de cockpit charge.

Recommandation : sur mobile, afficher d'abord l'action principale, puis mettre les filtres avances dans un bouton "Filtrer". Les KPI doivent rester compacts et ne pas repousser le travail principal trop bas.

### 2. Tablette a traiter comme un vrai format

L'application gere bien mobile et desktop, mais la tablette est le format le plus sensible pour les managers/secretaire : ni vraiment mobile, ni vraiment desktop. Certaines tables apparaissent des `md`, ce qui peut etre trop tot sur iPad portrait.

Recommandation : conserver les cartes jusqu'au breakpoint `lg` sur les pages operationnelles, puis n'afficher les tables completes qu'en desktop large.

### 3. Modales longues

La creation client, la creation centre et certains dialogues d'action contiennent beaucoup de champs. Meme si le scroll fonctionne, l'utilisateur peut perdre le contexte.

Recommandation : transformer les longues modales en sections compactes ou en mini-stepper : Identite, Societe, Domiciliation, Abonnement, Documents. Ajouter un footer sticky avec l'action principale.

### 4. Feedback d'action a renforcer

Plusieurs actions critiques produisent un toast, mais pas toujours un changement visuel immediat evident : archiver, marquer lu/non lu, urgent, invitation, regeneration, suspension.

Recommandation : chaque action doit avoir un etat visible dans la carte concernee : badge, couleur, libelle, date ou statut mis a jour.

### 5. Libelles metier a franciser et unifier

Quelques titres restent tres "produit" ou anglophones, par exemple "Scanning Hub". Cela peut etre moderne, mais pour des secretaires et managers de centre, le vocabulaire metier francais rassure davantage.

Recommandation : privilegier des libelles operationnels : "Scanner un courrier", "Boite courrier", "Dossiers a valider", "Facturation centre", "Clients du centre".

### 6. Accessibilite et lisibilite

Les composants de base sont bons, mais certains textes tres petits (`text-[9px]`, `text-[10px]`) peuvent etre difficiles a lire sur mobile. Des avertissements DialogDescription ont deja ete vus en console.

Recommandation : viser 12 px minimum pour les metadonnees lisibles, verifier tous les Dialog avec titre + description, et conserver des cibles tactiles proches de 44 px.

## Analyse par zone

### Shell admin

Le shell est coherent : sidebar desktop, menu mobile, bottom nav telephone. C'est une bonne base SaaS.

Sur telephone, la barre basse fonctionne bien, mais cinq items pour manager/secretaire reste dense. Elle doit rester reservee aux actions quotidiennes : Tableau de bord, Scan, Mails, Clients, Plus. Si une page devient secondaire, elle devrait passer dans "Plus".

Sur tablette, la sidebar iconique peut fonctionner, mais il faut eviter que les pages affichent trop vite des tables larges. Le format tablette doit rester confortable avec des cartes.

### Page clients manager/secretaire

La page est devenue beaucoup plus professionnelle. Les cartes mobiles et la separation clients/demandes/imports sont positives.

Point a surveiller : la modale "Nouveau client" devient longue avec les nouvelles informations obligatoires. Elle doit rester claire, surtout pour un manager qui saisit depuis tablette.

Recommandation : passer cette modale en sections avec titres courts, garder le bouton de validation visible en bas, et rendre les champs importants tres explicites : adresse personnelle du representant, forme juridique, capital, forfait, periodicite.

### Page validation

La page liste `/admin/validation` est maintenant proche du bon niveau mobile : claire, sobre, cartes lisibles, bouton "Ouvrir" compact. C'est un bon standard a reproduire.

Amelioration recommandee : garder le mode carte jusqu'a `lg`, car une table des `md` peut etre trop serree sur tablette portrait. Le bouton principal doit rester court et toujours visible.

### Page scan

C'est une page centrale pour la production. L'architecture est bonne : selection client, upload, recent activity, alertes de forfait. La modale client est bien adaptee au mobile.

Ameliorations recommandees : renommer "Scanning Hub" en "Scanner un courrier", rendre le bouton de scan sticky sur mobile une fois le fichier choisi, et desactiver visuellement les clients Classic non eligibles au scan plutot que de les cacher totalement. Cela explique mieux la logique forfaitaire.

### Page mails admin

La page est puissante, mais c'est celle qui risque le plus de devenir dense. Elle doit devenir le poste de travail courrier.

Recommandation : structurer l'UX en quatre vues simples : Boite courrier, Urgences, Relances, Historique. Les filtres avances peuvent etre regroupes dans un panneau "Filtrer" sur mobile. Les badges IA doivent etre courts et visibles : Urgent, Resume IA, Action requise, Archive.

### Boite mail client

La direction "boite de reception" est la bonne. Il faut eviter que l'apercu occupe trop d'espace quand le document n'est pas une image.

Recommandation : sur mobile, liste d'abord puis detail en plein ecran. Sur desktop, master-detail type Gmail. Les actions doivent etre immediatement visibles : ouvrir document, marquer lu/non lu, archiver, signaler un probleme.

### Facturation

La page facturation est relativement bien structuree : KPI, filtres, cartes mobiles, table desktop. Le choix d'ouvrir les PDF dans un nouvel onglet est bon.

Point critique : eviter tout indicateur statique qui pourrait sembler reel, comme une progression mensuelle non calculee. Il faut aussi afficher partout HT/TTC sans ambiguite.

### Adresses et centres

La page reseau est importante pour le super admin. Elle doit rester tres lisible, car elle porte le futur multi-tenant.

Recommandation : sur mobile, afficher d'abord la liste des centres, puis la carte. Sur desktop, carte + liste fonctionnent bien. Pour la creation centre, l'autocomplete adresse est essentiel et doit rester stable.

### Parametres et profils

Les pages parametres doivent etre sobres et rassurantes. C'est souvent la zone ou l'utilisateur vient regler un probleme.

Recommandation : reduire les textes longs, classer par blocs : Profil, Centre, Notifications, Securite, Prefererences. Les options non encore fonctionnelles doivent etre masquees ou clairement marquees "bientot".

### Site public et tunnel d'inscription

Le site public a bien gagne en qualite : hero plus propre, pages locales SEO, CTA mieux orientes. Le tunnel d'inscription doit rester isole, c'est le bon choix, car l'utilisateur y est en mode conversion et ne doit pas etre distrait.

Recommandation : continuer a renforcer les pages locales et le maillage, mais sans alourdir le tunnel. Dans le tunnel, l'objectif est la clarte : etape, progression, donnees sauvegardees, paiement, confirmation.

## Priorites recommandees

### Priorite 1 - Avant beta terrain

- Auditer chaque page manager/secretaire sur iPhone 12, iPad portrait et desktop 1366 px.
- Garder les cartes mobiles jusqu'a `lg` sur les pages operationnelles.
- Transformer les filtres complexes en panneau mobile.
- Simplifier les titres metier et supprimer les anglicismes inutiles.
- Verifier tous les Dialog/AlertDialog : fond clair, description accessible, action principale visible.

### Priorite 2 - Pendant beta

- Observer les vrais usages sur scan, mails et validation.
- Ajouter des micro-etats visibles apres chaque action : lu, archive, urgent, invitation envoyee, document genere.
- Mesurer les pages lentes ou trop animees sur telephone.
- Corriger les libelles incompris par les managers et secretaires.

### Priorite 3 - Avant lancement commercial

- Harmoniser tout le design system : titres, KPI, badges, boutons, modales, empty states.
- Finaliser l'accessibilite : taille texte, contrastes, focus clavier, descriptions de dialogues.
- Ajouter une couche analytics produit : pages consultees, actions echouees, temps de traitement scan, invitations activees.
- Rediger une courte aide integree par role : manager, secretaire, client, super admin.

## Conclusion

L'UX est deja nettement au-dessus d'un prototype. Le produit donne l'impression d'un vrai SaaS metier, pas d'un simple back-office. Le chantier restant est une phase de raffinement professionnel : moins de bruit, plus de guidage, plus de coherence tablette/mobile.

La prochaine action la plus rentable est de lancer un "Sprint UX production mobile" sur trois pages : scan, mails admin, clients. Ce sont les trois ecrans qui feront gagner ou perdre du temps aux equipes terrain.
