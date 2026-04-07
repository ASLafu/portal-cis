// ==========================================================
//  CIS – Portal Profesional
//  Lógica de renderizado y formularios del área profesional
// ==========================================================

(function () {
  'use strict';

  const API = 'http://localhost:3001';

  /* ----------------------------------------------------------
     GUARDIA: solo profesionales
  ---------------------------------------------------------- */
  const sesionRaw = sessionStorage.getItem('cis_pro');
  if (!sesionRaw) {
    window.location.href = 'login-profesional.html';
    return;
  }
  const pro = JSON.parse(sesionRaw);

  /* ----------------------------------------------------------
     UTILIDADES
  ---------------------------------------------------------- */
  function esc(s) {
    return String(s || '–')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function calcEdad(fechaISO) {
    if (!fechaISO) return '–';
    const hoy = new Date();
    const nac = new Date(fechaISO);
    let edad = hoy.getFullYear() - nac.getFullYear();
    if (hoy < new Date(hoy.getFullYear(), nac.getMonth(), nac.getDate())) edad--;
    return edad + ' años';
  }

  function formatFecha(iso) {
    if (!iso) return '–';
    const [y, m, d] = iso.split('T')[0].split('-');
    return `${d}/${m}/${y}`;
  }

  function badgeConsentimiento(estado) {
    const map = {
      pendiente:  { cls: 'badge-consent-pending',  txt: '⏳ Consentimiento pendiente' },
      aceptado:   { cls: 'badge-consent-ok',        txt: '✅ Vinculado' },
      rechazado:  { cls: 'badge-consent-rejected',  txt: '❌ Rechazado' },
      null:       { cls: 'badge-consent-pending',   txt: '⏳ Sin solicitud' },
    };
    const b = map[estado] || map['null'];
    return `<span class="apt-status ${b.cls}">${b.txt}</span>`;
  }

  /* ----------------------------------------------------------
     SELECTORES DE FECHA (día / mes / año)
  ---------------------------------------------------------- */
  function initFechaSelects() {
    const selDia  = document.getElementById('pacFechaDia');
    const selAnio = document.getElementById('pacFechaAnio');
    if (!selDia || !selAnio) return;

    // Poblar días (1-31)
    for (let d = 1; d <= 31; d++) {
      const opt = document.createElement('option');
      opt.value = String(d).padStart(2, '0');
      opt.textContent = d;
      selDia.appendChild(opt);
    }

    // Poblar años (año actual → 1990)
    const hoy = new Date().getFullYear();
    for (let y = hoy; y >= 1990; y--) {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      selAnio.appendChild(opt);
    }
  }

  /* ----------------------------------------------------------
     PERFIL DEL PROFESIONAL (SIDEBAR)
  ---------------------------------------------------------- */
  function renderPerfilPro() {
    const avatar = document.getElementById('proAvatar');
    const nombre = document.getElementById('proNombre');
    const tel    = document.getElementById('proTel');
    const email  = document.getElementById('proEmail');

    const initials = pro.nombre.split(' ').slice(0, 2).map(n => n[0]).join('+');
    if (avatar) avatar.src = `https://ui-avatars.com/api/?name=${initials}&background=2D6A4F&color=fff&size=150`;
    if (nombre) nombre.textContent = pro.nombre;
    if (tel)    tel.textContent    = `📞 ${pro.telefono || '–'}`;
    if (email)  email.textContent  = `✉️ ${pro.email}`;
  }

  /* ----------------------------------------------------------
     CARGAR Y RENDERIZAR PACIENTES
  ---------------------------------------------------------- */
  async function cargarPacientes() {
    const lista = document.getElementById('listaPacientes');
    try {
      const resp = await fetch(`${API}/api/pacientes?usuarioId=${pro.id}&rol=profesional`);
      const datos = await resp.json();

      if (!datos.ok) {
        lista.innerHTML = `<p class="portal-empty">Error al cargar los pacientes.</p>`;
        return;
      }

      const total = datos.pacientes.length;
      const pendientes = datos.pacientes.filter(p => p.consentimiento_estado === 'pendiente' || !p.consentimiento_estado).length;

      const elTotal = document.getElementById('proPacientesTotal');
      const elPend  = document.getElementById('proPendientes');
      if (elTotal) elTotal.textContent = total;
      if (elPend)  elPend.textContent  = pendientes;

      if (total === 0) {
        lista.innerHTML = '<p class="portal-empty">Aún no has creado ningún perfil de paciente.<br>Usa el formulario de arriba para añadir el primero.</p>';
        return;
      }

      lista.innerHTML = datos.pacientes.map(p => `
        <div class="paciente-card">
          <div class="paciente-avatar">
            ${p.genero === 'femenino' ? '👧' : p.genero === 'masculino' ? '👦' : '🧒'}
          </div>
          <div class="paciente-info">
            <h4>${esc(p.nombre)}</h4>
            <p>${esc(p.diagnostico_principal)} · ${calcEdad(p.fecha_nacimiento)} · Añadido el ${formatFecha(p.created_at)}</p>
            ${p.tutor_nombre
              ? `<p class="paciente-tutor">👨‍👩‍👦 Tutor: ${esc(p.tutor_nombre)} (${esc(p.tutor_email)})</p>`
              : `<p class="paciente-tutor muted">Sin tutor vinculado aún</p>`}
          </div>
          <div class="paciente-estado">
            ${badgeConsentimiento(p.consentimiento_estado)}
          </div>
        </div>`
      ).join('');

    } catch (_err) {
      lista.innerHTML = '<p class="portal-empty">⚠️ No se pudo conectar con el servidor.</p>';
    }
  }

  /* ----------------------------------------------------------
     FORMULARIO: NUEVO PACIENTE
  ---------------------------------------------------------- */
  function initFormNuevoPaciente() {
    const form = document.getElementById('formNuevoPaciente');
    if (!form) return;

    // Error container
    const errEl = document.createElement('p');
    errEl.style.cssText = 'color:#c62828;background:#ffebee;border-left:4px solid #c62828;padding:.65rem 1rem;border-radius:6px;font-size:.9rem;margin-bottom:1rem;display:none;';
    form.insertBefore(errEl, form.firstChild);

    const okEl = document.createElement('p');
    okEl.style.cssText = 'color:#1b5e20;background:#e8f5e9;border-left:4px solid #2e7d32;padding:.65rem 1rem;border-radius:6px;font-size:.9rem;margin-bottom:1rem;display:none;';
    form.insertBefore(okEl, form.firstChild);

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      errEl.style.display = 'none';
      okEl.style.display = 'none';

      const nombre       = document.getElementById('pacNombre').value.trim();

      // Compilar fecha desde los tres selectores
      const dia   = document.getElementById('pacFechaDia').value;
      const mes   = document.getElementById('pacFechaMes').value;
      const anio  = document.getElementById('pacFechaAnio').value;
      const fechaNac = (dia && mes && anio) ? `${anio}-${mes}-${dia}` : '';
      const genero       = document.getElementById('pacGenero').value;
      const diagnostico  = document.getElementById('pacDiagnostico').value.trim();
      const observaciones = document.getElementById('pacObservaciones').value.trim();
      const emailTutor   = document.getElementById('tutorEmail').value.trim();
      const nombreTutor  = document.getElementById('tutorNombre').value.trim();
      const btn          = form.querySelector('[type="submit"]');

      if (!nombre || !emailTutor) {
        errEl.textContent = '⚠️ El nombre del niño y el email del tutor son obligatorios.';
        errEl.style.display = 'block';
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Creando perfil...';

      try {
        const resp = await fetch(`${API}/api/pacientes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usuarioId: pro.id,
            rol: 'profesional',
            nombre, fechaNacimiento: fechaNac, genero,
            diagnostico, observaciones,
            emailTutor, nombreTutor,
          }),
        });
        const datos = await resp.json();

        if (!datos.ok) {
          errEl.textContent = '⚠️ ' + datos.mensaje;
          errEl.style.display = 'block';
        } else {
          okEl.textContent = '✅ ' + datos.mensaje;
          okEl.style.display = 'block';
          form.reset();
          await cargarPacientes();
        }
      } catch (_err) {
        errEl.textContent = '⚠️ No se pudo conectar con el servidor.';
        errEl.style.display = 'block';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Crear perfil y enviar solicitud';
      }
    });
  }

  /* ----------------------------------------------------------
     LOGOUT
  ---------------------------------------------------------- */
  function initLogout() {
    ['logoutProBtn', 'logoutProBtnSide'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', () => {
        sessionStorage.removeItem('cis_pro');
        window.location.href = 'login-profesional.html';
      });
    });
  }

  /* ----------------------------------------------------------
     INIT
  ---------------------------------------------------------- */
  function init() {
    if (!document.getElementById('profesionalApp')) return;
    renderPerfilPro();
    initFechaSelects();
    initFormNuevoPaciente();
    initLogout();
    cargarPacientes();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
