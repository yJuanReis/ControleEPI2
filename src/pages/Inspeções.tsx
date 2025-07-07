import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  HardHat,
  Search,
  Plus,
  Calendar,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import {
  ppeCatalog,
  employees,
  ppeMovements,
  PPEItem,
  Employee
} from '@/data/mockData';

interface Inspection {
  id: string;
  date: string;
  ppeItemId: string;
  employeeId: string;
  status: 'approved' | 'warning' | 'rejected';
  notes?: string;
  inspector: string;
}

interface FilterState {
  search: string;
  status: 'all' | 'approved' | 'warning' | 'rejected';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  startDate: string;
  endDate: string;
  sortBy: 'date' | 'status' | 'employee' | 'ppe';
  sortOrder: 'asc' | 'desc';
}

/* --------- MOCK DE INSPEÇÕES --------- */
const mockInspections: Inspection[] = [
  {
    id: 'insp001',
    date: '2025-07-02',
    ppeItemId: 'epi001',
    employeeId: 'emp001',
    status: 'approved',
    inspector: 'emp004'
  },
  {
    id: 'insp002',
    date: '2025-07-01',
    ppeItemId: 'epi002',
    employeeId: 'emp002',
    status: 'warning',
    notes: 'Arranhões na lente',
    inspector: 'emp004'
  },
  {
    id: 'insp003',
    date: '2025-06-28',
    ppeItemId: 'epi003',
    employeeId: 'emp003',
    status: 'rejected',
    notes: 'Trincos visíveis',
    inspector: 'emp004'
  }
];

/* --------- COMPONENTE --------- */
const Inspeções: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    dateRange: 'all',
    startDate: '',
    endDate: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* --------- FUNÇÕES AUXILIARES --------- */
  const getEmployeeName = (id: string) =>
    employees.find(emp => emp.id === id)?.name || 'Colaborador';
  const getPPEType = (id: string) =>
    ppeCatalog.find(item => item.id === id)?.type || 'EPI';

  const getStatusBadge = (status: Inspection['status']) => {
    const map = {
      approved: { color: 'green', label: 'Aprovado', icon: <CheckCircle className="h-4 w-4" /> },
      warning: { color: 'orange', label: 'Atenção', icon: <AlertTriangle className="h-4 w-4" /> },
      rejected: { color: 'red', label: 'Reprovado', icon: <XCircle className="h-4 w-4" /> }
    };
    const { color, label, icon } = map[status];
    return (
      <Badge color={color} className="flex items-center gap-1">
        {icon}
        {label}
      </Badge>
    );
  };

  const filterByDate = (insp: Inspection) => {
    if (filters.dateRange === 'all') return true;
    const inspDate = new Date(insp.date);
    const today = new Date();

    switch (filters.dateRange) {
      case 'today':
        return inspDate.toDateString() === today.toDateString();
      case 'week':
        return inspDate >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return inspDate >= new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'custom':
        if (filters.startDate && filters.endDate) {
          const start = new Date(filters.startDate);
          const end = new Date(filters.endDate);
          return inspDate >= start && inspDate <= end;
        }
        return true;
    }
  };

  /* --------- DADOS FILTRADOS/ORDENADOS --------- */
  const filteredInspections = useMemo(() => {
    let list = mockInspections.filter(insp => {
      /* Busca */
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (
          !getEmployeeName(insp.employeeId).toLowerCase().includes(s) &&
          !getPPEType(insp.ppeItemId).toLowerCase().includes(s) &&
          !(insp.notes || '').toLowerCase().includes(s)
        )
          return false;
      }
      /* Status */
      if (filters.status !== 'all' && insp.status !== filters.status) return false;
      /* Data */
      if (!filterByDate(insp)) return false;
      return true;
    });

    /* Ordenação */
    list.sort((a, b) => {
      let comp = 0;
      switch (filters.sortBy) {
        case 'date':
          comp = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'status':
          comp = a.status.localeCompare(b.status);
          break;
        case 'employee':
          comp = getEmployeeName(a.employeeId).localeCompare(getEmployeeName(b.employeeId));
          break;
        case 'ppe':
          comp = getPPEType(a.ppeItemId).localeCompare(getPPEType(b.ppeItemId));
          break;
      }
      return filters.sortOrder === 'desc' ? -comp : comp;
    });

    return list;
  }, [filters]);

  /* --------- ESTATÍSTICAS --------- */
  const stats = useMemo(() => ({
    total: filteredInspections.length,
    approved: filteredInspections.filter(i => i.status === 'approved').length,
    warning: filteredInspections.filter(i => i.status === 'warning').length,
    rejected: filteredInspections.filter(i => i.status === 'rejected').length
  }), [filteredInspections]);

  /* --------- HANDLERS --------- */
  const openModal = (insp?: Inspection) => {
    setSelectedInspection(insp || null);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setSelectedInspection(null);
    setIsModalOpen(false);
  };

  const clearFilters = () => setFilters({
    search: '',
    status: 'all',
    dateRange: 'all',
    startDate: '',
    endDate: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Inspeções</h1>
          <p className="text-gray-600">
            Registre e acompanhe inspeções de EPIs, garantindo segurança e conformidade.
          </p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Inspeção
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Aprovadas</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Atenção</p>
              <p className="text-2xl font-bold text-orange-600">{stats.warning}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
