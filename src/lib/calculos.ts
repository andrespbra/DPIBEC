import { Funcionario, Holerite, Receita, ContaPagar } from '../types';

export const calcBruto = (f: Omit<Funcionario, 'id' | 'nome' | 'cargo' | 'status'> & { salario: number; aluguel_moto?: number; vr?: number; periculosidade?: number; cesta_basica?: number; sal_familia?: number }): number => {
  return (
    f.salario +
    (f.aluguel_moto || 0) +
    (f.vr || 0) +
    (f.periculosidade || 0) +
    (f.cesta_basica || 0) +
    (f.sal_familia || 0)
  );
};

export const calcDescontos = (h: {
  desc_vale_transporte: number;
  desc_inss: number;
  desc_falta: number;
  desc_combustivel: number;
  desc_plano_odonto: number;
  desc_uniforme: number;
  desc_outros: number;
}): number => {
  return (
    h.desc_vale_transporte +
    h.desc_inss +
    h.desc_falta +
    h.desc_combustivel +
    h.desc_plano_odonto +
    h.desc_uniforme +
    h.desc_outros
  );
};

export const calcINSS = (salario: number): number => {
  // Tabela INSS progressive brackets calculation (current Brazilian rules)
  // Let's compute with real progressive brackets for high precision model
  let inssDesc = 0;
  if (salario <= 1412.00) {
    inssDesc = salario * 0.075;
  } else if (salario <= 2666.68) {
    inssDesc = (1412.00 * 0.075) + ((salario - 1412.00) * 0.09);
  } else if (salario <= 4000.03) {
    inssDesc = (1412.00 * 0.075) + ((2666.68 - 1412.00) * 0.09) + ((salario - 2666.68) * 0.12);
  } else if (salario <= 7786.02) {
    inssDesc = (1412.00 * 0.075) + ((2666.68 - 1412.00) * 0.09) + ((4000.03 - 2666.68) * 0.12) + ((salario - 4000.03) * 0.14);
  } else {
    inssDesc = 908.85; // INSS contribution cap
  }
  return Number(inssDesc.toFixed(2));
};

export const calcFGTS = (salarioBruto: number): number => {
  return Number((salarioBruto * 0.08).toFixed(2));
};

export const fmtMoeda = (v: number | undefined | null): string => {
  if (v === undefined || v === null || isNaN(v)) return 'R$ 0,00';
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const fmtData = (d: string | undefined | null): string => {
  if (!d) return '---';
  // Standard YYYY-MM-DD input splits and adjusts for timezone safely
  const parts = d.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return date.toLocaleDateString('pt-BR');
  } catch {
    return d;
  }
};

export const fmtCompetencia = (c: string): string => {
  if (!c) return '---';
  // format "2026-06-01" or "2026-06" to e.g. "Junho de 2026"
  const parts = c.split('-');
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  if (monthIdx >= 0 && monthIdx < 12) {
    return `${months[monthIdx]} / ${year}`;
  }
  return c;
};

export const calcDRE = (receitas: Receita[], contasPagar: ContaPagar[], holerites: Holerite[]) => {
  // Sum received revenues
  const totalReceitas = receitas
    .filter(r => r.status === 'recebido')
    .reduce((sum, r) => sum + r.valor, 0);

  // Sum paid operations
  const totalDespesas = contasPagar
    .filter(c => c.status === 'pago')
    .reduce((sum, c) => sum + c.valor, 0);

  // Sum paid employees payroll
  const totalFolha = holerites
    .filter(h => h.status === 'pago')
    .reduce((sum, h) => sum + h.salario_liquido, 0);

  const resultado = totalReceitas - totalDespesas - totalFolha;
  const margem = totalReceitas > 0 ? (resultado / totalReceitas) * 100 : 0;

  return {
    totalReceitas,
    totalDespesas,
    totalFolha,
    resultado,
    margem
  };
};
