import { fmtMoeda } from '../lib/calculos';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  UsersRound, 
  TrendingUp, 
  Calculator 
} from 'lucide-react';

interface KPICardsProps {
  totalReceitas: number;
  totalDespesas: number;
  totalFolha: number;
  saldo: number;
  totalPendente: number;
  margem: number;
}

export default function KPICards({ 
  totalReceitas, 
  totalDespesas, 
  totalFolha, 
  saldo, 
  totalPendente,
  margem 
}: KPICardsProps) {
  
  const positiveMargem = margem >= 0;
  
  // Custom design configurations
  const kpis = [
    {
      title: 'Faturamento Recebido',
      value: fmtMoeda(totalReceitas),
      subtitle: 'Contratos e fretes liquidados',
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      badge: { text: '+12%', type: 'up' }
    },
    {
      title: 'Despesas Operacionais',
      value: fmtMoeda(totalDespesas),
      subtitle: 'Contas c/ status PAGO (excl. folha)',
      icon: ArrowDownRight,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
      badge: { text: 'Combustível/Aluguel', type: 'info' }
    },
    {
      title: 'Folha de Pagamento',
      value: fmtMoeda(totalFolha),
      subtitle: 'Líquido pago c/ status PAGO',
      icon: UsersRound,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      badge: { text: 'Inclui Aluguel de Moto', type: 'info' }
    },
    {
      title: 'Saldo Final em Caixa',
      value: fmtMoeda(saldo),
      subtitle: 'Faturamento - Despesas - Folha',
      icon: Wallet,
      color: saldo >= 0 ? 'text-blue-600 bg-blue-50 border-blue-100' : 'text-amber-700 bg-amber-50 border-amber-100',
      badge: { text: saldo >= 0 ? 'Positivo' : 'Alerta Negativo', type: saldo >= 0 ? 'up' : 'down' }
    },
    {
      title: 'Custos a Pagar Pendentes',
      value: fmtMoeda(totalPendente),
      subtitle: 'Contas em aberto neste mês',
      icon: Calculator,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      badge: { text: 'Aguardando fluxo', type: 'warn' }
    },
    {
      title: 'Margem Operacional',
      value: `${margem.toFixed(1)}%`,
      subtitle: 'Retorno financeiro líquido',
      icon: ArrowUpRight,
      color: positiveMargem ? 'text-teal-600 bg-teal-50 border-teal-100' : 'text-red-600 bg-red-50 border-red-100',
      badge: { text: positiveMargem ? 'Rentável' : 'Revisar Custos', type: positiveMargem ? 'up' : 'down' }
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {kpis.map((k, index) => {
        const IconComponent = k.icon;
        return (
          <div 
            key={index} 
            className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{k.title}</p>
                <h3 className="text-2xl font-bold font-sans text-gray-900 tracking-tight leading-none">{k.value}</h3>
              </div>
              <div className={`p-2.5 rounded-lg border ${k.color} shrink-0`}>
                <IconComponent className="w-5 h-5" />
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100 mt-2">
              <span className="text-gray-505 truncate" title={k.subtitle}>{k.subtitle}</span>
              {k.badge.type === 'up' && (
                <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold font-mono shrink-0">
                  {k.badge.text}
                </span>
              )}
              {k.badge.type === 'info' && (
                <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-bold shrink-0 text-[10px]">
                  {k.badge.text}
                </span>
              )}
              {k.badge.type === 'warn' && (
                <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold shrink-0 text-[10px]">
                  {k.badge.text}
                </span>
              )}
              {k.badge.type === 'down' && (
                <span className="bg-rose-105 text-rose-800 px-1.5 py-0.5 rounded font-bold shrink-0">
                  {k.badge.text}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
