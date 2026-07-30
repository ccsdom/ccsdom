import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const rootDir = process.cwd();
const outputDir = path.join(rootDir, "outputs", "beta");
const outputPdf = path.join(outputDir, "kit-beta-testeurs-ccsdom.pdf");
const logoPath = path.join(
  rootDir,
  "public",
  "images",
  "ccsdom-google-workspace-logo.png"
);

fs.mkdirSync(outputDir, { recursive: true });

const logoData = fs.existsSync(logoPath)
  ? `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`
  : "";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function list(items) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

const html = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Kit beta testeurs CCS DOM</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      color: #102033;
      background: #ffffff;
      font-family: "Segoe UI", "Aptos", Arial, sans-serif;
      font-size: 10.2pt;
      line-height: 1.45;
    }

    .cover {
      min-height: 246mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 12mm 4mm 4mm;
      page-break-after: always;
      position: relative;
      overflow: hidden;
    }

    .cover::before {
      content: "";
      position: absolute;
      inset: -40mm -30mm auto auto;
      width: 130mm;
      height: 130mm;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(37, 99, 235, 0.18), rgba(37, 99, 235, 0));
      z-index: -1;
    }

    .cover::after {
      content: "";
      position: absolute;
      left: -32mm;
      bottom: 10mm;
      width: 120mm;
      height: 120mm;
      border-radius: 34mm;
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.08), rgba(37, 99, 235, 0.04));
      transform: rotate(-12deg);
      z-index: -1;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #0f172a;
      font-weight: 800;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      font-size: 11pt;
    }

    .brand img {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      object-fit: contain;
      box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
    }

    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      width: fit-content;
      margin-top: 34mm;
      padding: 6px 12px;
      border: 1px solid #bfdbfe;
      border-radius: 999px;
      color: #1d4ed8;
      background: #eff6ff;
      font-size: 9pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    h1 {
      max-width: 150mm;
      margin: 10mm 0 0;
      color: #0f172a;
      font-size: 34pt;
      line-height: 1.02;
      letter-spacing: -0.055em;
    }

    .lead {
      max-width: 138mm;
      margin-top: 7mm;
      color: #475569;
      font-size: 13pt;
      line-height: 1.55;
    }

    .cover-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 4mm;
      margin-top: 18mm;
    }

    .cover-card {
      min-height: 34mm;
      padding: 5mm;
      border: 1px solid #dbeafe;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.86);
      box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
    }

    .cover-card strong {
      display: block;
      color: #1d4ed8;
      font-size: 10pt;
      margin-bottom: 2mm;
    }

    .cover-card span {
      color: #475569;
      font-size: 9.2pt;
    }

    .footer-line {
      display: flex;
      justify-content: space-between;
      gap: 8mm;
      color: #64748b;
      font-size: 9pt;
      border-top: 1px solid #e2e8f0;
      padding-top: 5mm;
    }

    main {
      counter-reset: section;
    }

    section {
      page-break-inside: avoid;
      margin-bottom: 8mm;
    }

    h2 {
      margin: 0 0 4mm;
      color: #0f172a;
      font-size: 16pt;
      line-height: 1.15;
      letter-spacing: -0.025em;
      counter-increment: section;
    }

    h2::before {
      content: counter(section, decimal-leading-zero);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 25px;
      height: 25px;
      margin-right: 8px;
      border-radius: 9px;
      color: #ffffff;
      background: #2563eb;
      font-size: 8pt;
      font-weight: 800;
      vertical-align: 2px;
    }

    h3 {
      margin: 5mm 0 2mm;
      color: #1e293b;
      font-size: 12pt;
    }

    p {
      margin: 0 0 3mm;
      color: #475569;
    }

    ul {
      margin: 0 0 4mm;
      padding-left: 5mm;
    }

    li {
      margin: 1.4mm 0;
      color: #334155;
    }

    .note {
      padding: 4mm 5mm;
      border: 1px solid #bfdbfe;
      border-radius: 14px;
      background: #eff6ff;
      color: #1e3a8a;
      font-weight: 600;
    }

    .warning {
      padding: 4mm 5mm;
      border: 1px solid #fed7aa;
      border-radius: 14px;
      background: #fff7ed;
      color: #9a3412;
      font-weight: 650;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 3mm 0 6mm;
      page-break-inside: avoid;
      font-size: 9.2pt;
    }

    th {
      color: #0f172a;
      background: #f8fafc;
      text-align: left;
      font-weight: 800;
    }

    th,
    td {
      border: 1px solid #e2e8f0;
      padding: 3mm;
      vertical-align: top;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 999px;
      color: #1d4ed8;
      background: #dbeafe;
      font-weight: 800;
      font-size: 8.5pt;
    }

    .message {
      white-space: pre-wrap;
      padding: 5mm;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      color: #334155;
      background: #f8fafc;
      font-family: "Segoe UI", "Aptos", Arial, sans-serif;
      font-size: 9.5pt;
    }

    .incident-box {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2.5mm 5mm;
      padding: 5mm;
      border: 1px solid #dbeafe;
      border-radius: 16px;
      background: #fbfdff;
    }

    .incident-field {
      border-bottom: 1px dashed #cbd5e1;
      min-height: 9mm;
      color: #64748b;
      font-weight: 700;
    }

    .incident-field.full {
      grid-column: 1 / -1;
      min-height: 13mm;
    }

    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>
  <div class="cover">
    <div>
      <div class="brand">
        ${logoData ? `<img src="${logoData}" alt="CCS DOM" />` : ""}
        <span>CCS DOM</span>
      </div>
      <div class="eyebrow">Recette beta terrain</div>
      <h1>Kit testeurs pour valider la plateforme CCS DOM</h1>
      <p class="lead">
        Un guide court pour tester le SaaS dans des conditions proches du reel :
        managers, secretaire, clients pilotes et parcours d'inscription publique.
      </p>
      <div class="cover-grid">
        <div class="cover-card">
          <strong>Objectif</strong>
          <span>Identifier les vrais blocages metier avant ouverture plus large.</span>
        </div>
        <div class="cover-card">
          <strong>Priorite</strong>
          <span>P0 pour tout risque de paiement, document, droit ou fuite de centre.</span>
        </div>
        <div class="cover-card">
          <strong>Methode</strong>
          <span>Capture, URL, action realisee, resultat attendu et resultat obtenu.</span>
        </div>
      </div>
    </div>
    <div class="footer-line">
      <span>Document de travail - Phase beta CCS DOM</span>
      <span>Version du 23 mai 2026</span>
    </div>
  </div>

  <main>
    <section>
      <h2>Regles simples</h2>
      ${list([
        "Tester avec son vrai role : manager, secretaire ou client.",
        "Ne jamais utiliser de vraie carte bancaire tant que Stripe est en mode test.",
        "Faire une capture ecran pour chaque anomalie.",
        "Noter l'URL exacte de la page concernee.",
        "Noter l'action realisee juste avant le probleme.",
        "Signaler immediatement toute fuite de donnees : autre centre, autre client, mauvais document ou mauvaise facture.",
      ])}
      <p class="warning">
        Si Stripe reste bloque sur un ecran gris, verifier d'abord l'antivirus, les extensions navigateur
        et les bloqueurs de scripts. Kaspersky peut bloquer Stripe Checkout.
      </p>
    </section>

    <section>
      <h2>Priorites de retour</h2>
      <table>
        <thead>
          <tr>
            <th>Priorite</th>
            <th>Quand l'utiliser</th>
            <th>Exemples</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="pill">P0</span></td>
            <td>Blocage produit ou risque de confidentialite.</td>
            <td>Paiement impossible, fuite Orly / Paris, document vide, erreur 403 sur document autorise.</td>
          </tr>
          <tr>
            <td><span class="pill">P1</span></td>
            <td>Important mais contournable.</td>
            <td>Bouton peu visible, filtre confus, affichage mobile qui gene le travail.</td>
          </tr>
          <tr>
            <td><span class="pill">P2</span></td>
            <td>Confort ou finition.</td>
            <td>Texte a reformuler, alignement, couleur, espacement.</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2>Message a envoyer aux testeurs</h2>
      <div class="message">Bonjour,

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

