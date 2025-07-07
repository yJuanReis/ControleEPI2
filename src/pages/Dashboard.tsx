import React, { useState, useMemo } from 'react';
import {
  Users,
  HardHat,
  AlertTriangle,
  RefreshCw,
  PercentCircle
} from 'lucide-react';
import { StatsCard } from '../components/Dashboard/StatsCard';
import {
  dashboardStats,
  ppeCatalog,
  employees,
  ppeMovements
} from '../data/mockData';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../components/ui/card';
import { DataTable } from '../components/ui/DataTable';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, subMonths, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

const MOVEMENT_COLORS = {
  delivery: '#3498db',
  return: '#2ecc71',
  replacement: '#f39c12',
  discard: '#e74c3c'
} as const;

const MOVEMENT_LABELS = {
  delivery: 'Entrega',
  return: 'Devolução',
  replacement: 'Substituição',
  discard: 'Descarte'
} as const;

const Dashboard: React.FC = () => {
  /* -------------------------------------------------------- */
  /* ESTADO DE PERÍODO E MOVIMENTAÇÃO SELECIONADA             */
  /* -------------------------------------------------------- */
  const [timeFrame, setTimeFrame] = useState<'1month' | '3months' | '12months'>('3months');
  const [selectedMovementType, setSelectedMovementType] = useState<string | null>(null);

  /* -------------------------------------------------------- */
  /* FILTRA MOVIMENTAÇÕES PELO PERÍODO ESCOLHIDO              */
  /* -------------------------------------------------------- */
  const movementData = useMemo(() => {
    const now = new Date();
    const startDate =
      timeFrame === '1month'
        ? subMonths(now, 1)
        : timeFrame === '3months'
        ? subMonths(now, 3)
        : subMonths(now, 12); // 12 meses = 1 ano

    return ppeMovements.filter(mov => parseISO(mov.date) >= startDate);
  }, [timeFrame]);

  /* -------------------------------------------------------- */
  /* PREPARA DADOS MENSAIS PARA O GRÁFICO DE BARRAS           */
  /* -------------------------------------------------------- */
  const monthlyMovementData = useMemo(() => {
    const now = new Date();
    const months =
      timeFrame === '1month' ? 1 : timeFrame === '3months' ? 3 : 12;

    // cria array com cada mês no intervalo
    const data = [...Array(months)].map((_, i) => {
      const date = subMonths(now, months - i - 1);
      return {
        month: format(date, 'MMM', { locale: ptBR }),
        delivery: 0,
        return: 0,
        replacement: 0,
        discard: 0
      };
    });

    // agrega movimentações
    movementData.forEach(mov => {
      const d = parseISO(mov.date);
      const key = format(d, 'MMM', { locale: ptBR });
      const target = data.find(m => m.month === key);
      if (target && mov.type in target) {
        (target as any)[mov.type] += 1;
      }
    });

    return data;
  }, [movementData, timeFrame]);

  /* -------------------------------------------------------- */
  /* PREPARA DADOS PARA O GRÁFICO DE PIZZA                    */
  /* -------------------------------------------------------- */
  const pieChartData = useMemo(() => {
    const counts = { delivery: 0, return: 0, replacement: 0, discard: 0 };
    movementData.forEach(mov => {
      if (mov.type in counts) {
        (counts as any)[mov.type] += 1;
      }
    });
    return (Object.keys(counts) as Array<keyof typeof counts>).map(k => ({
      name: MOVEMENT_LABELS[k],
      value: counts[k],
      type: k
    }));
  }, [movementData]);

  /* -------------------------------------------------------- */
  /* ÚLTIMAS MOVIMENTAÇÕES (FILTRADAS SE NECESSÁRIO)          */
  /* -------------------------------------------------------- */
  const recentMovements = useMemo(() => {
    const list = selectedMovementType
      ? movementData.filter(m => m.type === selectedMovementType)
      : movementData;
    return list.slice(0, 5);
  }, [movementData, selectedMovementType]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* TÍTULO E DESCRIÇÃO */}
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao <strong>Controle de EPI</strong>. Acompanhe abaixo os principais indicadores do sistema.
        </p>
      </div>

      {/* CARDS DE INDICADORES */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="Total de Colaboradores"
          value={dashboardStats.totalEmployees}
          icon={<Users className="h-5 w-5 text-safety-blue" />}
          className="bg-safety-blue/5 border-safety-blue/20"
          valueClassName="text-safety-blue"
        />
        <StatsCard
          title="Total de Itens em Estoque"
          value={dashboardStats.totalPPEItems}
          icon={<HardHat className="h-5 w-5 text-safety-orange" />}
          className="bg-safety-orange/5 border-safety-orange/20"
          valueClassName="text-safety-orange"
        />
        <StatsCard
          title="EPIs Próximos do Vencimento"
          value={dashboardStats.expiringPPECount}
          icon={<AlertTriangle className="h-5 w-5 text-safety-red" />}
          className="bg-safety-red/5 border-safety-red/20"
          valueClassName="text-safety-red"
        />
        <StatsCard
          title="Movimentações do Mês"
          value={dashboardStats.movementsMonth}
          icon={<RefreshCw className="h-5 w-5 text-safety-green" />}
          className="bg-safety-green/5 border-safety-green/20"
          valueClassName="text-safety-green"
        />
        <StatsCard
          title="Taxa de Conformidade"
          value={`${dashboardStats.complianceRate}%`}
          icon={<PercentCircle className="h-5 w-5 text-safety-blue" />}
          className="bg-safety-blue/5 border-safety-blue/20"
          valueClassName="text-safety-blue"
        />
      </div>

      {/* GRÁFICOS DE MOVIMENTAÇÃO */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Análise de Movimentações</h2>
          <div className="flex items-center gap-2">
            <Button
              variant={timeFrame === '1month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeFrame('1month')}
            >
              1 Mês
            </Button>
            <Button
              variant={timeFrame === '3months' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeFrame('3months')}
            >
              3 Meses
            </Button>
            <Button
              variant={timeFrame === '12months' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeFrame('12months')}
            >
              1 Ano
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* GRÁFICO DE BARRAS */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl">Movimentações por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyMovementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(v, n) => [
                        v,
                        MOVEMENT_LABELS[n as keyof typeof MOVEMENT_LABELS]
                      ]}
                    />
                    <Legend
                      formatter={v => MOVEMENT_LABELS[v as keyof typeof MOVEMENT_LABELS]}
                    />
                    <Bar
                      dataKey="delivery"
                      fill={MOVEMENT_COLORS.delivery}
                      name="delivery"
                    />
                    <Bar
                      dataKey="return"
                      fill={MOVEMENT_COLORS.return}
                      name="return"
                    />
                    <Bar
                      dataKey="replacement"
                      fill={MOVEMENT_COLORS.replacement}
                      name="replacement"
                    />
                    <Bar
                      dataKey="discard"
                      fill={MOVEMENT_COLORS.discard}
                      name="discard"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* GRÁFICO DE PIZZA */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Tipos de Movimentação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      onClick={(d: any) =>
                        setSelectedMovementType(
                          selectedMovementType === d.type ? null : d.type
                        )
                      }
                    >
                      {pieChartData.map((entry) => (
                        <Cell
                          key={entry.type}
                          fill={MOVEMENT_COLORS[entry.type as keyof typeof MOVEMENT_COLORS]}
                          stroke={selectedMovementType === entry.type ? '#000' : undefined}
                          strokeWidth={selectedMovementType === entry.type ? 2 : 0}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => [`${v} movimentações`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* LEGENDA COM BADGES */}
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  {pieChartData.map((entry) => (
                    <Badge
                      key={entry.type}
                      variant={selectedMovementType === entry.type ? 'default' : 'outline'}
                      className="cursor-pointer flex items-center gap-1.5"
                      style={{
                        borderColor: MOVEMENT_COLORS[entry.type as keyof typeof MOVEMENT_COLORS],
                        color:
                          selectedMovementType === entry.type
                            ? 'white'
                            : MOVEMENT_COLORS[entry.type as keyof typeof MOVEMENT_COLORS],
                        backgroundColor:
                          selectedMovementType === entry.type
                            ? MOVEMENT_COLORS[entry.type as keyof typeof MOVEMENT_COLORS]
                            : 'transparent'
                      }}
                      onClick={() =>
                        setSelectedMovementType(
                          selectedMovementType === entry.type ? null : entry.type
                        )
                      }
                    >
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            MOVEMENT_COLORS[entry.type as keyof typeof MOVEMENT_COLORS]
                        }}
                      />
                      {entry.name} ({entry.value})
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* TABELAS: EPIS CRÍTICOS E MOVIMENTAÇÕES RECENTES */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* EPIs COM BAIXO ESTOQUE */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">EPIs com Baixo Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={ppeCatalog.filter(i => i.currentStock < i.minimumStock)}
              columns={[
                { key: 'type', header: 'Tipo' },
                { key: 'currentStock', header: 'Estoque Atual' },
                { key: 'minimumStock', header: 'Estoque Mínimo' },
                {
                  key: 'status',
                  header: 'Status',
                  render: () => (
                    <div className="flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full bg-safety-red mr-2" />
                      <span className="text-safety-red-dark">Crítico</span>
                    </div>
                  )
                }
              ]}
            />
          </CardContent>
        </Card>

        {/* ÚLTIMAS MOVIMENTAÇÕES */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl">
              {selectedMovementType
                ? `${MOVEMENT_LABELS[selectedMovementType as keyof typeof MOVEMENT_LABELS]} Recentes`
                : 'Últimas Movimentações'}
            </CardTitle>
            {selectedMovementType && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedMovementType(null)}>
                Limpar filtro
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <DataTable
              data={recentMovements}
              columns={[
                {
                  key: 'type',
                  header: 'Tipo',
                  render: (item: any) => {
                    const color = MOVEMENT_COLORS[item.type as keyof typeof MOVEMENT_COLORS];
                    return (
                      <div className="flex items-center">
                        <span
                          className="inline-block w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: color }}
                        />
                        {MOVEMENT_LABELS[item.type as keyof typeof MOVEMENT_LABELS]}
                      </div>
                    );
                  }
                },
                {
                  key: 'date',
                  header: 'Data',
                  render: (item: any) => new Date(item.date).toLocaleDateString('pt-BR')
                },
                {
                  key: 'employeeId',
                  header: 'Colaborador',
                  render: (item: any) => {
                    const emp = employees.find(e => e.id === item.employeeId);
                    return emp ? emp.name : item.employeeId;
                  }
                }
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
