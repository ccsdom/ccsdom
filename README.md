# CCS DOM

Plateforme SaaS de domiciliation commerciale et de gestion documentaire multi-centres.

Le produit couvre aujourd'hui quatre grands périmètres :
- gouvernance SaaS et pilotage réseau pour le `super_admin`
- exploitation centre pour les `manager` et `secretary`
- portail client pour les sociétés domiciliées
- génération documentaire et formalités `création / transfert`

## Rôles métier

- `super_admin` : pilotage du réseau, centres, quotas, abonnements centres, activité consolidée
- `manager`, `manager_paris`, `manager_orly` : gestion opérationnelle des centres, clients, validation, courrier, facturation, outils
- `secretary_paris`, `secretary_orly` : opérations ciblées de support centre
- `client` : portail courrier, documents, facturation, abonnement, paramètres

## Stack

- `Next.js 14` avec App Router
- `Firebase App Hosting`
- `Firestore`, `Storage`, `Authentication`, `Cloud Functions`
- `Stripe` pour la facturation
- `Genkit` et `Document AI` pour certains traitements documentaires

## Modules principaux

- `src/app/admin` : cockpit d'administration SaaS et centre
- `src/app/dashboard` : portail client
- `functions/src` : callables, triggers, facturation, PDF, provisioning, formalités
- `src/lib/access-control.ts` : contrôle d'accès multi-centres
- `functions/src/generateDocumentsFromData.ts` : moteur de liasse formalités
- `functions/src/pdfJobs.ts` : orchestration contrat, attestation, facture

## Commandes utiles

```bash
npm run dev
npm run build
npm run typecheck
npm run qa:critical
npm run qa:release
npm --prefix functions run build
```

Déploiements usuels :

```bash
npx -y firebase-tools@latest deploy --project bizhome-hub --only apphosting
npx -y firebase-tools@latest deploy --project bizhome-hub --only functions
npx -y firebase-tools@latest deploy --project bizhome-hub --only firestore:rules
npx -y firebase-tools@latest deploy --project bizhome-hub --only storage:rules
```

## État actuel

Les briques suivantes sont déjà en place :
- gestion multi-centres avec séparation des accès
- génération et régénération de `contrat`, `attestation` et `facture`
- portail client exploitable
- cockpit manager structuré
- gouvernance SaaS de base côté super admin
- réconciliation des données `client_requests` / `clients`
- liasse formalités orientée `création / transfert`

Les priorités de finalisation sont documentées dans `docs/finalisation-roadmap.md`.

La recette SaaS V1 à exécuter avant test élargi est documentée dans `docs/recette-saas-v1.md`.
