@echo off
echo ====================================================
echo   CRIADOR DO BANCO DE DADOS
echo   Sistema Disciplinar
echo ====================================================
echo.
echo Este programa vai criar o banco de dados para voce!
echo.
echo IMPORTANTE: O PostgreSQL precisa estar instalado!
echo.
set /p senha="Digite a senha do PostgreSQL (geralmente 'postgres'): "
echo.

echo Criando banco de dados...
set PGPASSWORD=%senha%

psql -U postgres -c "CREATE DATABASE ficha_disciplinar;" >nul 2>&1
if %errorlevel% equ 0 (
    echo Banco de dados criado com sucesso!
) else (
    echo Banco ja existe ou erro ao criar. Continuando...
)

echo.
echo Criando tabelas do sistema...
psql -U postgres -d ficha_disciplinar -f backend\database.sql
if %errorlevel% neq 0 (
    echo.
    echo ERRO ao criar tabelas! Verifique se:
    echo 1. PostgreSQL esta instalado
    echo 2. A senha esta correta
    echo 3. O servico do PostgreSQL esta rodando
    pause
    exit
)

echo.
echo Inserindo dados de exemplo...
psql -U postgres -d ficha_disciplinar -f backend\dados-exemplo.sql
if %errorlevel% neq 0 (
    echo AVISO: Nao foi possivel inserir dados de exemplo.
    echo O sistema funcionara, mas sem dados iniciais.
)

echo.
echo ====================================================
echo   BANCO DE DADOS CRIADO COM SUCESSO!
echo ====================================================
echo.
echo Tabelas criadas:
echo - turmas (12 turmas)
echo - alunos (13 alunos exemplo)
echo - ocorrencias (8 registros)
echo - faltas (16 registros)
echo - tipos_ocorrencia (10 tipos)
echo.
pause