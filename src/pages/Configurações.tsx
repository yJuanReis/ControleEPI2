import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import {
  Settings,
  Users,
  Shield,
  Bell,
  Database,
  Mail,
  Trash2,
  Plus,
  Edit,
  Save,
  X
} from 'lucide-react';

interface WhitelistUser {
  id: string;
  email: string;
  name: string;
  addedDate: string;
  addedBy: string;
  status: 'active' | 'inactive';
}

interface NotificationSettings {
  emailNotifications: boolean;
  lowStockAlerts: boolean;
  expirationAlerts: boolean;
  inspectionReminders: boolean;
  movementNotifications: boolean;
}

interface SystemSettings {
  companyName: string;
  authorizedDomain: string;
  minimumStockThreshold: number;
  expirationWarningDays: number;
  inspectionIntervalDays: number;
}

const Configurações: React.FC = () => {
  const { user, logout } = useAuth();
  
  // Estados para gerenciar as configurações
  const [activeTab, setActiveTab] = useState<'general' | 'whitelist' | 'notifications' | 'system'>('general');
  const [isEditing, setIsEditing] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');

  // Mock data - em produção virá do Firestore
  const [whitelistUsers, setWhitelistUsers] = useState<WhitelistUser[]>([
    {
      id: '1',
      email: 'consultor@empresa-externa.com',
      name: 'João Consultor',
      addedDate: '2025-01-15',
      addedBy: 'admin@empresa.com.br',
      status: 'active'
    },
    {
      id: '2',
      email: 'terceirizado@fornecedor.com',
      name: 'Maria Silva',
      addedDate: '2025-02-20',
      addedBy: 'admin@empresa.com.br',
      status: 'active'
    }
  ]);

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    lowStockAlerts: true,
    expirationAlerts: true,
    inspectionReminders: true,
    movementNotifications: false
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    companyName: 'Empresa Exemplo Ltda',
    authorizedDomain: '@empresa.com.br',
    minimumStockThreshold: 10,
    expirationWarningDays: 30,
    inspectionIntervalDays: 90
  });

  // Funções para gerenciar whitelist
  const handleAddUser = () => {
    if (newUserEmail && newUserName) {
      const newUser: WhitelistUser = {
        id: Date.now().toString(),
        email: newUserEmail,
        name: newUserName,
        addedDate: new Date().toISOString().split('T')[0],
        addedBy: user?.email || 'admin',
        status: 'active'
      };
      setWhitelistUsers([...whitelistUsers, newUser]);
      setNewUserEmail('');
      setNewUserName('');
    }
  };

  const handleRemoveUser = (id: string) => {
    setWhitelistUsers(whitelistUsers.filter(user => user.id !== id));
  };

  const handleToggleUserStatus = (id: string) => {
    setWhitelistUsers(whitelistUsers.map(user => 
      user.id === id 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  // Funções para salvar configurações
  const handleSaveNotifications = () => {
    // Em produção, salvar no Firestore
    console.log('Salvando configurações de notificação:', notificationSettings);
    setIsEditing(false);
  };

  const handleSaveSystemSettings = () => {
    // Em produção, salvar no Firestore
    console.log('Salvando configurações do sistema:', systemSettings);
    setIsEditing(false);
  };

  const tabs = [
    { id: 'general' as const, label: 'Geral', icon: Settings },
    { id: 'whitelist' as const, label: 'Usuários Credenciados', icon: Users },
    { id: 'notifications' as const, label: 'Notificações', icon: Bell },
    { id: 'system' as const, label: 'Sistema', icon: Database }
  ];

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-gray-600">
          Gerencie as configurações do sistema <strong>Controle de EPI</strong> e os usuários autorizados.
        </p>
      </div>

      {/* Navegação por abas */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Conteúdo das abas */}
      {activeTab === 'general' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Informações da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Nome</label>
                <p className="text-gray-900">{user?.displayName || 'Não informado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">E-mail</label>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Último acesso</label>
                <p className="text-gray-900">{user?.metadata.lastSignInTime}</p>
              </div>
              <Button variant="outline" onClick={logout} className="w-full">
                Sair da conta
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Estatísticas do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Usuários credenciados:</span>
                <span className="font-medium">{whitelistUsers.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Usuários ativos:</span>
                <span className="font-medium">
                  {whitelistUsers.filter(u => u.status === 'active').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Domínio autorizado:</span>
                <span className="font-medium">{systemSettings.authorizedDomain}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'whitelist' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Adicionar Usuário Credenciado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="usuario@empresa.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome do usuário"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddUser} disabled={!newUserEmail || !newUserName}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usuários Credenciados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Nome</th>
                      <th className="text-left p-2">E-mail</th>
                      <th className="text-left p-2">Data de Adição</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {whitelistUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100">
                        <td className="p-2">{user.name}</td>
                        <td className="p-2">{user.email}</td>
                        <td className="p-2">{new Date(user.addedDate).toLocaleDateString('pt-BR')}</td>
                        <td className="p-2">
                          <Badge
                            color={user.status === 'active' ? 'green' : 'gray'}
                            className="cursor-pointer"
                            onClick={() => handleToggleUserStatus(user.id)}
                          >
                            {user.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleUserStatus(user.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveUser(user.id)}
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
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'notifications' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Configurações de Notificações
            </CardTitle>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={handleSaveNotifications}>
                    <Save className="h-4 w-4 mr-1" />
                    Salvar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(notificationSettings).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">
                    {key === 'emailNotifications' && 'Notificações por E-mail'}
                    {key === 'lowStockAlerts' && 'Alertas de Estoque Baixo'}
                    {key === 'expirationAlerts' && 'Alertas de Vencimento'}
                    {key === 'inspectionReminders' && 'Lembretes de Inspeção'}
                    {key === 'movementNotifications' && 'Notificações de Movimentação'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {key === 'emailNotifications' && 'Receber notificações por e-mail'}
                    {key === 'lowStockAlerts' && 'Alertas quando o estoque estiver baixo'}
                    {key === 'expirationAlerts' && 'Alertas para EPIs próximos do vencimento'}
                    {key === 'inspectionReminders' && 'Lembretes para inspeções pendentes'}
                    {key === 'movementNotifications' && 'Notificações de entrega e devolução'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={value}
                  disabled={!isEditing}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    [key]: e.target.checked
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === 'system' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Configurações do Sistema
            </CardTitle>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={handleSaveSystemSettings}>
                    <Save className="h-4 w-4 mr-1" />
                    Salvar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  value={systemSettings.companyName}
                  disabled={!isEditing}
                  onChange={(e) => setSystemSettings({
                    ...systemSettings,
                    companyName: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domínio Autorizado
                </label>
                <input
                  type="text"
                  value={systemSettings.authorizedDomain}
                  disabled={!isEditing}
                  onChange={(e) => setSystemSettings({
                    ...systemSettings,
                    authorizedDomain: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Limite Mínimo de Estoque
                </label>
                <input
                  type="number"
                  value={systemSettings.minimumStockThreshold}
                  disabled={!isEditing}
                  onChange={(e) => setSystemSettings({
                    ...systemSettings,
                    minimumStockThreshold: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dias de Aviso para Vencimento
                </label>
                <input
                  type="number"
                  value={systemSettings.expirationWarningDays}
                  disabled={!isEditing}
                  onChange={(e) => setSystemSettings({
                    ...systemSettings,
                    expirationWarningDays: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Intervalo de Inspeção (dias)
                </label>
                <input
                  type="number"
                  value={systemSettings.inspectionIntervalDays}
                  disabled={!isEditing}
                  onChange={(e) => setSystemSettings({
                    ...systemSettings,
                    inspectionIntervalDays: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Configurações;
