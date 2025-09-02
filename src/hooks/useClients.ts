// src/hooks/useClients.ts
import { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export interface Client {
  id: string;
  name: string;
  siren: string;
}

const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      setError(null);
      try {
        const clientsCol = collection(db, "clients");
        const q = query(clientsCol, orderBy("name", "asc"));
        const snapshot = await getDocs(q);

        const clientsData: Client[] = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          siren: doc.data().siren,
        }));

        setClients(clientsData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Erreur inconnue"));
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  return { clients, loading, error };
};

export default useClients;
