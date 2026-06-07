import { useState } from 'react';
import { Holerite, Funcionario } from '../types';
import { fmtMoeda, fmtCompetencia } from '../lib/calculos';
import HoleriteVisual from './HoleriteVisual';
import { 
  Plus, 
  Settings, 
  HelpCircle, 
  Users, 
  Calculator, 
  Grid, 
  FileText, 
  Check, 
  CheckSquare, 
  Info,
  Calendar
} from 'lucide-react';

interface HoleritesViewProps {
  holerites: Holerite[];
  funcionarios: Funcionario[];
  onGenerateBatch: (month: string) => Promise<{ criados: number; total: number }>;
  onUpdateStatus: (id: string, status: 'pendente' | 'pago' | 'aprovado') => void;
  onPayAllHolerites: (month: string) => void;
  onSaveHolerite: (holerite: Holerite) => void;
  onSuccessToast: (msg: string) => void;
}

export default function HoleritesView({
  holerites,
  funcionarios,
  onGenerateBatch,
  onUpdateStatus,
  onPayAllHolerites,
  onSaveHolerite,
  onSuccessToast
}: HoleritesViewProps) {
  // Month filter (competencia format "2026-06")
  const [selectedMonth, setSelectedMonth] = useState('2026-06');
  const [selectedHolerite, setSelectedHolerite] = useState<Holerite | null>(null);

  // Editing state for extra workorders
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedOS, setEditedOS] = useState('');
  const [editedVT, setEditedVT] = useState('');
  const [editedFuel, setEditedFuel] = useState('');
  const [editedOdonto, setEditedOdonto] = useState('');

  // 1. Filter holerites by selected month
  const currentHolerites = holerites.filter(
    h => h.competencia.substring(0, 7) === selectedMonth
  );

  const handleGenerate = async () => {
    try {
      const res = await onGenerateBatch(selectedMonth);
      onSuccessToast(`Processamento Concluído! Criados: ${res.criados} holerites de um total de ${res.total} funcionários.`);
      // Deselect selected holerite to avoid stale info
      setSelectedHolerite(null);
    } catch {
      alert('Houve um erro ao processar lote!');
    }
  };

  const handlePayAll = () => {
    if (confirm(`Deseja liquidar faturamento folha integralmente para o mês de ${fmtCompetencia(selectedMonth)}? Prol de Caixa e Contas a Pagar serão criados automático!`)) {
      onPayAllHolerites(selectedMonth);
      onSuccessToast(`Todos os holerites do mês de ${fmtCompetencia(selectedMonth)} foram marcados como pagos!`);
      setSelectedHolerite(null);
    }
  };

  const handleStartEdit = (h: Holerite) => {
    setEditingId(h.id);
    setEditedOS(String(h.ordem_servico));
    setEditedVT(String(h.desc_vale_transporte));
    setEditedFuel(String(h.desc_combustivel));
    setEditedOdonto(String(h.desc_plano_odonto));
  };

  const handleSaveEdit = (h: Holerite) => {
    const os = parseFloat(editedOS) || 0;
    const vt = parseFloat(editedVT) || 0;
    const fuel = parseFloat(editedFuel) || 0;
    const odonto = parseFloat(editedOdonto) || 0;

    const is = h.desc_inss; // Retain progressive INSS calculated or recalculate if needed

    const updated: Holerite = {
      ...h,
      ordem_servico: os,
      desc_vale_transporte: vt,
      desc_combustivel: fuel,
      desc_plano_odonto: odonto,
      total_bruto: Number((h.salario_base + h.aluguel_moto + h.vr + h.periculosidade + h.cesta_basica + h.sal_familia + os).toFixed(2)),
      total_descontos: Number((vt + is + h.desc_falta + fuel + odonto + h.desc_uniforme + h.desc_outros).toFixed(2)),
      salario_liquido: Number((
        (h.salario_base + h.aluguel_moto + h.vr + h.periculosidade + h.cesta_basica + h.sal_familia + os) - 
        (vt + is + h.desc_falta + fuel + odonto + h.desc_uniforme + h.desc_outros)
      ).toFixed(2))
    };

    onSaveHolerite(updated);
    setEditingId(null);
    onSuccessToast('Variações da folha salvas com sucesso!');
    setSelectedHolerite(updated); // Update preview card
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 font-sans">Holerites & Folha Mensal de Pagamentos</h2>
          <p className="text-xs text-gray-500 font-sans">
            Módulo financeiro da CLT SP. Processamento simplificado em lote com taxas e proventos específicos de motoqueiros alocados.
          </p>
        </div>
        
        {/* Actions Controls panel */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
          <div className="flex items-center space-x-1 border border-gray-300 rounded-lg p-1 bg-gray-50 text-xs shrink-0">
            <Calendar className="w-3.5 h-3.5 text-gray-400 ml-1.5 shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setSelectedHolerite(null); // Clear preview when switching months
              }}
              className="text-xs bg-transparent p-1 px-2 font-bold text-gray-800 outline-none"
            >
              <option value="2026-05">Maio de 2026</option>
              <option value="2026-06">Junho de 2026</option>
              <option value="2026-07">Julho de 2026</option>
              <option value="2026-08">Agosto de 2026</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            className="flex items-center space-x-2 bg-purple-950 text-white font-bold hover:bg-purple-900 text-xs px-3.5 py-2 rounded-lg shadow cursor-pointer text-center"
            title="Procure funcionários sem holerite neste mês e crie-os"
          >
            <Calculator className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Processar Folha do Mês</span>
          </button>

          {currentHolerites.length > 0 && currentHolerites.some(h => h.status === 'pendente') && (
            <button
              onClick={handlePayAll}
              className="flex items-center space-x-1 bg-emerald-600 text-white font-bold hover:bg-emerald-700 text-xs px-3.5 py-2 rounded-lg shadow cursor-pointer text-center"
            >
              <CheckSquare className="w-4 h-4 shrink-0" />
              <span>Marcar Todas como Pagas</span>
            </button>
          )}
        </div>
      </div>

      {/* Main split display: table vs preview paper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Table Ledger: List of generated holerites */}
        <div className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm lg:col-span-12 xl:col-span-7">
          <h3 className="font-bold text-xs uppercase mb-3 text-purple-950 flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-purple-800" />
            <span>Lista de Folha de {fmtCompetencia(selectedMonth)} ({currentHolerites.length})</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-550 bg-gray-50 text-[10px] text-gray-550 border-b border-gray-200 uppercase font-bold text-gray-500">
                  <th className="py-2.5 px-3">Colaborador / Cargo</th>
                  <th className="py-2.5 px-3 text-right">Bruto (+)</th>
                  <th className="py-2.5 px-3 text-right">Descontos (-)</th>
                  <th className="py-2.5 px-3 text-right">Previsão Líquido</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 leading-relaxed font-sans">
                {currentHolerites.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400">
                      Nenhum holerite processado para esta competência ainda. Clique em "Processar Folha do Mês" para iniciar!
                    </td>
                  </tr>
                ) : (
                  currentHolerites.map((h) => {
                    const isEditing = editingId === h.id;
                    const isSelected = selectedHolerite?.id === h.id;
                    
                    return (
                      <tr 
                        key={h.id} 
                        className={`hover:bg-gray-50/40 transition-colors cursor-pointer ${
                          isSelected ? 'bg-purple-50/20 font-semibold border-l-4 border-l-purple-850' : ''
                        }`}
                        onClick={() => setSelectedHolerite(h)}
                      >
                        <td className="py-3 px-3">
                          <div className="font-bold text-gray-900">{h.funcionario?.nome}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{h.funcionario?.cargo}</div>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-800 font-mono">
                          {isEditing ? (
                            <span className="text-[10px] text-gray-400">Em editor...</span>
                          ) : (
                            fmtMoeda(h.total_bruto)
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-rose-800 font-mono">
                          {isEditing ? (
                            <span className="text-[10px] text-gray-400">Em editor...</span>
                          ) : (
                            `(${fmtMoeda(h.total_descontos)})`
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-extrabold text-purple-950 font-mono text-sm">
                          {isEditing ? (
                            <span className="text-[10px] text-gray-400">Em editor...</span>
                          ) : (
                            fmtMoeda(h.salario_liquido)
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-block ${
                            h.status === 'pago' 
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-850'
                          }`}>
                            {h.status === 'pago' ? 'Pago' : 'Pendente'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                            {isEditing ? (
                              <button
                                onClick={() => handleSaveEdit(h)}
                                className="bg-purple-950 text-white text-[10px] font-bold px-2.5 py-1 rounded transition-all cursor-pointer"
                              >
                                Gravar
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStartEdit(h)}
                                className="text-purple-900 hover:text-purple-950 hover:bg-purple-50 px-2 py-1 rounded text-[10px] font-bold transition-all border border-purple-200 cursor-pointer"
                                title="Editar Proventos e Descontos extras"
                              >
                                Ajustar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Quick adjust inline forms block if actively editing */}
          {editingId && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4 space-y-3">
              <h4 className="text-xs font-bold text-amber-950">Ajuste de Variáveis de Folha Manual:</h4>
              <div className="grid grid-cols-2 shadow-inner sm:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-gray-150">
                <div>
                  <label className="block text-[10px] font-bold text-gray-650 uppercase">Ordem de Serviço (OS)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editedOS}
                    onChange={(e) => setEditedOS(e.target.value)}
                    className="w-full text-xs font-mono font-bold border border-gray-300 rounded p-1 text-purple-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-650 uppercase">Desconto VT (R$)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editedVT}
                    onChange={(e) => setEditedVT(e.target.value)}
                    className="w-full text-xs font-mono font-bold border border-gray-300 rounded p-1 text-rose-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-650 uppercase">Descon. Combustível</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editedFuel}
                    onChange={(e) => setEditedFuel(e.target.value)}
                    className="w-full text-xs font-mono font-bold border border-gray-300 rounded p-1 text-rose-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-650 uppercase">Plano Odontológico</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editedOdonto}
                    onChange={(e) => setEditedOdonto(e.target.value)}
                    className="w-full text-xs font-mono font-bold border border-gray-300 rounded p-1 text-rose-800"
                  />
                </div>
              </div>
              <p className="text-[10px] text-amber-800">Nota: Ao salvar, o faturamento total bruto, descontos e líquido deste colaborador serão re-calculados imediatamente!</p>
            </div>
          )}
        </div>

        {/* Paper visualizer preview column */}
        <div className="lg:col-span-12 xl:col-span-5">
          {selectedHolerite ? (
            <HoleriteVisual 
              holerite={selectedHolerite} 
              funcionario={selectedHolerite.funcionario!} 
            />
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-400 h-96 flex flex-col justify-center items-center">
              <FileText className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-xs font-bold text-gray-500">Selecione uma linha de folha</p>
              <p className="text-[10px] text-gray-400 mt-1 max-w-xs">
                Selecione qualquer colaborador na planilha ao lado para visualizar e imprimir seu contracheque fiscal individual em PDF.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
