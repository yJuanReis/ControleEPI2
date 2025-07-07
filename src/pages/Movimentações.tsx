import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ppeMovements, employees, ppeCatalog, PPEMovement } from '@/data/mockData';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Users,
  Package,
  ArrowUpCircle,
  ArrowDownCircle,
  RotateCcw,
  X
} from 'lucide-react';

interface FilterState {
  search: string;
  type: 'all' | 'delivery' | 'return' | 'replacement' | 'discard';
  employeeId: string;
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  startDate: string;
  endDate: string;
  sortBy: 'date' | 'type' | 'employee';
  sortOrder: 'asc' | 'desc';
}

const Movimentações: React.FC = () => {
  const [selectedMovement, setSelectedMovement] = useState<PPEMovement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'all',
    employeeId: '',
    dateRange: 'all',
    startDate: '',
    endDate: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Funções auxiliares
  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : 'Colaborador não encontrado';
  };

  const getPPEType = (ppeItemId: string) => {
    const item = ppeCatalog.find(ppe => ppe.id === ppeItemId);
    return item ? `${item.type} - ${item.brand}` : 'EPI não encontrado';
  };

  const getMovementTypeIcon = (type: PPEMovement['type']) => {
    switch (type) {
      case 'delivery':
        return <ArrowUpCircle className="h-4 w-4 text-blue-600" />;
      case 'return':
        return <ArrowDownCircle className="h-4 w-4 text-green-600" />;
      case 'replacement':
        return <RotateCcw className="h-4 w-4 text-orange-600" />;
      case 'discard':
        return <X className="h-4 w-4 text-red-600" />;
    }
  };

  const getMovementTypeLabel = (type: PPEMovement['type']) => {
    switch (type) {
      case 'delivery':
        return 'Entrega';
      case 'return':
        return 'Devolução';
      case 'replacement':
        return 'Substituição';
      case 'discard':
        return 'Descarte';
    }
  };

  const getMovementTypeColor = (type: PPEMovement['type']) => {
    switch (type) {
      case 'delivery':
        return 'blue';
      case 'return':
        return 'green';
      case 'replacement':
        return 'orange';
      case 'discard':
        return 'red';
    }
  };

  // Filtrar movimentações por data
  const filterByDateRange = (movement: PPEMovement) => {
    const movementDate = new Date(movement.date);
    const today = new Date();
    
    switch (filters.dateRange) {
      case 'today':
        return movementDate.toDateString() === today.toDateString();
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return movementDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return movementDate >= monthAgo;
      case 'custom':
        if (filters.startDate && filters.endDate) {
          const start = new Date(filters.startDate);
          const end = new Date(filters.endDate);
          return movementDate >= start && movementDate <= end;
        }
        return true;
      default:
        return true;
    }
  };

  // Dados filtrados e ordenados
  const filteredMovements = useMemo(() => {
    let filtered = ppeMovements.filter(movement => {
      // Filtro de busca
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const employeeName = getEmployeeName(movement.employeeId).toLowerCase();
        const ppeType = getPPEType(movement.ppeItemId).toLowerCase();
        const reason = movement.reason?.toLowerCase() || '';
        
        if (!employeeName.includes(searchLower) && 
            !ppeType.includes(searchLower) && 
            !reason.includes(searchLower)) {
          return false;
        }
      }

      // Filtro de tipo
      if (filters.type !== 'all' && movement.type !== filters.type) {
        return false;
      }

      // Filtro de colaborador
      if (filters.employeeId && movement.employeeId !== filters.employeeId) {
        return false;
      }

      // Filtro de data
      if (!filterByDateRange(movement)) {
        return false;
      }

      return true;
    });

    // Ordenação
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'employee':
          comparison = getEmployeeName(a.employeeId).localeCompare(getEmployeeName(b.employeeId));
          break;
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [filters]);

  // Estatísticas das movimentações
  const stats = useMemo(() => {
    const today = new Date();
    const thisMonth = filteredMovements.filter(m => {
      const movDate = new Date(m.date);
      return movDate.getMonth() === today.getMonth() && movDate.getFullYear() === today.getFullYear();
    });

    return {
      total: filteredMovements.length,
      thisMonth: thisMonth.length,
      deliveries: filteredMovements.filter(m => m.type === 'delivery').length,
      returns: filteredMovements.filter(m => m.type === 'return').length,
      replacements: filteredMovements.filter(m => m.type === 'replacement').length,
      discards: filteredMovements.filter(m => m.type === 'discard').length
    };
  }, [filteredMovements]);

  const openModal = (movement?: PPEMovement) => {
    setSelectedMovement(movement || null);
    setIsCreating(!movement);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedMovement(null);
    setIsCreating(false);
    setIsModalOpen(false);
  };

  const handleDelete = (movementId: string) => {
    if (confirm('Tem certeza que deseja excluir esta movimentação?')) {
      // Em produção, fazer delete no Firestore
      console.log('Excluindo movimentação:', movementId);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      employeeId: '',
      dateRange: 'all',
      startDate: '',
      endDate: '',
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  const exportMovements = () => {
    // Em produção, gerar e baixar relatório
    console.log('Exportando movimentações:', filteredMovements);
    alert('Funcionalidade de exportação será implementada em breve!');
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Movimentações</h1>
          <p className="text-gray-600">
            Acompanhe todas as movimentações de EPIs: entregas, devoluções, substituições e descartes.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportMovements}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => openModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Movimentação
          </Button>
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <RefreshCw className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Este Mês</p>
              <p className="text-2xl font-bold text-green-600">{stats.thisMonth}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <ArrowUpCircle className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Entregas</p>
              <p className="text-2xl font-bold text-blue-600">{stats.deliveries}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <ArrowDownCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Devoluções</p>
              <p className="text-2xl font-bold text-green-600">{stats.returns}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <RotateCcw className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Substituições</p>
              <p className="text-2xl font-bold text-orange-600">{stats.replacements}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <X className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Descartes</p>
              <p className="text-2xl font-bold text-red-600">{stats.discards}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Limpar filtros
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tipo de movimentação */}
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value as FilterState['type'] })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os tipos</option>
              <option value="delivery">Entregas</option>
              <option value="return">Devoluções</option>
              <option value="replacement">Substituições</option>
              <option value="discard">Descartes</option>
            </select>

            {/* Colaborador */}
            <select
              value={filters.employeeId}
              onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os colaboradores</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>

            {/* Período */}
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as FilterState['dateRange'] })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os períodos</option>
              <option value="today">Hoje</option>
              <option value="week">Última semana</option>
              <option value="month">Último mês</option>
              <option value="custom">Período personalizado</option>
            </select>

            {/* Data inicial (apenas se período personalizado) */}
            {filters.dateRange === 'custom' && (
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}

            {/* Data final (apenas se período personalizado) */}
            {filters.dateRange === 'custom' && (
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de movimentações */}
      <Card>
        <CardHeader>
          <CardTitle>
            Movimentações ({filteredMovements.length} 
            {Object.values(filters).some(v => v && v !== 'all') ? ` de ${ppeMovements.length}` : ''})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Data</th>
                  <th className="text-left p-3">Tipo</th>
                  <th className="text-left p-3">Colaborador</th>
                  <th className="text-left p-3">EPI</th>
                  <th className="text-left p-3">Qtd</th>
                  <th className="text-left p-3">Motivo</th>
                  <th className="text-left p-3">Responsável</th>
                  <th className="text-left p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map((movement) => (
                  <tr key={movement.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(movement.date).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getMovementTypeIcon(movement.type)}
                        <Badge color={getMovementTypeColor(movement.type)}>
                          {getMovementTypeLabel(movement.type)}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-gray-400" />
                        {getEmployeeName(movement.employeeId)}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-2 text-gray-400" />
                        {getPPEType(movement.ppeItemId)}
                      </div>
                    </td>
                    <td className="p-3 font-medium">{movement.quantity}</td>
                    <td className="p-3 text-gray-600">
                      {movement.reason || 'Não informado'}
                    </td>
                    <td className="p-3">
                      {getEmployeeName(movement.responsibleId)}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openModal(movement)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openModal(movement)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(movement.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredMovements.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <RefreshCw className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma movimentação encontrada com os filtros aplicados.</p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalhes/criação */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedMovement ? 'Detalhes da Movimentação' : 'Nova Movimentação'}
              </h3>
              <Button variant="ghost" size="sm" onClick={closeModal}>
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              {selectedMovement ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Data</label>
                      <p className="mt-1">{new Date(selectedMovement.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tipo</label>
                      <div className="flex items-center gap-2 mt-1">
                        {getMovementTypeIcon(selectedMovement.type)}
                        <span>{getMovementTypeLabel(selectedMovement.type)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Colaborador</label>
                    <p className="mt-1">{getEmployeeName(selectedMovement.employeeId)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">EPI</label>
                    <p className="mt-1">{getPPEType(selectedMovement.ppeItemId)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quantidade</label>
                      <p className="mt-1 font-medium">{selectedMovement.quantity}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Responsável</label>
                      <p className="mt-1">{getEmployeeName(selectedMovement.responsibleId)}</p>
                    </div>
                  </div>

                  {selectedMovement.reason && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Motivo</label>
                      <p className="mt-1">{selectedMovement.reason}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-600">Formulário de criação de nova movimentação será implementado aqui.</p>
              )}
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={closeModal} className="flex-1">
                Fechar
              </Button>
              {selectedMovement && (
                <Button onClick={() => openModal(selectedMovement)} className="flex-1">
                  Editar
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Movimentações;
