import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Se você quiser medir a performance da sua aplicação,
// você pode passar uma função para registrar os resultados (por exemplo: reportWebVitals(console.log))
// ou enviar para um endpoint de analytics. Saiba mais: https://bit.ly/CRA-vitals
reportWebVitals();
