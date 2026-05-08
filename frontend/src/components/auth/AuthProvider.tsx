import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { firebaseAuth } from "../../services/firebase";

type Role = "student" | "ta" | "instructor";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  role: Role;
  isReady: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<Role>("student");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
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
        setToken(null);
        setRole("student");
      }
      setIsReady(true);
    });
    return unsub;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      role,
      isReady,
      signInWithGoogle: async () => {
        await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      },
      logout: async () => {
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
