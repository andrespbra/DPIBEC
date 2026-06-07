import React, { useState, useEffect } from 'react';
import { Veiculo, Funcionario, ManutencaoVeiculo } from '../types';
import { fmtMoeda, fmtData } from '../lib/calculos';
import { 
  Plus, 
  Trash2, 
  Wrench, 
  Gauge, 
  User, 
  Calendar, 
  X, 
  Clock, 
  Hammer 
} from 'lucide-react';
import { getManutencoes, saveManutencao } from '../lib/store';

interface VeiculosViewProps {
  veiculos: Veiculo[];
  funcionarios: Funcionario[];
  onSaveVeiculo: (v: Omit<Veiculo, 'id'> & { id?: string }) => void;
  onDeleteVeiculo: (id: string) => void;
  onSuccessToast: (msg: string) => void;
}

export default function VeiculosView({
  veiculos,
  funcionarios,
  onSaveVeiculo,
  onDeleteVeiculo,
  onSuccessToast
}: VeiculosViewProps) {
  // Maintenance logs list state
  const [manutencoes, setManutencoes] = useState<ManutencaoVeiculo[]>([]);
  const [isNewVeiculoModalOpen, setIsNewVeiculoModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

  // New vehicle form fields
  const [nome, setNome] = useState('');
  const [placa, setPlaca] = useState('');
  const [tipo, setTipo] = useState('Utilitário');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [anoFabricacao, setAnoFabricacao] = useState('2020');
  const [kmAtual, setKmAtual] = useState('50000');
  const [kmProximaRevisao, setKmProximaRevisao] = useState('60000');
  const [status, setStatus] = useState<'ativo' | 'inativo' | 'manutencao' | 'vendido'>('ativo');
  const [responsavelId, setResponsavelId] = useState('');

  // Maintenance form fields
  const [mVeiculoId, setMVeiculoId] = useState('');
  const [mTipo, setMTipo] = useState('Troca de Óleo');
  const [mDescricao, setMDescricao] = useState('');
  const [mValor, setMValor] = useState('');
  const [mDataServico, setMDataServico] = useState(new Date().toISOString().substring(0, 10));
  const [mKmServico, setMKmServico] = useState('');
  const [mOficina, setMOficina] = useState('');

  // Loaded employees lookup
  const responsaveisMap = new Map(funcionarios.map(f => [f.id, f.nome]));

  useEffect(() => {
    loadManutencoes();
  }, [veiculos]);

  const loadManutencoes = async () => {
    const list = await getManutencoes();
    setManutencoes(list);
  };

  const handleCreateVeiculo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) {
      alert('Preencha o nome identificador do veículo!');
      return;
    }

    onSaveVeiculo({
      nome: nome.toUpperCase(),
      placa: placa ? placa.toUpperCase() : undefined,
      tipo,
      marca: marca || undefined,
      modelo: modelo || undefined,
      ano_fabricacao: parseInt(anoFabricacao) || undefined,
      km_atual: parseInt(kmAtual) || 0,
      km_proxima_revisao: parseInt(kmProximaRevisao) || undefined,
      status,
      manutencao_status: 'ok',
      responsavel_id: responsavelId || undefined
    });

    setIsNewVeiculoModalOpen(false);
    onSuccessToast('Veículo de frota cadastrado!');
    
    // Clear fields
    setNome('');
    setPlaca('');
  };

  const handleCreateMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mVeiculoId || !mValor || parseFloat(mValor) <= 0) {
      alert('Por favor selecione um veículo e informe um custo válido!');
      return;
    }

    // Save maintenance log (internals handle linking and triggering Accounts Payable costs automatic creations in category "Manutenção Frota")
    const val = parseFloat(mValor);
    const kms = mKmServico ? parseInt(mKmServico) : undefined;
    
    await saveManutencao({
      veiculo_id: mVeiculoId,
      tipo: mTipo,
      descricao: mDescricao || undefined,
      valor: val,
      data_servico: mDataServico,
      km_servico: kms,
      oficina: mOficina || undefined,
      status: 'realizado'
    });

    // We trigger saveVeiculo update (increase mileage and reset warnings) inside store automatically
    // Re-sync parent list and local states
    setIsMaintenanceModalOpen(false);
    onSuccessToast('Registro de manutenção inserido e lançado no contas a pagar!');
    
    // Clean fields
    setMDescricao('');
    setMValor('');
    setMKmServico('');
    setMOficina('');
    loadManutencoes();
  };

  const handleQuickMainteClick = (veicId: string) => {
    setMVeiculoId(veicId);
    
    // Autofill km from target vehicle
    const target = veiculos.find(v => v.id === veicId);
    if (target) {
      setMKmServico(String(target.km_atual));
    }

    setIsMaintenanceModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-xl border border-gray-150 shadow-sm gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 font-sans">Frota de Veículos & Manutenção</h2>
          <p className="text-xs text-gray-550 font-sans">
            Controle de Fiorinos, Kombis, motos e utilitários da frota. Acompanhamento de revisões de quilometragem periódicas obrigatórias.
          </p>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto shrink-0">
          <button
            onClick={() => setIsNewVeiculoModalOpen(true)}
            className="flex items-center space-x-2 bg-purple-950 text-white hover:bg-purple-900 font-semibold text-xs px-4 py-2 rounded-lg shadow cursor-pointer transition-all border border-transparent"
          >
            <span>Cadastrar Veículo</span>
          </button>
          <button
            onClick={() => {
              if (veiculos.length === 0) {
                alert('Primeiro cadastre um veículo na frota!');
                return;
              }
              setMVeiculoId(veiculos[0].id);
              setMKmServico(String(veiculos[0].km_atual));
              setIsMaintenanceModalOpen(true);
            }}
            className="flex items-center space-x-2 bg-gradient-to-tr from-amber-500 to-amber-650 bg-amber-500 text-purple-950 font-bold hover:bg-amber-600 text-xs px-4 py-2 rounded-lg shadow cursor-pointer transition-all"
          >
            <Wrench className="w-4 h-4 shrink-0" />
            <span>Registrar Manutenção</span>
          </button>
        </div>
      </div>

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {veiculos.map((v) => {
          const driverName = v.responsavel_id ? responsaveisMap.get(v.responsavel_id) : 'Nenhum alocado';
          const isPending = v.manutencao_status !== 'ok';
          
          return (
            <div key={v.id} className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow relative">
              {/* Badge status */}
              <div className="absolute top-4 right-4 flex space-x-1">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                  v.status === 'ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-805'
                }`}>
                  {v.status}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                  v.manutencao_status === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                }`}>
                  Ref: {v.manutencao_status}
                </span>
              </div>

              {/* Title & Specs */}
              <div>
                <h3 className="font-bold text-sm text-purple-950 flex items-center space-x-2">
                  <span className="truncate">{v.nome}</span>
                  {v.placa && <span className="bg-gray-100 text-gray-700 font-mono text-[9px] px-1 rounded">{v.placa}</span>}
                </h3>
                <p className="text-xs text-gray-500 font-sans">{v.marca || 'VW'} · {v.modelo || 'Utilitário'} ({v.tipo})</p>
              </div>

              {/* KM gauges progress details */}
              <div className="bg-purple-50/20 border border-purple-100/50 p-3 rounded-lg grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-1 text-gray-400">
                    <Gauge className="w-3.5 h-3.5" />
                    <span className="text-[9px] uppercase font-semibold">Odômetro Atual</span>
                  </div>
                  <span className="font-bold text-gray-800 font-mono text-sm">{v.km_atual.toLocaleString()} KM</span>
                </div>
                <div className="space-y-0.5 border-l border-gray-200 pl-3">
                  <div className="flex items-center space-x-1 text-gray-400">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-[9px] uppercase font-semibold text-amber-700">Próxima Revisão</span>
                  </div>
                  <span className="font-bold text-gray-800 font-mono text-sm">{v.km_proxima_revisao?.toLocaleString() || '---'} KM</span>
                </div>
              </div>

              {/* Assigned driver */}
              <div className="flex items-center space-x-2 text-xs text-gray-550 border-b border-gray-100 pb-3">
                <User className="w-4 h-4 text-purple-800" />
                <span>Condutor: <strong>{driverName}</strong></span>
              </div>

              {/* Deletion / Action row */}
              <div className="flex justify-between items-center text-xs pt-1">
                <button
                  onClick={() => handleQuickMainteClick(v.id)}
                  className="text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded border border-amber-250 font-bold px-2.5 py-1 text-[10px] transition-all cursor-pointer"
                >
                  Acionar Oficina
                </button>

                <button
                  onClick={() => {
                    if (confirm('Deseja remover este veículo da frota de entregas?')) {
                      onDeleteVeiculo(v.id);
                      onSuccessToast('Veículo removido.');
                    }
                  }}
                  className="text-gray-405 hover:text-red-700 hover:bg-rose-50 p-1.5 rounded transition-all cursor-pointer"
                  title="Excluir Veículo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* HISTORIC MAINTENANCE WORK ORDERS */}
      <div className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm">
        <h3 className="font-bold text-xs uppercase mb-4 text-purple-950 flex items-center space-x-1.5 pb-2 border-b border-gray-100">
          <Hammer className="w-4 h-4 text-purple-850" />
          <span>Extrato de Ordens de Oficina Recentes ({manutencoes.length})</span>
        </h3>

        {manutencoes.length === 0 ? (
          <p className="text-center py-6 text-xs text-gray-400">Nenhum reparo ou manutenção registrado na frota ainda.</p>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="bg-gray-50 text-[10px] text-gray-500 font-bold uppercase">
                  <th className="py-2 px-3">Veículo</th>
                  <th className="py-2 px-3">Serviço Oficina</th>
                  <th className="py-2 px-3">Oficina Autorizada</th>
                  <th className="py-2 px-3">Quilometragem (KM)</th>
                  <th className="py-2 px-3">Data Reparo</th>
                  <th className="py-2 px-3 text-right">Valor Pago</th>
                  <th className="py-2 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 text-gray-700">
                {manutencoes.map((m) => {
                  const targetVeic = veiculos.find(v => v.id === m.veiculo_id);
                  return (
                    <tr key={m.id} className="hover:bg-gray-550/10">
                      <td className="py-2 px-3 font-bold">{targetVeic?.nome || 'Frota IBEC'}</td>
                      <td className="py-2 px-3 font-semibold">{m.tipo}</td>
                      <td className="py-2 px-3">{m.oficina || 'Especializada SP'}</td>
                      <td className="py-2 px-3 font-mono">{m.km_servico?.toLocaleString() || '---'} KM</td>
                      <td className="py-2 px-3"><div className="flex items-center space-x-1 font-mono"><Calendar className="w-3.5 h-3.5 text-gray-405" /><span>{fmtData(m.data_servico)}</span></div></td>
                      <td className="py-2 px-3 text-right font-bold text-rose-800 font-mono">{fmtMoeda(m.valor)}</td>
                      <td className="py-2 px-3 text-center"><span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded text-[10px]">Realizado</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* NEW VEHICLE MODAL */}
      {isNewVeiculoModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-150 w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="bg-purple-950 text-white px-5 py-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">Adicionar Veículo à Frota</h3>
                <p className="text-[11px] text-purple-200">Insira as especificações da placa e odômetros de controle</p>
              </div>
              <button onClick={() => setIsNewVeiculoModalOpen(false)} className="text-purple-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateVeiculo} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Identificador Veículo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: FIORINO 3, CARRO SANDERO"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Placa Oficial</label>
                  <input
                    type="text"
                    placeholder="XYZ-1234"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Tipo de Veículo *</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 bg-white"
                  >
                    <option value="Utilitário">Utilitário (Fiorino)</option>
                    <option value="Van">Van (Kombi)</option>
                    <option value="Moto">Motos</option>
                    <option value="Carro">Carros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Marca</label>
                  <input type="text" placeholder="VW, Fiat, Honda" value={marca} onChange={(e) => setMarca(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Odômetro Atual (KM) *</label>
                  <input
                    type="number"
                    required
                    value={kmAtual}
                    onChange={(e) => setKmAtual(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-850"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">KM Próxima Revisão *</label>
                  <input
                    type="number"
                    required
                    value={kmProximaRevisao}
                    onChange={(e) => setKmProximaRevisao(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-850"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Motorista Alocado</label>
                  <select
                    value={responsavelId}
                    onChange={(e) => setResponsavelId(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 bg-white"
                  >
                    <option value="">Nenhum</option>
                    {funcionarios.map(f => (
                      <option key={f.id} value={f.id}>{f.nome} ({f.cargo})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsNewVeiculoModalOpen(false)} className="bg-gray-150 text-gray-800 font-bold px-4 py-2 rounded-lg text-xs">Cancelar</button>
                <button type="submit" className="bg-purple-950 text-white font-bold px-5 py-2 rounded-lg text-xs">Adicionar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW MAINTENANCE LAUNCH MODAL */}
      {isMaintenanceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-150 w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="bg-amber-500 text-purple-950 px-5 py-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">Registrar Ordem de Manutenção Oficina</h3>
                <p className="text-[11px] text-purple-900 font-medium">As faturas serão inseridas direto em contas a pagar</p>
              </div>
              <button onClick={() => setIsMaintenanceModalOpen(false)} className="text-purple-950 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateMaintenance} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-purple-955 uppercase mb-1">Selecione Veículo Reparado *</label>
                  <select
                    value={mVeiculoId}
                    onChange={(e) => {
                      setMVeiculoId(e.target.value);
                      const t = veiculos.find(v => v.id === e.target.value);
                      if (t) setMKmServico(String(t.km_atual));
                    }}
                    className="w-full text-xs font-bold border border-gray-300 rounded-lg p-2 bg-white"
                  >
                    {veiculos.map(v => (
                      <option key={v.id} value={v.id}>{v.nome} (Placa: {v.placa || '---'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Tipo do Conserto *</label>
                  <select
                    value={mTipo}
                    onChange={(e) => setMTipo(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 bg-white"
                  >
                    <option value="Troca de Óleo">Troca de Óleo completa</option>
                    <option value="Pastilhas de freio">Reparos Freio (Pastilhas)</option>
                    <option value="Kit Embreagem">Fricção (Embreagem)</option>
                    <option value="Kit Relação">Tração (Relação/Corrente)</option>
                    <option value="Troca de Pneus">Pneumáticos (Troca de Pneus)</option>
                    <option value="Lanternagem / Funilaria">Lanternagem / Chapa</option>
                    <option value="Revisão Periódica">Revisão Mecânica Geral</option>
                    <option value="Outros Serviços">Outro Conserto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Valor da Fatura (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={mValor}
                    onChange={(e) => setMValor(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Odômetro do Serviço (KM)</label>
                  <input
                    type="number"
                    placeholder="Ex: 54000"
                    value={mKmServico}
                    onChange={(e) => setMKmServico(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Data de Entrada</label>
                  <input
                    type="date"
                    required
                    value={mDataServico}
                    onChange={(e) => setMDataServico(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-855"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Oficina Credenciada / Concessionária</label>
                  <input
                    type="text"
                    placeholder="Ex: Auto Center Pinheiros, Mecânica Jardim"
                    value={mOficina}
                    onChange={(e) => setMOficina(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-800"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Descrição das Peças Substituídas</label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Troca de lonas traseiras, filtro lubrificante, óleo sintético..."
                    value={mDescricao}
                    onChange={(e) => setMDescricao(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-855"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100 font-sans">
                <button type="button" onClick={() => setIsMaintenanceModalOpen(false)} className="bg-gray-150 text-gray-800 font-bold px-4 py-2 rounded-lg text-xs cursor-pointer">Cancelar</button>
                <button type="submit" className="bg-purple-950 hover:bg-purple-900 border border-transparent text-white font-bold px-5 py-2 rounded-lg text-xs shadow cursor-pointer">Lançar Ordem</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
