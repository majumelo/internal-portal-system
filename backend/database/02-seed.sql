    
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO categoria (nome) VALUES
    ('TI'), ('RH'), ('Compras'), ('Financeiro'), ('Infraestrutura')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO usuario (nome, login, senha_hash, perfil) VALUES
    ('Maria Julia',   'maria', crypt('123456', gen_salt('bf', 10)), 'COLABORADOR'),
    ('Layanne Santos', 'layanne', crypt('123456', gen_salt('bf', 10)), 'COLABORADOR'),
    ('Ana Atendente', 'ana',   crypt('123456', gen_salt('bf', 10)), 'ATENDENTE')
ON CONFLICT (login) DO NOTHING;
