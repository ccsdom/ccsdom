# Checklist De Durcissement Production

Cette checklist sert a distinguer clairement ce qui est pret pour la production de ce qui reste volontairement en mode test.

## Etat Actuel

- Domaine applicatif canonique : `https://ccsdom.fr`.
- Domaine email Firebase Auth valide : `noreply@ccsdom.fr`.
- Page d'action Auth personnalisee : `https://ccsdom.fr/auth/action`.
- Secret local `serviceAccountKey.json` ignore et retire du suivi Git.
- QA critique disponible : `npm run qa:critical`.
- QA production disponible : `npm run qa:production`.

## Blocage Production Reel

### Stripe

Le projet utilise encore une cle publique Stripe de test dans `apphosting.yaml`.

Avant encaissement reel :

1. Creer ou verifier les produits/prix Stripe en mode live.
2. Remplacer `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` par une cle `pk_live_...`.
3. Mettre a jour le secret Firebase `STRIPE_SECRET_KEY` avec une cle `sk_live_...`.
4. Mettre a jour le secret Firebase `STRIPE_WEBHOOK_SECRET` avec le webhook live.
5. Verifier que les IDs `price_...` du catalogue correspondent au mode live.
6. Lancer `npm run qa:production`.
7. Tester un paiement live avec un petit montant ou un produit de recette dedie.

## Points A Durcir Ensuite

### Firebase App Check

- Ajouter `NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY` dans `apphosting.yaml`.
- Verifier que la cle reCAPTCHA autorise `ccsdom.fr`.
- Tester en production sans enforcement strict.
- Activer l'enforcement progressivement sur Firestore, Storage et Functions sensibles.

### Capacite App Hosting

`maxInstances: 1` limite les couts, mais peut devenir fragile.

Recommandation avant lancement commercial :

- passer a `maxInstances: 3` minimum ;
- surveiller les couts et les cold starts ;
- ajuster selon trafic reel.

### Firebase Auth

- Verifier dans Firebase Console que tous les templates Auth utilisent `https://ccsdom.fr/auth/action`.
- Garder MFA preparee, puis l'imposer d'abord au super admin.

## Regle De Decision

Tant que `npm run qa:production` echoue sur Stripe, l'application peut etre utilisee en test ou pre-production, mais ne doit pas etre consideree comme prete pour encaissement reel.
