import { jsx as _jsx } from "react/jsx-runtime";
import { AuthProvider } from "@/contexts/auth0Context";
import LoginView from "./LoginView";
const LoginWithAuth0 = () => {
    return (_jsx(AuthProvider, { children: _jsx(LoginView, {}) }));
};
export default LoginWithAuth0;
