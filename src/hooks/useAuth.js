import { useContext } from "react";
import { AuthContext } from "../contexts/firebaseContext";
const useAuth = () => useContext(AuthContext);
export default useAuth;
