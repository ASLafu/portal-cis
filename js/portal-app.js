// ==========================================================
//  CIS – Portal de Familias
//  Lógica de renderizado dinámico
// ==========================================================

(function () {
  'use strict';

  /* ----------------------------------------------------------
     UTILIDADES
  ---------------------------------------------------------- */

  /** Formatea una fecha ISO "YYYY-MM-DD" como objeto con día y mes corto */
  function parseFecha(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const diasSem = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
    return {
      dia:    String(d).padStart(2, '0'),
      mes:    meses[m - 1],
      diaSem: diasSem[date.getDay()],
      texto:  `${d} de ${['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][m-1]} de ${y}`,
      obj:    date,
    };
  }

  /** Comprueba si una fecha ISO es hoy o en el futuro */
  function esFutura(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    const fecha = new Date(y, m - 1, d);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fecha >= hoy;
  }

  /** Escapar HTML básico para evitar XSS */
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ----------------------------------------------------------
     PERFIL DE USUARIO
  ---------------------------------------------------------- */
  function renderPerfil(u) {
    const avatar = document.getElementById('portalAvatar');
    const nombre = document.getElementById('portalNombre');
    const rol    = document.getElementById('portalRol');
    const tel    = document.getElementById('portalTel');
    const email  = document.getElementById('portalEmail');
    const pac    = document.getElementById('portalPaciente');
    const ref    = document.getElementById('portalRef');

    const initials = u.nombre.split(' ').slice(0, 2).map(n => n[0]).join('+');
    if (avatar) avatar.src = `https://ui-avatars.com/api/?name=${initials}&background=4A90A4&color=fff&size=150`;
    if (nombre) nombre.textContent = u.nombre;
    if (rol)    rol.textContent    = u.rol;
    if (tel)    tel.textContent    = `📞 ${u.telefono}`;
    if (email)  email.textContent  = `✉️ ${u.email}`;
    if (pac)    pac.textContent    = `👤 ${u.paciente.nombre} (${u.paciente.edad} años)`;
    if (ref)    ref.textContent    = `📋 Ref: ${u.paciente.ref}`;
  }

  /* ----------------------------------------------------------
     CITAS
  ---------------------------------------------------------- */
  function renderCitas(citas) {
    const container    = document.getElementById('appointmentList');
    const tabProximas  = document.getElementById('tabProximas');
    const tabPasadas   = document.getElementById('tabPasadas');
    const counterBadge = document.getElementById('citasProximasBadge');
    if (!container) return;

    // Ordenar: próximas ascendente, pasadas descendente
    const proximas = citas
      .filter(c => c.estado === 'proxima' || c.estado === 'pendiente')
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    const pasadas = citas
      .filter(c => c.estado === 'realizada' || c.estado === 'cancelada')
      .sort((a, b) => b.fecha.localeCompare(a.fecha));

    // Badge contador de citas próximas
    if (counterBadge) {
      counterBadge.textContent = proximas.length;
      counterBadge.style.display = proximas.length > 0 ? '' : 'none';
    }

    let vistaActual = 'proximas';

    function buildCard(c) {
      const f = parseFecha(c.fecha);
      const esProxima = c.estado === 'proxima';
      const esCancelada = c.estado === 'cancelada';

      let estadoLabel  = '';
      let estadoClass  = '';
      if (c.estado === 'proxima')   { estadoLabel = 'ESTA SEMANA'; estadoClass = ''; }
      if (c.estado === 'pendiente') { estadoLabel = 'PROGRAMADA';  estadoClass = 'pending'; }
      if (c.estado === 'realizada') { estadoLabel = 'REALIZADA';   estadoClass = 'apt-status--done'; }
      if (c.estado === 'cancelada') { estadoLabel = 'CANCELADA';   estadoClass = 'apt-status--cancelled'; }

      const dateClass = (c.estado === 'realizada' || c.estado === 'cancelada') ? 'apt-date apt-date--past' : 'apt-date';
      const titleClass = (c.estado === 'realizada' || c.estado === 'cancelada') ? 'apt-title--past' : '';

      return `
        <div class="apt-card${esProxima ? ' next' : ''}">
          <div class="${dateClass}">
            <span class="day">${f.dia}</span>
            <span class="month">${f.mes}</span>
          </div>
          <div class="apt-details">
            <h4 class="${titleClass}">${esc(c.especialidad)} – ${esc(c.profesional)}</h4>
            <p>🕒 ${f.diaSem.charAt(0).toUpperCase() + f.diaSem.slice(1)}, ${esc(c.hora)}h (${esc(c.duracion)}) | ${esc(c.consulta)}</p>
          </div>
          <div class="apt-status ${estadoClass}">${estadoLabel}</div>
        </div>`;
    }

    function renderVista(lista, vacia) {
      if (lista.length === 0) {
        container.innerHTML = `<p class="portal-empty">${vacia}</p>`;
        return;
      }
      container.innerHTML = lista.map(buildCard).join('');
    }

    function setTab(tab) {
      vistaActual = tab;
      if (tabProximas) tabProximas.classList.toggle('active', tab === 'proximas');
      if (tabPasadas)  tabPasadas.classList.toggle('active',  tab === 'pasadas');
      if (tab === 'proximas') {
        renderVista(proximas, 'No tienes citas programadas próximamente. <a href="index.html#servicios" class="link-primary">Solicita una →</a>');
      } else {
        renderVista(pasadas, 'No hay citas pasadas registradas.');
      }
    }

    if (tabProximas) tabProximas.addEventListener('click', () => setTab('proximas'));
    if (tabPasadas)  tabPasadas.addEventListener('click',  () => setTab('pasadas'));

    // Vista inicial
    setTab('proximas');
  }

  /* ----------------------------------------------------------
     DIARIO DE SESIONES
  ---------------------------------------------------------- */
  function renderSesiones(sesiones) {
    const container = document.getElementById('sessionList');
    if (!container) return;

    if (sesiones.length === 0) {
      container.innerHTML = '<p class="portal-empty">No hay sesiones registradas todavía.</p>';
      return;
    }

    // Ordenar descendente por fecha
    const ordenadas = [...sesiones].sort((a, b) => b.fecha.localeCompare(a.fecha));

    container.innerHTML = ordenadas.map(s => {
      const f = parseFecha(s.fecha);
      return `
        <div class="session-card">
          <div class="session-date">${f.texto}</div>
          <div class="session-content">
            <strong class="session-title">${esc(s.titulo)}</strong>
            <p>${esc(s.contenido)}</p>
            <div class="prof">Evaluado por: ${esc(s.evaluador)}</div>
          </div>
        </div>`;
    }).join('');
  }

  /* ----------------------------------------------------------
     FACTURACIÓN
  ---------------------------------------------------------- */
  function renderFacturacion(items) {
    const container = document.getElementById('billingList');
    const totalEl   = document.getElementById('billingTotal');
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = '<p class="portal-empty">No hay movimientos registrados.</p>';
      return;
    }

    const ordenados = [...items].sort((a, b) => b.fecha.localeCompare(a.fecha));
    const total    = ordenados.reduce((sum, i) => sum + i.importe, 0);

    container.innerHTML = ordenados.map(i => {
      const f = parseFecha(i.fecha);
      const badgeHTML = i.estado === 'pagado'
        ? '<span class="badge-paid">PAGADO</span>'
        : '<span class="badge-pending">PENDIENTE</span>';
      return `
        <div class="billing-item">
          <div class="b-info">
            <h5>${esc(i.descripcion)}</h5>
            <p>Ref: ${esc(i.ref)} &bull; ${f.texto} &bull; ${esc(i.metodo)}</p>
          </div>
          <div class="b-amount ${i.estado === 'pagado' ? 'paid' : 'unpaid'}">
            ${i.importe} € ${badgeHTML}
          </div>
        </div>`;
    }).join('');

    if (totalEl) totalEl.textContent = `Total abonado: ${total} €`;
  }

  /* ----------------------------------------------------------
     CANCELAR CITA (simulado)
  ---------------------------------------------------------- */
  function initCancelarCita() {
    // Usando delegación de eventos por si hay botones dinámicos futuros
    document.addEventListener('click', function (e) {
      if (e.target.closest('.btn-cancelar-cita')) {
        const id = e.target.closest('.btn-cancelar-cita').dataset.id;
        if (confirm('¿Confirmas que deseas cancelar esta cita?')) {
          const cita = CIS_DATA.citas.find(c => String(c.id) === String(id));
          if (cita) {
            cita.estado = 'cancelada';
            renderCitas(CIS_DATA.citas);
            alert('✅ Cita cancelada correctamente. Recibirás confirmación por email.');
          }
        }
      }
    });
  }

  /* ----------------------------------------------------------
     EXPORTAR EXTRACTO (simulado)
  ---------------------------------------------------------- */
  function initExportarExtracto(email) {
    const btn = document.getElementById('btnExtracto');
    if (!btn) return;
    btn.addEventListener('click', () => {
      alert('📄 El extracto de facturación se enviará a ' + email + ' en los próximos minutos.');
    });
  }

  /* ----------------------------------------------------------
     RESUMEN RÁPIDO (panel superior)
  ---------------------------------------------------------- */
  function renderResumen(citas, sesiones, facturacion) {
    const elProximas = document.getElementById('resumenProximas');
    const elSesiones = document.getElementById('resumenSesiones');
    const elTotal    = document.getElementById('resumenTotal');

    const proximas     = citas.filter(c => c.estado === 'proxima' || c.estado === 'pendiente').length;
    const sesionesCont = sesiones.length;
    const totalAbonado = (facturacion || []).reduce((s, i) => s + i.importe, 0);

    if (elProximas) elProximas.textContent = proximas;
    if (elSesiones) elSesiones.textContent = sesionesCont;
    if (elTotal)    elTotal.textContent    = totalAbonado > 0 ? `${totalAbonado} €` : '0 €';
  }

  /* ----------------------------------------------------------
     INIT
  ---------------------------------------------------------- */
  function cargarDatos() {
    const raw = sessionStorage.getItem('cis_usuario');

    if (raw) {
      // ── Usuario que acaba de registrarse ──
      const u = JSON.parse(raw);
      return {
        usuario: {
          nombre:   u.nombre,
          rol:      u.rol || 'Tutor Legal',
          telefono: u.telefono,
          email:    u.email,
          paciente: {
            nombre: '–',
            edad:   '–',
            ref:    'Aún sin registrar',
          },
        },
        citas:       [],
        sesiones:    [],
        facturacion: [],
      };
    }

    // ── Sin sesión activa → datos demo ──
    return CIS_DATA;
  }

  function init() {
    if (!document.getElementById('portalApp')) return;

    const datos = cargarDatos();
    renderPerfil(datos.usuario);
    renderResumen(datos.citas, datos.sesiones, datos.facturacion);
    renderCitas(datos.citas);
    renderSesiones(datos.sesiones);
    renderFacturacion(datos.facturacion);
    initCancelarCita();
    initExportarExtracto(datos.usuario.email);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
