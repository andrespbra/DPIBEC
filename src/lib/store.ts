import { supabase } from './supabase';
import { Funcionario, Holerite, ContaPagar, Receita, Veiculo, Cliente, ManutencaoVeiculo } from '../types';
import { calcINSS, calcBruto } from './calculos';

// ============================================================
// SEED DATA FOR PRODUCTION (Clean Slate)
// ============================================================

const SEED_FUNCIONARIOS: Funcionario[] = [];
const SEED_CLIENTES: Cliente[] = [];
const SEED_VEICULOS: Veiculo[] = [];
const SEED_CONTAS_PAGAR: ContaPagar[] = [];
const SEED_RECEITAS: Receita[] = [];
const SEED_HOLERITES: Holerite[] = [];
const SEED_MANUTENCOES: ManutencaoVeiculo[] = [];

// Initialize localStorage keys if they do not exist
function initLocalStorage() {
  // Force reset legacy seed data once to ensure a clean slate in the user's browser
  if (!localStorage.getItem('ibec_db_cleared_for_prod_v2')) {
    localStorage.removeItem('ibec_funcionarios');
    localStorage.removeItem('ibec_clientes');
    localStorage.removeItem('ibec_veiculos');
    localStorage.removeItem('ibec_contas_pagar');
    localStorage.removeItem('ibec_receitas');
    localStorage.removeItem('ibec_holerites');
    localStorage.removeItem('ibec_manutencoes');
    localStorage.setItem('ibec_db_cleared_for_prod_v2', 'true');
  }

  if (!localStorage.getItem('ibec_funcionarios')) {
    localStorage.setItem('ibec_funcionarios', JSON.stringify(SEED_FUNCIONARIOS));
  }
  if (!localStorage.getItem('ibec_clientes')) {
    localStorage.setItem('ibec_clientes', JSON.stringify(SEED_CLIENTES));
  }
  if (!localStorage.getItem('ibec_veiculos')) {
    localStorage.setItem('ibec_veiculos', JSON.stringify(SEED_VEICULOS));
  }
  if (!localStorage.getItem('ibec_contas_pagar')) {
    localStorage.setItem('ibec_contas_pagar', JSON.stringify(SEED_CONTAS_PAGAR));
  }
  if (!localStorage.getItem('ibec_receitas')) {
    localStorage.setItem('ibec_receitas', JSON.stringify(SEED_RECEITAS));
  }
  if (!localStorage.getItem('ibec_holerites')) {
    localStorage.setItem('ibec_holerites', JSON.stringify(SEED_HOLERITES));
  }
  if (!localStorage.getItem('ibec_manutencoes')) {
    localStorage.setItem('ibec_manutencoes', JSON.stringify(SEED_MANUTENCOES));
  }
}

initLocalStorage();

// ============================================================
// STORE DATABASE LAYER OPERATORS (Local Storage + Supabase)
// ============================================================

export const getFuncionarios = async (): Promise<Funcionario[]> => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('funcionarios').select('*').order('nome', { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) return data as Funcionario[];
    } catch (e) {
      console.warn('[Supabase] Failed query to funcionarios. Falling back to LocalStorage.', e);
    }
  }
  return JSON.parse(localStorage.getItem('ibec_funcionarios') || '[]');
};

export const saveFuncionario = async (funcionario: Omit<Funcionario, 'id'> & { id?: string }): Promise<Funcionario> => {
  const isNew = !funcionario.id;
  const newId = funcionario.id || 'f-' + Math.random().toString(36).substr(2, 9);
  const now = new Date().toISOString();
  
  const saved: Funcionario = {
    ...funcionario,
    id: newId,
    created_at: funcionario.created_at || now,
    updated_at: now
  };

  if (supabase) {
    try {
      const query = isNew
        ? supabase.from('funcionarios').insert([saved])
        : supabase.from('funcionarios').update(saved).eq('id', newId);
      const { error } = await query;
      if (error) throw error;
    } catch (e) {
      console.warn('[Supabase] Failed save funcionario. Saving to LocalStorage instead.', e);
    }
  }

  const items = JSON.parse(localStorage.getItem('ibec_funcionarios') || '[]');
  const index = items.findIndex((i: Funcionario) => i.id === newId);
  if (index >= 0) {
    items[index] = saved;
  } else {
    items.push(saved);
  }
  localStorage.setItem('ibec_funcionarios', JSON.stringify(items));
  return saved;
};

