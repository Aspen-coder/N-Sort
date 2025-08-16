// hooks/useAuth.ts


import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { 
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";

export const useAuth = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  return { user, loading };
};