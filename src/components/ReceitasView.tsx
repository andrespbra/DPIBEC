import React, { useState } from 'react';
import { Receita, Cliente } from '../types';
import { fmtMoeda, fmtData } from '../lib/calculos';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  Trash2, 
  X, 
  Calendar, 
  ArrowUpRight 
} from 'lucide-react';

interface ReceitasViewProps {
  receitas: Receita[];
  clientes: Cliente[];
  onSaveReceita: (receita: Omit<Receita, 'id'> & { id?: string }) => void;
  onReceiveReceita: (id: string) => void;
  onDeleteReceita: (id: string) => void;
  onSuccessToast: (msg: string) => void;
}

export default function ReceitasView({
  receitas,
  clientes,
  onSaveReceita,
  onReceiveReceita,
  onDeleteReceita,
  onSuccessToast
}: ReceitasViewProps) {
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [clientFilter, setClientFilter] = useState('todos');

  // New item modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cliente, setCliente] = useState('TMF');
  const [servico, setServico] = useState('Entrega/Moto');
  const [valor, setValor] = useState('');
  const [dataEmissao, setDataEmissao] = useState(new Date().toISOString().substring(0, 10));
  const [descricao, setDescricao] = useState('');
  const [numeroNota, setNumeroNota] = useState('');
  const [formaRecebimento, setFormaRecebimento] = useState('Transferência Bancária');
  const [observacoes, setObservacoes] = useState('');

  // 1. Data filtering
  const filteredReceitas = receitas.filter(r => {
    const matchesSearch = r.servico.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (r.descricao || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || r.status === statusFilter;
    const matchesClient = clientFilter === 'todos' || r.cliente === clientFilter;
    return matchesSearch && matchesStatus && matchesClient;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valor || parseFloat(valor) <= 0) {
      alert('Preencha um valor líquido de faturamento válido!');
      return;
    }

    onSaveReceita({
      cliente,
      servico,
      descricao: descricao || undefined,
      valor: parseFloat(valor),
      data_emissao: dataEmissao,
      status: 'pendente',
      forma_recebimento: formaRecebimento,
      numero_nota: numeroNota || undefined,
      observacoes: observacoes || undefined
    });

    // Reset and close
    setCliente('TMF');
    setServico('Entrega/Moto');
    setValor('');
    setDataEmissao(new Date().toISOString().substring(0, 10));
    setDescricao('');
    setNumeroNota('');
    setFormaRecebimento('Transferência Bancária');
    setObservacoes('');
    setIsModalOpen(false);

    onSuccessToast('Previsão de recebimento agendada com sucesso!');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-xl border border-gray-150 shadow-sm gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 font-sans">Controle de Faturamento / Receitas</h2>
          <p className="text-xs text-gray-500">Acompanhamento e faturamento de contratos corporativos de transporte, mensais e rotas.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-purple-950 text-white hover:bg-purple-900 font-semibold text-xs px-4 py-2 rounded-lg shadow-sm font-sans transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Faturamento Recibo</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative flex-grow max-w-md min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por serviço, descrição ou motoboy..."
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
            <option value="recebido">Recebido</option>
            <option value="cancelado">Cancelado</option>
            <option value="inadimplente">Inadimplente</option>
          </select>

          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="border border-gray-300 rounded-lg p-1.5 text-xs bg-white text-gray-700 outline-none"
          >
            <option value="todos">Cliente: Todos</option>
            {clientes.map(c => (
              <option key={c.id} value={c.nome}>{c.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Revenues Table */}
      <div className="bg-white rounded-xl border border-gray-150 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans font-normal">
            <thead>
              <tr className="bg-gray-550 bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Devedor / Cliente</th>
                <th className="py-3 px-4">Serviço Alocado</th>
                <th className="py-3 px-4">Emissão</th>
                <th className="py-3 px-4 text-right">Valor Líquido</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 text-xs">
              {filteredReceitas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    Nenhum faturamento de receita localizado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredReceitas.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-purple-950 flex items-center space-x-1.5">
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{r.cliente}</span>
                      </div>
                      {r.descricao && (
                        <span className="text-[10px] text-gray-400 block mt-0.5 max-w-sm truncate" title={r.descricao}>
                          {r.descricao}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-800">{r.servico}</div>
                      {r.numero_nota && (
                        <span className="text-[9px] bg-gray-100 text-gray-600 px-1 py-0.2 rounded font-mono block w-fit mt-0.5">
                          DOC: {r.numero_nota}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{fmtData(r.data_emissao)}</span>
                      </div>
                      {r.data_recebimento && (
                        <span className="text-[10px] text-emerald-600 block leading-none mt-1">
                          Recebido em: {fmtData(r.data_recebimento)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700 font-mono text-sm">
                      {fmtMoeda(r.valor)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-block ${
                        r.status === 'recebido' 
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.status === 'recebido' ? 'Recebido' : 'Aguardando'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-2.5">
                        {r.status === 'pendente' && (
                          <button
                            onClick={() => {
                              onReceiveReceita(r.id);
                              onSuccessToast(`Recebimento do cliente ${r.cliente} liquidado em caixa!`);
                            }}
                            className="text-emerald-700 hover:text-emerald-950 font-bold bg-emerald-50 hover:bg-emerald-110 border border-emerald-250 px-2 py-0.8 rounded text-[10px] transition-all cursor-pointer flex items-center space-x-1"
                            title="Confirmar Depósito"
                          >
                            <CheckCircle className="w-3 h-3 text-emerald-800" />
                            <span>Liquidar</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm('Deletar faturamento deste cliente do histórico?')) {
                              onDeleteReceita(r.id);
                              onSuccessToast('Receita removida.');
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW RECEITA MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-150 w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="bg-purple-950 text-white px-5 py-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">Registrar Novo Faturamento de Cliente</h3>
                <p className="text-[11px] text-purple-200">Insira as ordens de faturamento geradas ou contratos vigentes</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-purple-300 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Cliente Solicitante *</label>
                  <select
                    value={cliente}
                    onChange={(e) => {
                      setCliente(e.target.value);
                      // Default services based on template clients
                      if (e.target.value === 'TMF') setServico('Entrega/Moto');
                      if (e.target.value === 'Correios') setServico('Entrega Postal');
                      if (e.target.value === 'STYLO') setServico('Logística');
                      if (e.target.value === 'BOX') setServico('Armazenagem');
                    }}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 bg-white focus:ring-1 focus:ring-purple-800"
                  >
                    {clientes.map(c => (
                      <option key={c.id} value={c.nome}>{c.nome}</option>
                    ))}
                    <option value="Outro Cliente">Outros / Avulsos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Tipo de Serviço *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Entrega/Moto, Armazenagem, Frete Kombi"
                    value={servico}
                    onChange={(e) => setServico(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Valor do Faturamento (R$) *</label>
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
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Data de Emissão *</label>
                  <input
                    type="date"
                    required
                    value={dataEmissao}
                    onChange={(e) => setDataEmissao(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Canal de Depósito</label>
                  <select
                    value={formaRecebimento}
                    onChange={(e) => setFormaRecebimento(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 bg-white focus:ring-1 focus:ring-purple-800"
                  >
                    <option value="Transferência Bancária">Transferência Bancária (TED/PIX)</option>
                    <option value="Boleto">Boleto Pago</option>
                    <option value="Dinheiro">Dinheiro Físico</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Número de Fatura (NFe)</label>
                  <input
                    type="text"
                    placeholder="Ex: NF-1090"
                    value={numeroNota}
                    onChange={(e) => setNumeroNota(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-800"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Descrição do Serviço / Motoboys Envolvidos</label>
                  <input
                    type="text"
                    placeholder="Ex: Alocação do motoboy fixo para rotas administrativas Daniela"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-800"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Notas Gerais</label>
                  <textarea
                    rows={2}
                    placeholder="Escreva anotações internas adicionais sobre este contrato..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-800"
                  ></textarea>
                </div>
              </div>

              {/* Actions */}
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
                  Agendar Faturamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
