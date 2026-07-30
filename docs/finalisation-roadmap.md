# Feuille de Route De Finalisation

## Vision

Faire de `CCS DOM` une plateforme de référence pour :
- la domiciliation commerciale multi-centres
- l'exploitation quotidienne des centres
- le suivi client
- la génération documentaire
- l'accompagnement aux formalités de création et de transfert

## État D'Avancement Par Rôle

### Super Admin SaaS

Déjà en place :
- gestion des centres
- vue consolidée réseau
- carte des implantations
- facturation agrégée centres
- activité consolidée

À finaliser :
- abonnement centre complet
- quotas centre pilotables
- suspension/réactivation centre
- impersonation sécurisée
- reporting MRR, ARR, churn, activation

### Gestionnaire De Centre

Déjà en place :
- gestion clients
- validation des dossiers
- scan courrier
- gestion des mails
- facturation client
- outils de génération documentaire

À finaliser :
- files de travail plus explicites
- alertes opérationnelles
- dashboard d'exploitation par centre
- workflows d'anomalies et de relance

### Secrétaire

Déjà en place :
- rôle existant
- accès ciblé à certaines opérations

À finaliser :
- poste de travail dédié
- file des scans à traiter
- file des pièces à contrôler
- relances et tâches assignées

### Client

Déjà en place :
- tableau de bord
- courrier
- documents
- factures
- abonnement
- paramètres

À finaliser :
- timeline de dossier
- checklist dynamique
- meilleure lisibilité des actions en attente
- assistance contextualisée

## Chantiers Prioritaires

### Lot 1 - Stabilisation Et Industrialisation

Objectif :
sécuriser la maintenabilité et la qualité de delivery.

Travaux :
- fiabiliser les commandes de qualité
- documenter le produit et l'exploitation
- introduire des tests critiques
- préparer la migration `Node 22`
- clarifier les environnements `test / production`

Critères de sortie :
- `typecheck`, build front et build functions autonomes
- documentation d'installation et d'exploitation à jour
- premiers tests critiques exécutables

### Lot 2 - Gouvernance SaaS

Objectif :
faire du `super_admin` un vrai cockpit réseau.

Travaux :
- fiche centre complète
- abonnement centre
- quotas et limites
- santé centre
- prise en main contrôlée pour audit

Critères de sortie :
- un nouveau centre peut être créé, configuré, facturé et supervisé sans intervention code

### Lot 3 - Excellence Opérationnelle Centre

Objectif :
rendre le rôle `manager` fluide, rapide et fiable.

Travaux :
- priorisation des files
- actions rapides
- anomalies visibles
- rapports d'activité utiles
- meilleure ergonomie des validations

Critères de sortie :
- un gestionnaire suit un dossier de bout en bout sans friction ni ambiguïté

### Lot 4 - Poste De Travail Secrétariat

Objectif :
transformer le rôle `secretary` en rôle métier productif.

Travaux :
- scans entrants
- pièces à vérifier
- notifications de relance
- journal de traitement

Critères de sortie :
- une secrétaire peut traiter son flux quotidien sans dépendre du manager

### Lot 5 - Liasse Formalités Premium

Objectif :
faire du module formalités un différenciateur fort.

Travaux :
- enrichir les données de préremplissage
- mieux gérer les variantes par forme sociale
- mieux gérer les cas `création` / `transfert`
- professionnaliser les PDF
- contrôle de cohérence avant export

Critères de sortie :
- liasse quasi complète, lisible, cohérente, et directement exploitable par le formaliste

## Risques À Surveiller

- dette documentaire encore élevée
- absence de CI
- absence de tests métier propriétaires
- dépendance à des templates PDF externes
- migration future `Node 20 -> Node 22`
- séparation encore perfectible entre données métier, opérationnelles et financières

## Ordre D'Exécution Recommandé

1. Stabilisation et outillage
2. Gouvernance SaaS super admin
3. Exploitation manager
4. Poste de travail secrétaire
5. Liasse formalités premium
6. Finitions client et support

## Prochaine Étape Recommandée

Le prochain lot à lancer est :

`Lot 1 - Stabilisation Et Industrialisation`

Sous-lot immédiat :
- tests critiques
- documentation exploitation
- migration technique préparatoire
- conventions de delivery
