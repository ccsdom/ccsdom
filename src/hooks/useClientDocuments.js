import { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs, } from "firebase/firestore";
import { db } from "@/firebase";
const useClientDocuments = (clientId) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
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
                const q = query(collection(db, "documents"), where("clientId", "==", clientId), orderBy("createdAt", "desc"));
                const snapshot = await getDocs(q);
                const docsData = snapshot.docs.map((doc) => {
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
            }
            catch (err) {
                setError(err.message || "Erreur lors du chargement des documents");
                setDocuments([]);
            }
            finally {
                setLoading(false);
            }
        };
        fetchDocuments();
    }, [clientId]);
    return { documents, loading, error };
};
export default useClientDocuments;
