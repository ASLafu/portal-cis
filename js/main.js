// ---------------------------------------------------------
// CIS - Centro de Intervención Psicoeducativa
// Archivo JavaScript Principal — v2
// ---------------------------------------------------------

/* =========================================================
   UTILIDADES GLOBALES
   ========================================================= */

/** Muestra un mensaje de error inline dentro de un formulario */
function mostrarError(elemento, msg) {
  if (!elemento) return;
  elemento.textContent = msg;
  elemento.style.display = msg ? 'block' : 'none';
}

/** Oculta el mensaje de error */
function ocultarError(elemento) {
  if (!elemento) return;
  elemento.textContent = '';
  elemento.style.display = 'none';
}

/** Valida email */
function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/** Valida teléfono español (móvil o fijo) */
function telefonoValido(tel) {
  const limpio = tel.replace(/\s+/g, '');
  const t = limpio.startsWith('+') ? limpio : '+34' + limpio;
  return /^\+34(?:[6789]\d{8}|\d{9})$/.test(t);
}

/** Normaliza teléfono a +34XXXXXXXXX */
function normalizarTelefono(tel) {
  const limpio = tel.replace(/\s+/g, '');
  return limpio.startsWith('+') ? limpio : '+34' + limpio;
}

/** Muestra banner de aviso cuando no hay servidor disponible */
function mostrarAvisoSinServidor(form) {
  const aviso = document.createElement('div');
  aviso.style.cssText = 'background:#fff3e0;border-left:4px solid #f57c00;border-radius:8px;padding:1rem 1.2rem;margin-bottom:1.2rem;font-size:.9rem;color:#e65100;line-height:1.6;';
  aviso.innerHTML = '<strong>⚠️ Modo sin conexión</strong><br>Estás abriendo la página directamente como archivo. Para usar el portal de familias necesitas iniciar el servidor: <code>npm run dev</code> en la carpeta del proyecto.';
  form.parentNode.insertBefore(aviso, form);
  // Deshabilitar botón de envío
  const btn = form.querySelector('[type="submit"]');
  if (btn) {
    btn.disabled = true;
    btn.title = 'El servidor no está disponible';
  }
}

/* =========================================================
   FUNCIÓN PRINCIPAL
   ========================================================= */

