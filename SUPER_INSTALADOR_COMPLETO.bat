@echo off
color 0A
title Sistema Disciplinar - Super Instalador

echo.
echo    ###########################################
echo    #                                         #
echo    #    SUPER INSTALADOR - SISTEMA ESCOLAR  #
echo    #    Escola Civico Militar Jupiara       #
echo    #                                         #
echo    ###########################################
echo.
echo    Este instalador vai fazer TUDO automaticamente!
echo.
echo    O que vamos fazer:
echo    [x] Verificar programas necessarios
echo    [x] Instalar todas as dependencias
echo    [x] Criar o banco de dados
echo    [x] Configurar o sistema
echo    [x] Iniciar tudo pronto para usar!
echo.
echo ====================================================
pause

cls
echo ====================================================
echo  PASSO 1: Verificando programas necessarios
echo ====================================================
echo.

set node_ok=0
set pg_ok=0

echo Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Node.js esta instalado!
    set node_ok=1
) else (
    echo [ERRO] Node.js NAO esta instalado!
    echo.
    echo Vou abrir o site para voce baixar:
    start https://nodejs.org
    echo.
    echo Instrucoes:
    echo 1. Clique no botao verde "LTS"
    echo 2. Execute o instalador
    echo 3. Clique em Next, Next, Next, Install
    echo 4. Depois volte aqui e aperte qualquer tecla
    echo.
    pause
)

echo.
echo Verificando PostgreSQL...
psql --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] PostgreSQL esta instalado!
    set pg_ok=1
) else (
    echo [AVISO] PostgreSQL pode nao estar instalado ou configurado
    echo.
    echo Se ainda nao tem, baixe em:
    start https://www.postgresql.org/download/windows/
    echo.
    echo Instrucoes:
    echo 1. Baixe o instalador
    echo 2. Durante instalacao, anote a senha (pode ser: postgres)
    echo 3. Depois volte aqui
    echo.
    pause
)

cls
echo ====================================================
echo  PASSO 2: Instalando dependencias do sistema
echo ====================================================
echo.

echo Instalando Backend (servidor)...
echo.
cd backend
call npm install --silent
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao instalar backend!
    pause
    exit
)
echo [OK] Backend instalado!

echo.
echo Instalando Frontend (interface)...
echo.
cd ..
call npm install --silent
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao instalar frontend!
    pause
    exit
)
echo [OK] Frontend instalado!

cls
echo ====================================================
echo  PASSO 3: Configurando Banco de Dados
echo ====================================================
echo.
echo Agora vamos criar o banco de dados.
echo.

set /p criar_bd="Deseja criar o banco de dados agora? (S/N): "
if /i "%criar_bd%"=="S" (
    echo.
    set /p senha_pg="Digite a senha do PostgreSQL (geralmente 'postgres'): "
    
    echo.
    echo Criando banco de dados...
    set PGPASSWORD=%senha_pg%
    
    psql -U postgres -c "DROP DATABASE IF EXISTS ficha_disciplinar;" >nul 2>&1
    psql -U postgres -c "CREATE DATABASE ficha_disciplinar;" >nul 2>&1
    
    echo Criando tabelas...
    psql -U postgres -d ficha_disciplinar -f backend\database.sql >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] Tabelas criadas!
    ) else (
        echo [ERRO] Falha ao criar tabelas
    )
    
    echo Inserindo dados de exemplo...
    psql -U postgres -d ficha_disciplinar -f backend\dados-exemplo.sql >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] Dados de exemplo inseridos!
    ) else (
        echo [AVISO] Dados de exemplo nao inseridos
    )
    
    echo.
    echo Atualizando arquivo de configuracao...
    (
        echo PORT=5000
        echo DB_HOST=localhost
        echo DB_PORT=5432
        echo DB_NAME=ficha_disciplinar
        echo DB_USER=postgres
        echo DB_PASSWORD=%senha_pg%
        echo JWT_SECRET=escola_civico_militar_jupiara_2024
    ) > backend\.env
    echo [OK] Configuracao salva!
)

cls
echo ====================================================
echo  PASSO 4: Iniciando o Sistema
echo ====================================================
echo.
echo Vou abrir o sistema para voce!
echo.

echo Iniciando Backend (aguarde 5 segundos)...
start /min cmd /k "cd backend && npm run dev"
timeout /t 5 /nobreak >nul

echo Iniciando Frontend (o navegador vai abrir)...
start /min cmd /k "npm start"

echo.
echo ====================================================
echo.
echo    ##############################################
echo    #                                            #
echo    #         SISTEMA INSTALADO COM SUCESSO!    #
echo    #                                            #
echo    ##############################################
echo.
echo    O navegador vai abrir em alguns segundos...
echo.
echo    Se nao abrir, acesse: http://localhost:3000
echo.
echo    Para parar o sistema: Execute PARAR_SISTEMA.bat
echo    Para iniciar novamente: Execute INICIAR_SISTEMA.bat
echo.
echo ====================================================
echo.
pause