export const deleteFuncionario = async (id: string): Promise<boolean> => {
  if (supabase) {
    try {
      const { error } = await supabase.from('funcionarios').delete().eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.warn('[Supabase] Failed delete on remote DB.', e);
    }
  }

  const items = JSON.parse(localStorage.getItem('ibec_funcionarios') || '[]');
  const filtered = items.filter((i: Funcionario) => i.id !== id);
  localStorage.setItem('ibec_funcionarios', JSON.stringify(filtered));
  return true;
};

// --- HOLERITES OPERATORS ---

export const getHolerites = async (): Promise<Holerite[]> => {
  const funcs = await getFuncionarios();
  const funcsMap = new Map<string, Funcionario>(funcs.map(f => [f.id, f]));

  if (supabase) {
    try {
      const { data, error } = await supabase.from('holerites').select('*').order('competencia', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map((h: any) => ({
          ...h,
          funcionario: funcsMap.get(h.funcionario_id)
        })) as Holerite[];
      }
    } catch (e) {
      console.warn('[Supabase] Holerites query failed. Using local state.', e);
    }
  }
  
  const hols = JSON.parse(localStorage.getItem('ibec_holerites') || '[]');
  return hols.map((h: Holerite) => ({
    ...h,
    funcionario: funcsMap.get(h.funcionario_id)
  }));
};

export const saveHolerite = async (holerite: Omit<Holerite, 'id'> & { id?: string }): Promise<Holerite> => {
  const isNew = !holerite.id;
  const newId = holerite.id || 'h-' + Math.random().toString(36).substr(2, 9);
  
  const saved: Holerite = {
    ...holerite,
    id: newId,
    total_bruto: Number((holerite.salario_base + holerite.aluguel_moto + holerite.vr + holerite.periculosidade + holerite.cesta_basica + holerite.sal_familia + holerite.ordem_servico).toFixed(2)),
    total_descontos: Number((holerite.desc_vale_transporte + holerite.desc_inss + holerite.desc_falta + holerite.desc_combustivel + holerite.desc_plano_odonto + holerite.desc_uniforme + holerite.desc_outros).toFixed(2)),
    salario_liquido: Number((
      (holerite.salario_base + holerite.aluguel_moto + holerite.vr + holerite.periculosidade + holerite.cesta_basica + holerite.sal_familia + holerite.ordem_servico) - 
      (holerite.desc_vale_transporte + holerite.desc_inss + holerite.desc_falta + holerite.desc_combustivel + holerite.desc_plano_odonto + holerite.desc_uniforme + holerite.desc_outros)
    ).toFixed(2)),
    created_at: holerite.created_at || new Date().toISOString()
  };

  if (supabase) {
    try {
      const { funcionario, ...supabasePayload } = saved as any; // Strip join object
      const query = isNew
        ? supabase.from('holerites').insert([supabasePayload])
        : supabase.from('holerites').update(supabasePayload).eq('id', newId);
      const { error } = await query;
      if (error) throw error;
    } catch (e) {
      console.warn('[Supabase] Failed saving holerite.', e);
    }
  }

  const items = JSON.parse(localStorage.getItem('ibec_holerites') || '[]');
  const index = items.findIndex((i: Holerite) => i.id === newId);
  if (index >= 0) {
    items[index] = saved;
  } else {
    items.push(saved);
  }
  localStorage.setItem('ibec_holerites', JSON.stringify(items));
  return saved;
};

