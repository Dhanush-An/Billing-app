import React, { createContext, useContext } from "react";
import { useStorage } from "../../hooks/useStorage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useStorage("currentUser", null);

    const login = (user) => setCurrentUser(user);
    const logout = () => setCurrentUser(null);

    return (
        <AuthContext.Provider value={{ currentUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
