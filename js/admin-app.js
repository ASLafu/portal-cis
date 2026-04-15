// ==========================================================
//  CIS – Panel de Administración
//  Lógica completa del área de administración
// ==========================================================

(function () {
  'use strict';

  const API = window.API_BASE;

  /* ----------------------------------------------------------
     GUARDIA: solo admins
  ---------------------------------------------------------- */
  const sesionRaw = sessionStorage.getItem('cis_admin');
  if (!sesionRaw) {
    window.location.href = 'login-admin.html';
    return;
  }
  const admin = JSON.parse(sesionRaw);

  /* ----------------------------------------------------------
     UTILIDADES
  ---------------------------------------------------------- */
  function esc(s) {
    return String(s || '–')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function formatFecha(iso) {
    if (!iso) return '–';
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function badgeEstado(estado) {
    const mapa = {
      pendiente:   'badge-consent-pending',
      confirmada:  'badge-consent-ok',
      aceptado:    'badge-consent-ok',
      cancelada:   'badge-consent-rejected',
      rechazado:   'badge-consent-rejected',
    };
    return `<span class="apt-status ${mapa[estado] || ''}">${esc(estado)}</span>`;
  }

  /* ----------------------------------------------------------
     PERFIL ADMIN (SIDEBAR)
  ---------------------------------------------------------- */
  function renderPerfilAdmin() {
    const avatar  = document.getElementById('adminAvatar');
    const nombre  = document.getElementById('adminNombre');
    const emailEl = document.getElementById('adminEmail');
    const initials = admin.nombre.split(' ').slice(0, 2).map(n => n[0]).join('+');
    if (avatar)  avatar.src       = `https://ui-avatars.com/api/?name=${initials}&background=c0392b&color=fff&size=150`;
    if (nombre)  nombre.textContent = admin.nombre;
    if (emailEl) emailEl.textContent = `✉️ ${admin.email}`;
  }

  /* ----------------------------------------------------------
     NAVEGACIÓN ENTRE SECCIONES
  ---------------------------------------------------------- */
  function initNav() {
    const btns = document.querySelectorAll('.admin-nav-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.dataset.section;
        document.querySelectorAll('.admin-section').forEach(s => s.classList.add('hidden'));
        document.getElementById(`section-${target}`)?.classList.remove('hidden');
        loadSection(target);
      });
    });
  }

  const loaded = new Set();

  function loadSection(name) {
    if (loaded.has(name)) return;
    loaded.add(name);
    switch (name) {
      case 'stats':           cargarStats();          break;
      case 'usuarios':        cargarUsuarios();       break;
      case 'pacientes':       cargarPacientes();      break;
      case 'citas':           cargarCitas();          break;
      case 'consentimientos': cargarConsentimientos(); break;
    }
  }

  /* ----------------------------------------------------------
     1. ESTADÍSTICAS
  ---------------------------------------------------------- */
  async function cargarStats() {
    const grid = document.getElementById('statsGrid');
    try {
      const resp = await fetch(`${API}/api/admin/stats?adminId=${admin.id}`);
      const d    = await resp.json();
      if (!d.ok) { grid.innerHTML = '<p class="portal-empty">Error al cargar estadísticas.</p>'; return; }

      grid.innerHTML = `
        <div class="stat-card"><span class="stat-val">${d.totalUsuarios}</span><span class="stat-label">Usuarios totales</span></div>
        <div class="stat-card"><span class="stat-val">${d.totalFamilias}</span><span class="stat-label">Familias registradas</span></div>
        <div class="stat-card"><span class="stat-val">${d.totalProfesionales}</span><span class="stat-label">Profesionales</span></div>
        <div class="stat-card stat-card--accent"><span class="stat-val">${d.totalPacientes}</span><span class="stat-label">Pacientes activos</span></div>
        <div class="stat-card"><span class="stat-val">${d.totalCitas}</span><span class="stat-label">Citas registradas</span></div>
        <div class="stat-card stat-card--warn"><span class="stat-val">${d.citasPendientes}</span><span class="stat-label">Citas pendientes</span></div>
        <div class="stat-card stat-card--warn"><span class="stat-val">${d.consentPendientes}</span><span class="stat-label">Consentimientos pendientes</span></div>
        <div class="stat-card stat-card--ok"><span class="stat-val">${d.consentAceptados}</span><span class="stat-label">Consentimientos aceptados</span></div>
      `;
    } catch (_) {
      grid.innerHTML = '<p class="portal-empty">⚠️ No se pudo conectar con el servidor.</p>';
    }
  }

  /* ----------------------------------------------------------
     2. USUARIOS
  ---------------------------------------------------------- */
  async function cargarUsuarios() {
    const cont = document.getElementById('tablaUsuarios');
    try {
      const resp = await fetch(`${API}/api/admin/usuarios?adminId=${admin.id}`);
      const d    = await resp.json();
      if (!d.ok || d.usuarios.length === 0) {
        cont.innerHTML = '<p class="portal-empty">No hay usuarios registrados.</p>'; return;
      }

      cont.innerHTML = `
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead><tr>
              <th>#</th><th>Nombre</th><th>Email</th><th>Teléfono</th>
              <th>Rol</th><th>Alta</th><th>Estado</th><th>Acción</th>
            </tr></thead>
            <tbody>
              ${d.usuarios.map(u => `
                <tr id="row-u-${u.id}">
                  <td>${u.id}</td>
                  <td>${esc(u.nombre)}</td>
                  <td>${esc(u.email)}</td>
                  <td>${esc(u.telefono)}</td>
                  <td><span class="role-badge role-${u.rol}">${u.rol}</span></td>
                  <td>${formatFecha(u.created_at)}</td>
                  <td>${u.activo
                    ? '<span class="apt-status badge-consent-ok">Activo</span>'
                    : '<span class="apt-status badge-consent-rejected">Bloqueado</span>'}</td>
                  <td>
                    <button class="btn-admin-toggle btn-sm"
                      data-id="${u.id}" data-activo="${u.activo}">
                      ${u.activo ? '🔒 Desactivar' : '✅ Activar'}
                    </button>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;

      // Delegación de eventos para toggle
      cont.addEventListener('click', async (e) => {
        const btn = e.target.closest('.btn-admin-toggle');
        if (!btn) return;
        const id = btn.dataset.id;
        btn.disabled = true;
        btn.textContent = '...';

        const resp = await fetch(`${API}/api/admin/usuarios/${id}/toggle`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminId: admin.id }),
        });
        const r = await resp.json();
        if (r.ok) {
          loaded.delete('usuarios');
          cargarUsuarios();
        } else {
          btn.disabled = false;
          btn.textContent = 'Error';
        }
      });

    } catch (_) {
      cont.innerHTML = '<p class="portal-empty">⚠️ Error de conexión.</p>';
    }
  }

  /* ----------------------------------------------------------
     3. PACIENTES
  ---------------------------------------------------------- */
  async function cargarPacientes() {
    const cont = document.getElementById('tablaPacientes');
    try {
      const resp = await fetch(`${API}/api/admin/pacientes?adminId=${admin.id}`);
      const d    = await resp.json();
      if (!d.ok || d.pacientes.length === 0) {
        cont.innerHTML = '<p class="portal-empty">No hay pacientes registrados.</p>'; return;
      }

      cont.innerHTML = `
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead><tr>
              <th>#</th><th>Nombre</th><th>Diagnóstico</th><th>Profesional</th>
              <th>Tutor</th><th>Consentimiento</th><th>Alta</th>
            </tr></thead>
            <tbody>
              ${d.pacientes.map(p => `
                <tr>
                  <td>${p.id}</td>
                  <td>${esc(p.nombre)}</td>
                  <td>${esc(p.diagnostico_principal)}</td>
                  <td>${esc(p.profesional_nombre)}</td>
                  <td>${p.tutor_nombre ? esc(p.tutor_nombre) : '<span class="muted">Sin vincular</span>'}</td>
                  <td>${badgeEstado(p.consentimiento_estado || 'pendiente')}</td>
                  <td>${formatFecha(p.created_at)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    } catch (_) {
      cont.innerHTML = '<p class="portal-empty">⚠️ Error de conexión.</p>';
    }
  }

  /* ----------------------------------------------------------
     4. CITAS
  ---------------------------------------------------------- */
  async function cargarCitas() {
    const cont = document.getElementById('tablaCitas');
    try {
      const resp = await fetch(`${API}/api/admin/citas?adminId=${admin.id}`);
      const d    = await resp.json();
      if (!d.ok || d.citas.length === 0) {
        cont.innerHTML = '<p class="portal-empty">No hay citas registradas.</p>'; return;
      }

      cont.innerHTML = `
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead><tr>
              <th>#</th><th>Paciente</th><th>Email</th><th>Profesional</th>
              <th>Fecha</th><th>Hora</th><th>Estado</th><th>Cambiar</th>
            </tr></thead>
            <tbody>
              ${d.citas.map(c => `
                <tr id="row-c-${c.id}">
                  <td>${c.id}</td>
                  <td>${esc(c.nombre)}</td>
                  <td>${esc(c.email)}</td>
                  <td>${esc(c.profesional_nombre)}</td>
                  <td>${formatFecha(c.fecha)}</td>
                  <td>${esc(c.hora)}</td>
                  <td>${badgeEstado(c.estado)}</td>
                  <td>
                    <select class="select-estado-cita" data-id="${c.id}">
                      <option value="pendiente"  ${c.estado==='pendiente'  ?'selected':''}>Pendiente</option>
                      <option value="confirmada" ${c.estado==='confirmada' ?'selected':''}>Confirmada</option>
                      <option value="cancelada"  ${c.estado==='cancelada'  ?'selected':''}>Cancelada</option>
                    </select>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;

      cont.addEventListener('change', async (e) => {
        const sel = e.target.closest('.select-estado-cita');
        if (!sel) return;
        const id     = sel.dataset.id;
        const estado = sel.value;
        sel.disabled = true;

        await fetch(`${API}/api/admin/citas/${id}/estado`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminId: admin.id, estado }),
        });
        sel.disabled = false;
        loaded.delete('citas');
        cargarCitas();
      });

    } catch (_) {
      cont.innerHTML = '<p class="portal-empty">⚠️ Error de conexión.</p>';
    }
  }

  /* ----------------------------------------------------------
     5. CONSENTIMIENTOS
  ---------------------------------------------------------- */
  async function cargarConsentimientos() {
    const cont = document.getElementById('tablaConsentimientos');
    try {
      const resp = await fetch(`${API}/api/admin/consentimientos?adminId=${admin.id}`);
      const d    = await resp.json();
      if (!d.ok || d.consentimientos.length === 0) {
        cont.innerHTML = '<p class="portal-empty">No hay consentimientos registrados.</p>'; return;
      }

      cont.innerHTML = `
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead><tr>
              <th>#</th><th>Paciente</th><th>Profesional</th><th>Tutor email</th>
              <th>Tutor nombre</th><th>Estado</th><th>Enviado</th><th>Respondido</th>
            </tr></thead>
            <tbody>
              ${d.consentimientos.map(c => `
                <tr>
                  <td>${c.id}</td>
                  <td>${esc(c.paciente_nombre)}</td>
                  <td>${esc(c.profesional_nombre)}</td>
                  <td>${esc(c.email_tutor)}</td>
                  <td>${esc(c.nombre_tutor)}</td>
                  <td>${badgeEstado(c.estado)}</td>
                  <td>${formatFecha(c.fecha_envio)}</td>
                  <td>${formatFecha(c.fecha_respuesta)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    } catch (_) {
      cont.innerHTML = '<p class="portal-empty">⚠️ Error de conexión.</p>';
    }
  }

  /* ----------------------------------------------------------
     LOGOUT
  ---------------------------------------------------------- */
  function initLogout() {
    ['adminLogoutBtn', 'adminLogoutBtnSide'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', () => {
        sessionStorage.removeItem('cis_admin');
        window.location.href = 'login-admin.html';
      });
    });
  }

  /* ----------------------------------------------------------
     INIT
  ---------------------------------------------------------- */
  function init() {
    if (!document.getElementById('adminApp')) return;
    renderPerfilAdmin();
    initNav();
    initLogout();
    loadSection('stats'); // Carga el dashboard al entrar
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
