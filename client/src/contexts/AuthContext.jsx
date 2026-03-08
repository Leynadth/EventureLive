import { createContext, useContext, useState, useEffect } from "react";
import { getProfile } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);

  useEffect(() => {
    getProfile()
      .then((data) => {
        if (data?.user) setUserState(data.user);
        else setUserState(null);
      })
      .catch(() => setUserState(null));
  }, []);

  const setUser = (nextUser) => {
    setUserState(nextUser);
  };

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}


export function useCurrentUser() {
  const { user } = useAuth();
  return user;
}


export function useUserRole() {
  const user = useCurrentUser();
  return user?.role ?? "user";
}