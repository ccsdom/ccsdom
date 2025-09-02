import { jsx as _jsx } from "react/jsx-runtime";
import { AuthProvider } from "@/contexts/firebaseContext";
import RegisterMultiStep from "@/components/form/RegisterMultiStep";
const RegisterPage = () => {
    return (_jsx(AuthProvider, { children: _jsx("main", { children: _jsx(RegisterMultiStep, {}) }) }));
};
export default RegisterPage;
