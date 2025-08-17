@echo off
echo ====================================================
echo   PARANDO O SISTEMA
echo ====================================================
echo.

echo Fechando servidor Backend...
taskkill /F /IM node.exe >nul 2>&1

echo Fechando aplicacao Frontend...
taskkill /F /FI "WindowTitle eq npm*" >nul 2>&1
taskkill /F /FI "WindowTitle eq react*" >nul 2>&1

echo.
echo Sistema parado com sucesso!
echo.
pause