// src/pages/auth-demo/firebase/login.tsx
import { AuthProvider } from "@/contexts/firebaseContext";
import LoginView from "./LoginView";

const Login = () => {
  return (
    <AuthProvider>
      <LoginView />
    </AuthProvider>
  );
};

export default Login;
