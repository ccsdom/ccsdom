import { jsx as _jsx } from "react/jsx-runtime";
import { AuthProvider } from "@/contexts/firebaseContext";
import RegisterView from "./RegisterView";
const RegisterWithFirebase = () => {
    return (_jsx(AuthProvider, { children: _jsx(RegisterView, {}) }));
};
export default RegisterWithFirebase;
