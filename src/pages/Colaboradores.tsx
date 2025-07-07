import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { employees, Employee, ppeCatalog, ppeMovements } from '@/data/mockData';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  UserCheck,
  UserX,
  Eye,
  HardHat,
  Calendar,
  Building,
  Mail,
  Phone,
  FileText,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface FilterState {
  search: string;
  department: string;
  status: 'all' | 'active' | 'inactive';
  sortBy: 'name' | 'department' | 'hireDate' | 'position';
  sortOrder: 'asc' | 'desc';
}

interface EmployeePPEStatus {
  employeeId: string;
  totalAssigned: number;
  recentMovements: number;
  expiringSoon: number;
  complianceStatus: 'compliant' | 'warning' | 'critical';
}

const Colaboradores: React.FC = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'details' | 'ppe'>('details');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    department: '',
    status: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Calcular status de EPI por colaborador
  const employeePPEStatus = useMemo(() => {
    const statusMap: Record<string, EmployeePPEStatus> = {};
    
    employees.forEach(employee => {
      const employeeMovements = ppeMovements.filter(m => m.employeeId === employee.id);
      const recentMovements = employeeMovements.filter(m => {
        const movementDate = new Date(m.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return movementDate >= thirtyDaysAgo;
      }).length;

      // Simular EPIs vencendo (em produção seria calculado com base nos dados reais)
      const expiringSoon = Math.floor(Math.random() * 3);
      const totalAssigned = employeeMovements.filter(m => m.type === 'delivery').length;
      
      let complianceStatus: 'compliant' | 'warning' | 'critical' = 'compliant';
      if (expiringSoon > 1) complianceStatus = 'critical';
      else if (expiringSoon > 0 || recentMovements === 0) complianceStatus = 'warning';

      statusMap[employee.id] = {
        employeeId: employee.id,
        totalAssigned,
        recentMovements,
        expiringSoon,
        complianceStatus
      };
    });

    return statusMap;
  }, []);

  // Obter departamentos únicos
  const departments = useMemo(() => {
    return Array.from(new Set(employees.map(emp => emp.department))).sort();
  }, []);

  // Dados filtrados e ordenados
  const filteredEmployees = useMemo(() => {
    let filtered = employees.filter(employee => {
      // Filtro de busca
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!employee.name.toLowerCase().includes(searchLower) &&
            !employee.email.toLowerCase().includes(searchLower) &&
            !employee.position.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Filtro de departamento
      if (filters.department && employee.department !== filters.department) {
        return false;
      }

      // Filtro de status
      if (filters.status !== 'all' && employee.status !== filters.status) {
        return false;
      }

      return true;
    });

    // Ordenação
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'department':
          comparison = a.department.localeCompare(b.department);
          break;
        case 'position':
          comparison = a.position.localeCompare(b.position);
          break;
        case 'hireDate':
          comparison = new Date(a.hireDate).getTime() - new Date(b.hireDate).getTime();
          break;
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [filters]);

  // Estatísticas dos colaboradores
  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(emp => emp.status === 'active').length;
    const compliant = Object.values(employeePPEStatus).filter(s => s.complianceStatus === 'compliant').length;
    const critical = Object.values(employeePPEStatus).filter(s => s.complianceStatus === 'critical').length;

    return { total, active, compliant, critical };
  }, [employeePPEStatus]);

  const openModal = (employee?: Employee) => {
    setSelectedEmployee(employee || null);
    setIsEditing(!!employee);
    setViewMode('details');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedEmployee(null);
    setIsEditing(false);
    setIsModalOpen(false);
  };

  const handleToggleStatus = (employeeId: string) => {
    // Em produção, atualizar status no Firestore
    console.log('Alterando status do colaborador:', employeeId);
  };

  const handleDelete = (employeeId: string) => {
    if (confirm('Tem certeza que deseja excluir este colaborador?')) {
      // Em produção, fazer delete no Firestore
      console.log('Excluindo colaborador:', employeeId);
    }
  };

  const getEmployeeMovements = (employeeId: string) => {
    return ppeMovements.filter(m => m.employeeId === employeeId);
  };

  const getComplianceIcon = (status: 'compliant' | 'warning' | 'critical') => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Colaboradores</h1>
          <p className="text-gray-600">
            Gerencie os colaboradores da empresa e acompanhe a distribuição de EPIs.
          </p>
        </div>
        <Button onClick={() => openModal()} className="md:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Colaborador
        </Button>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <UserCheck className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Ativos</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Em Conformidade</p>
              <p className="text-2xl font-bold text-green-600">{stats.compliant}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Situação Crítica</p>
              <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e busca */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-5">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por nome, e-mail ou cargo..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtro de departamento */}
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os departamentos</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {/* Filtro de status */}
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as FilterState['status'] })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>

            {/* Ordenação */}
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Ordenar por nome</option>
              <option value="department">Ordenar por departamento</option>
              <option value="position">Ordenar por cargo</option>
              <option value="hireDate">Ordenar por admissão</option>
            </select>

            {/* Direção da ordenação */}
            <select
              value={filters.sortOrder}
              onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value as FilterState['sortOrder'] })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="asc">Crescente</option>
              <option value="desc">Decrescente</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de colaboradores */}
      <Card>
        <CardHeader>
          <CardTitle>
            Colaboradores Cadastrados ({filteredEmployees.length} 
            {filters.search || filters.department || filters.status !== 'all' ? ` de ${employees.length}` : ''})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">Departamento</th>
                  <th className="text-left p-3">Cargo</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">EPIs</th>
                  <th className="text-left p-3">Conformidade</th>
                  <th className="text-left p-3">Admissão</th>
                  <th className="text-left p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => {
                  const ppeStatus = employeePPEStatus[employee.id];
                  
                  return (
                    <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-gray-600 text-xs">{employee.email}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-1 text-gray-400" />
                          {employee.department}
                        </div>
                      </td>
                      <td className="p-3">{employee.position}</td>
                      <td className="p-3">
                        <Badge
                          color={employee.status === 'active' ? 'green' : 'gray'}
                          className="cursor-pointer"
                          onClick={() => handleToggleStatus(employee.id)}
                        >
                          {employee.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <HardHat className="h-4 w-4 text-gray-400" />
                          <span>{ppeStatus?.totalAssigned || 0}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {getComplianceIcon(ppeStatus?.complianceStatus || 'compliant')}
                          <span className="text-xs">
                            {ppeStatus?.complianceStatus === 'compliant' && 'Conforme'}
                            {ppeStatus?.complianceStatus === 'warning' && 'Atenção'}
                            {ppeStatus?.complianceStatus === 'critical' && 'Crítico'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          {new Date(employee.hireDate).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openModal(employee)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openModal(employee)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(employee.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredEmployees.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum colaborador encontrado com os filtros aplicados.</p>
                <Button variant="outline" className="mt-4" onClick={() => setFilters({
                  search: '',
                  department: '',
                  status: 'all',
                  sortBy: 'name',
                  sortOrder: 'asc'
                })}>
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalhes/edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedEmployee ? 'Detalhes do Colaborador' : 'Novo Colaborador'}
              </h3>
              <Button variant="ghost" size="sm" onClick={closeModal}>
                ×
              </Button>
            </div>

            {/* Navegação do modal */}
            {selectedEmployee && (
              <div className="flex gap-2 mb-6 border-b">
                <button
                  onClick={() => setViewMode('details')}
                  className={`pb-2 px-4 border-b-2 transition-colors ${
                    viewMode === 'details'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600'
                  }`}
                >
                  Dados Pessoais
                </button>
                <button
                  onClick={() => setViewMode('ppe')}
                  className={`pb-2 px-4 border-b-2 transition-colors ${
                    viewMode === 'ppe'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600'
                  }`}
                >
                  EPIs e Movimentações
                </button>
              </div>
            )}
            
            <div className="space-y-4">
              {selectedEmployee && viewMode === 'details' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nome</label>
                      <p className="mt-1 font-medium">{selectedEmployee.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <Badge color={selectedEmployee.status === 'active' ? 'green' : 'gray'} className="mt-1">
                        {selectedEmployee.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">E-mail</label>
                    <div className="flex items-center mt-1">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <p>{selectedEmployee.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Departamento</label>
                      <div className="flex items-center mt-1">
                        <Building className="h-4 w-4 mr-2 text-gray-400" />
                        <p>{selectedEmployee.department}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Cargo</label>
                      <p className="mt-1">{selectedEmployee.position}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data de Admissão</label>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <p>{new Date(selectedEmployee.hireDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Resumo de EPIs</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">EPIs Atribuídos</p>
                        <p className="font-bold text-lg">{employeePPEStatus[selectedEmployee.id]?.totalAssigned || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Movimentações (30d)</p>
                        <p className="font-bold text-lg">{employeePPEStatus[selectedEmployee.id]?.recentMovements || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">EPIs Vencendo</p>
                        <p className="font-bold text-lg text-orange-600">{employeePPEStatus[selectedEmployee.id]?.expiringSoon || 0}</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : selectedEmployee && viewMode === 'ppe' ? (
                <>
                  <h4 className="font-medium">Histórico de Movimentações</h4>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Data</th>
                          <th className="text-left p-2">Tipo</th>
                          <th className="text-left p-2">EPI</th>
                          <th className="text-left p-2">Qtd</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getEmployeeMovements(selectedEmployee.id).map((movement) => {
                          const ppeItem = ppeCatalog.find(p => p.id === movement.ppeItemId);
                          return (
                            <tr key={movement.id} className="border-b border-gray-100">
                              <td className="p-2">{new Date(movement.date).toLocaleDateString('pt-BR')}</td>
                              <td className="p-2">
                                <Badge
                                  color={
                                    movement.type === 'delivery' ? 'blue' :
                                    movement.type === 'return' ? 'green' :
                                    movement.type === 'replacement' ? 'orange' : 'red'
                                  }
                                >
                                  {movement.type === 'delivery' && 'Entrega'}
                                  {movement.type === 'return' && 'Devolução'}
                                  {movement.type === 'replacement' && 'Substituição'}
                                  {movement.type === 'discard' && 'Descarte'}
                                </Badge>
                              </td>
                              <td className="p-2">{ppeItem?.type || 'EPI não encontrado'}</td>
                              <td className="p-2">{movement.quantity}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    
                    {getEmployeeMovements(selectedEmployee.id).length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p>Nenhuma movimentação registrada.</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-gray-600">Formulário de criação de novo colaborador será implementado aqui.</p>
              )}
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={closeModal} className="flex-1">
                Fechar
              </Button>
              {selectedEmployee && (
                <Button onClick={() => openModal(selectedEmployee)} className="flex-1">
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

export default Colaboradores;
