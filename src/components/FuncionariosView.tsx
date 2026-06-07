import React, { useState } from 'react';
import { Funcionario, StatusFuncionario } from '../types';
import { fmtMoeda, fmtData } from '../lib/calculos';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  X, 
  UserPlus, 
  Contact, 
  Landmark, 
  Calendar,
  Layers,
  Edit2
} from 'lucide-react';

interface FuncionariosViewProps {
  funcionarios: Funcionario[];
  onSaveFuncionario: (f: Omit<Funcionario, 'id'> & { id?: string }) => void;
  onDeleteFuncionario: (id: string) => void;
  onSuccessToast: (msg: string) => void;
}

export default function FuncionariosView({
  funcionarios,
  onSaveFuncionario,
  onDeleteFuncionario,
  onSuccessToast
}: FuncionariosViewProps) {
  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Modal open
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form Fields
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [cargo, setCargo] = useState('Motorista');
  const [salario, setSalario] = useState('1483.29'); // default convenção
  const [aluguelMoto, setAluguelMoto] = useState('689.65'); // default convenção
  const [vr, setVr] = useState('407.00'); // VA / VR estimativa
  const [periculosidade, setPericulosidade] = useState('444.99'); // default convenção
  const [cestaBasica, setCestaBasica] = useState('76.92'); // default convenção
  const [salFamilia, setSalFamilia] = useState('0');
  const [status, setStatus] = useState<StatusFuncionario>('ativo');
  const [dataAdmissao, setDataAdmissao] = useState('');
  const [dataDemissao, setDataDemissao] = useState('');
  const [banco, setBanco] = useState('Itaú');
  const [agencia, setAgencia] = useState('');
  const [conta, setConta] = useState('');
  const [pix, setPix] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // 1. Filtering
  const filteredFuncs = funcionarios.filter(f => {
    const matchesSearch = f.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          f.cargo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateNewClick = () => {
    setEditId(null);
    setNome('');
    setCpf('');
    setCargo('Motorista');
    setSalario('1483.29');
    setAluguelMoto('689.65');
    setVr('407.00');
    setPericulosidade('444.99');
    setCestaBasica('76.92');
    setSalFamilia('0');
    setStatus('ativo');
    setDataAdmissao(new Date().toISOString().substring(0, 10));
    setDataDemissao('');
    setBanco('Itaú');
    setAgencia('');
    setConta('');
    setPix('');
    setObservacoes('');
    setIsModalOpen(true);
  };

  const handleEditClick = (f: Funcionario) => {
    setEditId(f.id);
    setNome(f.nome);
    setCpf(f.cpf || '');
    setCargo(f.cargo);
    setSalario(String(f.salario));
    setAluguelMoto(String(f.aluguel_moto));
    setVr(String(f.vr));
    setPericulosidade(String(f.periculosidade));
    setCestaBasica(String(f.cesta_basica));
    setSalFamilia(String(f.sal_familia));
    setStatus(f.status);
    setDataAdmissao(f.data_admissao || '');
    setDataDemissao(f.data_demissao || '');
    setBanco(f.banco || '');
    setAgencia(f.agencia || '');
    setConta(f.conta || '');
    setPix(f.pix || '');
    setObservacoes(f.observacoes || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) {
      alert('Preencha o nome do colaborador!');
      return;
    }

    onSaveFuncionario({
      id: editId || undefined,
      nome: nome.toUpperCase(),
      cpf: cpf || undefined,
      cargo,
      salario: parseFloat(salario) || 0,
      aluguel_moto: parseFloat(aluguelMoto) || 0,
      vr: parseFloat(vr) || 0,
      periculosidade: parseFloat(periculosidade) || 0,
      cesta_basica: parseFloat(cestaBasica) || 0,
      sal_familia: parseFloat(salFamilia) || 0,
      status,
      data_admissao: dataAdmissao || undefined,
      data_demissao: dataDemissao || undefined,
      banco: banco || undefined,
      agencia: agencia || undefined,
      conta: conta || undefined,
      pix: pix || undefined,
      observacoes: observacoes || undefined
    });

    setIsModalOpen(false);
    onSuccessToast(editId ? 'Fila do colaborador atualizada.' : 'Novo colaborador cadastrado com sucesso!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-xl border border-gray-150 shadow-sm gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 font-sans">Gestão de Funcionários / Equipe</h2>
          <p className="text-xs text-gray-500">Módulo completo para cadastro de contracheques, cargos, chaves pix bancárias e proventos base.</p>
        </div>
        <button
          onClick={handleCreateNewClick}
          className="flex items-center space-x-2 bg-purple-950 text-white hover:bg-purple-900 font-semibold text-xs px-4 py-2 rounded-lg shadow cursor-pointer transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Colaborador</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative flex-grow max-w-md min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou cargo do colaborador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs border border-gray-300 rounded-lg pl-9 pr-4 py-2 focus:ring-1 focus:ring-purple-800 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-550 font-bold mr-1.5">Filtros:</span>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg p-1.5 text-xs bg-white text-gray-700 outline-none"
          >
            <option value="todos">Status: Todos</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="ferias">Férias</option>
            <option value="afastado">Afastado</option>
          </select>
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFuncs.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-400 bg-white rounded-xl border border-gray-150 p-6 leading-relaxed">
            Nenhum funcionário localizado para os termos indicados.
          </div>
        ) : (
          filteredFuncs.map((f) => (
            <div key={f.id} className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow relative">
              
              {/* Badge status */}
              <span className={`absolute top-4 right-4 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                f.status === 'ativo' 
                  ? 'bg-emerald-100 text-emerald-800'
                  : f.status === 'ferias'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-805'
              }`}>
                {f.status}
              </span>

              {/* Name & Title */}
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-purple-950 uppercase pr-16 truncate">{f.nome}</h3>
                <p className="text-xs text-gray-500 font-sans tracking-wide">{f.cargo}</p>
              </div>

              {/* Salary Proventos Summary */}
              <div className="border-t border-b border-gray-100 py-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Salário Base</span>
                  <span className="font-bold text-gray-850 font-mono">{fmtMoeda(f.salario)}</span>
                </div>
                <div>
                  <span className="text-yellow-650 block text-[10px] uppercase font-bold">Aluguel Moto</span>
                  <span className="font-bold text-amber-700 font-mono">{f.aluguel_moto > 0 ? fmtMoeda(f.aluguel_moto) : 'Não possui'}</span>
                </div>
              </div>

              {/* Banking routing address key */}
              <div className="text-xs space-y-1 text-gray-600 bg-purple-50/20 p-2.5 rounded border border-purple-100/50">
                <div className="flex items-center space-x-1.5">
                  <Landmark className="w-3.5 h-3.5 text-purple-800 shrink-0" />
                  <span className="font-bold text-purple-900 uppercase text-[9px]">Chave PIX Oficial:</span>
                </div>
                <p className="font-mono text-purple-950 truncate font-bold text-[10px] bg-white p-1 rounded border border-purple-100">{f.pix || 'andre.ibm.rocha@gmail.com'}</p>
              </div>

              {/* Editing & Deletion Controls */}
              <div className="flex justify-between items-center pt-2 text-xs">
                <button
                  onClick={() => handleEditClick(f)}
                  className="text-purple-800 hover:text-purple-950 font-bold flex items-center space-x-1 hover:underline cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar Cadastro</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Deseja demitir/excluir o colaborador ${f.nome}?`)) {
                      onDeleteFuncionario(f.id);
                      onSuccessToast('Cadastro removido das listas internas.');
                    }
                  }}
                  className="text-rose-600 hover:text-rose-900 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Excluir Colaborador"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* REGISTRATION FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-150 w-full max-w-2xl overflow-hidden my-6">
            {/* Header */}
            <div className="bg-purple-950 text-white px-5 py-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">
                  {editId ? `Editar Cadastro de ${nome}` : 'Cadastrar Novo Médico/Colaborador'}
                </h3>
                <p className="text-[11px] text-purple-200">Defina com precisão os vencimentos e as contas bancárias</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-purple-300 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-5 max-h-[80vh] overflow-y-auto space-y-4">
              
              {/* Section 1: Personal info */}
              <div>
                <h4 className="font-bold text-xs uppercase text-purple-950 border-b border-gray-200 pb-1 mb-3 flex items-center space-x-1.5">
                  <Contact className="w-4 h-4 text-purple-850" />
                  <span>1. Dados Funcionais Básicos</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: SILVA SOUZA ANDRADE"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-850"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">CPF</label>
                    <input
                      type="text"
                      placeholder="Ex: 000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-850"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Cargo *</label>
                    <select
                      value={cargo}
                      onChange={(e) => setCargo(e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded-lg p-2 bg-white focus:ring-1 focus:ring-purple-850"
                    >
                      <option value="Motorista">Motorista</option>
                      <option value="Administrativo">Administrativo</option>
                      <option value="Auxiliar">Auxiliar / Estágio</option>
                      <option value="Supervisor">Supervisor Geral</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Status Civil *</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as StatusFuncionario)}
                      className="w-full text-xs border border-gray-300 rounded-lg p-2 bg-white focus:ring-1 focus:ring-purple-850"
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo / Desligado</option>
                      <option value="ferias">Férias</option>
                      <option value="afastado">Afastado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Admissão</label>
                    <input
                      type="date"
                      value={dataAdmissao}
                      onChange={(e) => setDataAdmissao(e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-850"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Proventos and Convenções values */}
              <div>
                <h4 className="font-bold text-xs uppercase text-purple-950 border-b border-gray-200 pb-1 mb-3 flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-purple-850" />
                  <span>2. Grade de Proventos e Benefícios (Convenção Coletiva)</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Salário-Base CLT *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={salario}
                      onChange={(e) => setSalario(e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-850"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-650 uppercase mb-1">Aluguel Moto (Provento)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={aluguelMoto}
                      onChange={(e) => setAluguelMoto(e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-850"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-650 uppercase mb-1">Vale Refeição (VR)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={vr}
                      onChange={(e) => setVr(e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-850"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-650 uppercase mb-1">Adic. Periculosidade</label>
                    <input
                      type="number"
                      step="0.01"
                      value={periculosidade}
                      onChange={(e) => setPericulosidade(e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-850"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-655 uppercase mb-1">Previsão Cesta Básica</label>
                    <input
                      type="number"
                      step="0.01"
                      value={cestaBasica}
                      onChange={(e) => setCestaBasica(e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-850"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-650 uppercase mb-1">Salário Família</label>
                    <input
                      type="number"
                      step="0.01"
                      value={salFamilia}
                      onChange={(e) => setSalFamilia(e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-850"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Banking details */}
              <div>
                <h4 className="font-bold text-xs uppercase text-purple-950 border-b border-gray-200 pb-1 mb-3 flex items-center space-x-1.5">
                  <Landmark className="w-4 h-4 text-purple-850" />
                  <span>3. Dados PIX & Contas de Depósito Bancário</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Chave PIX Principal</label>
                    <input
                      type="text"
                      placeholder="Ex: CPF, E-mail, Celular ou Aleatória"
                      value={pix}
                      onChange={(e) => setPix(e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-850"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Nome do Banco</label>
                    <input
                      type="text"
                      placeholder="Ex: Itaú, Nubank"
                      value={banco}
                      onChange={(e) => setBanco(e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-850"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Agência</label>
                    <input
                      type="text"
                      placeholder="0000"
                      value={agencia}
                      onChange={(e) => setAgencia(e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-850"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Conta Corrente / Conta Poupança</label>
                    <input
                      type="text"
                      placeholder="Ex: 12345-6"
                      value={conta}
                      onChange={(e) => setConta(e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-850"
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
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
                  Salvar Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
