@echo off
setlocal EnableExtensions
chcp 65001 >nul

title OMVITAL - Iniciando sistema
cd /d "%~dp0"

echo ========================================
echo   OMVITAL - Sistema de Clinica
echo ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js no esta instalado o no esta en el PATH.
  echo Instala Node.js v18+ desde https://nodejs.org
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo [INFO] Instalando dependencias...
  where bun >nul 2>&1
  if errorlevel 1 (
    call npm install
  ) else (
    call bun install
  )
  if errorlevel 1 (
    echo [ERROR] Fallo la instalacion de dependencias.
    pause
    exit /b 1
  )
  echo.
)

echo [INFO] Iniciando servidor de desarrollo...
echo [INFO] El navegador se abrira en unos segundos.
echo [INFO] Mantén esta ventana abierta mientras uses el sistema.
echo [INFO] Para detener el servidor: Ctrl+C
echo.

start "" cmd /c "timeout /t 4 /nobreak >nul && start http://localhost:3000"

where bun >nul 2>&1
if errorlevel 1 (
  call npm run dev
) else (
  call bun run dev
)

if errorlevel 1 (
  echo.
  echo [ERROR] El servidor se detuvo con un error.
  pause
  exit /b 1
)

endlocal
