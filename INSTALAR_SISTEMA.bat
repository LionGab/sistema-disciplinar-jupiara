@echo off
echo ====================================================
echo   INSTALADOR DO SISTEMA DISCIPLINAR
echo   Escola Civico Militar Jupiara
echo ====================================================
echo.
echo Este instalador vai preparar tudo para voce!
echo.
pause

echo.
echo [1/4] Verificando se o Node.js esta instalado...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERRO: Node.js nao esta instalado!
    echo Por favor, instale o Node.js primeiro:
    echo https://nodejs.org
    echo.
    pause
    exit
)
echo Node.js encontrado!

echo.
echo [2/4] Instalando dependencias do Backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ERRO ao instalar dependencias do backend!
    pause
    exit
)

echo.
echo [3/4] Instalando dependencias do Frontend...
cd ..
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ERRO ao instalar dependencias do frontend!
    pause
    exit
)

echo.
echo ====================================================
echo   INSTALACAO CONCLUIDA COM SUCESSO!
echo ====================================================
echo.
echo Agora voce precisa:
echo.
echo 1. Instalar PostgreSQL (se ainda nao tem)
echo    Site: https://www.postgresql.org/download/windows/
echo.
echo 2. Criar o banco de dados usando o arquivo:
echo    backend\database.sql
echo.
echo 3. Executar o arquivo INICIAR_SISTEMA.bat
echo.
pause