import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  DocumentData,
  QuerySnapshot,
} from "firebase/firestore";
import { db } from "@/firebase";

export interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  createdAt: Date;
  status: "pending" | "approved" | "rejected";
}

const useClientDocuments = (clientId: string | null) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) {
      setDocuments([]);
      return;
    }

    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);

      try {
        // Construire la requête Firestore filtrée par clientId et ordonnée par date
        const q = query(
          collection(db, "documents"),
          where("clientId", "==", clientId),
          orderBy("createdAt", "desc")
        );

        const snapshot: QuerySnapshot<DocumentData> = await getDocs(q);

        const docsData: Document[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            url: data.url,
            type: data.type,
            createdAt: data.createdAt.toDate(),
            status: data.status,
          };
        });

        setDocuments(docsData);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des documents");
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [clientId]);

  return { documents, loading, error };
};

export default useClientDocuments;
