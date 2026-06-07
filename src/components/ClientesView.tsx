import React, { useState } from 'react';
import { Cliente } from '../types';
import { fmtMoeda } from '../lib/calculos';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Phone, 
  Mail, 
  Briefcase, 
  DollarSign, 
  X 
} from 'lucide-react';

interface ClientesViewProps {
  clientes: Cliente[];
  onSaveCliente: (c: Omit<Cliente, 'id'> & { id?: string }) => void;
  onDeleteCliente: (id: string) => void;
  onSuccessToast: (msg: string) => void;
}

export default function ClientesView({
  clientes,
  onSaveCliente,
  onDeleteCliente,
  onSuccessToast
}: ClientesViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [cnpjCpf, setCnpjCpf] = useState('');
  const [tipo, setTipo] = useState<'empresa' | 'pessoa_fisica'>('empresa');
  const [contato, setContato] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [servicosStr, setServicosStr] = useState('Logística');
  const [valorMensalMedio, setValorMensalMedio] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) {
      alert('Preencha o nome da empresa!');
      return;
    }

    onSaveCliente({
      nome: nome.toUpperCase(),
      cnpj_cpf: cnpjCpf || undefined,
      tipo,
      contato: contato || undefined,
      telefone: telefone || undefined,
      email: email || undefined,
      servicos_contratados: servicosStr.split(',').map(s => s.trim()).filter(s => s.length > 0),
      valor_mensal_medio: valorMensalMedio ? parseFloat(valorMensalMedio) : undefined,
      status: 'ativo',
      observacoes: observacoes || undefined
    });

    setIsModalOpen(false);
    onSuccessToast('Contrato de cliente registrado com sucesso!');

    // Reset
    setNome('');
    setCnpjCpf('');
    setContato('');
    setTelefone('');
    setEmail('');
    setServicosStr('Logística');
    setValorMensalMedio('');
    setObservacoes('');
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-xl border border-gray-150 shadow-sm gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 font-sans">Clientes & Contratos Corporativos</h2>
          <p className="text-xs text-gray-500">Gestão de acordos corporativos e limites médios de faturamento mensal fixo/recorrente.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-purple-950 text-white hover:bg-purple-900 font-semibold text-xs px-4 py-2 rounded-lg shadow cursor-pointer transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Cliente / Contrato</span>
        </button>
      </div>

      {/* Grid of clients cards style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clientes.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow relative">
            
            {/* Status header badge */}
            <span className="absolute top-4 right-4 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
              {c.status}
            </span>

            {/* Title */}
            <div>
              <h3 className="font-bold text-sm text-purple-950 flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-purple-850 shrink-0" />
                <span className="truncate">{c.nome}</span>
              </h3>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">{c.cnpj_cpf || 'CNPJ não informado'}</p>
            </div>

            {/* Average monthly billing values cost detail */}
            <div className="border-t border-b border-gray-100 py-3 grid grid-cols-2 gap-2 text-xs text-gray-700 bg-gray-50 p-2.5 rounded border border-gray-100">
              <div>
                <span className="text-gray-400 block text-[9px] uppercase font-semibold">Mensalidade Média</span>
                <span className="font-extrabold text-purple-950 font-mono">{fmtMoeda(c.valor_mensal_medio)}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[9px] uppercase font-semibold">Tipo Cadastro</span>
                <span className="font-bold text-gray-800 capitalize">{c.tipo === 'empresa' ? 'Empresa Jurídica' : 'Física'}</span>
              </div>
            </div>

            {/* Active modalities listed */}
            <div className="space-y-1.5 text-xs text-gray-650">
              <div className="flex items-center space-x-1.5 text-purple-900 text-[10px] font-bold uppercase">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Modalidades Contratadas:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {c.servicos_contratados.map((s, idx) => (
                  <span key={idx} className="bg-purple-100 text-purple-800 border border-purple-200 text-[9px] px-2 py-0.2 rounded-full font-bold">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Contacts list */}
            <div className="text-xs space-y-1.5 text-gray-600 border-t border-gray-100 pt-3">
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-gray-450 shrink-0" />
                <span className="truncate">{c.telefone || '(11) 3300-0000'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-gray-450 shrink-0" />
                <span className="truncate text-gray-500 font-mono text-[10px]" title={c.email}>{c.email || 'financeiro@ibec.com.br'}</span>
              </div>
            </div>

            {/* Deletion actions footer */}
            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-[10px] text-gray-400">Atendido por SP</span>
              <button
                onClick={() => {
                  if (confirm(`Excluir o cliente corporativo ${c.nome} das listagens?`)) {
                    onDeleteCliente(c.id);
                    onSuccessToast('Cliente de faturamento removido!');
                  }
                }}
                className="text-gray-405 hover:text-red-700 hover:bg-rose-50 p-1 rounded transition-all cursor-pointer"
                title="Excluir Cliente"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* ADICIONAR CLIENTE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-150 w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="bg-purple-950 text-white px-5 py-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">Adicionar Cliente / Contrato Comercial</h3>
                <p className="text-[11px] text-purple-200">Insira as diretrizes para faturamentos corporativos</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-purple-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreate} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Razão Social / Nome Empresa *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: TMF TRANSPORTES S/A"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">CNPJ / CPF do Cliente</label>
                  <input
                    type="text"
                    placeholder="Ex: 00.000.000/0001-00"
                    value={cnpjCpf}
                    onChange={(e) => setCnpjCpf(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Sessão Cadastro</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as any)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 bg-white"
                  >
                    <option value="empresa">Pessoa Jurídica (PJ)</option>
                    <option value="pessoa_fisica">Pessoa Física (PF)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Mensalidade Média (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={valorMensalMedio}
                    onChange={(e) => setValorMensalMedio(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Contato Responsável</label>
                  <input
                    type="text"
                    placeholder="Ex: José da Silva"
                    value={contato}
                    onChange={(e) => setContato(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Telefone Fone</label>
                  <input
                    type="text"
                    placeholder="(11) 90000-0000"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">E-mail Comercial</label>
                  <input
                    type="email"
                    placeholder="financeiro@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-800"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Modalidades Contratadas (separadas por vírgula) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Entrega/Moto, Armazenagem, Frete Prata"
                    value={servicosStr}
                    onChange={(e) => setServicosStr(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-800"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Anotações Gerais do Contrato Comercial</label>
                  <textarea
                    rows={2}
                    placeholder="Observações de vigência de faturas, taxas combinadas..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full text-xs border border-gray-300 p-2 border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-800"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-150 text-gray-800 font-bold px-4 py-2 rounded-lg cursor-pointer">Cancelar</button>
                <button type="submit" className="bg-purple-950 text-white font-bold px-5 py-2 rounded-lg shadow cursor-pointer">Salvar Contrato</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
