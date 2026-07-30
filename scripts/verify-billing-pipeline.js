const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function runE2ETest() {
    const testId = 'TEST-' + Math.random().toString(36).substring(7);
    const invoiceId = `inv_test_${testId}`;
    const invoiceRef = db.collection('invoices').doc(invoiceId);
    
    console.log(`[1/4] Début du test E2E - Facture: ${invoiceId}`);
    
    const now = admin.firestore.Timestamp.now();
    
    // Simuler la création d'une facture comme le ferait Stripe/Verify session
    const invoiceData = {
        id: invoiceId,
        invoiceNumber: `FAC-TEST-${testId.toUpperCase()}`,
        status: "paid",
        amountCents: 5000, // 50.00 €
        currency: "EUR",
        addressKey: "paris",
        type: "registration",
        issuedAt: now,
        paidAt: now,
        snapshot: {
            client: {
                name: "Test Client E2E",
                email: "test-e2e@example.com",
                address: "1 Rue du Test, 75000 Paris",
                siret: "12345678900011"
            },
            seller: {
                name: "CCS DOM",
                address: "123 Avenue de Paris, 75012 Paris",
                email: "contact@ccsdom.fr",
                siren: "123 456 789",
                tva: "FR123456789"
            }
        },
        pdf: {
            status: "pending",
            createdAt: now,
            updatedAt: now
        },
        createdAt: now,
        updatedAt: now
    };

    console.log(`[2/4] Création du document invoice...`);
    await invoiceRef.set(invoiceData);

    console.log(`[3/4] Attente du déclenchement des triggers (T1: Job Creation)...`);
    
    let jobId = null;
    // Poll for jobId
    for (let i = 0; i < 15; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const snap = await invoiceRef.get();
        const data = snap.data();
        if (data.pdf && data.pdf.jobId) {
            jobId = data.pdf.jobId;
            console.log(`      ✅ Job PDF créé : ${jobId} (Statut: ${data.pdf.status})`);
            break;
        }
    }

    if (!jobId) {
        console.error(`      ❌ Échec : Le job PDF n'a pas été créé après 15s.`);
        return;
    }

    console.log(`[4/4] Attente de la génération PDF et synchronisation finale (T2 & T3)...`);
    
    let finalUrl = null;
    for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const snap = await invoiceRef.get();
        const data = snap.data();
        if (data.pdf && data.pdf.status === 'success' && data.pdf.url) {
            finalUrl = data.pdf.url;
            console.log(`      ✅ PDF prêt !`);
            console.log(`      🔗 URL : ${finalUrl}`);
            break;
        }
        if (data.pdf && data.pdf.status === 'error') {
            console.error(`      ❌ Erreur signalée dans le document invoice : ${data.pdf.error}`);
            break;
        }
        console.log(`      ... En cours (Tentative ${i+1}/30) - Statut: ${data.pdf.status}`);
    }

    if (finalUrl) {
        console.log(`\n🎉 TEST RÉUSSI : La chaîne complète (Invoice -> Trigger -> Job -> Sync) est fluide.`);
    } else {
        console.error(`\n❌ TEST INCOMPLET : Timeout ou erreur lors de la génération.`);
    }

    // Garder le document quelques minutes pour vérification manuelle si besoin, puis nettoyer
    console.log(`\nNote: Le document ${invoiceId} est conservé pour inspection.`);
}

runE2ETest().catch(err => {
    console.error(`\n❌ ERREUR FATALE durant le test:`, err);
});
