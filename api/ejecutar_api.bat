@echo off
title CIS API - Servidor Node.js
echo ============================================================
echo  CIS - Centro de Intervencion Psicoeducativa
echo  Iniciando servidor API en http://localhost:3001
echo ============================================================
echo.
echo  Endpoints disponibles:
echo    GET  http://localhost:3001/api/health
echo    POST http://localhost:3001/api/registro
echo    POST http://localhost:3001/api/login
echo.
echo  IMPORTANTE: Asegurate de que XAMPP (MySQL) esta activo.
echo  Para detener el servidor pulsa Ctrl+C
echo.
echo ============================================================
echo.

cd /d "%~dp0"
node server.js

pause
