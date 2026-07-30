import * as admin from "firebase-admin";

export async function waitForPdfOutputUrl(params: {
  docRef: admin.firestore.DocumentReference;
  timeoutMs?: number;
  intervalMs?: number;
}) {
  const { docRef, timeoutMs = 30_000, intervalMs = 1_000 } = params;

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const snap = await docRef.get();
    if (snap.exists) {
      const data: any = snap.data();

      const url =
        data?.outputUrl ||
        data?.outputURL ||
        data?.downloadUrl ||
        data?.url ||
        null;

      if (typeof url === "string" && url.startsWith("http")) {
        return { outputUrl: url, raw: data };
      }

      const status = String(data?.status || data?.state || "").toLowerCase();
      if (status.includes("fail") || status.includes("error")) {
        throw new Error(`PDF job failed (${docRef.path}) status=${status}`);
      }
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error(`Timeout waiting outputUrl (${docRef.path})`);
}
