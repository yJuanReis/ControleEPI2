// src/App.tsx
// Componente raiz da aplicação.
import React from 'react';
import './App.css';
import AppRoutes from './routes'; // Importe o AppRoutes

function App() {
  return (
    <div className="App">
      <AppRoutes /> {/* Renderiza as rotas aqui */}
    </div>
  );
}

export default App;
