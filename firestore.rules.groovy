rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Espace privé par utilisateur
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Sessions Stripe (ex: créées côté backend, lisibles par le propriétaire)
    match /stripeSessions/{id} {
      allow read: if request.auth != null && request.auth.uid == resource.data.ownerId;
      allow create, update, delete: if false; // écrites uniquement par le backend
    }

    // Exemple d'espace public en lecture seule
    match /public/{docId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
