// src/hooks/useDocuments.ts
import { useState, useCallback } from "react";
import { db, storage } from "@/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { ref, deleteObject, uploadBytesResumable, getDownloadURL } from "firebase/storage";

interface Document {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  url: string;
  createdAt: Date;
}

const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDocuments = useCallback(async (params: { clientId?: string; page?: number; rowsPerPage?: number }) => {
    setLoading(true);
    let baseQuery = collection(db, "documents");

    if (params.clientId) {
      baseQuery = query(baseQuery, where("clientId", "==", params.clientId));
    }

    // TODO: ajouter pagination avec startAfter etc.

    const q = query(baseQuery, orderBy("createdAt", "desc"), limit(params.rowsPerPage || 20));
    const snapshot = await getDocs(q);

    const docs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as Document[];

    setDocuments(docs);
    setLoading(false);
  }, []);

  const deleteDocument = async (id: string, url: string) => {
    await deleteObject(ref(storage, url));
    await deleteDoc(doc(db, "documents", id));
    // On peut déclencher un fetch après suppression dans le composant
  };

  const uploadDocument = async (clientId: string, file: File) => {
    return new Promise<void>((resolve, reject) => {
      const storageRef = ref(storage, `documents/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        () => {},
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, "documents"), {
            name: file.name,
            clientId,
            clientName: "", // On peut récupérer le nom client dans le composant via clientsList
            url: downloadURL,
            createdAt: new Date(),
          });
          resolve();
        }
      );
    });
  };

  return { documents, loading, fetchDocuments, deleteDocument, uploadDocument };
};

export default useDocuments;
