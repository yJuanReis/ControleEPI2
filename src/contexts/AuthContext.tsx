import React, { createContext, useContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { auth, db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const provider = new GoogleAuthProvider();

  // Domínio autorizado da empresa
  const AUTHORIZED_DOMAIN = "@empresa.com.br"; // Substitua pelo domínio real

  /**
   * Valida se o usuário tem permissão para acessar o sistema
   */
  const validateUser = async (user: User): Promise<boolean> => {
    try {
      // Verifica se o e-mail pertence ao domínio autorizado
      if (user.email?.endsWith(AUTHORIZED_DOMAIN)) {
        return true;
      }

      // Se não for do domínio, verifica se está na whitelist
      const whitelistDoc = await getDoc(doc(db, "whitelist", user.uid));
      return whitelistDoc.exists();
    } catch (error) {
      console.error("Erro ao validar usuário:", error);
      return false;
    }
  };

  /**
   * Faz login com Google e valida o usuário
   */
  const signInWithGoogle = async (): Promise<void> => {
    try {
      setError(null);
      setLoading(true);

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const isAuthorized = await validateUser(user);
      
      if (!isAuthorized) {
        setError("Acesso restrito a usuários autorizados.");
        await signOut(auth);
        setUser(null);
      }
    } catch (error: any) {
      console.error("Erro no login:", error);
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Faz logout do usuário
   */
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
      setError(null);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  /**
   * Monitora mudanças no estado de autenticação
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const isAuthorized = await validateUser(user);
        if (isAuthorized) {
          setUser(user);
        } else {
          setUser(null);
          setError("Acesso restrito a usuários autorizados.");
          await signOut(auth);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signInWithGoogle,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
