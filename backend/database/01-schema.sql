-- =============================================================
-- Portal de Solicitações Internas - Estrutura do banco
-- PostgreSQL 14+
-- =============================================================

CREATE TABLE IF NOT EXISTS usuario (
    id          SERIAL       PRIMARY KEY,
    nome        VARCHAR(100) NOT NULL,
    login       VARCHAR(50)  NOT NULL UNIQUE,
    senha_hash  VARCHAR(255) NOT NULL,
    perfil      VARCHAR(20)  NOT NULL
                CHECK (perfil IN ('COLABORADOR', 'ATENDENTE')),
    ativo       BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categoria (
    id     SERIAL      PRIMARY KEY,
    nome   VARCHAR(50) NOT NULL UNIQUE,
    ativo  BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS solicitacao (
    id              SERIAL       PRIMARY KEY,
    titulo          VARCHAR(150) NOT NULL CHECK (char_length(titulo) >= 3),
    descricao       TEXT         NOT NULL,
    categoria_id    INT          NOT NULL REFERENCES categoria (id),
    solicitante_id  INT          NOT NULL REFERENCES usuario (id),
    status          VARCHAR(20)  NOT NULL DEFAULT 'ABERTO'
                    CHECK (status IN ('ABERTO', 'EM_ATENDIMENTO', 'CONCLUIDO')),
    criado_em       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Índices nos campos usados pelos filtros e pela visibilidade (RN05)
CREATE INDEX IF NOT EXISTS idx_solicitacao_status       ON solicitacao (status);
CREATE INDEX IF NOT EXISTS idx_solicitacao_categoria    ON solicitacao (categoria_id);
CREATE INDEX IF NOT EXISTS idx_solicitacao_solicitante  ON solicitacao (solicitante_id);
CREATE INDEX IF NOT EXISTS idx_solicitacao_criado_em    ON solicitacao (criado_em);

CREATE TABLE IF NOT EXISTS historico_status (
    id               SERIAL       PRIMARY KEY,
    solicitacao_id   INT          NOT NULL REFERENCES solicitacao (id) ON DELETE CASCADE,
    status_anterior  VARCHAR(20)  NULL
                     CHECK (status_anterior IN ('ABERTO', 'EM_ATENDIMENTO', 'CONCLUIDO')),
    status_novo      VARCHAR(20)  NOT NULL
                     CHECK (status_novo IN ('ABERTO', 'EM_ATENDIMENTO', 'CONCLUIDO')),
    usuario_id       INT          NOT NULL REFERENCES usuario (id),
    observacao       VARCHAR(500) NULL,
    alterado_em      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historico_solicitacao ON historico_status (solicitacao_id);
