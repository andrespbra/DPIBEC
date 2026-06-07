/**
 * IBEC Express - TypeScript Types System
 */

export type StatusFuncionario = 'ativo' | 'inativo' | 'ferias' | 'afastado';
export type StatusPagamento = 'pendente' | 'pago' | 'vencido' | 'cancelado';
export type StatusReceita = 'pendente' | 'recebido' | 'cancelado' | 'inadimplente';
export type StatusVeiculo = 'ativo' | 'inativo' | 'manutencao' | 'vendido';
export type StatusManutencao = 'agendado' | 'realizado' | 'cancelado';

export interface Funcionario {
  id: string;
  nome: string;
  cpf?: string;
  cargo: string;
  salario: number;
  aluguel_moto: number;
  vr: number;
  periculosidade: number;
  cesta_basica: number;
  sal_familia: number;
  status: StatusFuncionario;
  data_admissao?: string;
  data_demissao?: string;
  banco?: string;
  agencia?: string;
  conta?: string;
  pix?: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Holerite {
  id: string;
  funcionario_id: string;
  funcionario?: Funcionario; // Populated client-side or joined
  competencia: string; // "YYYY-MM" or "YYYY-MM-DD"
  salario_base: number;
  aluguel_moto: number;
  vr: number;
  periculosidade: number;
  cesta_basica: number;
  sal_familia: number;
  ordem_servico: number;
  total_bruto: number; // Generated or computed
  desc_vale_transporte: number;
  desc_inss: number;
  desc_falta: number;
  desc_combustivel: number;
  desc_plano_odonto: number;
  desc_uniforme: number;
  desc_outros: number;
  total_descontos: number; // Generated or computed
  salario_liquido: number; // Generated or computed
  status: 'pendente' | 'pago' | 'aprovado';
  observacoes?: string;
  created_at?: string;
}

export interface ContaPagar {
  id: string;
  descricao: string;
  fornecedor?: string;
  categoria: string;
  valor: number;
  vencimento: string; // YYYY-MM-DD
  data_pagamento?: string; // YYYY-MM-DD
  status: StatusPagamento;
  banco?: string;
  forma_pagamento: string;
  numero_nota?: string;
  recorrente: boolean;
  recorrencia_meses: number;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Receita {
  id: string;
  cliente: string; // Can map to name from Clientes list
  servico: string;
  descricao?: string;
  valor: number;
  data_emissao: string; // YYYY-MM-DD
  data_recebimento?: string; // YYYY-MM-DD
  status: StatusReceita;
  forma_recebimento?: string;
  numero_nota?: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Veiculo {
  id: string;
  nome: string;
  placa?: string;
  tipo: string; // "Moto", "Van", "Carro", "Utilitário", etc
  marca?: string;
  modelo?: string;
  ano_fabricacao?: number;
  km_atual: number;
  km_proxima_revisao?: number;
  status: StatusVeiculo;
  manutencao_status: 'ok' | 'pendente' | 'urgente';
  responsavel_id?: string;
  data_proxima_revisao?: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ManutencaoVeiculo {
  id: string;
  veiculo_id: string;
  tipo: string;
  descricao?: string;
  valor: number;
  data_servico: string;
  km_servico?: number;
  oficina?: string;
  status: StatusManutencao;
  created_at?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  cnpj_cpf?: string;
  tipo: 'empresa' | 'pessoa_fisica';
  contato?: string;
  telefone?: string;
  email?: string;
  servicos_contratados: string[];
  valor_mensal_medio?: number;
  status: 'ativo' | 'inativo';
  observacoes?: string;
  created_at?: string;
}

export interface KPIData {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  totalFolha: number;
  totalPendente: number;
  margemOperacional: number;
}
