/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { getProfile } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    function finish(userData) {
      if (cancelled) return;
      if (userData?.user) setUserState(userData.user);
      else setUserState(null);
      setLoading(false);
    }
    getProfile()
      .then((data) => finish(data))
      .catch(() => {
        if (cancelled) return;
        return new Promise((resolve) => setTimeout(resolve, 3000)).then(() => {
          if (cancelled) return;
          return getProfile();
        }).then((data) => finish(data)).catch(() => {
          if (!cancelled) {
            setUserState(null);
            setLoading(false);
          }
        });
      });
    return () => { cancelled = true; };
  }, []);

  const setUser = (nextUser, token) => {
    if (nextUser === null) {
      try {
        localStorage.removeItem("eventure_token");
      } catch {
        /* ignore */
      }
    } else if (token) {
      try {
        localStorage.setItem("eventure_token", token);
      } catch {
        /* ignore */
      }
    }
    setUserState(nextUser);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
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