function inicializarApp() {
  console.log('CIS v2 cargado correctamente.');

  // ── LOGOUT ────────────────────────────────────────────────
  function hacerLogout() {
    sessionStorage.removeItem('cis_usuario');
    window.location.href = 'index.html';
  }

  // Soporte para ambos IDs (nav y sidebar)
  ['logoutBtn', 'logoutBtnNav'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', hacerLogout);
  });

  // ── BOTÓN "ZONA FAMILIAS" dinámico ───────────────────────
  const sesionActiva = sessionStorage.getItem('cis_usuario');
  if (sesionActiva) {
    try {
      const usuarioObj = JSON.parse(sesionActiva);
      const botonZonaFamilias = document.querySelector('a.btn-nav[href="login.html"]');
      if (botonZonaFamilias && usuarioObj.nombre) {
        const primerNombre = usuarioObj.nombre.split(' ')[0];
        botonZonaFamilias.textContent = `👤 Hola, ${primerNombre}`;
        botonZonaFamilias.href = 'portal.html';
      }
    } catch (e) {
      console.error('Error leyendo datos del usuario:', e);
    }
  }

  // ── NAVEGACIÓN MÓVIL ──────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', navLinks.classList.contains('open'));
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', () => {
      if (navLinks) navLinks.classList.remove('open');
    });
  });

  // ── FECHA MÍNIMA EN INPUT DATE ────────────────────────────
  const fechaInput = document.getElementById('fecha');
  if (fechaInput) {
    fechaInput.setAttribute('min', new Date().toISOString().split('T')[0]);
  }

  // ── FORMULARIO DE CITA ────────────────────────────────────
  const citaFormWrap = document.getElementById('citaFormWrap');
  const citaForm     = document.getElementById('citaForm');

  if (citaFormWrap) {
    const sesionRaw = sessionStorage.getItem('cis_usuario');
    if (!sesionRaw) {
      citaFormWrap.innerHTML = `
        <div class="cita-auth-wall">
          <div class="cita-auth-icon">🔒</div>
          <h3>Acceso reservado a familias registradas</h3>
          <p>Para solicitar una cita debes tener una cuenta en el portal de familias. Es rápido y gratuito.</p>
          <div class="cita-auth-btns">
            <a href="registro.html" class="btn btn-primary">Crear cuenta gratis</a>
            <a href="login.html" class="btn btn-outline">Ya tengo cuenta</a>
          </div>
          <p class="cita-auth-note">¿Tienes dudas antes de registrarte? Llámanos al <a href="tel:+34912345678">91&nbsp;234&nbsp;56&nbsp;78</a> o escríbenos a <a href="mailto:info@cis-madrid.es">info@cis-madrid.es</a></p>
        </div>`;
    } else {
      const usuario = JSON.parse(sesionRaw);
      const campoNombre   = document.getElementById('nombre');
      const campoTelefono = document.getElementById('telefono');
      const campoEmail    = document.getElementById('email');
      if (campoNombre   && usuario.nombre)   campoNombre.value   = usuario.nombre;
      if (campoTelefono && usuario.telefono) campoTelefono.value = usuario.telefono;
      if (campoEmail    && usuario.email)    campoEmail.value    = usuario.email;
    }
  }

  if (citaForm) {
    citaForm.removeAttribute('onsubmit');

    // Crear contenedor de error inline para cita
    const citaError = document.createElement('p');
    citaError.style.cssText = 'color:#c62828;background:#ffebee;border-left:4px solid #c62828;padding:.65rem 1rem;border-radius:6px;font-size:.9rem;margin-bottom:1rem;display:none;';
    citaForm.insertBefore(citaError, citaForm.firstChild);

    citaForm.addEventListener('submit', function (e) {
      e.preventDefault();
      ocultarError(citaError);

      const nombre     = document.getElementById('nombre').value.trim();
      const telefono   = document.getElementById('telefono').value.trim();
      const email      = document.getElementById('email').value.trim();
      const profesional = document.getElementById('profesional').value;
      const fecha      = document.getElementById('fecha').value;
      const hora       = document.getElementById('hora').value;

      if (!nombre || !telefono || !email || !profesional || !fecha || !hora) {
        mostrarError(citaError, '⚠️ Por favor, rellena todos los campos obligatorios.');
        return;
      }
      if (!telefonoValido(telefono)) {
        mostrarError(citaError, '⚠️ Introduce un número de teléfono español válido (ej: 612345678 o 912345678).');
        return;
      }
      if (!emailValido(email)) {
        mostrarError(citaError, '⚠️ Introduce un correo electrónico válido (ej: usuario@dominio.com).');
        return;
      }

      document.getElementById('telefono').value = normalizarTelefono(telefono);
      const params = new URLSearchParams(new FormData(citaForm)).toString();
      window.location.href = 'confirmar-cita.html?' + params;
    });
  }

  // ── LOGIN FAMILIAS ────────────────────────────────────────
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    const loginError = document.createElement('p');
    loginError.id = 'loginError';
    loginError.style.cssText = 'color:#c62828;background:#ffebee;border-left:4px solid #c62828;padding:.65rem 1rem;border-radius:6px;font-size:.9rem;margin-bottom:1rem;display:none;';
    loginForm.insertBefore(loginError, loginForm.firstChild);

    // Aviso si no hay servidor
    if (window.CIS_SIN_SERVIDOR) {
      mostrarAvisoSinServidor(loginForm);
      return;
    }

    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      ocultarError(loginError);

      const email     = document.getElementById('email').value.trim();
      const password  = document.getElementById('password').value;
      const submitBtn = loginForm.querySelector('[type="submit"]');

      if (!email || !password) {
        mostrarError(loginError, '⚠️ Por favor, rellena todos los campos.');
        return;
      }
      if (!emailValido(email)) {
        mostrarError(loginError, '⚠️ El correo electrónico no tiene un formato válido.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Entrando...';

      try {
        const resp  = await fetch(window.API_BASE + '/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const datos = await resp.json();

        if (!datos.ok) {
          mostrarError(loginError, '⚠️ ' + datos.mensaje);
          submitBtn.disabled = false;
          submitBtn.textContent = 'Entrar al portal';
          return;
        }

        sessionStorage.setItem('cis_usuario', JSON.stringify({
          id:       datos.usuario.id,
          nombre:   datos.usuario.apellido
            ? datos.usuario.nombre + ' ' + datos.usuario.apellido
            : datos.usuario.nombre,
          rol:      datos.usuario.rol === 'admin' ? 'Administrador' : 'Tutor Legal',
          telefono: datos.usuario.telefono,
          email:    datos.usuario.email,
          esNuevo:  false,
        }));
        window.location.href = 'portal.html';

      } catch (_err) {
        mostrarError(loginError, '⚠️ No se pudo conectar con el servidor. Asegúrate de que la API está activa (npm run dev).');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Entrar al portal';
      }
    });
  }

  // ── REGISTRO FAMILIAS ─────────────────────────────────────
  const registroForm = document.getElementById('registroForm');
  if (registroForm) {
    const registroError = document.createElement('p');
    registroError.id = 'registroError';
    registroError.style.cssText = 'color:#c62828;background:#ffebee;border-left:4px solid #c62828;padding:.65rem 1rem;border-radius:6px;font-size:.9rem;margin-bottom:1rem;display:none;';
    registroForm.insertBefore(registroError, registroForm.firstChild);

    if (window.CIS_SIN_SERVIDOR) {
      mostrarAvisoSinServidor(registroForm);
      return;
    }

    registroForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      ocultarError(registroError);

      const nombre    = document.getElementById('nombre').value.trim();
      const apellido  = document.getElementById('apellido').value.trim();
      const tlf       = document.getElementById('tlf').value.trim();
      const email     = document.getElementById('email').value.trim();
      const password  = document.getElementById('password').value;
      const password2El = document.getElementById('password2');
      const password2 = password2El ? password2El.value : password;
      const submitBtn = registroForm.querySelector('[type="submit"]');

      // Validaciones
      if (!nombre || !apellido || !tlf || !email || !password) {
        mostrarError(registroError, '⚠️ Por favor, rellena todos los campos obligatorios.');
        return;
      }
      if (nombre.trim().length < 2) {
        mostrarError(registroError, '⚠️ El nombre debe tener al menos 2 caracteres.');
        return;
      }
      if (apellido.trim().length < 2) {
        mostrarError(registroError, '⚠️ Los apellidos deben tener al menos 2 caracteres.');
        return;
      }
      if (!emailValido(email)) {
        mostrarError(registroError, '⚠️ El correo electrónico no tiene un formato válido.');
        return;
      }
      if (!telefonoValido(tlf)) {
        mostrarError(registroError, '⚠️ Introduce un teléfono español válido (ej: 612345678 o 912345678).');
        return;
      }
      if (password.length < 8) {
        mostrarError(registroError, '⚠️ La contraseña debe tener al menos 8 caracteres.');
        return;
      }
      if (password2El && password !== password2) {
        mostrarError(registroError, '⚠️ Las contraseñas no coinciden. Compruébalas e inténtalo de nuevo.');
        if (password2El) password2El.focus();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Creando cuenta...';

      try {
        const resp  = await fetch(window.API_BASE + '/api/registro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre,
            apellido,
            email,
            telefono: normalizarTelefono(tlf),
            password,
          }),
        });
        const datos = await resp.json();

        if (!datos.ok) {
          mostrarError(registroError, '⚠️ ' + datos.mensaje);
          submitBtn.disabled = false;
          submitBtn.textContent = 'Crear perfil familiar';
          return;
        }

        sessionStorage.setItem('cis_usuario', JSON.stringify({
          id:       datos.usuario.id,
          nombre:   datos.usuario.nombre + ' ' + datos.usuario.apellido,
          rol:      'Tutor Legal',
          telefono: datos.usuario.telefono,
          email:    datos.usuario.email,
          esNuevo:  true,
        }));
        window.location.href = 'portal.html';

      } catch (_err) {
        mostrarError(registroError, '⚠️ No se pudo conectar con el servidor. Asegúrate de que la API está activa (npm run dev).');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Crear perfil familiar';
      }
    });
  }

  // ── CARRUSEL MOTIVACIONAL ─────────────────────────────────
  const track = document.getElementById('carouselTrack');
  if (track) {
    let currentSlide = 0;
    const slides   = track.querySelectorAll('.carousel-slide');
    const dotsWrap = document.getElementById('carouselDots');

    if (slides.length > 0 && dotsWrap) {
      slides.forEach((_, i) => {
        const btn = document.createElement('button');
        btn.className = 'dot-indicator' + (i === 0 ? ' active' : '');
        btn.setAttribute('aria-label', `Diapositiva ${i + 1}`);
        btn.addEventListener('click', () => goToSlide(i));
        dotsWrap.appendChild(btn);
      });

      function goToSlide(n) {
        currentSlide = (n + slides.length) % slides.length;
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        dotsWrap.querySelectorAll('.dot-indicator').forEach((d, i) => {
          d.classList.toggle('active', i === currentSlide);
        });
      }

      const btnPrev = document.querySelector('.carousel-btn:first-of-type');
      const btnNext = document.querySelector('.carousel-btn:last-of-type');

      if (btnPrev) btnPrev.addEventListener('click', () => goToSlide(currentSlide - 1));
      if (btnNext) btnNext.addEventListener('click', () => goToSlide(currentSlide + 1));

      document.querySelectorAll('.carousel-btn').forEach(btn => btn.removeAttribute('onclick'));
      setInterval(() => goToSlide(currentSlide + 1), 5000);
    }
  }

  // ── CONFIRMAR CITA ────────────────────────────────────────
  const dataTable = document.getElementById('dataTable');
  if (dataTable) {
    const params = new URLSearchParams(window.location.search);
    if (params.toString().length > 0) {
      const etiquetas = {
        nombre: 'Nombre', telefono: 'Teléfono', email: 'Correo',
        profesional: 'Profesional', fecha: 'Fecha', hora: 'Hora',
        curso: 'Curso / Motivo',
      };
      let html = '';
      params.forEach((value, key) => {
        const label = etiquetas[key] || (key.charAt(0).toUpperCase() + key.slice(1));
        html += `<tr><td>${label}</td><td>${value || '–'}</td></tr>`;
      });
      dataTable.innerHTML = html;
    }

    window.confirmarCita = async function () {
      const confirmBtn = document.querySelector('.btn-primary[onclick="confirmarCita()"]');
      if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Enviando...';
      }

      if (window.CIS_SIN_SERVIDOR) {
        alert('⚠️ El servidor no está disponible. Abre la app con el comando npm run dev para enviar la cita.');
        if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.textContent = '✅ Confirmar solicitud'; }
        return;
      }

      const params  = new URLSearchParams(window.location.search);
      const bodyData = {};
      params.forEach((value, key) => { bodyData[key] = value; });

      try {
        const res = await fetch(window.API_BASE + '/api/citas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyData),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.mensaje || errData.error || 'Error al solicitar la cita');
        }

        const confirmWrap = document.getElementById('confirmWrap');
        const successMsg  = document.getElementById('successMsg');
        if (confirmWrap) confirmWrap.classList.add('is-hidden');
        if (successMsg)  successMsg.classList.remove('is-hidden');

      } catch (err) {
        console.error(err);
        alert('⚠️ ' + err.message);
        if (confirmBtn) {
          confirmBtn.disabled = false;
          confirmBtn.textContent = '✅ Confirmar solicitud';
        }
      }
    };
  }

  // ── LOGIN PROFESIONAL ──────────────────────────────────────
  const loginProfesionalForm = document.getElementById('loginProfesionalForm');
  if (loginProfesionalForm) {
    const errEl = document.createElement('p');
    errEl.style.cssText = 'color:#c62828;background:#ffebee;border-left:4px solid #c62828;padding:.65rem 1rem;border-radius:6px;font-size:.9rem;margin-bottom:1rem;display:none;';
    loginProfesionalForm.insertBefore(errEl, loginProfesionalForm.firstChild);

    if (window.CIS_SIN_SERVIDOR) {
      mostrarAvisoSinServidor(loginProfesionalForm);
      return;
    }

    loginProfesionalForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      ocultarError(errEl);

      const email    = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const btn      = loginProfesionalForm.querySelector('[type="submit"]');

      if (!email || !password) {
        mostrarError(errEl, '⚠️ Rellena todos los campos.');
        return;
      }
      if (!emailValido(email)) {
        mostrarError(errEl, '⚠️ El correo electrónico no es válido.');
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Verificando...';

      try {
        const resp  = await fetch(window.API_BASE + '/api/login-profesional', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const datos = await resp.json();

        if (!datos.ok) {
          mostrarError(errEl, '⚠️ ' + datos.mensaje);
          btn.disabled = false;
          btn.textContent = 'Entrar al área profesional';
          return;
        }

        sessionStorage.setItem('cis_pro', JSON.stringify({
          id:       datos.usuario.id,
          nombre:   datos.usuario.nombre,
          email:    datos.usuario.email,
          telefono: datos.usuario.telefono,
          rol:      datos.usuario.rol,
        }));
        window.location.href = 'profesional-portal.html';

      } catch (_) {
        mostrarError(errEl, '⚠️ No se pudo conectar con el servidor. Asegúrate de que la API está activa.');
        btn.disabled = false;
        btn.textContent = 'Entrar al área profesional';
      }
    });
  }

  // ── REGISTRO PROFESIONAL ───────────────────────────────────
  const registroProfesionalForm = document.getElementById('registroProfesionalForm');
  if (registroProfesionalForm) {
    const errEl = document.createElement('p');
    errEl.style.cssText = 'color:#c62828;background:#ffebee;border-left:4px solid #c62828;padding:.65rem 1rem;border-radius:6px;font-size:.9rem;margin-bottom:1rem;display:none;';
    registroProfesionalForm.insertBefore(errEl, registroProfesionalForm.firstChild);

    if (window.CIS_SIN_SERVIDOR) {
      mostrarAvisoSinServidor(registroProfesionalForm);
      return;
    }

    registroProfesionalForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      ocultarError(errEl);

      const nombre       = document.getElementById('nombre').value.trim();
      const tlf          = document.getElementById('tlf').value.trim();
      const email        = document.getElementById('email').value.trim();
      const password     = document.getElementById('password').value;
      const codigoAcceso = document.getElementById('codigoAcceso').value.trim();
      const btn          = registroProfesionalForm.querySelector('[type="submit"]');

      if (!nombre || !tlf || !email || !password || !codigoAcceso) {
        mostrarError(errEl, '⚠️ Todos los campos son obligatorios.');
        return;
      }
      if (!emailValido(email)) {
        mostrarError(errEl, '⚠️ El correo electrónico no es válido.');
        return;
      }
      if (!telefonoValido(tlf)) {
        mostrarError(errEl, '⚠️ Introduce un teléfono español válido (ej: 612345678).');
        return;
      }
      if (password.length < 8) {
        mostrarError(errEl, '⚠️ La contraseña debe tener al menos 8 caracteres.');
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Creando cuenta...';

      try {
        const resp  = await fetch(window.API_BASE + '/api/registro-profesional', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre,
            email,
            telefono: normalizarTelefono(tlf),
            password,
            codigoAcceso,
          }),
        });
        const datos = await resp.json();

        if (!datos.ok) {
          mostrarError(errEl, '⚠️ ' + datos.mensaje);
          btn.disabled = false;
          btn.textContent = 'Crear cuenta profesional';
          return;
        }

        sessionStorage.setItem('cis_pro', JSON.stringify({
          id:       datos.usuario.id,
          nombre:   datos.usuario.nombre,
          email:    datos.usuario.email,
          telefono: datos.usuario.telefono,
          rol:      datos.usuario.rol,
        }));
        window.location.href = 'profesional-portal.html';

      } catch (_) {
        mostrarError(errEl, '⚠️ No se pudo conectar con el servidor. Asegúrate de que la API está activa.');
        btn.disabled = false;
        btn.textContent = 'Crear cuenta profesional';
      }
    });
  }

  // ── LOGIN ADMINISTRADOR ────────────────────────────────────
  const loginAdminForm = document.getElementById('loginAdminForm');
  if (loginAdminForm) {
    const errEl = document.createElement('p');
    errEl.style.cssText = 'color:#c62828;background:#ffebee;border-left:4px solid #c62828;padding:.65rem 1rem;border-radius:6px;font-size:.9rem;margin-bottom:1rem;display:none;';
    loginAdminForm.insertBefore(errEl, loginAdminForm.firstChild);

    if (window.CIS_SIN_SERVIDOR) {
      mostrarAvisoSinServidor(loginAdminForm);
      return;
    }

    loginAdminForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      ocultarError(errEl);

      const email    = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const btn      = loginAdminForm.querySelector('[type="submit"]');

      if (!email || !password) {
        mostrarError(errEl, '⚠️ Rellena todos los campos.');
        return;
      }
      if (!emailValido(email)) {
        mostrarError(errEl, '⚠️ El correo electrónico no es válido.');
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Verificando...';

      try {
        const resp  = await fetch(window.API_BASE + '/api/login-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const datos = await resp.json();

        if (!datos.ok) {
          mostrarError(errEl, '⚠️ ' + datos.mensaje);
          btn.disabled = false;
          btn.textContent = 'Entrar al panel';
          return;
        }

        sessionStorage.setItem('cis_admin', JSON.stringify({
          id:     datos.usuario.id,
          nombre: datos.usuario.nombre,
          email:  datos.usuario.email,
          rol:    datos.usuario.rol,
        }));
        window.location.href = 'admin-portal.html';

      } catch (_) {
        mostrarError(errEl, '⚠️ No se pudo conectar con el servidor. Asegúrate de que la API está activa.');
        btn.disabled = false;
        btn.textContent = 'Entrar al panel';
      }
    });
  }
}

