// ============================================================
//  CIS API – Configuración de entorno
//  Detecta automáticamente si estamos en local, en producción
//  o abriendo el archivo directamente desde el sistema de archivos.
// ============================================================

(function () {
  'use strict';

  var host = window.location.hostname;
  var protocol = window.location.protocol;

  // Apertura directa como archivo (file://) → modo sin servidor
  if (protocol === 'file:') {
    window.API_BASE        = null;   // null indica "sin API disponible"
    window.CIS_MODO_LOCAL  = true;
    window.CIS_SIN_SERVIDOR = true;
    console.warn('[CIS] Modo FILE://: la API no está disponible. Abre la app con el servidor Express (npm run dev) para usar el portal.');
    return;
  }

  // Servidor de desarrollo local
  if (host === 'localhost' || host === '127.0.0.1') {
    window.API_BASE       = 'http://localhost:3001';
    window.CIS_MODO_LOCAL = true;
    window.CIS_SIN_SERVIDOR = false;
    return;
  }

  // Producción (Railway u otro host) – misma URL de origen
  window.API_BASE       = '';
  window.CIS_MODO_LOCAL = false;
  window.CIS_SIN_SERVIDOR = false;
})();
