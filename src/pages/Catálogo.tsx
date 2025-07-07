import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ppeCatalog, PPEItem } from '@/data/mockData';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  CheckCircle,
  Eye,
  Calendar,
  DollarSign,
  Hash
} from 'lucide-react';

interface FilterState {
  search: string;
  stockStatus: 'all' | 'low' | 'normal' | 'critical';
  sortBy: 'type' | 'stock' | 'price' | 'expiration';
  sortOrder: 'asc' | 'desc';
}

const Catálogo: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<PPEItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    stockStatus: 'all',
    sortBy: 'type',
    sortOrder: 'asc'
  });

  // Dados filtrados e ordenados
  const filteredItems = useMemo(() => {
    let filtered = ppeCatalog.filter(item => {
      // Filtro de busca
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!item.type.toLowerCase().includes(searchLower) &&
            !item.brand.toLowerCase().includes(searchLower) &&
            !item.model.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Filtro de status do estoque
      if (filters.stockStatus !== 'all') {
        const stockRatio = item.currentStock / item.minimumStock;
        if (filters.stockStatus === 'critical' && stockRatio >= 0.5) return false;
        if (filters.stockStatus === 'low' && (stockRatio < 0.5 || stockRatio >= 1)) return false;
        if (filters.stockStatus === 'normal' && stockRatio < 1) return false;
      }

      return true;
    });

    // Ordenação
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'stock':
          comparison = a.currentStock - b.currentStock;
          break;
        case 'price':
          comparison = a.unitPrice - b.unitPrice;
          break;
        case 'expiration':
          const dateA = a.expirationDate ? new Date(a.expirationDate).getTime() : 0;
          const dateB = b.expirationDate ? new Date(b.expirationDate).getTime() : 0;
          comparison = dateA - dateB;
          break;
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [filters]);

  // Função para determinar status do estoque
  const getStockStatus = (item: PPEItem) => {
    const ratio = item.currentStock / item.minimumStock;
    if (ratio < 0.5) return { status: 'critical', color: 'red', label: 'Crítico' };
    if (ratio < 1) return { status: 'low', color: 'orange', label: 'Baixo' };
    return { status: 'normal', color: 'green', label: 'Normal' };
  };

  // Função para determinar status do vencimento
  const getExpirationStatus = (expirationDate?: string) => {
    if (!expirationDate) return { status: 'none', color: 'gray', label: 'N/A' };
    
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: 'expired', color: 'red', label: 'Vencido' };
    if (diffDays <= 30) return { status: 'expiring', color: 'orange', label: 'Vence em breve' };
    return { status: 'valid', color: 'green', label: 'Válido' };
  };

  const openModal = (item?: PPEItem) => {
    setSelectedItem(item || null);
    setIsEditing(!!item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setIsEditing(false);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este item do catálogo?')) {
      // Em produção, fazer delete no Firestore
      console.log('Excluindo item:', id);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Catálogo de EPIs</h1>
          <p className="text-gray-600">
            Gerencie o catálogo completo de Equipamentos de Proteção Individual da empresa.
          </p>
        </div>
        <Button onClick={() => openModal()} className="md:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo EPI
        </Button>
      </div>

      {/* Filtros e busca */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por tipo, marca ou modelo..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtro de status */}
            <select
              value={filters.stockStatus}
              onChange={(e) => setFilters({ ...filters, stockStatus: e.target.value as FilterState['stockStatus'] })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os status</option>
              <option value="critical">Estoque crítico</option>
              <option value="low">Estoque baixo</option>
              <option value="normal">Estoque normal</option>
            </select>

            {/* Ordenação */}
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="type">Ordenar por tipo</option>
              <option value="stock">Ordenar por estoque</option>
              <option value="price">Ordenar por preço</option>
              <option value="expiration">Ordenar por vencimento</option>
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

      {/* Estatísticas rápidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total de Itens</p>
              <p className="text-2xl font-bold">{ppeCatalog.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Estoque Crítico</p>
              <p className="text-2xl font-bold text-red-600">
                {ppeCatalog.filter(item => item.currentStock / item.minimumStock < 0.5).length}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Vencendo</p>
              <p className="text-2xl font-bold text-orange-600">
                {ppeCatalog.filter(item => {
                  if (!item.expirationDate) return false;
                  const diffDays = Math.ceil((new Date(item.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return diffDays <= 30 && diffDays > 0;
                }).length}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Em Conformidade</p>
              <p className="text-2xl font-bold text-green-600">
                {ppeCatalog.filter(item => {
                  const stockOk = item.currentStock >= item.minimumStock;
                  const expOk = !item.expirationDate || new Date(item.expirationDate) > new Date();
                  return stockOk && expOk;
                }).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de EPIs */}
      <Card>
        <CardHeader>
          <CardTitle>
            EPIs Cadastrados ({filteredItems.length} 
            {filters.search || filters.stockStatus !== 'all' ? ` de ${ppeCatalog.length}` : ''})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Tipo</th>
                  <th className="text-left p-3">Marca/Modelo</th>
                  <th className="text-left p-3">Estoque</th>
                  <th className="text-left p-3">Status Estoque</th>
                  <th className="text-left p-3">Vencimento</th>
                  <th className="text-left p-3">Preço Unit.</th>
                  <th className="text-left p-3">CA</th>
                  <th className="text-left p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const stockStatus = getStockStatus(item);
                  const expStatus = getExpirationStatus(item.expirationDate);
                  
                  return (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 font-medium">{item.type}</td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{item.brand}</div>
                          <div className="text-gray-600 text-xs">{item.model}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{item.currentStock}</div>
                          <div className="text-gray-600 text-xs">Min: {item.minimumStock}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge color={stockStatus.color}>
                          {stockStatus.label}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {item.expirationDate ? (
                          <div>
                            <div className="text-sm">{new Date(item.expirationDate).toLocaleDateString('pt-BR')}</div>
                            <Badge color={expStatus.color} className="text-xs">
                              {expStatus.label}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="p-3">
                        R$ {item.unitPrice.toFixed(2)}
                      </td>
                      <td className="p-3">
                        {item.ca || <span className="text-gray-400">N/A</span>}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openModal(item)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openModal(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
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
            
            {filteredItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum EPI encontrado com os filtros aplicados.</p>
                <Button variant="outline" className="mt-4" onClick={() => setFilters({
                  search: '',
                  stockStatus: 'all',
                  sortBy: 'type',
                  sortOrder: 'asc'
                })}>
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalhes/edição (placeholder) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedItem ? 'Detalhes do EPI' : 'Novo EPI'}
              </h3>
              <Button variant="ghost" size="sm" onClick={closeModal}>
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              {selectedItem ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                    <p className="mt-1">{selectedItem.type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Marca</label>
                    <p className="mt-1">{selectedItem.brand}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Modelo</label>
                    <p className="mt-1">{selectedItem.model}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Estoque Atual</label>
                      <p className="mt-1">{selectedItem.currentStock}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Estoque Mínimo</label>
                      <p className="mt-1">{selectedItem.minimumStock}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Preço Unitário</label>
                    <p className="mt-1">R$ {selectedItem.unitPrice.toFixed(2)}</p>
                  </div>
                  {selectedItem.expirationDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Vencimento</label>
                      <p className="mt-1">{new Date(selectedItem.expirationDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                  )}
                  {selectedItem.ca && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">CA</label>
                      <p className="mt-1">{selectedItem.ca}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-600">Formulário de criação de novo EPI será implementado aqui.</p>
              )}
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={closeModal} className="flex-1">
                Fechar
              </Button>
              {selectedItem && (
                <Button onClick={() => openModal(selectedItem)} className="flex-1">
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

export default Catálogo;
