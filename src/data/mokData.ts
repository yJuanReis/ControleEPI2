
// src/data/mockData.ts
// Dados simulados e tipagens para o desenvolvimento.
export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  hireDate: string;
  status: 'active' | 'inactive';
}

export interface PPEItem {
  id: string;
  type: string;
  brand: string;
  model: string;
  currentStock: number;
  minimumStock: number;
  unitPrice: number;
  expirationDate?: string;
  ca?: string; // Certificado de Aprovação
}

export interface PPEMovement {
  id: string;
  type: 'delivery' | 'return' | 'replacement' | 'discard';
  date: string;
  employeeId: string;
  ppeItemId: string;
  quantity: number;
  reason?: string;
  responsibleId: string;
}

export interface Inspection {
  id: string;
  date: string;
  ppeItemId: string;
  employeeId: string;
  status: 'approved' | 'warning' | 'rejected';
  notes?: string;
  inspector: string;
}

// Dados mockados
export const employees: Employee[] = [
  { id: 'emp1', name: 'João Silva', email: 'joao.silva@empresa.com.br', department: 'Produção', position: 'Operador', hireDate: '2020-01-15', status: 'active' },
  { id: 'emp2', name: 'Maria Souza', email: 'maria.souza@empresa.com.br', department: 'Manutenção', position: 'Técnico', hireDate: '2019-03-20', status: 'active' },
  { id: 'emp3', name: 'Carlos Santos', email: 'carlos.santos@empresa.com.br', department: 'Produção', position: 'Supervisor', hireDate: '2018-07-10', status: 'active' },
  { id: 'emp4', name: 'Ana Costa', email: 'ana.costa@empresa.com.br', department: 'Administrativo', position: 'Assistente', hireDate: '2021-05-01', status: 'inactive' },
  { id: 'emp5', name: 'Pedro Lima', email: 'pedro.lima@empresa.com.br', department: 'Produção', position: 'Operador', hireDate: '2022-02-28', status: 'active' },
  { id: 'emp6', name: 'Juliana Almeida', email: 'juliana.almeida@empresa.com.br', department: 'Manutenção', position: 'Engenheiro', hireDate: '2017-11-01', status: 'active' },
  { id: 'emp7', name: 'Fernando Pereira', email: 'fernando.pereira@empresa.com.br', department: 'Produção', position: 'Operador', hireDate: '2020-08-01', status: 'active' },
];

export const ppeCatalog: PPEItem[] = [
  { id: 'ppe1', type: 'Luva', brand: 'SafetyPro', model: 'Nitrilica', currentStock: 150, minimumStock: 50, unitPrice: 5.50, expirationDate: '2025-12-31', ca: '12345' },
  { id: 'ppe2', type: 'Capacete', brand: 'HardHat', model: 'Classe B', currentStock: 30, minimumStock: 10, unitPrice: 45.00, expirationDate: '2026-06-30', ca: '67890' },
  { id: 'ppe3', type: 'Óculos de Segurança', brand: 'EyeGuard', model: 'Anti-risco', currentStock: 200, minimumStock: 100, unitPrice: 12.00, expirationDate: '2025-10-15', ca: '54321' },
  { id: 'ppe4', type: 'Máscara', brand: 'RespiraSeguro', model: 'PFF2', currentStock: 40, minimumStock: 20, unitPrice: 8.00, expirationDate: '2024-07-01', ca: '98765' },
  { id: 'ppe5', type: 'Protetor Auricular', brand: 'QuietZone', model: 'Plug Silicone', currentStock: 80, minimumStock: 30, unitPrice: 7.50, expirationDate: '2026-01-20', ca: '11223' },
  { id: 'ppe6', type: 'Bota de Segurança', brand: 'FootSafe', model: 'Couro Bico PVC', currentStock: 15, minimumStock: 10, unitPrice: 80.00, expirationDate: '2027-03-01', ca: '44556' },
  { id: 'ppe7', type: 'Uniforme', brand: 'WorkWear', model: 'Algodão', currentStock: 70, minimumStock: 25, unitPrice: 60.00, ca: '77889' },
];

export const ppeMovements: PPEMovement[] = [
  { id: 'mov1', type: 'delivery', date: '2024-06-10', employeeId: 'emp1', ppeItemId: 'ppe1', quantity: 2, responsibleId: 'admin' },
  { id: 'mov2', type: 'return', date: '2024-06-15', employeeId: 'emp1', ppeItemId: 'ppe1', quantity: 1, reason: 'Desgaste', responsibleId: 'admin' },
  { id: 'mov3', type: 'delivery', date: '2024-06-20', employeeId: 'emp2', ppeItemId: 'ppe2', quantity: 1, responsibleId: 'admin' },
  { id: 'mov4', type: 'replacement', date: '2024-06-25', employeeId: 'emp3', ppeItemId: 'ppe3', quantity: 1, reason: 'Dano', responsibleId: 'admin' },
  { id: 'mov5', type: 'discard', date: '2024-05-01', ppeItemId: 'ppe4', quantity: 5, reason: 'Vencimento', responsibleId: 'admin' },
  { id: 'mov6', type: 'delivery', date: '2024-05-10', employeeId: 'emp5', ppeItemId: 'ppe1', quantity: 3, responsibleId: 'admin' },
  { id: 'mov7', type: 'delivery', date: '2024-04-05', employeeId: 'emp6', ppeItemId: 'ppe5', quantity: 1, responsibleId: 'admin' },
  { id: 'mov8', type: 'delivery', date: '2024-04-12', employeeId: 'emp7', ppeItemId: 'ppe2', quantity: 1, responsibleId: 'admin' },
  { id: 'mov9', type: 'return', date: '2024-03-01', employeeId: 'emp5', ppeItemId: 'ppe1', quantity: 1, reason: 'Fim de uso', responsibleId: 'admin' },
  { id: 'mov10', type: 'delivery', date: '2024-03-15', employeeId: 'emp1', ppeItemId: 'ppe3', quantity: 1, responsibleId: 'admin' },
];

export const ppeInspections: Inspection[] = [
  { id: 'insp1', date: '2024-06-01', ppeItemId: 'ppe1', employeeId: 'emp1', status: 'approved', notes: 'Em bom estado', inspector: 'Inspetor A' },
  { id: 'insp2', date: '2024-05-15', ppeItemId: 'ppe2', employeeId: 'emp2', status: 'warning', notes: 'Pequeno arranhão', inspector: 'Inspetor B' },
  { id: 'insp3', date: '2024-04-20', ppeItemId: 'ppe3', employeeId: 'emp3', status: 'rejected', notes: 'Trincado', inspector: 'Inspetor A' },
  { id: 'insp4', date: '2024-06-20', ppeItemId: 'ppe5', employeeId: 'emp6', status: 'approved', notes: 'Conforme', inspector: 'Inspetor C' },
  { id: 'insp5', date: '2024-06-25', ppeItemId: 'ppe1', employeeId: 'emp5', status: 'approved', notes: 'Limpo', inspector: 'Inspetor B' },
];