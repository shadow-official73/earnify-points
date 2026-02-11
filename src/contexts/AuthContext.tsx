import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { auth, getUserProfile, createUserProfile, getUserRole } from "@/lib/firebase";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  userRole: string;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState("user");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Check if profile exists, create if not
        const profile = await getUserProfile(firebaseUser.uid);
        if (!profile) {
          await createUserProfile(firebaseUser.uid, firebaseUser.phoneNumber || "");
        }
        const role = await getUserRole(firebaseUser.uid);
        setUserRole(role);
      } else {
        setUserRole("user");
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, userRole, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
