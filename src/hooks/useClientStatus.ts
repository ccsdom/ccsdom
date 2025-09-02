import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import useAuth from "@/hooks/useAuth"; // ✅


export const useClientStatus = () => {
  const { user } = useAuth();
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "unpaid" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStatus = async () => {
      setLoading(true);
      const ref = doc(db, "clients", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setPaymentStatus(data.paymentStatus || "unpaid");
      } else {
        setPaymentStatus("unpaid");
      }

      setLoading(false);
    };

    fetchStatus();
  }, [user]);

  return { paymentStatus, loading };
};