export const generateHoleritesBatch = async (competencia: string): Promise<{ criados: number; total: number }> => {
  // competencia format like "2026-06-01" or "2026-06"
  const fullCompetencia = competencia.length === 7 ? `${competencia}-01` : competencia;
  
  const funcionarios = await getFuncionarios();
  const ativos = funcionarios.filter(f => f.status === 'ativo');
  
  const holeritesExistentes = await getHolerites();
  const existentesIds = new Set(
    holeritesExistentes
      .filter(h => h.competencia.substring(0, 7) === fullCompetencia.substring(0, 7))
      .map(h => h.funcionario_id)
  );

  let criados = 0;
  for (const f of ativos) {
    if (!existentesIds.has(f.id)) {
      const osAmount = 0; // Default zero and editable later
      const descValetransporte = 0;
      const descFalta = 0;
      const descCombustivel = 0;
      const descPlanoOdonto = 0;
      const descUniforme = 0;
      const descOutros = 0;
      
      const inss = calcINSS(f.salario); // calculated progressively based on base salary
      
      const totalBruto = Number((f.salario + f.aluguel_moto + f.vr + f.periculosidade + f.cesta_basica + f.sal_familia + osAmount).toFixed(2));
      const totalDescontos = Number((descValetransporte + inss + descFalta + descCombustivel + descPlanoOdonto + descUniforme + descOutros).toFixed(2));
      const salarioLiquido = Number((totalBruto - totalDescontos).toFixed(2));

      await saveHolerite({
        funcionario_id: f.id,
        competencia: fullCompetencia,
        salario_base: f.salario,
        aluguel_moto: f.aluguel_moto,
        vr: f.vr,
        periculosidade: f.periculosidade,
        cesta_basica: f.cesta_basica,
        sal_familia: f.sal_familia,
        ordem_servico: osAmount,
        desc_vale_transporte: descValetransporte,
        desc_inss: inss,
        desc_falta: descFalta,
        desc_combustivel: descCombustivel,
        desc_plano_odonto: descPlanoOdonto,
        desc_uniforme: descUniforme,
        desc_outros: descOutros,
        total_bruto: totalBruto,
        total_descontos: totalDescontos,
        salario_liquido: salarioLiquido,
        status: 'pendente',
        observacoes: 'Gerado automaticamente via lote de folha mensal.'
      });
      criados++;
    }
  }

  return { criados, total: ativos.length };
};

export const deleteHolerite = async (id: string): Promise<boolean> => {
  if (supabase) {
    try {
      const { error } = await supabase.from('holerites').delete().eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.warn('[Supabase] Failed delete holerite.', e);
    }
  }

  const items = JSON.parse(localStorage.getItem('ibec_holerites') || '[]');
  const filtered = items.filter((i: Holerite) => i.id !== id);
  localStorage.setItem('ibec_holerites', JSON.stringify(filtered));
  return true;
};

// --- CONTAS PAGAR OPERATORS ---

export const getContasPagar = async (): Promise<ContaPagar[]> => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('contas_pagar').select('*').order('vencimento', { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) return data as ContaPagar[];
    } catch (e) {
      console.warn('[Supabase] Query to contas_pagar failed.', e);
    }
  }
  return JSON.parse(localStorage.getItem('ibec_contas_pagar') || '[]');
};

export const saveContaPagar = async (conta: Omit<ContaPagar, 'id'> & { id?: string }): Promise<ContaPagar> => {
  const isNew = !conta.id;
  const newId = conta.id || 'cp-' + Math.random().toString(36).substr(2, 9);
  const now = new Date().toISOString();

  const saved: ContaPagar = {
    ...conta,
    id: newId,
    created_at: conta.created_at || now,
    updated_at: now
  };

  if (supabase) {
    try {
      const query = isNew
        ? supabase.from('contas_pagar').insert([saved])
        : supabase.from('contas_pagar').update(saved).eq('id', newId);
      const { error } = await query;
      if (error) throw error;
    } catch (e) {
      console.warn('[Supabase] Save conta_pagar failed.', e);
    }
  }

  const items = JSON.parse(localStorage.getItem('ibec_contas_pagar') || '[]');
  const index = items.findIndex((i: ContaPagar) => i.id === newId);
  if (index >= 0) {
    items[index] = saved;
  } else {
    items.push(saved);
  }
  localStorage.setItem('ibec_contas_pagar', JSON.stringify(items));
  return saved;
};

