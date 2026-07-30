import * as admin from "firebase-admin";
import * as path from "path";
import * as fs from "fs";

if (!admin.apps.length) {
  admin.initializeApp();
}

const bucket = admin.storage().bucket();

async function uploadFile(localPath: string, remotePath: string) {
  console.log(`Uploading ${localPath} to ${remotePath}...`);
  if (!fs.existsSync(localPath)) {
    console.error(`Local file not found: ${localPath}`);
    return;
  }
  
  await bucket.upload(localPath, {
    destination: remotePath,
    metadata: {
      contentType: 'application/zip',
    },
  });
  console.log(`Successfully uploaded to ${remotePath}`);
}

async function main() {
  const publicDir = path.join(process.cwd(), "..", "public");
  
  const filesToUpload = [
    { local: "invoice_paris.zip", remote: "templates/invoice_paris.zip" },
    { local: "invoice_orly.zip", remote: "templates/invoice_orly.zip" },
  ];

  for (const f of filesToUpload) {
    await uploadFile(path.join(publicDir, f.local), f.remote);
  }
}

main().catch(console.error);