// Ejecución garantizada
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarApp);
} else {
  inicializarApp();
}

// ---------------------------------------------------------
// BANNER DE COOKIES
// ---------------------------------------------------------
(function () {
  if (window.location.pathname.endsWith('cookies.html')) return;

  function consentExpired() {
    const raw = localStorage.getItem('cookie_consent');
    if (!raw) return true;
    try {
      const data  = JSON.parse(raw);
      const doceM = 12 * 30 * 24 * 60 * 60 * 1000;
      return (Date.now() - data.ts) > doceM;
    } catch (_) { return true; }
  }

  if (!consentExpired()) return;

  const banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Aviso de cookies');

  const estaEnHtml = window.location.pathname.includes('/html/') ||
                     window.location.protocol === 'file:';
  const urlCookies = estaEnHtml ? 'cookies.html' : 'html/cookies.html';

  banner.innerHTML = `
    <p>🍪 Utilizamos cookies propias y de terceros para mejorar tu experiencia y analizar el tráfico web de forma anónima. <a href="${urlCookies}">Más información</a>.</p>
    <div class="cookie-banner-btns">
      <button class="cookie-btn-accept" id="cookieBtnAccept">Aceptar todas</button>
      <button class="cookie-btn-reject" id="cookieBtnReject">Solo necesarias</button>
    </div>
  `;

  document.body.appendChild(banner);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => banner.classList.add('visible'));
  });

  function saveConsent(value) {
    localStorage.setItem('cookie_consent', JSON.stringify({ value, ts: Date.now() }));
    banner.classList.remove('visible');
    banner.addEventListener('transitionend', () => banner.remove(), { once: true });
  }

  document.getElementById('cookieBtnAccept').addEventListener('click', () => saveConsent('all'));
  document.getElementById('cookieBtnReject').addEventListener('click', () => saveConsent('necessary'));
})();
