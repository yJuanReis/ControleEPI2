import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ppeCatalog, PPEItem } from '@/data/mockData';
import {
  Search,
  Filter,
  HardHat,
  Package,
  Plus,
  Edit,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface FilterState {
  search: string;
  stockStatus: 'all' | 'critical' | 'low' | 'normal';
  sortBy: 'type' | 'stock' | 'expiration';
  sortOrder: 'asc' | 'desc';
}

const Estoque: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    stockStatus: 'all',
    sortBy: 'type',
    sortOrder: 'asc'
  });

  /** ---------- FUNÇÕES AUXILIARES ---------- **/
  const getStockStatus = (item: PPEItem) => {
    const ratio = item.currentStock / item.minimumStock;
    if (ratio < 0.5) return { status: 'critical', color: 'red', label: 'Crítico' };
    if (ratio < 1) return { status: 'low', color: 'orange', label: 'Baixo' };
    return { status: 'normal', color: 'green', label: 'Normal' };
  };

  const getExpirationStatus = (expirationDate?: string) => {
    if (!expirationDate) return 'N/A';
    const diffDays =
      (new Date(expirationDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24);
    if (diffDays < 0) return 'Vencido';
    if (diffDays <= 30) return 'Vence em breve';
    return 'Válido';
  };

  /** ---------- FILTRO E ORDENAÇÃO ---------- **/
  const filteredItems = useMemo(() => {
    let data = [...ppeCatalog];

    /* Filtro de busca */
    if (filters.search) {
      const s = filters.search.toLowerCase();
      data = data.filter(
        i =>
          i.type.toLowerCase().includes(s) ||
          i.brand.toLowerCase().includes(s) ||
          i.model.toLowerCase().includes(s)
      );
    }

    /* Filtro de status de estoque */
    if (filters.stockStatus !== 'all') {
      data = data.filter(i => getStockStatus(i).status === filters.stockStatus);
    }

    /* Ordenação */
    data.sort((a, b) => {
      let comp = 0;
      switch (filters.sortBy) {
        case 'type':
          comp = a.type.localeCompare(b.type);
          break;
        case 'stock':
          comp = a.currentStock - b.currentStock;
          break;
        case 'expiration':
          comp =
            (a.expirationDate ? new Date(a.expirationDate).getTime() : 0) -
            (b.expirationDate ? new Date(b.expirationDate).getTime() : 0);
          break;
      }
      return filters.sortOrder === 'asc' ? comp : -comp;
    });

    return data;
  }, [filters]);

  /** ---------- HANDLERS ---------- **/
  const handleDelete = (id: string) => {
    if (confirm('Confirmar exclusão do item?')) {
      console.log('Excluir item', id);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Título */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Controle de Estoque</h1>
          <p className="text-gray-600">
            Visualize o nível de estoque dos EPIs e gerencie reposições.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Registrar Entrada
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar EPI..."
                className="pl-10 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                value={filters.search}
                onChange={e => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            {/* Status */}
            <select
              className="px-3 py-2 border rounded-md"
              value={filters.stockStatus}
              onChange={e =>
                setFilters({ ...filters, stockStatus: e.target.value as FilterState['stockStatus'] })
              }
            >
              <option value="all">Todos os status</option>
              <option value="critical">Crítico (&lt;50%)</option>
              <option value="low">Baixo (&lt;100%)</option>
              <option value="normal">Normal</option>
            </select>

            {/* Ordenar por */}
            <select
              className="px-3 py-2 border rounded-md"
              value={filters.sortBy}
              onChange={e =>
                setFilters({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })
              }
            >
              <option value="type">Ordenar por tipo</option>
              <option value="stock">Ordenar por estoque</option>
              <option value="expiration">Ordenar por vencimento</option>
            </select>

            {/* Direção */}
            <select
              className="px-3 py-2 border rounded-md"
              value={filters.sortOrder}
              onChange={e =>
                setFilters({ ...filters, sortOrder: e.target.value as FilterState['sortOrder'] })
              }
            >
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Resumo rápido */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <HardHat className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Itens Totais</p>
              <p className="text-2xl font-bold">{ppeCatalog.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Críticos</p>
              <p className="text-2xl font-bold text-red-600">
                {ppeCatalog.filter(i => getStockStatus(i).status === 'critical').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Package className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Baixos</p>
              <p className="text-2xl font-bold text-orange-600">
                {ppeCatalog.filter(i => getStockStatus(i).status === 'low').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de estoque */}
      <Card>
        <CardHeader>
          <CardTitle>
            EPIs em Estoque ({filteredItems.length}
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
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Vencimento</th>
                  <th className="text-left p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => {
                  const stock = getStockStatus(item);
                  const exp = getExpirationStatus(item.expirationDate);
                  return (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{item.type}</td>
                      <td className="p-3">
                        <div className="font-medium">{item.brand}</div>
                        <div className="text-xs text-gray-600">{item.model}</div>
                      </td>
                      <td className="p-3">
                        {item.currentStock}/{item.minimumStock}
                      </td>
                      <td className="p-3">
                        <Badge color={stock.color}>{stock.label}</Badge>
                      </td>
                      <td className="p-3">{exp}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
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
              <div className="text-center py-6 text-gray-500">
                <Package className="h-10 w-10 mx-auto mb-2" />
                Nenhum item encontrado.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Estoque;
