// src/config/firebase.ts
// Réexporte ton init existant pour garder les imports uniformes partout.
export { app, db, auth, storage } from "@/firebase";
// Si l'alias "@" n'est pas configuré, utilise la version relative :
// export { app, db, auth, storage } from "../firebase";
