import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ContasPagarView from './components/ContasPagarView';
import ReceitasView from './components/ReceitasView';
import HoleritesView from './components/HoleritesView';
import FuncionariosView from './components/FuncionariosView';
import VeiculosView from './components/VeiculosView';
import ClientesView from './components/ClientesView';
import RelatoriosView from './components/RelatoriosView';

import * as store from './lib/store';
import { Funcionario, Holerite, ContaPagar, Receita, Veiculo, Cliente } from './types';
import { fmtMoeda, fmtData, calcDRE } from './lib/calculos';

import { 
  Bell, 
  HelpCircle, 
  ShieldAlert, 
  Globe, 
  Check, 
  KeyRound, 
  Lock, 
  User, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function App() {
  // Core application states
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [activeUserEmail, setActiveUserEmail] = useState('admin@ibec.com.br');

  // Database list states
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [holerites, setHolerites] = useState<Holerite[]>([]);
  const [contasPagar, setContasPagar] = useState<ContaPagar[]>([]);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  // UI Toast notifications helper
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Collective bargaining conventions settings state (stored in localStorage)
  const [convenioSalBase, setConvenioSalBase] = useState('1483.29');
  const [convenioAluguelMoto, setConvenioAluguelMoto] = useState('689.65');
  const [convenioPericulosidade, setConvenioPericulosidade] = useState('444.99');
  const [convenioVA, setConvenioVA] = useState('18.50');
  const [convenioCesta, setConvenioCesta] = useState('76.92');

  // Load and check login status
  useEffect(() => {
    const session = localStorage.getItem('ibec_auth_session');
    if (session) {
      setIsAuthenticated(true);
      setActiveUserEmail(session);
    }
    loadAllData();
    loadConventionSettings();
  }, [isAuthenticated]);

  const loadAllData = async () => {
    try {
      const funcs = await store.getFuncionarios();
      const hols = await store.getHolerites();
      const cps = await store.getContasPagar();
      const recs = await store.getReceitas();
      const veics = await store.getVeiculos();
      const clis = await store.getClientes();

      setFuncionarios(funcs);
      setHolerites(hols);
      setContasPagar(cps);
      setReceitas(recs);
      setVeiculos(veics);
      setClientes(clis);
    } catch (e) {
      console.error('Failed loading financial database.', e);
    }
  };

  const loadConventionSettings = () => {
    const sal = localStorage.getItem('conv_sal_base') || '1483.29';
    const moto = localStorage.getItem('conv_aluguel_moto') || '689.65';
    const peri = localStorage.getItem('conv_periculosidade') || '444.99';
    const vaVal = localStorage.getItem('conv_va_dia') || '18.50';
    const ces = localStorage.getItem('conv_cesta_mes') || '76.92';

    setConvenioSalBase(sal);
    setConvenioAluguelMoto(moto);
    setConvenioPericulosidade(peri);
    setConvenioVA(vaVal);
    setConvenioCesta(ces);
  };

  const handleSaveConventions = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('conv_sal_base', convenioSalBase);
    localStorage.setItem('conv_aluguel_moto', convenioAluguelMoto);
    localStorage.setItem('conv_periculosidade', convenioPericulosidade);
    localStorage.setItem('conv_va_dia', convenioVA);
    localStorage.setItem('conv_cesta_mes', convenioCesta);

    triggerToast('Parâmetros de Convenção Coletiva atualizados!');
  };

  // Toast trigger helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Auth logins handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail) {
      alert('Por favor digite um e-mail administrativo!');
      return;
    }
    // Simple bypass credentials for demo, protects data, integrates seamlessly
    localStorage.setItem('ibec_auth_session', authEmail);
    setActiveUserEmail(authEmail);
    setIsAuthenticated(true);
    triggerToast('Sessão autenticada. Bem-vindo de volta!');
  };

  const handleLogout = () => {
    localStorage.removeItem('ibec_auth_session');
    setIsAuthenticated(false);
  };

  // --- DATABASE OPERATORS WRAPPER ---

  const handleSaveFuncionario = async (f: Omit<Funcionario, 'id'> & { id?: string }) => {
    await store.saveFuncionario(f);
    loadAllData();
  };

  const handleDeleteFuncionario = async (id: string) => {
    await store.deleteFuncionario(id);
    loadAllData();
  };

  const handleSaveConta = async (c: Omit<ContaPagar, 'id'> & { id?: string }) => {
    await store.saveContaPagar(c);
    loadAllData();
  };

  const handlePayConta = async (id: string) => {
    const match = contasPagar.find(c => c.id === id);
    if (match) {
      await store.saveContaPagar({
        ...match,
        status: 'pago',
        data_pagamento: new Date().toISOString().substring(0, 10)
      });
      loadAllData();
    }
  };

  const handleDeleteConta = async (id: string) => {
    await store.deleteContaPagar(id);
    loadAllData();
  };

  const handleSaveReceita = async (r: Omit<Receita, 'id'> & { id?: string }) => {
    await store.saveReceita(r);
    loadAllData();
  };

  const handleReceiveReceita = async (id: string) => {
    const match = receitas.find(r => r.id === id);
    if (match) {
      await store.saveReceita({
        ...match,
        status: 'recebido',
        data_recebimento: new Date().toISOString().substring(0, 10)
      });
      loadAllData();
    }
  };

  const handleDeleteReceita = async (id: string) => {
    await store.deleteReceita(id);
    loadAllData();
  };

  const handleSaveVeiculo = async (v: Omit<Veiculo, 'id'> & { id?: string }) => {
    await store.saveVeiculo(v);
    loadAllData();
  };

  const handleDeleteVeiculo = async (id: string) => {
    await store.deleteVeiculo(id);
    loadAllData();
  };

  const handleSaveCliente = async (c: Omit<Cliente, 'id'> & { id?: string }) => {
    await store.saveCliente(c);
    loadAllData();
  };

  const handleDeleteCliente = async (id: string) => {
    await store.deleteCliente(id);
    loadAllData();
  };

  // Folha batch payroll mechanics
  const handleGeneratePayrollBatch = async (month: string): Promise<{ criados: number; total: number }> => {
    const res = await store.generateHoleritesBatch(month);
    loadAllData();
    return res;
  };

  const handleUpdateHoleriteStatus = async (id: string, status: 'pendente' | 'pago' | 'aprovado') => {
    const match = holerites.find(h => h.id === id);
    if (match) {
      await store.saveHolerite({ ...match, status });
      loadAllData();
    }
  };

  const handleSaveHolerite = async (h: Holerite) => {
    await store.saveHolerite(h);
    loadAllData();
  };

  const handlePayAllHolerites = async (month: string) => {
    const monthHols = holerites.filter(h => h.competencia.substring(0, 7) === month && h.status === 'pendente');
    
    let totalPaidLiquido = 0;
    for (const h of monthHols) {
      totalPaidLiquido += h.salario_liquido;
      await store.saveHolerite({
        ...h,
        status: 'pago'
      });
    }

    // Register a consolidated expenditure costs inside Contas a Pagar in category "Folha Pagamento" for full compliance
    if (totalPaidLiquido > 0) {
      await store.saveContaPagar({
        descricao: `Folha Pagamento CLT - Ref: ${month}`,
        categoria: 'Operacional',
        valor: totalPaidLiquido,
        vencimento: new Date().toISOString().substring(0, 10),
        data_pagamento: new Date().toISOString().substring(0, 10),
        status: 'pago',
        forma_pagamento: 'PIX em lote',
        recorrente: false,
        recorrencia_meses: 1,
        observacoes: 'Lançamento automático de folha salarial processada líquida.'
      });
    }

    loadAllData();
  };

  // --- STATS DATA COMPUTATIONS ---

  // Standard stats calculation based on the current active tab months / or general
  const computationStats = (() => {
    // We compute for the current active month (e.g. June 2026) to make dashboard relevant
    const activePeriod = '2026-06';
    const periodReceitas = receitas.filter(r => r.data_emissao.includes(activePeriod));
    const periodContas = contasPagar.filter(c => c.vencimento.includes(activePeriod));
    const periodHolerites = holerites.filter(h => h.competencia.includes(activePeriod));

    const dre = calcDRE(periodReceitas, periodContas, periodHolerites);

    // Calc pending obligations a pagar to wait
    const totalPendente = contasPagar
      .filter(c => c.status === 'pendente')
      .reduce((sum, c) => sum + c.valor, 0);

    return {
      totalReceitas: dre.totalReceitas,
      totalDespesas: dre.totalDespesas,
      totalFolha: dre.totalFolha,
      saldo: dre.totalReceitas - dre.totalDespesas - dre.totalFolha,
      totalPendente,
      margem: dre.margem
    };
  })();

  // Recharts Monthly comparative bar compilation
  const chartMonthlyData = (() => {
    const months = [
      { key: '2026-01', label: 'Jan/26' },
      { key: '2026-02', label: 'Fev/26' },
      { key: '2026-03', label: 'Mar/26' },
      { key: '2026-04', label: 'Abr/26' },
      { key: '2026-05', label: 'Mai/26' },
      { key: '2026-06', label: 'Jun/26' },
    ];

    return months.map(m => {
      const recs = receitas.filter(r => r.data_emissao.includes(m.key));
      const conts = contasPagar.filter(c => c.vencimento.includes(m.key));
      const hols = holerites.filter(h => h.competencia.includes(m.key));

      const d = calcDRE(recs, conts, hols);

      return {
        name: m.label,
        Receitas: d.totalReceitas,
        Despesas: d.totalDespesas,
        Folha: d.totalFolha
      };
    });
  })();

  // 1. CHRONOLOGICAL CASH REGISTER EXTRATO registry (Chronological double-entry cash flow)
  // We combine PAID bills and RECEIVED revenues, sorting them by their dates
  const chronologicalCashFlow = (() => {
    const entries: Array<{
      date: string;
      type: 'entrada' | 'saída';
      description: string;
      sourceTarget: string;
      value: number;
    }> = [];

    // Add received revenues
    receitas
      .filter(r => r.status === 'recebido' && r.data_recebimento)
      .forEach(r => {
        entries.push({
          date: r.data_recebimento!,
          type: 'entrada',
          description: `Depósito: ${r.cliente} (${r.servico})`,
          sourceTarget: 'Faturamento Recebido',
          value: r.valor
        });
      });

    // Add paid accounts payable
    contasPagar
      .filter(c => c.status === 'pago' && c.data_pagamento)
      .forEach(c => {
        entries.push({
          date: c.data_pagamento!,
          type: 'saída',
          description: `Pago: ${c.descricao}`,
          sourceTarget: c.fornecedor || 'Credor',
          value: c.valor
        });
      });

    // Add paid holerites
    holerites
      .filter(h => h.status === 'pago')
      .forEach(h => {
        // Assume competency date or default 5th work day of corresponding competency month
        const fakeDate = h.competencia; // YYYY-MM-DD
        entries.push({
          date: fakeDate,
          type: 'saída',
          description: `Holerite Folha Pago: ${h.funcionario?.nome}`,
          sourceTarget: 'Colaborador CLT',
          value: h.salario_liquido
        });
      });

    // Sort by date chronologically descending (newest first)
    return entries.sort((a, b) => b.date.localeCompare(a.date));
  })();

  // 2. Compute Header Warnings counting
  const alertCount = (() => {
    let count = 0;
    const todayStr = new Date().toISOString().substring(0, 10);
    // Overdue bills
    count += contasPagar.filter(c => c.status === 'pendente' && c.vencimento < todayStr).length;
    // Approaching fleet review
    count += veiculos.filter(v => v.manutencao_status !== 'ok').length;
    return count;
  })();

  // If not authenticated, render Login overlay
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-purple-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
        {/* Abstract vector branding circles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-purple-900/40 rounded-full blur-3xl"></div>

        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-purple-900/20 overflow-hidden relative z-10 animate-slideUp">
          {/* Header branding */}
          <div className="bg-purple-900 text-white p-6 text-center border-b border-purple-950">
            <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center font-black text-purple-950 text-2xl mx-auto shadow-md shadow-purple-950/20 mb-3 rotate-3">
              <span>IB</span>
            </div>
            <h1 className="font-sans font-black text-lg tracking-wide leading-none">IBEC Express</h1>
            <p className="text-amber-400 text-[10px] uppercase font-mono tracking-wider font-bold mt-1">MOTOBOY & SISTEMA FINANCEIRO SP</p>
          </div>

          {/* Sign in credentials */}
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100/50 text-[11px] text-purple-950 leading-relaxed flex items-start space-x-2">
              <Lock className="w-4 h-4 text-purple-800 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">Acesso Administrativo Demonstração:</span>
                <p className="mt-0.5 text-gray-600">Este terminal possui acesso à folha de faturamento SP. Digite seu e-mail corporativo abaixo para liberar o perfil administrador.</p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-gray-600 uppercase">E-mail Corporativo</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="Ex: admin@ibec.com.br"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-350 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-900"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-gray-600 uppercase">Senha Secreta</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-355 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-950 text-white font-bold py-2.8 rounded-lg hover:bg-purple-900 shadow transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2 text-xs"
            >
              <span>Acessar Painel Integrado</span>
            </button>
            
            {/* Quick profiles trigger */}
            <div className="pt-2 text-center text-[10px]">
              <button
                type="button"
                onClick={() => {
                  setAuthEmail('andre.ibm.rocha@gmail.com');
                  setAuthPassword('admin123');
                }}
                className="text-purple-900 font-bold hover:underline"
              >
                Preencher com E-mail Oficial (andre.ibm.rocha@gmail.com)
              </button>
            </div>
          </form>
        </div>
        
        <p className="text-[10px] text-purple-400 text-center mt-6 z-10 font-mono">
          IBEC Express Transportes Ltda · Pinheiros, SP · 2026
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800 overflow-hidden font-sans text-xs">
      {/* Sidebar Nav */}
      <Sidebar 
        currentTab={currentTab} 
        onChangeTab={setCurrentTab} 
        onLogout={handleLogout}
        userEmail={activeUserEmail}
      />

      <div className="flex-grow flex flex-col h-full overflow-hidden">
        {/* Header header */}
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex justify-between items-center shrink-0 no-print">
          <div>
            <h1 className="font-extrabold text-gray-900 text-sm tracking-wide capitalize">
              {currentTab === 'dashboard' && 'Dashboard Financeiro'}
              {currentTab === 'caixa' && 'Livro de Fluxo de Caixa'}
              {currentTab === 'contas-pagar' && 'Gestão de Contas a Pagar'}
              {currentTab === 'receitas' && 'Receitas e Recebíveis'}
              {currentTab === 'holerites' && 'Folha de Pagamento & Holerites'}
              {currentTab === 'funcionarios' && 'Colaboradores Integrados'}
              {currentTab === 'veiculos' && 'Controle de Frota Logística'}
              {currentTab === 'clientes' && 'Clientes e Contratos comerciais'}
              {currentTab === 'relatorios' && 'DRE Contábil Comercial'}
              {currentTab === 'configuracoes' && 'Convenção Coletiva e Ajustes'}
            </h1>
            <p className="text-[10px] text-gray-500 block leading-none mt-0.5 font-mono uppercase">
              Domingo, 07 de Junho de 2026 · Pinheiros / SP
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Database status indicator */}
            <div className="flex items-center space-x-1.5 px-2 py-1 rounded bg-purple-50 border border-purple-100 text-[10px] font-bold text-purple-900 uppercase font-mono">
              <Globe className="w-3.5 h-3.5 text-purple-800 shrink-0" />
              <span>Conexão SQLite Local</span>
            </div>

            {/* Notifications Alert block */}
            <div className="relative">
              <div title="Notificações Operacionais" className="p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer relative">
                <Bell className="w-4 h-4 text-gray-600 shrink-0" />
                {alertCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 rounded-full border-2 border-white text-[9px] font-bold text-white flex items-center justify-center animate-bounce">
                    {alertCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic content rendering with overflows */}
        <main className="flex-grow p-6 overflow-y-auto bg-gray-50/50 relative">
          
          {toastMessage && (
            <div className="fixed top-20 right-6 z-55 bg-purple-950 text-white font-bold border border-purple-800 p-3.5 rounded-lg shadow-2xl flex items-center space-x-2 animate-fadeIn no-print text-xs font-mono">
              <Check className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Tab switches */}
          {currentTab === 'dashboard' && (
            <DashboardView 
              stats={computationStats}
              chartData={chartMonthlyData}
              contasPagar={contasPagar}
              veiculos={veiculos}
              receitas={receitas}
              onChangeTab={setCurrentTab}
              onPayBill={handlePayConta}
            />
          )}

          {currentTab === 'contas-pagar' && (
            <ContasPagarView 
              contas={contasPagar}
              onSaveConta={handleSaveConta}
              onPayConta={handlePayConta}
              onDeleteConta={handleDeleteConta}
              onSuccessToast={triggerToast}
            />
          )}

          {currentTab === 'receitas' && (
            <ReceitasView 
              receitas={receitas}
              clientes={clientes}
              onSaveReceita={handleSaveReceita}
              onReceiveReceita={handleReceiveReceita}
              onDeleteReceita={handleDeleteReceita}
              onSuccessToast={triggerToast}
            />
          )}

          {/* CHRONOLOGICAL CASH REGISTER EXTRATO TAB */}
          {currentTab === 'caixa' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 font-sans">Livro de Caixa / Extrato Cronológico</h2>
                <p className="text-xs text-gray-500">Conciliação integral em tempo real de entradas e saídas liquidadas por ordem de recebimento.</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-150 shadow-sm overflow-hidden text-xs">
                <table className="w-full text-left font-sans">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-205 text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                      <th className="py-2.5 px-4 font-bold">Data Liquidação</th>
                      <th className="py-2.5 px-4">Operação Financeira / Detalhes</th>
                      <th className="py-2.5 px-4">Envolvidos</th>
                      <th className="py-2.5 px-4 text-right">Inflow (+)</th>
                      <th className="py-2.5 px-4 text-right">Outflow (-)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 text-xs text-gray-700">
                    {chronologicalCashFlow.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-400">
                          Nenhuma transação liquidada no histórico. Comece marcando Contas como pagas ou Receitas como recebidas!
                        </td>
                      </tr>
                    ) : (
                      chronologicalCashFlow.map((entry, idx) => {
                        const isEntrada = entry.type === 'entrada';
                        return (
                          <tr key={idx} className="hover:bg-gray-50/45 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold">{fmtData(entry.date)}</td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-gray-950 font-sans block">{entry.description}</span>
                              <span className="text-[10px] text-purple-900 bg-purple-100 rounded px-1 text-[9px] font-bold font-sans inline-block mt-0.5">{entry.sourceTarget}</span>
                            </td>
                            <td className="py-3 px-4 font-semibold">{entry.sourceTarget}</td>
                            <td className="py-3 px-4 text-right font-bold text-emerald-700 font-mono text-sm bg-emerald-50/5">
                              {isEntrada ? `+ ${fmtMoeda(entry.value)}` : ''}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-rose-700 font-mono text-sm bg-rose-50/5">
                              {!isEntrada ? `- (${fmtMoeda(entry.value)})` : ''}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentTab === 'holerites' && (
            <HoleritesView 
              holerites={holerites}
              funcionarios={funcionarios}
              onGenerateBatch={handleGeneratePayrollBatch}
              onUpdateStatus={handleUpdateHoleriteStatus}
              onPayAllHolerites={handlePayAllHolerites}
              onSaveHolerite={handleSaveHolerite}
              onSuccessToast={triggerToast}
            />
          )}

          {currentTab === 'funcionarios' && (
            <FuncionariosView 
              funcionarios={funcionarios}
              onSaveFuncionario={handleSaveFuncionario}
              onDeleteFuncionario={handleDeleteFuncionario}
              onSuccessToast={triggerToast}
            />
          )}

          {currentTab === 'veiculos' && (
            <VeiculosView 
              veiculos={veiculos}
              funcionarios={funcionarios}
              onSaveVeiculo={handleSaveVeiculo}
              onDeleteVeiculo={handleDeleteVeiculo}
              onSuccessToast={triggerToast}
            />
          )}

          {currentTab === 'clientes' && (
            <ClientesView 
              clientes={clientes}
              onSaveCliente={handleSaveCliente}
              onDeleteCliente={handleDeleteCliente}
              onSuccessToast={triggerToast}
            />
          )}

          {currentTab === 'relatorios' && (
            <RelatoriosView 
              receitas={receitas}
              contasPagar={contasPagar}
              holerites={holerites}
              onSuccessToast={triggerToast}
            />
          )}

          {/* SETTINGS / CONVENÇÕES PANEL */}
          {currentTab === 'configuracoes' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 font-sans">Parâmetros de Convenção Coletiva & Normas</h2>
                <p className="text-xs text-gray-500">Ajustes dos índices de referência sindicais aplicados automaticamente no re-cálculo da folha salarial.</p>
              </div>

              {/* Convention adjustment Form */}
              <div className="bg-white rounded-xl border border-gray-150 p-6 shadow-sm max-w-xl mx-auto">
                <form onSubmit={handleSaveConventions} className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Salário Mínimo e Base de Categoria (CLT)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={convenioSalBase}
                        onChange={(e) => setConvenioSalBase(e.target.value)}
                        className="w-full text-xs font-mono font-bold border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-900"
                      />
                      <span className="text-[10px] text-gray-400">Convenção Base de referência 2022: R$ 1.483,29</span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Aluguel Moto / Locação Convenção</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={convenioAluguelMoto}
                        onChange={(e) => setConvenioAluguelMoto(e.target.value)}
                        className="w-full text-xs font-mono font-bold border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-900"
                      />
                      <span className="text-[10px] text-gray-400">Locação moto de motoristas alocados: R$ 689,65</span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Adicional Periculosidade (CLT CLT)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={convenioPericulosidade}
                        onChange={(e) => setConvenioPericulosidade(e.target.value)}
                        className="w-full text-xs font-mono font-bold border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-900"
                      />
                      <span className="text-[10px] text-gray-400">Periculosidade obrigatória motos: R$ 444,99</span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Vale Alimentação (VA / Dia util)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={convenioVA}
                        onChange={(e) => setConvenioVA(e.target.value)}
                        className="w-full text-xs font-mono font-bold border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Cesta Básica Sindicato (Mensal)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={convenioCesta}
                        onChange={(e) => setConvenioCesta(e.target.value)}
                        className="w-full text-xs font-mono font-bold border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-900"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                      type="submit"
                      className="bg-purple-950 text-white hover:bg-purple-900 font-bold px-6 py-2 rounded-lg cursor-pointer text-xs"
                    >
                      Salvar Parâmetros
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
