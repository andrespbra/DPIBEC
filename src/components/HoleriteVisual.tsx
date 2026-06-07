import { Holerite, Funcionario } from '../types';
import { fmtMoeda, fmtData, fmtCompetencia, calcFGTS } from '../lib/calculos';
import { Printer, Check, Landmark, Award } from 'lucide-react';

interface HoleriteVisualProps {
  holerite: Holerite;
  funcionario: Funcionario;
}

export default function HoleriteVisual({ holerite, funcionario }: HoleriteVisualProps) {
  const handlePrint = () => {
    window.print();
  };

  // Extract month and year formatted
  const compLabel = fmtCompetencia(holerite.competencia);

  const entries = [
    { code: '001', name: 'Salário Base', ref: '30 dias', type: 'provento', val: holerite.salario_base },
    { code: '005', name: 'Aluguel de Moto (Provento)', ref: 'Convenção', type: 'provento', val: holerite.aluguel_moto },
    { code: '012', name: 'Vale Refeição (VR)', ref: '22 dias', type: 'provento', val: holerite.vr },
    { code: '030', name: 'Adicional Periculosidade (30%)', ref: '30%', type: 'provento', val: holerite.periculosidade },
    { code: '042', name: 'Previsão Cesta Básica', ref: 'Mês', type: 'provento', val: holerite.cesta_basica },
    { code: '055', name: 'Salário Família', ref: 'Dep.', type: 'provento', val: holerite.sal_familia },
    { code: '090', name: 'Trabalho Ordem de Serviço (OS)', ref: 'Avulso', type: 'provento', val: holerite.ordem_servico },
    
    // Deductions
    { code: '101', name: 'Vale Transporte (Dedução)', ref: '6%', type: 'desconto', val: holerite.desc_vale_transporte },
    { code: '110', name: 'INSS Progressive Tax', ref: 'Progressivo', type: 'desconto', val: holerite.desc_inss },
    { code: '120', name: 'Faltas / Atrasos', ref: 'Dias', type: 'desconto', val: holerite.desc_falta },
    { code: '135', name: 'Adiantamento Combustível', ref: 'Consumo', type: 'desconto', val: holerite.desc_combustivel },
    { code: '150', name: 'Plano Odontológico Metlife', ref: 'Mensal', type: 'desconto', val: holerite.desc_plano_odonto },
    { code: '160', name: 'Uniforme / EPI entregues', ref: 'Copart', type: 'desconto', val: holerite.desc_uniforme },
    { code: '199', name: 'Outros Descontos Extras', ref: 'Ajuste', type: 'desconto', val: holerite.desc_outros },
  ].filter(e => e.val > 0);

  const calculatedFGTS = calcFGTS(holerite.salario_base + holerite.periculosidade);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6 max-w-4xl mx-auto my-4 printable-area">
      {/* Controls */}
      <div className="flex flex-wrap justify-between items-center pb-4 mb-4 border-b border-gray-100 no-print">
        <div>
          <span className="bg-amber-100 text-amber-850 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
            Recibo Oficial de Pagamento
          </span>
          <h2 className="text-sm font-bold text-gray-800 font-sans mt-0.5">Contracheque Individual - IBEC Express</h2>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handlePrint}
            className="flex items-center space-x-1.5 bg-purple-950 text-white font-semibold text-xs px-3.5 py-1.8 rounded-lg shadow hover:bg-purple-900 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Actual holerite paper starts here */}
      <div id="holerite-paper" className="p-4 border-2 border-gray-300 rounded font-mono text-xs text-gray-800">
        
        {/* Header Employer */}
        <div className="grid grid-cols-12 border-b border-gray-300 pb-2 mb-2 gap-2">
          <div className="col-span-8">
            <h3 className="font-bold text-sm uppercase text-purple-950">IBEC Express Motoboy e Logística Ltda.</h3>
            <p className="text-[10px] text-gray-500">Rua das Flores, 1200 - Pinheiros, São Paulo / SP</p>
            <p className="text-[10px] text-gray-500">CNPJ: 14.890.345/0001-90</p>
          </div>
          <div className="col-span-4 text-right">
            <div className="border border-gray-300 rounded px-2 py-1 text-center bg-gray-50">
              <span className="text-[10px] block text-gray-500 uppercase font-semibold">Competência</span>
              <span className="font-bold text-sm text-gray-800">{compLabel}</span>
            </div>
            <span className="text-[9px] text-amber-600 block mt-1 font-mono uppercase font-bold">Folha Mensal</span>
          </div>
        </div>

        {/* Employee Card */}
        <div className="grid grid-cols-12 border border-gray-300 p-2 rounded mb-3 bg-gray-50/50 gap-2">
          <div className="col-span-2 text-center border-r border-gray-200">
            <span className="text-[9px] text-gray-400 block font-normal uppercase">Cód</span>
            <span className="font-bold">{funcionario.id.toUpperCase()}</span>
          </div>
          <div className="col-span-5 border-r border-gray-200 px-2">
            <span className="text-[9px] text-gray-400 block font-normal uppercase">Nome do Colaborador</span>
            <span className="font-bold text-gray-900">{funcionario.nome}</span>
          </div>
          <div className="col-span-3 border-r border-gray-200 px-2">
            <span className="text-[9px] text-gray-400 block font-normal uppercase">Cargo</span>
            <span className="font-bold">{funcionario.cargo}</span>
          </div>
          <div className="col-span-2 px-2">
            <span className="text-[9px] text-gray-400 block font-normal uppercase">CPF</span>
            <span className="font-bold text-[10px]">{funcionario.cpf || '---'}</span>
          </div>
        </div>

        {/* Main calculation Table */}
        <div className="border border-gray-300 rounded overflow-hidden mb-3">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-[9px] border-b border-gray-350">
                <th className="py-1 px-2.5 w-12 text-center">Cód</th>
                <th className="py-1 px-2.5">Descrição do Item</th>
                <th className="py-1 px-2.5 w-24 text-center">Ref.</th>
                <th className="py-1 px-2.5 w-28 text-right bg-emerald-50 text-emerald-800">Vencimentos</th>
                <th className="py-1 px-2.5 w-28 text-right bg-rose-50 text-rose-800">Descontos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {entries.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/45 text-[10px] leading-relaxed">
                  <td className="py-1.5 px-2.5 text-center text-gray-400">{item.code}</td>
                  <td className="py-1.5 px-2.5 font-bold text-gray-700">{item.name}</td>
                  <td className="py-1.5 px-2.5 text-center text-gray-500">{item.ref}</td>
                  <td className="py-1.5 px-2.5 text-right font-semibold text-emerald-700 bg-emerald-50/20">
                    {item.type === 'provento' ? fmtMoeda(item.val) : ''}
                  </td>
                  <td className="py-1.5 px-2.5 text-right font-semibold text-rose-700 bg-rose-50/20">
                    {item.type === 'desconto' ? `(${fmtMoeda(item.val)})` : ''}
                  </td>
                </tr>
              ))}
              {/* Dummy spacing lines if empty to look structured */}
              {entries.length < 8 && Array.from({ length: 8 - entries.length }).map((_, idx) => (
                <tr key={`dummy-${idx}`} className="h-6">
                  <td className="py-1.5 px-2.5"></td>
                  <td className="py-1.5 px-2.5"></td>
                  <td className="py-1.5 px-2.5"></td>
                  <td className="py-1.5 px-2.5 bg-emerald-50/5"></td>
                  <td className="py-1.5 px-2.5 bg-rose-50/5"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="grid grid-cols-12 border border-gray-300 rounded mb-3 divide-x divide-gray-300">
          <div className="col-span-4 p-2 bg-gray-50 text-center">
            <span className="text-[9px] text-gray-400 block uppercase">Total Proventos (+)</span>
            <span className="text-xs font-bold text-emerald-800 font-mono">{fmtMoeda(holerite.total_bruto)}</span>
          </div>
          <div className="col-span-4 p-2 bg-gray-50 text-center">
            <span className="text-[9px] text-gray-400 block uppercase">Total Descontos (-)</span>
            <span className="text-xs font-bold text-rose-800 font-mono">({fmtMoeda(holerite.total_descontos)})</span>
          </div>
          <div className="col-span-4 p-2.5 bg-purple-950 text-white text-center">
            <span className="text-[9px] text-purple-200 block uppercase font-sans font-semibold">Valor Líquido a Receber</span>
            <span className="text-sm font-black font-mono text-amber-400">{fmtMoeda(holerite.salario_liquido)}</span>
          </div>
        </div>

        {/* Wage bases calculations (Tax indicators block) */}
        <div className="border border-gray-300 p-2.5 rounded bg-gray-50 leading-relaxed grid grid-cols-5 text-center gap-1.5 text-[9px] text-gray-500 mb-3 uppercase">
          <div className="border-r border-gray-200">
            <span className="block font-normal">Salário Base</span>
            <span className="block font-bold text-gray-800">{fmtMoeda(holerite.salario_base)}</span>
          </div>
          <div className="border-r border-gray-200">
            <span className="block font-normal">Base Cálc. INSS</span>
            <span className="block font-bold text-gray-800">{fmtMoeda(holerite.salario_base)}</span>
          </div>
          <div className="border-r border-gray-200">
            <span className="block font-normal">FGTS Mensal (8%)</span>
            <span className="block font-bold text-gray-800">{fmtMoeda(calculatedFGTS)}</span>
          </div>
          <div className="border-r border-gray-200 text-purple-900 font-semibold lowercase">
            <span className="block font-normal uppercase">Custo FGTS Empresa</span>
            <span className="block font-bold uppercase">{fmtMoeda(calculatedFGTS)}</span>
          </div>
          <div>
            <span className="block font-normal text-amber-700">Aluguel Moto</span>
            <span className="block font-bold text-amber-700">{fmtMoeda(holerite.aluguel_moto)}</span>
          </div>
        </div>

        {/* Banking and receipt details */}
        <div className="border border-gray-300 p-3 rounded mb-3 flex flex-col md:flex-row justify-between items-start md:items-center bg-purple-50/30 gap-2">
          <div className="flex items-center space-x-2">
            <Landmark className="w-5 h-5 text-purple-800 shrink-0" />
            <div className="text-[10px]">
              <span className="font-bold block text-purple-900 uppercase">Dados para PIX / Depósito</span>
              <span className="text-gray-600 font-mono">
                Banco: {funcionario.banco || 'Itaú'} · Ag: {funcionario.agencia || '---'} · C: {funcionario.conta || '---'}
              </span>
              <span className="block text-gray-950 font-bold">PIX Cadastrado: <span className="font-mono">{funcionario.pix || 'andre.ibm.rocha@gmail.com'}</span></span>
            </div>
          </div>
          <div className="bg-emerald-100 text-emerald-850 px-2 py-1 rounded border border-emerald-250 flex items-center space-x-1 font-sans font-bold text-[9px] shrink-0 uppercase">
            <Check className="w-3 h-3 text-emerald-800" />
            <span>Crédito em Conta Concluído</span>
          </div>
        </div>

        {/* Declaração de RECEBIDO (Standard signature slip) */}
        <div className="border border-dashed border-gray-400 p-3 rounded mt-4 bg-gray-50/30 text-[9px] leading-relaxed text-gray-500">
          <div className="flex justify-between items-center mb-2 border-b border-gray-200 pb-1 uppercase font-bold text-gray-700">
            <span>Declaração de Recebimento de Valores</span>
            <span>Recibo nº {holerite.id.split('-')[1]?.toUpperCase() || 'FOLHA'}</span>
          </div>
          <p>
            Declaro ter recebido da empresa <span className="font-semibold text-gray-700 uppercase">IBEC Express Motoboy e Logística Ltda</span>, a importância líquida de <span className="font-bold text-gray-800">{fmtMoeda(holerite.salario_liquido)} ({holerite.salario_liquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})</span> informada neste recibo de vencimento, referente à competência fiscal de {compLabel}.
          </p>
          <div className="grid grid-cols-12 gap-4 mt-6 items-end">
            <div className="col-span-5 border-b border-gray-400 text-center pb-1">
              <span>____/____/2026</span>
              <span className="block text-[8px] text-gray-400">DATA DO PAGAMENTO</span>
            </div>
            <div className="col-span-7 border-b border-gray-400 text-center pb-1 uppercase font-bold text-gray-700">
              <span className="block truncate font-mono text-[9px]">{funcionario.nome}</span>
              <span className="block text-[8px] text-gray-400 font-normal">ASSINATURA DO COLABORADOR</span>
            </div>
          </div>
        </div>

      </div>

      {/* Helpful Hint Block */}
      <div className="mt-4 p-3.5 bg-yellow-50 text-amber-900 border border-yellow-150 rounded-lg text-xs leading-relaxed flex items-start space-x-2 no-print">
        <Award className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <h4 className="font-bold text-amber-950 font-sans">Regra de Negociação IBEC Convenção Coletiva:</h4>
          <ul className="list-disc ml-4 space-y-0.5 mt-1 font-serif">
            <li><strong>Aluguel de Moto (R$ {holerite.aluguel_moto}):</strong> Pago como Provento livre de impostos trabalhistas de folha; não pode constar como desconto fiscal.</li>
            <li><strong>FGTS Empresa (8%):</strong> Custo inteiramente pago pela empresa ao governo; não é deduzido do salário líquido do empregado.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