Merci de tester comme dans une vraie journee de travail.</div>
    </section>

    <section class="page-break">
      <h2>Parcours manager Orly / Paris</h2>
      ${list([
        "Connexion au compte manager.",
        "Verifier que le centre affiche est correct.",
        "Page Clients : liste, recherche, creation client, ouverture dossier.",
        "Onglet Demandes : ouvrir, approuver, rejeter si pertinent.",
        "Validation : ouvrir dossier, verifier documents, generer contrat et attestation.",
        "Facturation : voir les factures, telecharger un PDF, regenerer une facture.",
        "Mails : verifier que seuls les courriers du centre apparaissent.",
        "Notifications et activites : verifier l'isolation du centre.",
        "Mobile : verifier que les boutons importants restent visibles.",
      ])}
      <p class="note">
        Point critique : manager Orly ne doit jamais voir Paris, et manager Paris ne doit jamais voir Orly.
      </p>
    </section>

    <section>
      <h2>Parcours secretaire</h2>
      ${list([
        "Connexion au compte secretaire.",
        "Verifier que le menu n'expose pas la gouvernance SaaS.",
        "Page Scan : selection client, upload courrier, envoi.",
        "Tester un client autorise au scan.",
        "Tester un client Classic si present : le comportement doit etre clair.",
        "Page Mails : verifier que le courrier apparait apres scan.",
        "Relances : filtrer, creer ou traiter une relance.",
        "Mobile / tablette : traiter un courrier sans gene majeure.",
      ])}
      <p class="note">
        Point critique : la liste client doit correspondre au centre de la secretaire.
      </p>
    </section>

    <section>
      <h2>Parcours client</h2>
      ${list([
        "Connexion au portail client.",
        "Tableau de bord : comprehension generale.",
        "Courriers : ouvrir un courrier et telecharger le fichier.",
        "Documents : ouvrir contrat, attestation et pieces upload.",
        "Factures : ouvrir et telecharger une facture PDF.",
        "Abonnement : verifier le forfait courant.",
        "Support : poser une question simple.",
        "Mobile : verifier que les pages restent lisibles.",
      ])}
      <p class="note">
        Point critique : le client ne doit voir que ses propres donnees.
      </p>
    </section>

    <section class="page-break">
      <h2>Parcours inscription publique</h2>
      ${list([
        "Ouvrir le site public.",
        "Lancer une inscription creation.",
        "Choisir un centre.",
        "Remplir les informations representant, societe, pieces et signature.",
        "Aller jusqu'au paiement Stripe avec une carte test.",
        "Verifier le retour sur CCS DOM.",
        "Refaire le parcours en transfert.",
      ])}
      <p class="note">
        Point critique : le centre choisi doit etre conserve et la demande doit arriver chez le bon manager.
      </p>
    </section>

    <section>
      <h2>Fiche de retour incident</h2>
      <div class="incident-box">
        <div class="incident-field">Priorite : P0 / P1 / P2</div>
        <div class="incident-field">Role :</div>
        <div class="incident-field">Centre :</div>
        <div class="incident-field">URL :</div>
        <div class="incident-field full">Action faite :</div>
        <div class="incident-field full">Resultat attendu :</div>
        <div class="incident-field full">Resultat obtenu :</div>
        <div class="incident-field full">Capture / preuve :</div>
        <div class="incident-field full">Commentaire :</div>
      </div>
    </section>

    <section>
      <h2>Exemples de bons retours</h2>
      <h3>Exemple P0</h3>
      <p>
        Role : manager Paris. Page : notifications. Action : ouvrir les notifications.
        Resultat attendu : voir uniquement Paris. Resultat obtenu : une notification Orly apparait.
        Priorite : P0, car suspicion de fuite inter-centres.
      </p>
      <h3>Exemple P1</h3>
      <p>
        Role : secretaire Orly. Page : scan mobile. Action : ouvrir la selection client.
        Resultat attendu : choisir facilement un client. Resultat obtenu : liste lisible mais trop basse sur iPhone.
        Priorite : P1, car utilisable mais a ameliorer.
      </p>
    </section>
  </main>
</body>
</html>`;

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.pdf({
    path: outputPdf,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: `<div></div>`,
    footerTemplate: `
      <div style="width: 100%; padding: 0 16mm; color: #94a3b8; font-family: Segoe UI, Arial, sans-serif; font-size: 8px; display: flex; justify-content: space-between;">
        <span>CCS DOM - Kit beta testeurs</span>
        <span>Page <span class="pageNumber"></span>/<span class="totalPages"></span></span>
      </div>
    `,
    margin: {
      top: "18mm",
      right: "16mm",
      bottom: "16mm",
      left: "16mm",
    },
  });
} finally {
  await browser.close();
}

console.log(outputPdf);
