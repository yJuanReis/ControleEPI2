// src/firebaseConfig.ts (ou .js)

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // Para autenticação
import { getFirestore } from 'firebase/firestore'; // Para o banco de dados Firestore
import { getStorage } from 'firebase/storage'; // Para armazenamento de arquivos
// import { getAnalytics } from 'firebase/analytics'; // Só se você ativou o Analytics e quiser usar

// Suas credenciais do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAT10eh1eBhK_fTLWvvvW8KHALJuW1Zo0Q",
  authDomain: "controle-epi-13c7e.firebaseapp.com",
  databaseURL: "https://controle-epi-13c7e-default-rtdb.firebaseio.com",
  projectId: "controle-epi-13c7e",
  storageBucket: "controle-epi-13c7e.firebasestorage.app",
  messagingSenderId: "211418789346",
  appId: "1:211418789346:web:7c29c30707c335e5a2f5bb",
  measurementId: "G-KPY9SCMHN1"
};

// Inicializa o Firebase com suas credenciais
const app = initializeApp(firebaseConfig);

// Exporta as instâncias dos serviços que você vai usar no seu app
export const auth = getAuth(app); // Instância de autenticação
export const db = getFirestore(app); // Instância do Firestore (banco de dados)
export const storage = getStorage(app); // Instância do Storage (armazenamento de arquivos)

// Se você ativou o Google Analytics, descomente a linha abaixo e importe o getAnalytics lá em cima
// export const analytics = getAnalytics(app);