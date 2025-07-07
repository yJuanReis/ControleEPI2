
// src/routes.tsx
// Configuração das rotas da aplicação.
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Configuracoes from "./pages/Configuracoes";
import Catalogo from "./pages/Catálogo"; // Corrigido para "Catálogo" com acento
import Colaboradores from "./pages/Colaboradores";
import Estoque from "./pages/Estoque";
import Movimentacoes from "./pages/Movimentacoes";
import Inspecoes from "./pages/Inspeções"; // Corrigido para "Inspeções" com acento

// Importe o ProtectedRoute (você vai criar esse componente)
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <AuthProvider> {/* O AuthProvider deve envolver as rotas que precisam de autenticação */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuracoes"
            element={
              <ProtectedRoute>
                <Configuracoes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/catalogo"
            element={
              <ProtectedRoute>
                <Catalogo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/colaboradores"
            element={
              <ProtectedRoute>
                <Colaboradores />
              </ProtectedRoute>
            }
          />
          <Route
            path="/estoque"
            element={
              <ProtectedRoute>
                <Estoque />
              </ProtectedRoute>
            }
          />
          <Route
            path="/movimentacoes"
            element={
              <ProtectedRoute>
                <Movimentacoes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inspecoes"
            element={
              <ProtectedRoute>
                <Inspecoes />
              </ProtectedRoute>
            }
          />
          {/* Adicione outras rotas protegidas aqui */}
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default AppRoutes;