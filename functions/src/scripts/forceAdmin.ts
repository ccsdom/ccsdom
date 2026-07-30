import * as admin from "firebase-admin";

/**
 * Script utilitaire pour forcer un rôle sur un UID spécifique.
 * Usage: npx ts-node src/scripts/forceAdmin.ts <uid> <role>
 */

if (!admin.apps.length) admin.initializeApp();

const uid = process.argv[2];
const role = process.argv[3] || "super_admin";

if (!uid) {
  console.error("Usage: npx ts-node src/scripts/forceAdmin.ts <uid> [role]");
  process.exit(1);
}

async function run() {
  console.log(`Setting role '${role}' for user '${uid}'...`);
  
  try {
    // 1. Custom Claims
    await admin.auth().setCustomUserClaims(uid, { role });
    
    // 2. Firestore Document
    const db = admin.firestore();
    await db.collection("users").doc(uid).set({
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    console.log("Success! Logout and log back in on the web app to refresh the token.");
  } catch (error) {
    console.error("Error setting role:", error);
  }
}

run();
