// scripts/audit-storage-urls.mjs
import admin from "firebase-admin";
import fs from "fs";

/**
 * Logique de détection et catégorisation des chemins Storage.
 */
function categorizePath(val) {
  if (val === undefined || val === null || val === "") return "MISSING";
  if (typeof val !== "string") return "AMBIGUOUS";
  
  if (val.startsWith("https://firebasestorage.googleapis.com")) {
    return "ABSOLUTE_LEGACY";
  }
  
  if (val.includes("/") && !val.startsWith("http")) {
    return "RELATIVE_OK";
  }
  
  return "AMBIGUOUS";
}

function getStorageRelativePath(pathOrUrl) {
  if (!pathOrUrl || typeof pathOrUrl !== "string") return pathOrUrl;
  
  if (pathOrUrl.startsWith("http")) {
    try {
      const parts = pathOrUrl.split("/o/");
      if (parts.length > 1) {
        const pathWithQuery = parts[1];
        const path = pathWithQuery.split("?")[0];
        return decodeURIComponent(path);
      }
    } catch (e) {
      // Erreur de formatage URL
    }
  }
  
  return pathOrUrl;
}

// 1) Init Admin
const serviceAccountPath = "./serviceAccountKey.json";
let adminConfig = {
  projectId: "bizhome-hub"
};

try {
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    if (serviceAccount.private_key) {
      console.log("🔑 Authentification via serviceAccountKey.json");
      adminConfig.credential = admin.credential.cert(serviceAccount);
    } else {
      adminConfig.credential = admin.credential.applicationDefault();
    }
  } else {
    adminConfig.credential = admin.credential.applicationDefault();
  }
} catch (e) {
  adminConfig.credential = admin.credential.applicationDefault();
}

if (!admin.apps.length) {
  admin.initializeApp(adminConfig);
}

const db = admin.firestore();

async function auditCollection(collectionName, fieldsToCheck) {
  console.log(`\n--- Audit de la collection : ${collectionName} ---`);
  const col = db.collection(collectionName);
  const snapshot = await col.get();
  
  let totalDocs = 0;
  let affectedDocs = new Set();
  let stats = {
    RELATIVE_OK: 0,
    ABSOLUTE_LEGACY: 0,
    MISSING: 0,
    AMBIGUOUS: 0
  };
  let matches = [];

  for (const doc of snapshot.docs) {
    totalDocs++;
    const data = doc.data();
    
    for (const fieldPath of fieldsToCheck) {
      const parts = fieldPath.split('.');
      let val = data;
      for (const p of parts) {
        val = val?.[p];
      }

      const category = categorizePath(val);
      stats[category]++;

      if (category === "ABSOLUTE_LEGACY" || category === "AMBIGUOUS") {
        affectedDocs.add(doc.id);
        const proposedPath = category === "ABSOLUTE_LEGACY" ? getStorageRelativePath(val) : null;
        
        matches.push({
          id: doc.id,
          field: fieldPath,
          current: val,
          proposed: proposedPath,
          status: category
        });
      }
    }
  }
  
  return { 
    totalDocs, 
    affectedDocsCount: affectedDocs.size, 
    stats,
    matches 
  };
}

async function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportFilename = `audit-storage-report-${timestamp}.json`;

  console.log("🚀 Lancement de l'audit Storage URLs (V3 - Structure Réelle)");
  
  const results = {
    client_requests: await auditCollection("client_requests", [
      "documents.kbis",
      "documents.identityCard",
      "documents.proofOfAddress",
      "documentsUploadMeta.kbis.storageUrl",
      "documentsUploadMeta.identityCard.storageUrl",
      "documentsUploadMeta.proofOfAddress.storageUrl"
    ]),
    mails: await auditCollection("mails", [
      "storagePath"
    ]),
    clients_fallback: await auditCollection("clients", [
      "documents.kbis",
      "documents.identityCard",
      "documents.proofOfAddress"
    ])
  };

  const summary = {
    generatedAt: new Date().toISOString(),
    global: {
      totalDocsScanned: 0,
      totalAffectedDocs: 0,
      totalLegacy: 0,
      totalAmbiguous: 0,
      totalMissing: 0,
      totalRelativeOk: 0
    },
    details: results
  };

  console.log("\n================ REPORTING FINAL ================");

  for (const [col, res] of Object.entries(results)) {
    summary.global.totalDocsScanned += res.totalDocs;
    summary.global.totalAffectedDocs += res.affectedDocsCount;
    summary.global.totalLegacy += res.stats.ABSOLUTE_LEGACY;
    summary.global.totalAmbiguous += res.stats.AMBIGUOUS;
    summary.global.totalMissing += res.stats.MISSING;
    summary.global.totalRelativeOk += res.stats.RELATIVE_OK;

    console.log(`\nCollection [${col}] :`);
    console.log(`- Documents scannés    : ${res.totalDocs}`);
    console.log(`- Documents à traiter  : ${res.affectedDocsCount}`);
    console.log(`- Détail des champs :`);
    console.log(`  🟢 RELATIVE_OK       : ${res.stats.RELATIVE_OK}`);
    console.log(`  🔴 ABSOLUTE_LEGACY   : ${res.stats.ABSOLUTE_LEGACY}`);
    console.log(`  🟡 AMBIGUOUS         : ${res.stats.AMBIGUOUS}`);
    console.log(`  ⚪ MISSING           : ${res.stats.MISSING}`);
  }

  console.log("\n================ BILAN GLOBAL ================");
  console.log(`Docs scannés         : ${summary.global.totalDocsScanned}`);
  console.log(`Docs impactés        : ${summary.global.totalAffectedDocs}`);
  console.log(`Champs Legacy (URLs) : ${summary.global.totalLegacy}`);
  console.log(`Champs Relatifs (OK) : ${summary.global.totalRelativeOk}`);
  console.log(`Champs Ambigus       : ${summary.global.totalAmbiguous}`);
  console.log(`Champs Absents       : ${summary.global.totalMissing}`);
  
  fs.writeFileSync(reportFilename, JSON.stringify(summary, null, 2));
  console.log(`\n📄 Rapport complet généré : ${reportFilename}`);
  console.log("==============================================");
  console.log("Fin du Dry Run (aucune donnée n'a été modifiée).");
}

main().catch(err => {
  console.error("❌ Erreur fatale lors de l'audit :", err);
  process.exit(1);
});
