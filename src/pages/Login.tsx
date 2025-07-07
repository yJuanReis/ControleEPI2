
// src/pages/Login.tsx
// Página de autenticação.
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn } from 'lucide-react'; // Certifique-se de ter 'lucide-react' instalado

const Login: React.FC = () => {
  const { user, loading, signInWithGoogle, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Controle de EPI</h1>
        <p className="text-gray-600 mb-6">Faça login para acessar o sistema.</p>
        <Button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2"
        >
          {loading ? 'Carregando...' : (
            <>
              <LogIn className="h-5 w-5" />
              Entrar com Google
            </>
          )}
        </Button>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default Login;
