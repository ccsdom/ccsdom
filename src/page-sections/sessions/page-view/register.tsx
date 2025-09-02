import React from "react";
import { AuthProvider } from "@/contexts/firebaseContext";
import RegisterMultiStep from "@/components/form/RegisterMultiStep";

const RegisterPage = () => {
  return (
    <AuthProvider>
      <main>
        <RegisterMultiStep />
      </main>
    </AuthProvider>
  );
};

export default RegisterPage;
