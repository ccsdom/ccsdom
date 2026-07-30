
const admin = require('firebase-admin');
admin.initializeApp({
  projectId: 'bizhome-hub'
});
const db = admin.firestore();

async function run() {
  const jobs = [
    { coll: 'pdf_requests_contrats_paris', id: 'U9FfxaKHadXl638TaZX4' },
    { coll: 'pdf_requests_invoices_paris', id: 'aR80sB6XkHqTYtBsXofL' }
  ];

  for (const j of jobs) {
    console.log(`Retriggering ${j.coll}/${j.id}...`);
    await db.collection(j.coll).doc(j.id).update({
      status: 'complete',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  // Fixing Attestation (Copying data from contract if available, but the contract job is for SAMY)
  // Let's create a NEW attestation job if the old one was empty.
  const samyUid = 'xlJg4I6HC8TO68UZ98dwGoYVBFz2';
  const contractSnap = await db.doc(`pdf_requests_contrats_paris/U9FfxaKHadXl638TaZX4`).get();
  if (contractSnap.exists) {
    const data = contractSnap.data().data;
    console.log(`Creating new attestation job for Samy...`);
    await db.collection('pdf_requests_attestations_paris').add({
      data: data,
      status: 'queued',
      ownerUid: samyUid,
      requestUid: samyUid,
      template: 'bizhome-hub.firebasestorage.app/templates/attestation_paris.zip',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  process.exit(0);
}

run();
