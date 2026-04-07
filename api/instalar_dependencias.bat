@echo off
title Instalar Dependencias - CIS API
echo ============================================================
echo  CIS - Centro de Intervencion Psicoeducativa
echo  Instalando dependencias de la API (Node.js + Express)
echo ============================================================
echo.
cd /d "%~dp0"
echo Instalando: express, mysql2, bcryptjs, cors, dotenv...
echo.
npm install
echo.
echo ============================================================
echo  Instalacion completada.
echo  Ahora puedes iniciar la API con: ejecutar_api.bat
echo ============================================================
pause
