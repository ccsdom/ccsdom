import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useClientStatus } from "@/hooks/useClientStatus";
import { Box, CircularProgress } from "@mui/material";

const PAYMENT_PATH = "/paiement";

type Props = { children: React.ReactNode };

const RequirePaid: React.FC<Props> = ({ children }) => {
  const { pathname } = useLocation();
  const { paymentStatus, loading } = useClientStatus();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (paymentStatus !== "paid" && pathname !== PAYMENT_PATH) {
    return <Navigate to={PAYMENT_PATH} replace state={{ from: pathname }} />;
  }

  return <>{children}</>;
};

export default RequirePaid;
