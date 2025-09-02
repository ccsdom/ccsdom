import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
const ProtectedRoute = ({ children, allowedRoles, }) => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) {
        return _jsx(Navigate, { replace: true, to: "/login" });
    }
    if (!user || !allowedRoles.includes(user.role)) {
        return _jsx(Navigate, { replace: true, to: "/unauthorized" });
    }
    return _jsx(_Fragment, { children: children });
};
export default ProtectedRoute;
