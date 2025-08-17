@echo off
echo ====================================================
echo   INICIANDO SISTEMA DISCIPLINAR
echo   Escola Civico Militar Jupiara
echo ====================================================
echo.

echo [1/2] Iniciando servidor Backend...
start cmd /k "cd backend && npm run dev"

echo Aguardando servidor iniciar...
timeout /t 5 /nobreak >nul

echo.
echo [2/2] Iniciando aplicacao Frontend...
start cmd /k "npm start"

echo.
echo ====================================================
echo   SISTEMA INICIADO!
echo ====================================================
echo.
echo O navegador vai abrir automaticamente em instantes...
echo.
echo Para PARAR o sistema, feche as janelas pretas do CMD.
echo.
echo ====================================================
echo.
pause