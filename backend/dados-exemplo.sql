-- Dados de exemplo para teste do sistema
-- Execute após criar o schema principal (database.sql)

-- Inserir alunos de exemplo
INSERT INTO alunos (matricula, nome, data_nascimento, turma_id, telefone_responsavel, email_responsavel, endereco, observacoes) VALUES
-- Turma 6A
('2024001', 'Ana Silva Santos', '2012-03-15', 1, '(11) 98765-4321', 'ana.santos@email.com', 'Rua das Flores, 123 - Centro', 'Aluna exemplar'),
('2024002', 'Carlos Eduardo Lima', '2012-07-22', 1, '(11) 97654-3210', 'carlos.lima@email.com', 'Av. Brasil, 456 - Jardim', 'Participa do grêmio estudantil'),
('2024003', 'Beatriz Costa Oliveira', '2012-01-30', 1, '(11) 96543-2109', 'beatriz.costa@email.com', 'Rua São Paulo, 789 - Vila Nova', 'Monitora de matemática'),

-- Turma 6B
('2024004', 'Diego Ferreira Souza', '2012-09-18', 2, '(11) 95432-1098', 'diego.souza@email.com', 'Rua da Paz, 321 - Centro', 'Atleta da escola'),
('2024005', 'Eduarda Mendes Silva', '2012-05-12', 2, '(11) 94321-0987', 'eduarda.silva@email.com', 'Av. Independência, 654 - Jardim', 'Líder de turma'),

-- Turma 7A
('2024006', 'Felipe Roberto Alves', '2011-11-08', 3, '(11) 93210-9876', 'felipe.alves@email.com', 'Rua Rio de Janeiro, 987 - Vila Nova', 'Participa do coral'),
('2024007', 'Gabriela dos Santos', '2011-04-25', 3, '(11) 92109-8765', 'gabriela.santos@email.com', 'Rua Minas Gerais, 147 - Centro', 'Destaque em português'),

-- Turma 8A
('2024008', 'Henrique Barbosa Lima', '2010-12-03', 5, '(11) 91098-7654', 'henrique.lima@email.com', 'Av. Goiás, 258 - Jardim', 'Capitão da turma'),
('2024009', 'Isabella Rodrigues Costa', '2010-08-17', 5, '(11) 90987-6543', 'isabella.costa@email.com', 'Rua Bahia, 369 - Vila Nova', 'Monitora de ciências'),

-- Turma 9A
('2024010', 'João Victor Pereira', '2009-06-14', 7, '(11) 89876-5432', 'joao.pereira@email.com', 'Rua Ceará, 741 - Centro', 'Representante de turma'),
('2024011', 'Kamila Fernandes Silva', '2009-10-29', 7, '(11) 88765-4321', 'kamila.silva@email.com', 'Av. Pernambuco, 852 - Jardim', 'Voluntária na biblioteca'),

-- Turma 1A EM
('2024012', 'Lucas Martins Oliveira', '2008-02-11', 9, '(11) 87654-3210', 'lucas.oliveira@email.com', 'Rua Paraná, 963 - Vila Nova', 'Presidente do grêmio'),
('2024013', 'Mariana Cunha Santos', '2008-07-05', 9, '(11) 86543-2109', 'mariana.santos@email.com', 'Av. Rio Grande do Sul, 174 - Centro', 'Destaque em química');

-- Inserir ocorrências de exemplo
INSERT INTO ocorrencias (aluno_id, tipo_ocorrencia_id, data_ocorrencia, hora_ocorrencia, descricao, medidas_tomadas, responsavel_registro, status) VALUES
-- Ocorrências para Diego (id 4)
(4, 1, '2024-08-01', '07:15', 'Chegou 15 minutos atrasado à primeira aula', 'Advertência verbal e orientação sobre pontualidade', 'Tenente Silva', 'resolvida'),
(4, 3, '2024-08-05', '10:30', 'Conversando durante explicação da matéria de História', 'Mudança de lugar na sala', 'Sargento Costa', 'resolvida'),

-- Ocorrências para Felipe (id 6)
(6, 4, '2024-08-03', '11:20', 'Uso de celular durante aula de Matemática', 'Celular recolhido até o final das aulas', 'Tenente Silva', 'resolvida'),
(6, 2, '2024-08-07', '07:00', 'Uniforme incompleto - sem gravata', 'Orientação sobre uso correto do uniforme', 'Sargento Oliveira', 'resolvida'),

-- Ocorrências para Henrique (id 8)
(8, 5, '2024-08-02', '14:15', 'Desrespeitou colega de turma durante discussão', 'Conversa individual e pedido de desculpas', 'Tenente Silva', 'resolvida'),
(8, 7, '2024-08-10', '15:30', 'Discussão acalorada com colega durante recreio', 'Suspensão de recreio por 2 dias', 'Tenente Silva', 'em_andamento'),

-- Ocorrências para João Victor (id 10)
(10, 1, '2024-08-06', '07:20', 'Atraso de 20 minutos', 'Advertência e justificativa por escrito', 'Sargento Costa', 'pendente'),

-- Ocorrências para Lucas (id 12)
(12, 6, '2024-08-08', '08:00', 'Faltou sem justificativa prévia', 'Convocação dos responsáveis', 'Tenente Silva', 'pendente'),

-- Inserir faltas de exemplo
INSERT INTO faltas (aluno_id, data_falta, justificada, motivo, documento_justificativa) VALUES
-- Faltas para Diego
(4, '2024-07-25', false, 'Sem justificativa apresentada', null),
(4, '2024-08-12', true, 'Consulta médica', 'Atestado médico'),

-- Faltas para Felipe
(6, '2024-07-30', true, 'Compromisso familiar urgente', 'Declaração dos pais'),
(6, '2024-08-09', false, 'Não compareceu', null),

-- Faltas para Henrique
(8, '2024-08-01', true, 'Problema de saúde', 'Atestado médico'),
(8, '2024-08-11', false, 'Ausência não justificada', null),

-- Faltas para Isabella
(9, '2024-07-28', true, 'Viagem em família', 'Justificativa dos responsáveis'),

-- Faltas para João Victor
(10, '2024-08-04', false, 'Falta sem justificativa', null),
(10, '2024-08-13', true, 'Consulta odontológica', 'Declaração do dentista'),

-- Faltas para Lucas
(12, '2024-08-08', false, 'Não compareceu às aulas', null),
(12, '2024-08-10', false, 'Ausência não justificada', null),

-- Faltas para Mariana
(13, '2024-07-26', true, 'Participação em olimpíada de química', 'Comprovante de participação'),

-- Faltas adicionais para variabilidade
(5, '2024-07-29', true, 'Exame médico', 'Atestado'),
(7, '2024-08-02', false, 'Falta não justificada', null),
(11, '2024-08-06', true, 'Compromisso familiar', 'Declaração'),
(3, '2024-08-07', true, 'Consulta médica especializada', 'Atestado médico');

-- Atualizar as sequences para evitar conflitos (opcional)
SELECT setval('alunos_id_seq', (SELECT MAX(id) FROM alunos));
SELECT setval('ocorrencias_id_seq', (SELECT MAX(id) FROM ocorrencias));
SELECT setval('faltas_id_seq', (SELECT MAX(id) FROM faltas));