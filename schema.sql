-- ============================================================
-- IBEC Express - SCHEMA SQL PARA SUPABASE
-- Execute este script no editor SQL do seu painel do Supabase.
-- ============================================================

-- 1. TABELA: funcionarios
CREATE TABLE IF NOT EXISTS public.funcionarios (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    cpf TEXT,
    cargo TEXT NOT NULL,
    salario NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    aluguel_moto NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    vr NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    periculosidade NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    cesta_basica NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    sal_familia NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    status TEXT DEFAULT 'ativo'::text NOT NULL,
    data_admissao TEXT,
    data_demissao TEXT,
    banco TEXT,
    agencia TEXT,
    conta TEXT,
    pix TEXT,
    observacoes TEXT,
    created_at TEXT,
    updated_at TEXT
);

-- 2. TABELA: clientes
CREATE TABLE IF NOT EXISTS public.clientes (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    cnpj_cpf TEXT,
    tipo TEXT NOT NULL DEFAULT 'empresa'::text,
    contato TEXT,
    telefone TEXT,
    email TEXT,
    servicos_contratados TEXT[] DEFAULT '{}'::text[],
    valor_mensal_medio NUMERIC(12,2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'ativo'::text,
    observacoes TEXT,
    created_at TEXT
);

-- 3. TABELA: veiculos
CREATE TABLE IF NOT EXISTS public.veiculos (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    placa TEXT,
    tipo TEXT NOT NULL,
    marca TEXT,
    modelo TEXT,
    ano_fabricacao INTEGER,
    km_atual INTEGER DEFAULT 0 NOT NULL,
    km_proxima_revisao INTEGER,
    status TEXT NOT NULL DEFAULT 'ativo'::text,
    manutencao_status TEXT NOT NULL DEFAULT 'ok'::text,
    responsavel_id TEXT REFERENCES public.funcionarios(id) ON DELETE SET NULL,
    data_proxima_revisao TEXT,
    observacoes TEXT,
    created_at TEXT,
    updated_at TEXT
);

-- 4. TABELA: contas_pagar
CREATE TABLE IF NOT EXISTS public.contas_pagar (
    id TEXT PRIMARY KEY,
    descricao TEXT NOT NULL,
    fornecedor TEXT,
    categoria TEXT NOT NULL,
    valor NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    vencimento TEXT NOT NULL,
    data_pagamento TEXT,
    status TEXT NOT NULL DEFAULT 'pendente'::text,
    banco TEXT,
    forma_pagamento TEXT NOT NULL,
    numero_nota TEXT,
    recorrente BOOLEAN NOT NULL DEFAULT false,
    recorrencia_meses INTEGER NOT NULL DEFAULT 1,
    observacoes TEXT,
    created_at TEXT,
    updated_at TEXT
);

-- 5. TABELA: receitas
CREATE TABLE IF NOT EXISTS public.receitas (
    id TEXT PRIMARY KEY,
    cliente TEXT NOT NULL,
    servico TEXT NOT NULL,
    descricao TEXT,
    valor NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    data_emissao TEXT NOT NULL,
    data_recebimento TEXT,
    status TEXT NOT NULL DEFAULT 'pendente'::text,
    forma_recebimento TEXT,
    numero_nota TEXT,
    observacoes TEXT,
    created_at TEXT,
    updated_at TEXT
);

-- 6. TABELA: holerites
CREATE TABLE IF NOT EXISTS public.holerites (
    id TEXT PRIMARY KEY,
    funcionario_id TEXT NOT NULL REFERENCES public.funcionarios(id) ON DELETE CASCADE,
    competencia TEXT NOT NULL,
    salario_base NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    aluguel_moto NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    vr NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    periculosidade NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    cesta_basica NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    sal_familia NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    ordem_servico NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_bruto NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    desc_vale_transporte NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    desc_inss NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    desc_falta NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    desc_combustivel NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    desc_plano_odonto NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    desc_uniforme NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    desc_outros NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_descontos NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    salario_liquido NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'pendente'::text,
    observacoes TEXT,
    created_at TEXT
);

-- 7. TABELA: manutencoes
CREATE TABLE IF NOT EXISTS public.manutencoes (
    id TEXT PRIMARY KEY,
    veiculo_id TEXT NOT NULL REFERENCES public.veiculos(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL,
    descricao TEXT,
    valor NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    data_servico TEXT NOT NULL,
    km_servico INTEGER,
    oficina TEXT,
    status TEXT NOT NULL DEFAULT 'agendado'::text,
    created_at TEXT
);

-- ============================================================
-- DESABILITAR ROW LEVEL SECURITY (RLS) PARA PROTOTIPAGEM DIRETA
-- ============================================================
ALTER TABLE public.funcionarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.veiculos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas_pagar DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.receitas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.holerites DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.manutencoes DISABLE ROW LEVEL SECURITY;
