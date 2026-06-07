import React, { useState } from 'react';
import { ContaPagar } from '../types';
import { fmtMoeda, fmtData } from '../lib/calculos';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  Trash2, 
  X, 
  Calendar, 
  FileText, 
  HelpCircle,
  HelpCircle as QuestionIcon
} from 'lucide-react';

interface ContasPagarViewProps {
  contas: ContaPagar[];
  onSaveConta: (conta: Omit<ContaPagar, 'id'> & { id?: string }) => void;
  onPayConta: (id: string) => void;
  onDeleteConta: (id: string) => void;
  onSuccessToast: (msg: string) => void;
}

export default function ContasPagarView({
  contas,
  onSaveConta,
  onPayConta,
  onDeleteConta,
  onSuccessToast
}: ContasPagarViewProps) {
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [categoryFilter, setCategoryFilter] = useState('todos');

  // Input form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [descricao, setDescricao] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [categoria, setCategoria] = useState('Operacional');
  const [valor, setValor] = useState('');
  const [vencimento, setVencimento] = useState(new Date().toISOString().substring(0, 10));
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [banco, setBanco] = useState('Itaú');
  const [numeroNota, setNumeroNota] = useState('');
  const [recorrente, setRecorrente] = useState(false);
  const [observacoes, setObservacoes] = useState('');

  // 1. Unique categories list for filters
  const categoriesList = Array.from(new Set(contas.map(c => c.categoria)));

  // 2. Filtered data computation
  const filteredContas = contas.filter(c => {
    const matchesSearch = c.descricao.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (c.fornecedor || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'todos' || c.categoria === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao || !valor || parseFloat(valor) <= 0) {
      alert('Por favor, preencha a descrição e um valor de despesa válido!');
      return;
    }

    onSaveConta({
      descricao,
      fornecedor: fornecedor || undefined,
      categoria,
      valor: parseFloat(valor),
      vencimento,
      status: 'pendente',
      forma_pagamento: formaPagamento,
      banco: banco || undefined,
      numero_nota: numeroNota || undefined,
      recorrente,
      recorrencia_meses: 1,
      observacoes: observacoes || undefined
    });

    // Reset fields and close
    setDescricao('');
    setFornecedor('');
    setCategoria('Operacional');
    setValor('');
    setVencimento(new Date().toISOString().substring(0, 10));
    setFormaPagamento('PIX');
    setNumeroNota('');
    setRecorrente(false);
    setObservacoes('');
    setIsModalOpen(false);
    
    onSuccessToast('Despesa financeira agendada com sucesso!');
  };

  return (
    <div className="space-y-6">
      {/* List Header and Action Trigger */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-xl border border-gray-150 shadow-sm gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 font-sans">Contas a Pagar / Despesas</h2>
          <p className="text-xs text-gray-500">Fluxo completo de controle de faturamento de passivos, taxas e custos de frota.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-purple-950 text-white hover:bg-purple-900 font-semibold text-xs px-4 py-2 rounded-lg shadow-sm font-sans transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Conta / Lançamento</span>
        </button>
      </div>

      {/* Filters bar widget */}
      <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative flex-grow max-w-md min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por descrição ou credor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs border border-gray-300 rounded-lg pl-9 pr-4 py-2 focus:ring-1 focus:ring-purple-800 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-550 mr-1.5 font-bold">Filtros:</span>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg p-1.5 text-xs bg-white text-gray-700 outline-none"
          >
            <option value="todos">Status: Todos</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="vencido">Vencido</option>
            <option value="cancelado">Cancelado</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-lg p-1.5 text-xs bg-white text-gray-700 outline-none"
          >
            <option value="todos">Categoria: Todas</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main accounts payable table ledger */}
      <div className="bg-white rounded-xl border border-gray-150 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Classificação / Descrição</th>
                <th className="py-3 px-4">Fornecedor</th>
                <th className="py-3 px-4">Vencimento</th>
                <th className="py-3 px-4">Forma Pagto</th>
                <th className="py-3 px-4 text-right">Valor Bruto</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 text-xs">
              {filteredContas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    Nenhum faturamento de despesa localizado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredContas.map((c) => {
                  const todayStr = new Date().toISOString().substring(0, 10);
                  const isOverdue = c.status === 'pendente' && c.vencimento < todayStr;
                  
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900">{c.descricao}</div>
                        <div className="flex items-center space-x-1.5 text-[10px] mt-0.5">
                          <span className="bg-purple-100 text-purple-800 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase">
                            {c.categoria}
                          </span>
                          {c.recorrente && (
                            <span className="bg-blue-105 text-blue-800 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">
                              MENSAL RECORRENTE
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{c.fornecedor || '---'}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span className={isOverdue ? 'text-red-650 font-bold' : ''}>
                            {fmtData(c.vencimento)}
                          </span>
                        </div>
                        {c.data_pagamento && (
                          <span className="text-[10px] text-emerald-600 block leading-none mt-1">
                            Pago em: {fmtData(c.data_pagamento)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-500">{c.forma_pagamento}</td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900 font-mono">
                        {fmtMoeda(c.valor)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-block ${
                          c.status === 'pago' 
                            ? 'bg-emerald-100 text-emerald-800'
                            : isOverdue
                            ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {c.status === 'pago' ? 'Pago' : isOverdue ? 'Atrasado' : 'Aberto'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-2.5">
                          {c.status === 'pendente' && (
                            <button
                              onClick={() => {
                                onPayConta(c.id);
                                onSuccessToast(`Despesa "${c.descricao}" foi marcada como paga!`);
                              }}
                              className="text-emerald-700 hover:text-emerald-900 font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.8 rounded text-[10px] transition-all cursor-pointer flex items-center space-x-1"
                              title="Marcar como Pago"
                            >
                              <CheckCircle className="w-3 h-3" />
                              <span>Pagar</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm('Deseja realmente deletar este faturamento de despesa?')) {
                                onDeleteConta(c.id);
                                onSuccessToast('Conta deletada e removida das pendências.');
                              }
                            }}
                            className="text-gray-405 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-all cursor-pointer"
                            title="Remover Registro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL WINDOW FOR NEW ACCOUNT INPUT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-150 w-full max-w-lg overflow-hidden animate-slideUp">
            {/* Modal Header */}
            <div className="bg-purple-950 text-white px-5 py-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">Cadastrar Novo Custo / Conta a Pagar</h3>
                <p className="text-[11px] text-purple-200">Preencha os dados oficiais de faturamento da despesa</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-purple-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Descrição Curta *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Guia FGTS Mensal, Aluguel Escritório"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Fornecedor / Credor</label>
                  <input
                    type="text"
                    placeholder="Ex: Caixa, Imobiliária, Sabesp"
                    value={fornecedor}
                    onChange={(e) => setFornecedor(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Categoria de Custo *</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 bg-white focus:ring-1 focus:ring-purple-800"
                  >
                    <option value="Operacional">Operacional</option>
                    <option value="FGTS">FGTS / Impostos</option>
                    <option value="Aluguel">Aluguel / Imóvel</option>
                    <option value="Combustível">Combustível / Frota</option>
                    <option value="Manutenção Frota">Manutenção Frota</option>
                    <option value="Plano Saúde">Plano Saúde / Benefício</option>
                    <option value="Seguro">Seguro Geral</option>
                    <option value="Rescisão">Deduções de Rescisão</option>
                    <option value="Aviso Prévio">Aviso Prévio</option>
                    <option value="Outros">Outros Extras</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Valor Bruto (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0.01"
                    placeholder="0.00"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Data de Vencimento *</label>
                  <input
                    type="date"
                    required
                    value={vencimento}
                    onChange={(e) => setVencimento(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Forma de Pagamento</label>
                  <select
                    value={formaPagamento}
                    onChange={(e) => setFormaPagamento(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 bg-white focus:ring-1 focus:ring-purple-800"
                  >
                    <option value="PIX">PIX</option>
                    <option value="Boleto">Boleto Bancário</option>
                    <option value="Guia Código de Barras">Guia Código de Barras</option>
                    <option value="Débito Automático">Débito Automático</option>
                    <option value="Transferência (TED/DOC)">TED / DOC</option>
                    <option value="Dinheiro">Espécie / Caixa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Banco de Lançamento</label>
                  <input
                    type="text"
                    placeholder="Ex: Itaú, Bradesco, Santander"
                    value={banco}
                    onChange={(e) => setBanco(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-800"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Número de Nota Fiscal / Documento</label>
                  <input
                    type="text"
                    placeholder="Opcional. Ex: NF-8120"
                    value={numeroNota}
                    onChange={(e) => setNumeroNota(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-800"
                  />
                </div>

                <div className="col-span-2 flex items-center space-x-2 text-xs py-1">
                  <input
                    type="checkbox"
                    id="chk-recorrente"
                    checked={recorrente}
                    onChange={(e) => setRecorrente(e.target.checked)}
                    className="rounded border-gray-300 text-purple-900 focus:ring-purple-800 w-4 h-4"
                  />
                  <label htmlFor="chk-recorrente" className="font-bold text-gray-700 select-none cursor-pointer">
                    Esta conta possui Recorrência Mensal Automatizada (Contrato fixo)
                  </label>
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Observações / Anotações Gerais</label>
                  <textarea
                    rows={2}
                    placeholder="Escreva detalhes adicionais deste lançamento se necessário..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-800"
                  ></textarea>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-purple-950 hover:bg-purple-900 text-white font-semibold text-xs px-5 py-2 rounded-lg shadow cursor-pointer transition-colors"
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
