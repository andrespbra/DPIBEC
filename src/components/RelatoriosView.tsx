import { useState } from 'react';
import { Receita, ContaPagar, Holerite } from '../types';
import { fmtMoeda, calcDRE } from '../lib/calculos';
import { 
  FileSpreadsheet, 
  Printer, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  CheckCircle,
  HelpCircle,
  TrendingUp,
  FileText
} from 'lucide-react';

interface RelatoriosViewProps {
  receitas: Receita[];
  contasPagar: ContaPagar[];
  holerites: Holerite[];
  onSuccessToast: (msg: string) => void;
}

export default function RelatoriosView({
  receitas,
  contasPagar,
  holerites,
  onSuccessToast
}: RelatoriosViewProps) {
  const [filterPeriod, setFilterPeriod] = useState('2026-6'); // default Jun/26

  // 1. DRE Calculation for the chosen period
  // We filter items belonging to the selected fiscal period (month)
  const isAll = filterPeriod === 'ano';

  const filterPeriodItems = <T extends { data_emissao?: string; vencimento?: string; competencia?: string }>(list: T[]): T[] => {
    if (isAll) return list;
    return list.filter(item => {
      const dateStr = item.data_emissao || item.vencimento || item.competencia || '';
      return dateStr.includes(filterPeriod);
    });
  };

  const periodReceitas = filterPeriodItems(receitas);
  const periodContas = filterPeriodItems(contasPagar);
  const periodHolerites = filterPeriodItems(holerites);

  const dre = calcDRE(periodReceitas, periodContas, periodHolerites);

  // Group paid operational accounts payable by Category
  const accountsPaidGrouped = periodContas
    .filter(c => c.status === 'pago')
    .reduce((grouped: { [key: string]: number }, c) => {
      grouped[c.categoria] = (grouped[c.categoria] || 0) + c.valor;
      return grouped;
    }, {});

  const handlePrintDRE = () => {
    window.print();
  };

  const handleSimulatePDF = () => {
    onSuccessToast('Exportação de DRE iniciada! O relatório consolidado foi gerado com sucesso.');
  };

  return (
    <div className="space-y-6 printable-area">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-xl border border-gray-150 shadow-sm gap-4 no-print">
        <div>
          <h2 className="text-lg font-bold text-gray-900 font-sans">Demonstrativo de Resultado do Exercício (DRE)</h2>
          <p className="text-xs text-gray-500">Relatórios fiscais contábeis integrados com regime de caixa sobre lançamentos liquidados.</p>
        </div>
        
        {/* Period selection */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto shrink-0">
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg p-1.5 text-xs bg-white text-gray-700 outline-none font-bold"
          >
            <option value="2026-05">Competência: Maio/2026</option>
            <option value="2026-06">Competência: Junho/2026</option>
            <option value="2026-07">Competência: Julho/2026</option>
            <option value="ano">Consolidação Anual 2026</option>
          </select>

          <button
            onClick={handlePrintDRE}
            className="flex items-center space-x-1.5 bg-purple-950 text-white font-bold hover:bg-purple-900 text-xs px-3.5 py-2 rounded-lg shadow cursor-pointer transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir DRE</span>
          </button>
        </div>
      </div>

      {/* Main DRE Spreadsheet Paper format */}
      <div className="bg-white rounded-xl border-2 border-gray-200 shadow-md p-6 max-w-4xl mx-auto font-mono text-xs text-gray-800" id="dre-paper">
        {/* Header Header */}
        <div className="border-b-2 border-gray-300 pb-3 mb-4 flex justify-between items-start">
          <div>
            <h3 className="font-extrabold text-sm uppercase text-purple-950">IBEC Express Motoboy e Logística Ltda.</h3>
            <p className="text-[10px] text-gray-400">DEMONSTRATIVO CONSOLIDADO DO FLUXO FINANCEIRO OPERACIONAL</p>
            <p className="text-[10px] text-gray-500">Regime de Caixa Oficial · Pinheiros, São Paulo - SP</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold block text-gray-500 uppercase">Período de Referência</span>
            <span className="font-bold text-sm text-purple-950 uppercase">{filterPeriod === 'ano' ? 'Ano Fiscal 2026' : filterPeriod === '2026-05' ? 'Maio / 2026' : filterPeriod === '2026-07' ? 'Julho / 2026' : 'Junho / 2026'}</span>
          </div>
        </div>

        {/* Profitability summary ledger line-by-line */}
        <div className="space-y-4">
          
          {/* Section 1: Receitas Brutas */}
          <div>
            <div className="flex justify-between items-center font-bold bg-gray-100 p-2 text-purple-950 uppercase text-[11px] border-b border-gray-300">
              <span>1.0 - FATURAMENTO BRUTO RECEBIDO (+)</span>
              <span className="text-emerald-700">{fmtMoeda(dre.totalReceitas)}</span>
            </div>
            
            <div className="divide-y divide-gray-100 pl-4 py-1.5 leading-relaxed text-[11px]">
              {periodReceitas.filter(r => r.status === 'recebido').map((r, i) => (
                <div key={i} className="flex justify-between py-1 text-gray-650">
                  <span>· {r.cliente} ({r.servico})</span>
                  <span className="font-semibold text-gray-800">{fmtMoeda(r.valor)}</span>
                </div>
              ))}
              {periodReceitas.filter(r => r.status === 'recebido').length === 0 && (
                <div className="text-center py-2 text-gray-400">Nenhuma entrada registrada no regime para o período.</div>
              )}
            </div>
          </div>

          {/* Section 2: Operational Despesas Deductions */}
          <div>
            <div className="flex justify-between items-center font-bold bg-gray-100 p-2 text-purple-950 uppercase text-[11px] border-b border-gray-300">
              <span>2.0 - DEDUÇÕES E DESPESAS OPERACIONAIS (-)</span>
              <span className="text-rose-700">({fmtMoeda(dre.totalDespesas)})</span>
            </div>

            <div className="divide-y divide-gray-100 pl-4 py-1.5 leading-relaxed text-[11px]">
              {Object.keys(accountsPaidGrouped).map((cat, i) => (
                <div key={i} className="flex justify-between py-1 text-gray-650">
                  <span>· Custos Gerais com {cat}</span>
                  <span className="font-semibold text-gray-800">({fmtMoeda(accountsPaidGrouped[cat])})</span>
                </div>
              ))}
              {Object.keys(accountsPaidGrouped).length === 0 && (
                <div className="text-center py-2 text-gray-400">Nenhuma conta operacional despesa liquidada no período.</div>
              )}
            </div>
          </div>

          {/* Section 3: Payroll deductions cost */}
          <div>
            <div className="flex justify-between items-center font-bold bg-gray-105 bg-gray-100 p-2 text-purple-950 uppercase text-[11px] border-b border-gray-300">
              <span>3.0 - CUSTOS DE FOLHA DE PAGAMENTO CLT (-)</span>
              <span className="text-rose-700">({fmtMoeda(dre.totalFolha)})</span>
            </div>

            <div className="divide-y divide-gray-100 pl-4 py-1.5 leading-relaxed text-[11px]">
              {periodHolerites.filter(h => h.status === 'pago').map((h, i) => (
                <div key={i} className="flex justify-between py-1 text-gray-650">
                  <span>· Salário Líquido Pago a {h.funcionario?.nome} ({h.funcionario?.cargo})</span>
                  <span className="font-semibold text-gray-800">({fmtMoeda(h.salario_liquido)})</span>
                </div>
              ))}
              {periodHolerites.filter(h => h.status === 'pago').length === 0 && (
                <div className="text-center py-2 text-gray-400">Nenhum pagamento de folha de salários liquidado no período.</div>
              )}
            </div>
          </div>

          {/* TOTAL BALANCE CONSOLIDATION RESULT */}
          <div className="border-t-2 border-b-2 border-gray-400 p-3 mt-6 flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50/55 gap-3">
            <div className="space-y-0.5">
              <span className="font-extrabold text-sm text-purple-950 uppercase block">Resultado Líquido do Exercício</span>
              <span className="text-[10px] text-gray-405 uppercase font-semibold">Excedente disponível em caixa após custos</span>
            </div>
            
            <div className="text-right font-mono">
              <span className={`text-lg font-black block ${dre.resultado >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                {dre.resultado >= 0 ? '+' : ''}{fmtMoeda(dre.resultado)}
              </span>
              <span className="text-[10px] font-bold text-purple-900 bg-purple-100 rounded px-2 py-0.5 mt-1 inline-block">
                Margem Líquida: {dre.margem.toFixed(1)}%
              </span>
            </div>
          </div>

        </div>

        {/* Auditoring stamp lines */}
        <div className="mt-8 border-t border-gray-205 pt-4 text-[9px] text-gray-400 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Emitido digitalmente via Sistema Financeiro IBEC Express</span>
          <span className="font-bold border border-gray-200 px-2 py-0.5 rounded uppercase">Auditoria Fiscal Concluída</span>
          <span>Exercício Fiscal: 2026</span>
        </div>
      </div>

      {/* Analytical helpers cards no-print */}
      <div className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm space-y-4 max-w-4xl mx-auto no-print">
        <h4 className="font-bold text-xs uppercase text-purple-950 pb-2 border-b border-gray-100 flex items-center space-x-1.5">
          <FileText className="w-4 h-4 text-purple-850" />
          <span>Diretrizes de Auditoria e Fechamento de Caixa</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs leading-relaxed text-gray-600">
          <div className="space-y-1.5 p-3 bg-purple-50/20 rounded border border-purple-100/50">
            <h5 className="font-bold text-purple-950">Por que o INSS e Vale Transporte contam como desconto?</h5>
            <p>O INSS progressivo e VT estimam a dedução obrigatória na folha do colaborador. Estes valores são retirados do bruto do funcionário e transferidos para as guias a pagar da empresa, mantendo o balanço zerado.</p>
          </div>
          <div className="space-y-1.5 p-3 bg-purple-50/20 rounded border border-purple-100/50 font-serif">
            <h5 className="font-bold text-purple-950">A regra do FGTS Empresa (8%):</h5>
            <p>Diferente do INSS, o FGTS é um imposto exclusivamente suportado pela empresa de logística. Não desconta do holerite porém deve ser lançado no plano de Contas a Pagar como uma guia de recolhimento mensal (Categoria: FGTS).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
