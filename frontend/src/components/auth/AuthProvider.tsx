import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { firebaseAuth } from "../../services/firebase";

type Role = "student" | "ta" | "instructor";

type AppUser = {
  uid: string;
  email: string | null;
};

type AuthContextValue = {
  user: AppUser | null;
  token: string | null;
  role: Role;
  isReady: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<Role>("student");
  const [isReady, setIsReady] = useState(false);
  const devRole = (import.meta.env.VITE_DEV_AUTH_ROLE ?? "").toLowerCase() as Role | "";

  useEffect(() => {
    if (devRole) {
      setUser({ uid: `dev-${devRole}`, email: `${devRole}@local.dev` });
      setToken(`dev-${devRole}`);
      setRole(devRole);
      setIsReady(true);
      return;
    }
    if (!firebaseAuth) {
      setUser(null);
      setToken(null);
      setRole("student");
      setIsReady(true);
      return;
    }
    const unsub = onAuthStateChanged(firebaseAuth, async (nextUser) => {
      if (nextUser) {
        setUser({ uid: nextUser.uid, email: nextUser.email });
        const nextToken = await nextUser.getIdToken();
        setToken(nextToken);
        try {
          const payload = JSON.parse(atob(nextToken.split(".")[1] ?? ""));
          const nextRole = (payload.role ?? payload?.claims?.role ?? "student") as Role;
          setRole(nextRole);
        } catch {
          setRole("student");
        }
      } else {
        setUser(null);
        setToken(null);
        setRole("student");
      }
      setIsReady(true);
    });
    return unsub;
  }, [devRole]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      role,
      isReady,
      signInWithGoogle: async () => {
        if (!firebaseAuth) {
          throw new Error("Firebase auth is unavailable. Set VITE_DEV_AUTH_ROLE for local bypass.");
        }
        await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      },
      logout: async () => {
        if (!firebaseAuth) {
          setUser(null);
          setToken(null);
          setRole("student");
          return;
        }
        await signOut(firebaseAuth);
      },
    }),
    [isReady, role, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}
