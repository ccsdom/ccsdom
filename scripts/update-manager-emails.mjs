import admin from "firebase-admin";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT_DIR = process.cwd();
const PROJECT_ID = "bizhome-hub";
const APPLY = process.argv.includes("--apply");

const TARGETS = [
  {
    label: "Manager Orly",
    centerId: "orly_ville",
    centerKeys: ["orly", "orly_ville"],
    roleHints: ["manager_orly"],
    newEmail: "ccs-orly@ccsdom.fr",
    knownOldEmails: ["contact.ccs94@gmail.com", "ccs@ccsdom.fr"],
  },
  {
    label: "Manager Paris 12e",
    centerId: "paris_12e",
    centerKeys: ["paris", "paris_12e"],
    roleHints: ["manager_paris"],
    newEmail: "ccs-paris@ccsdom.fr",
    knownOldEmails: ["contact.ccs75@gmail.com", "bpc@ccsdom.fr"],
  },
];

function initAdmin() {
  if (admin.apps.length) return;

  const serviceAccountPath = path.resolve(ROOT_DIR, "serviceAccountKey.json");
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: PROJECT_ID,
    });
    console.log(`[init] service account loaded from ${serviceAccountPath}`);
    return;
  }

  admin.initializeApp({ projectId: PROJECT_ID });
  console.log("[init] application default credentials in use");
}

function normalizeString(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function normalizeEmail(value) {
  return normalizeString(value).toLowerCase();
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value.map(normalizeString).filter(Boolean);
  const single = normalizeString(value);
  return single ? [single] : [];
}

function normalizeCenter(value) {
  const center = normalizeString(value).toLowerCase();
  if (center === "orly") return "orly_ville";
  if (center === "paris") return "paris_12e";
  return center;
}

function managedCentersFromUser(user) {
  const centers = new Set();
  normalizeArray(user.managedCenterIds).forEach((center) => centers.add(normalizeCenter(center)));
  normalizeArray(user.managedAddressId).forEach((center) => centers.add(normalizeCenter(center)));

  const role = normalizeString(user.role).toLowerCase();
  if (role === "manager_orly" || role === "secretary_orly") centers.add("orly_ville");
  if (role === "manager_paris" || role === "secretary_paris") centers.add("paris_12e");

  return Array.from(centers);
}

function isTargetManager(user, target) {
  const role = normalizeString(user.role).toLowerCase();
  const centers = managedCentersFromUser(user);
  const email = normalizeEmail(user.emailLower || user.email);

  return (
    target.roleHints.includes(role) ||
    (role === "manager" && centers.includes(target.centerId)) ||
    target.knownOldEmails.includes(email)
  );
}

async function getAuthUserByEmail(email) {
  try {
    return await admin.auth().getUserByEmail(email);
  } catch (error) {
    if (error?.code === "auth/user-not-found") return null;
    throw error;
  }
}

async function getAuthUserByUid(uid) {
  try {
    return await admin.auth().getUser(uid);
  } catch (error) {
    if (error?.code === "auth/user-not-found") return null;
    throw error;
  }
}

function centerPatch(newEmail) {
  return {
    managerEmail: newEmail,
    contactEmail: newEmail,
    email: newEmail,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

async function main() {
  initAdmin();

  const db = admin.firestore();
  const usersSnapshot = await db.collection("users").get();
  const users = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const report = [];
  let blocked = false;

  console.log(`[mode] ${APPLY ? "APPLY" : "DRY-RUN"}\n`);

  for (const target of TARGETS) {
    const matches = users.filter((user) => isTargetManager(user, target));
    const exactManagers = matches.filter((user) => normalizeString(user.role).toLowerCase().startsWith("manager"));

    if (exactManagers.length !== 1) {
      blocked = true;
      report.push({
        target: target.label,
        status: "blocked",
        reason: `Expected exactly one manager match, found ${exactManagers.length}.`,
        matches: matches.map((user) => ({
          uid: user.uid || user.id,
          email: normalizeEmail(user.emailLower || user.email),
          role: user.role,
          managedCenters: managedCentersFromUser(user),
        })),
      });
      continue;
    }

    const userDoc = exactManagers[0];
    const uid = normalizeString(userDoc.uid || userDoc.id);
    const currentEmail = normalizeEmail(userDoc.emailLower || userDoc.email);
    const newEmail = normalizeEmail(target.newEmail);
    const authByNewEmail = await getAuthUserByEmail(newEmail);
    const authByUid = await getAuthUserByUid(uid);

    if (authByNewEmail && authByNewEmail.uid !== uid) {
      blocked = true;
      report.push({
        target: target.label,
        status: "blocked",
        reason: `New email ${newEmail} is already used by another Auth user (${authByNewEmail.uid}).`,
        uid,
        currentEmail,
        newEmail,
      });
      continue;
    }

    const planned = {
      target: target.label,
      status: APPLY ? "updated" : "planned",
      uid,
      currentFirestoreEmail: currentEmail,
      currentAuthEmail: authByUid?.email || null,
      newEmail,
      role: userDoc.role,
      managedCenters: managedCentersFromUser(userDoc),
      firestoreUserDoc: `users/${uid}`,
      centerDocs: target.centerKeys.map((centerKey) => `centers/${centerKey}`),
    };

    if (APPLY) {
      if (authByUid) {
        await admin.auth().updateUser(uid, {
          email: newEmail,
          emailVerified: false,
          disabled: false,
        });
      } else {
        planned.status = "updated_firestore_only";
        planned.warning = "Auth user not found by uid; Firestore was updated but Auth was not.";
      }

      const batch = db.batch();
      batch.set(
        db.collection("users").doc(uid),
        {
          email: newEmail,
          emailLower: newEmail,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      for (const centerKey of target.centerKeys) {
        batch.set(db.collection("centers").doc(centerKey), centerPatch(newEmail), { merge: true });
      }

      batch.set(db.collection("activity_logs").doc(), {
        type: "manager.email_updated",
        actorUid: "maintenance_script",
        targetUid: uid,
        targetEmail: newEmail,
        previousEmail: currentEmail || authByUid?.email || null,
        centerId: target.centerId,
        centerIds: [target.centerId],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await batch.commit();
    }

    report.push(planned);
  }

  console.log(JSON.stringify({ apply: APPLY, blocked, report }, null, 2));

  if (blocked) {
    process.exitCode = 2;
    return;
  }

  if (!APPLY) {
    console.log("\nDry-run uniquement. Relancer avec --apply pour appliquer ces modifications.");
  }
}

main().catch((error) => {
  console.error("[fatal]", error);
  process.exitCode = 1;
});
