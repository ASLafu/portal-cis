// ============================================================
//  CIS API – Configuración de entorno
//  Detecta automáticamente si estamos en local o en producción.
//  En local apunta a http://localhost:3001
//  En producción usa rutas relativas (mismo servidor Express)
// ============================================================

const API_BASE = (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
)
  ? 'http://localhost:3001'
  : '';  // En producción Express sirve frontend y API desde el mismo origen