export const deleteContaPagar = async (id: string): Promise<boolean> => {
  if (supabase) {
    try {
      const { error } = await supabase.from('contas_pagar').delete().eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.warn('[Supabase] Delete conta_pagar failed.', e);
    }
  }

  const items = JSON.parse(localStorage.getItem('ibec_contas_pagar') || '[]');
  const filtered = items.filter((i: ContaPagar) => i.id !== id);
  localStorage.setItem('ibec_contas_pagar', JSON.stringify(filtered));
  return true;
};

// --- RECEITAS OPERATORS ---

export const getReceitas = async (): Promise<Receita[]> => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('receitas').select('*').order('data_emissao', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) return data as Receita[];
    } catch (e) {
      console.warn('[Supabase] Query to receitas failed.', e);
    }
  }
  return JSON.parse(localStorage.getItem('ibec_receitas') || '[]');
};

export const saveReceita = async (receita: Omit<Receita, 'id'> & { id?: string }): Promise<Receita> => {
  const isNew = !receita.id;
  const newId = receita.id || 'r-' + Math.random().toString(36).substr(2, 9);
  const now = new Date().toISOString();

  const saved: Receita = {
    ...receita,
    id: newId,
    created_at: receita.created_at || now,
    updated_at: now
  };

  if (supabase) {
    try {
      const query = isNew
        ? supabase.from('receitas').insert([saved])
        : supabase.from('receitas').update(saved).eq('id', newId);
      const { error } = await query;
      if (error) throw error;
    } catch (e) {
      console.warn('[Supabase] Save receita failed.', e);
    }
  }

  const items = JSON.parse(localStorage.getItem('ibec_receitas') || '[]');
  const index = items.findIndex((i: Receita) => i.id === newId);
  if (index >= 0) {
    items[index] = saved;
  } else {
    items.push(saved);
  }
  localStorage.setItem('ibec_receitas', JSON.stringify(items));
  return saved;
};

export const deleteReceita = async (id: string): Promise<boolean> => {
  if (supabase) {
    try {
      const { error } = await supabase.from('receitas').delete().eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.warn('[Supabase] Delete receita failed.', e);
    }
  }

  const items = JSON.parse(localStorage.getItem('ibec_receitas') || '[]');
  const filtered = items.filter((i: Receita) => i.id !== id);
  localStorage.setItem('ibec_receitas', JSON.stringify(filtered));
  return true;
};

// --- VEICULOS OPERATORS ---

export const getVeiculos = async (): Promise<Veiculo[]> => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('veiculos').select('*').order('nome', { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) return data as Veiculo[];
    } catch (e) {
      console.warn('[Supabase] Query to veiculos failed.', e);
    }
  }
  return JSON.parse(localStorage.getItem('ibec_veiculos') || '[]');
};

export const saveVeiculo = async (veiculo: Omit<Veiculo, 'id'> & { id?: string }): Promise<Veiculo> => {
  const isNew = !veiculo.id;
  const newId = veiculo.id || 'v-' + Math.random().toString(36).substr(2, 9);
  const now = new Date().toISOString();

  const saved: Veiculo = {
    ...veiculo,
    id: newId,
    created_at: veiculo.created_at || now,
    updated_at: now
  };

  if (supabase) {
    try {
      const query = isNew
        ? supabase.from('veiculos').insert([saved])
        : supabase.from('veiculos').update(saved).eq('id', newId);
      const { error } = await query;
      if (error) throw error;
    } catch (e) {
      console.warn('[Supabase] Save veiculo failed.', e);
    }
  }

  const items = JSON.parse(localStorage.getItem('ibec_veiculos') || '[]');
  const index = items.findIndex((i: Veiculo) => i.id === newId);
  if (index >= 0) {
    items[index] = saved;
  } else {
    items.push(saved);
  }
  localStorage.setItem('ibec_veiculos', JSON.stringify(items));
  return saved;
};

export const deleteVeiculo = async (id: string): Promise<boolean> => {
  if (supabase) {
    try {
      const { error } = await supabase.from('veiculos').delete().eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.warn('[Supabase] Delete veiculo failed.', e);
    }
  }

  const items = JSON.parse(localStorage.getItem('ibec_veiculos') || '[]');
  const filtered = items.filter((i: Veiculo) => i.id !== id);
  localStorage.setItem('ibec_veiculos', JSON.stringify(filtered));
  return true;
};

