import { useState } from 'react';
import { Funcionario, Holerite, ContaPagar, Receita, Veiculo } from '../types';
import { fmtMoeda, fmtData } from '../lib/calculos';
import KPICards from './KPICards';
import FinancialChart from './FinancialChart';
import { 
  AlertTriangle, 
  ArrowRight, 
  Calendar, 
  CheckCircle, 
  DollarSign, 
  PlusCircle, 
  TrendingUp, 
  Wrench 
} from 'lucide-react';

interface DashboardViewProps {
  stats: {
    totalReceitas: number;
    totalDespesas: number;
    totalFolha: number;
    saldo: number;
    totalPendente: number;
    margem: number;
  };
  chartData: Array<{
    name: string;
    Receitas: number;
    Despesas: number;
    Folha: number;
  }>;
  contasPagar: ContaPagar[];
  veiculos: Veiculo[];
  receitas: Receita[];
  onChangeTab: (tab: string) => void;
  onPayBill: (id: string) => void;
}

export default function DashboardView({
  stats,
  chartData,
  contasPagar,
  veiculos,
  receitas,
  onChangeTab,
  onPayBill
}: DashboardViewProps) {
  
  // 1. Calculate urgent bills (vencendo nos próximos 3 dias, status pendente)
  const today = new Date();
  const alertLimitDate = new Date();
  alertLimitDate.setDate(today.getDate() + 3);

  const contasUrgentes = contasPagar
    .filter(c => {
      if (c.status !== 'pendente') return false;
      const vencDate = new Date(c.vencimento + 'T12:00:00');
      // Urgent if past due OR within next 3 days
      return vencDate <= alertLimitDate;
    })
    .slice(0, 4);

  // 2. Vehicles needing maintenance or approaching revision
  const veiculosAlertas = veiculos
    .filter(v => v.manutencao_status !== 'ok' || v.status === 'manutencao' || (v.km_proxima_revisao && (v.km_proxima_revisao - v.km_atual) <= 2000))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Visual KPI Widgets */}
      <KPICards 
        totalReceitas={stats.totalReceitas}
        totalDespesas={stats.totalDespesas}
        totalFolha={stats.totalFolha}
        saldo={stats.saldo}
        totalPendente={stats.totalPendente}
        margem={stats.margem}
      />

      {/* Financial analytical chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <FinancialChart data={chartData} />
        </div>
        
        {/* Quick action shortcuts */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-gray-150 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-1 uppercase tracking-wider text-purple-950">Atalhos Operacionais</h3>
            <p className="text-xs text-gray-500 mb-4">Ações rápidas administrativas freqüentes</p>
            
            <div className="space-y-2.5">
              <button 
                onClick={() => onChangeTab('holerites')}
                className="w-full flex items-center justify-between text-left p-3 rounded-lg border border-purple-100 hover:bg-purple-50/40 transition-colors"
              >
                <div className="flex items-center space-x-2.5 text-xs">
                  <div className="p-1 rounded bg-purple-100 text-purple-950">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Processar Folha do Mês</p>
                    <p className="text-[10px] text-gray-500">Gerar holerites em lote</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-purple-800" />
              </button>

              <button 
                onClick={() => onChangeTab('contas-pagar')}
                className="w-full flex items-center justify-between text-left p-3 rounded-lg border border-rose-100 hover:bg-rose-50/40 transition-colors"
              >
                <div className="flex items-center space-x-2.5 text-xs">
                  <div className="p-1.5 rounded bg-rose-100 text-rose-800">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Adicionar Despesa</p>
                    <p className="text-[10px] text-gray-500">Lançar boleto ou guia</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-rose-800" />
              </button>

              <button 
                onClick={() => onChangeTab('receitas')}
                className="w-full flex items-center justify-between text-left p-3 rounded-lg border border-emerald-100 hover:bg-emerald-50/40 transition-colors"
              >
                <div className="flex items-center space-x-2.5 text-xs">
                  <div className="p-1.5 rounded bg-emerald-150 text-emerald-800">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Registrar Faturamento</p>
                    <p className="text-[10px] text-gray-500">Adicionar receita de contrato</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-800" />
              </button>

              <button 
                onClick={() => onChangeTab('veiculos')}
                className="w-full flex items-center justify-between text-left p-3 rounded-lg border border-amber-100 hover:bg-amber-50/40 transition-colors"
              >
                <div className="flex items-center space-x-2.5 text-xs">
                  <div className="p-1.5 rounded bg-amber-100 text-amber-800">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Registrar Manutenção</p>
                    <p className="text-[10px] text-gray-500">Atualizar quilometragem e mecânica</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-amber-800" />
              </button>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100">
            <div className="bg-purple-950 text-white p-3 rounded-lg text-center text-[10px] uppercase font-mono font-bold tracking-wider">
              PIX ID: andre.ibm.rocha@gmail.com
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Alerts and urgent bills warnings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Urgent Bills Card */}
        <div className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <h4 className="font-bold text-gray-900 text-xs uppercase text-purple-950">Atenção: Contas Próximas ao Vencimento</h4>
            </div>
            <button 
              onClick={() => onChangeTab('contas-pagar')} 
              className="text-xs text-purple-800 font-bold hover:underline"
            >
              Ver Todas
            </button>
          </div>

          {contasUrgentes.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              <CheckCircle className="w-7 h-7 text-emerald-500 mx-auto mb-1.5" />
              Nenhuma conta a vencer nos próximos 3 dias!
            </div>
          ) : (
            <div className="space-y-3">
              {contasUrgentes.map((c) => {
                const vencDate = new Date(c.vencimento + 'T12:00:00');
                const isOverdue = vencDate < today;
                return (
                  <div key={c.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-100 text-xs">
                    <div className="space-y-0.5">
                      <p className="font-bold text-gray-800">{c.descricao}</p>
                      <div className="flex items-center space-x-1.5 text-[10px] text-gray-500">
                        <Calendar className="w-3 h-3 text-purple-800" />
                        <span className={isOverdue ? 'text-rose-600 font-bold' : ''}>
                          Vencimento: {fmtData(c.vencimento)} {isOverdue && '(Vencido!)'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex items-center space-x-3">
                      <span className="font-bold text-gray-900 block font-mono">{fmtMoeda(c.valor)}</span>
                      <button 
                        onClick={() => onPayBill(c.id)}
                        className="bg-emerald-550 bg-emerald-600 font-semibold hover:bg-emerald-700 text-white rounded px-2.5 py-1 text-[10px] transition-colors cursor-pointer"
                      >
                        Pagar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Fleet Maintenance Approaching Card */}
        <div className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
            <div className="flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-amber-500 shrink-0" />
              <h4 className="font-bold text-gray-900 text-xs uppercase text-purple-950">Avisos de Manutenção & Frota</h4>
            </div>
            <button 
              onClick={() => onChangeTab('veiculos')} 
              className="text-xs text-purple-800 font-bold hover:underline"
            >
              Ver Frota
            </button>
          </div>

          {veiculosAlertas.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              <CheckCircle className="w-7 h-7 text-emerald-500 mx-auto mb-1.5" />
              Todos os veículos da frota estão em dia (KM ok)!
            </div>
          ) : (
            <div className="space-y-3">
              {veiculosAlertas.map((v) => {
                const isUrg = v.manutencao_status === 'urgente';
                return (
                  <div key={v.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-150 text-xs">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-gray-800">{v.nome}</span>
                        <span className="bg-gray-200 text-gray-800 rounded px-1 text-[9px] font-mono">{v.placa}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">KM Atual: <strong className="font-mono text-gray-700">{v.km_atual.toLocaleString()}</strong> · Próx. Revisão: <strong className="font-mono">{v.km_proxima_revisao?.toLocaleString() || '---'}</strong></p>
                    </div>
                    <div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-block ${
                        isUrg ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {v.manutencao_status === 'urgente' ? 'Urgente' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
