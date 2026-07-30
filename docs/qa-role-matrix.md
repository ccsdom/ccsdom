# Matrice QA Par Role

## Objectif

Cette matrice sert a valider les parcours critiques avant tout lot sensible ou mise en production importante.

Les scenarios `P0` sont bloquants.
Les scenarios `P1` sont fortement recommandes.

Pour une recette SaaS V1 complete et executable, utiliser le protocole detaille :

- `docs/recette-saas-v1.md`

Pour organiser une beta avec des testeurs metier non techniques, utiliser le protocole terrain :

- `docs/recette-beta-client.md`

## Pre-requis de recette

- environnement de test connu
- comptes de test disponibles pour chaque role
- au moins un centre `Paris 12e`
- au moins un centre `Orly`
- au moins un client actif par centre
- au moins un dossier `creation` et un dossier `transfert`
- au moins une facture PDF disponible

## Super Admin

### P0

- Se connecter en `super_admin`
  - Resultat attendu : acces au cockpit SaaS sans exposition des outils clients quotidiens
- Ouvrir `Centres`
  - Resultat attendu : la liste des centres s'affiche avec carte et donnees principales
- Creer un centre
  - Resultat attendu : le centre est enregistre sans casser les centres historiques
- Ouvrir `Facturation centres`
  - Resultat attendu : vue agregee reseau, sans factures client detaillees
- Consulter `Activite`
  - Resultat attendu : les evenements reseau sont visibles et filtrables

### P1

- Changer de vue via le switcher de role
  - Resultat attendu : simulation manager sans fuite de droits reelle
- Verifier la carte reseau
  - Resultat attendu : zoom exploitable sur la region parisienne et reperes visibles

## Manager De Centre

### P0

- Se connecter en `manager_orly`
  - Resultat attendu : uniquement les donnees Orly sont visibles
- Ouvrir `Clients`
  - Resultat attendu : aucun client d'un autre centre n'apparait
- Ouvrir `Validation`
  - Resultat attendu : seules les demandes du centre courant apparaissent
- Ouvrir un dossier et cliquer sur `Regenerer`
  - Resultat attendu : contrat et attestation se regenerent sans erreur `403`
- Ouvrir `Facturation`
  - Resultat attendu : telechargement et regeneration facture fonctionnent
- Ouvrir `Outils`
  - Resultat attendu : seuls les clients accompagnes du centre courant sont visibles

### P1

- Ouvrir `Adresses`
  - Resultat attendu : le centre courant est coherent et le gestionnaire associe est juste
- Scanner un courrier
  - Resultat attendu : le client selectionne recoit bien un document rattachable
- Consulter `Activite`
  - Resultat attendu : les logs centre sont lisibles et utiles

## Secretaire

### P0

- Se connecter en `secretary_orly`
  - Resultat attendu : pas d'acces a la gouvernance SaaS
- Ouvrir `Clients`
  - Resultat attendu : liste limitee au centre rattache
- Ouvrir `Scanner courrier`
  - Resultat attendu : import document possible pour les clients du centre

### P1

- Verifier qu'aucune page sensible `billing`, `validation`, `activity` n'est exposee
  - Resultat attendu : role limite et coherent

## Client

### P0

- Se connecter avec un client actif
  - Resultat attendu : acces au portail client
- Ouvrir `Courrier`
  - Resultat attendu : liste, apercu et telechargement fonctionnent
- Ouvrir `Documents`
  - Resultat attendu : contrat, attestation et autres pieces sont visibles selon le dossier
- Ouvrir `Abonnement`
  - Resultat attendu : plan courant, factures et telechargement PDF fonctionnent
- Ouvrir `Parametres`
  - Resultat attendu : profil, mot de passe, pieces et PDFs disponibles

### P1

- Modifier le profil
  - Resultat attendu : sauvegarde sans erreur
- Uploader une piece justificative
  - Resultat attendu : fichier accepte et rattache au client

## Formalites Creation / Transfert

### P0

- Ouvrir `Outils` cote manager
  - Resultat attendu : le module charge et propose les clients accompagnes du centre
- Generer une liasse `creation`
  - Resultat attendu : documents critiques presents
  - Controle minimal : statuts, decision constitutive, mandat, attestation, beneficiaires effectifs, memo depot
- Generer une liasse `transfert`
  - Resultat attendu : documents critiques presents
  - Controle minimal : decision de transfert, statuts mis a jour, certification conforme, liste des sieges, mandat, attestation

### P1

- Verifier le pre-remplissage
  - Resultat attendu : denomination, representant, adresse, forme et date sont coherents

## Isolation Multi-centres

### P0

- `manager_orly` ne voit pas les clients `Paris`
- `manager_paris` ne voit pas les clients `Orly`
- `super_admin` voit les centres mais ne traite pas les operations client quotidiennes
- `client` ne voit jamais les donnees d'un autre client

## Facturation

### P0

- Une facture client deja generee reste telechargeable
- Une regeneration de facture ne casse pas le lien public
- Un manager ne peut pas lire la facture d'un autre centre
- Le super admin voit la facturation des centres, pas les operations detaillees client comme poste de travail courant

## Sortie De Recette

Un lot est considere comme validable si :
- tous les scenarios `P0` sont conformes
- aucun incident `403`, fuite de centre ou PDF vide n'est observe
- le build front et le build functions passent
- `npm run qa:critical` passe