// --- MANUTENÇÕES OPERATORS ---

export const getManutencoes = async (): Promise<ManutencaoVeiculo[]> => {
  return JSON.parse(localStorage.getItem('ibec_manutencoes') || '[]');
};

export const saveManutencao = async (manutencao: Omit<ManutencaoVeiculo, 'id'> & { id?: string }): Promise<ManutencaoVeiculo> => {
  const isNew = !manutencao.id;
  const newId = manutencao.id || 'm-' + Math.random().toString(36).substr(2, 9);
  
  const saved: ManutencaoVeiculo = {
    ...manutencao,
    id: newId,
    created_at: manutencao.created_at || new Date().toISOString()
  };

  // Add into list
  const items = JSON.parse(localStorage.getItem('ibec_manutencoes') || '[]');
  const index = items.findIndex((i: ManutencaoVeiculo) => i.id === newId);
  if (index >= 0) {
    items[index] = saved;
  } else {
    items.push(saved);
  }
  localStorage.setItem('ibec_manutencoes', JSON.stringify(items));

  // Also, update the linked vehicle's km and status if it is a realized maintenance
  if (saved.status === 'realizado' && saved.km_servico) {
    const listVeic = await getVeiculos();
    const targetVeicIdx = listVeic.findIndex(v => v.id === saved.veiculo_id);
    if (targetVeicIdx >= 0) {
      const targetVeic = listVeic[targetVeicIdx];
      // Increase vehicle km to maintenance km if higher
      const currentKm = Math.max(targetVeic.km_atual, saved.km_servico);
      await saveVeiculo({
        ...targetVeic,
        km_atual: currentKm,
        manutencao_status: 'ok' // Set as ok since service just completed!
      });
    }
  }

  return saved;
};

export const deleteManutencao = async (id: string): Promise<boolean> => {
  const items = JSON.parse(localStorage.getItem('ibec_manutencoes') || '[]');
  const filtered = items.filter((i: ManutencaoVeiculo) => i.id !== id);
  localStorage.setItem('ibec_manutencoes', JSON.stringify(filtered));
  return true;
};

// --- CLIENTES OPERATORS ---

export const getClientes = async (): Promise<Cliente[]> => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('clientes').select('*').order('nome', { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) return data as Cliente[];
    } catch (e) {
      console.warn('[Supabase] Query to clientes failed.', e);
    }
  }
  return JSON.parse(localStorage.getItem('ibec_clientes') || '[]');
};

export const saveCliente = async (cliente: Omit<Cliente, 'id'> & { id?: string }): Promise<Cliente> => {
  const isNew = !cliente.id;
  const newId = cliente.id || 'c-' + Math.random().toString(36).substr(2, 9);
  const now = new Date().toISOString();

  const saved: Cliente = {
    ...cliente,
    id: newId,
    created_at: cliente.created_at || now
  };

  if (supabase) {
    try {
      const query = isNew
        ? supabase.from('clientes').insert([saved])
        : supabase.from('clientes').update(saved).eq('id', newId);
      const { error } = await query;
      if (error) throw error;
    } catch (e) {
      console.warn('[Supabase] Save cliente failed.', e);
    }
  }

  const items = JSON.parse(localStorage.getItem('ibec_clientes') || '[]');
  const index = items.findIndex((i: Cliente) => i.id === newId);
  if (index >= 0) {
    items[index] = saved;
  } else {
    items.push(saved);
  }
  localStorage.setItem('ibec_clientes', JSON.stringify(items));
  return saved;
};

export const deleteCliente = async (id: string): Promise<boolean> => {
  if (supabase) {
    try {
      const { error } = await supabase.from('clientes').delete().eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.warn('[Supabase] Delete cliente failed.', e);
    }
  }

  const items = JSON.parse(localStorage.getItem('ibec_clientes') || '[]');
  const filtered = items.filter((i: Cliente) => i.id !== id);
  localStorage.setItem('ibec_clientes', JSON.stringify(filtered));
  return true;
};
