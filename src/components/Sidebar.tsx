import { 
  Building2, 
  LayoutDashboard, 
  WalletCards, 
  TrendingUp, 
  Receipt, 
  Users, 
  Truck, 
  FileSpreadsheet, 
  DollarSign, 
  Settings, 
  LogOut,
  User,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onChangeTab: (tab: string) => void;
  onLogout: () => void;
  userEmail: string;
}

export default function Sidebar({ currentTab, onChangeTab, onLogout, userEmail }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'caixa', label: 'Fluxo de Caixa', icon: DollarSign },
    { id: 'contas-pagar', label: 'Contas a Pagar', icon: WalletCards },
    { id: 'receitas', label: 'Receitas', icon: TrendingUp },
    { id: 'holerites', label: 'Holerites / Folha', icon: Receipt },
    { id: 'funcionarios', label: 'Funcionários', icon: Users },
    { id: 'veiculos', label: 'Frota & Revisões', icon: Truck },
    { id: 'clientes', label: 'Contratos / Clientes', icon: Building2 },
    { id: 'relatorios', label: 'DRE & Relatórios', icon: FileSpreadsheet },
    { id: 'configuracoes', label: 'Convenção & Ajustes', icon: Settings },
  ];

  return (
    <aside className="w-68 bg-purple-950 text-white flex flex-col h-screen border-r border-purple-900 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-purple-900 flex items-center space-x-3">
        {/* Golden wing logo replacement in CSS */}
        <div className="relative w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-purple-950 text-xl shadow-md shrink-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-600 to-amber-300"></div>
          <span className="relative z-10">IB</span>
          <div className="absolute -top-3 -right-3 w-8 h-8 bg-purple-950 rotate-45 transform"></div>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-wide leading-tight">IBEC Express</span>
          <span className="text-[10px] text-amber-400 font-mono tracking-wider font-semibold">MOTOBOY & LOGÍSTICA</span>
        </div>
      </div>

      {/* User Card */}
      <div className="px-4 py-3 bg-purple-900/40 border-b border-purple-950 flex items-center space-x-2.5 text-xs">
        <div className="w-8 h-8 rounded-full bg-purple-800 flex items-center justify-center text-amber-400 font-bold border border-purple-650 shrink-0">
          <User className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-purple-200 truncate font-sans">Administração</p>
          <p className="text-[10px] text-purple-300 truncate font-mono" title={userEmail}>
            {userEmail}
          </p>
        </div>
        <div title="Autenticado via Supabase/Local" className="text-amber-400">
          <ShieldCheck className="w-4 h-4 shrink-0" />
        </div>
      </div>

      {/* Menu Navigation */}
      <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-900">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-amber-500 text-purple-950 font-bold shadow-md shadow-purple-950/20'
                  : 'text-purple-200 hover:bg-purple-900/60 hover:text-white'
              }`}
            >
              <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-purple-950' : 'text-amber-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Profile */}
      <div className="p-4 border-t border-purple-900">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-red-200 hover:bg-red-950/40 hover:text-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4 text-red-400 shrink-0" />
          <span>Sair do Sistema</span>
        </button>
        <p className="text-[9px] text-purple-400 text-center mt-3 font-mono">
          IBEC Express SP v2.6.2026
        </p>
      </div>
    </aside>
  );
}
