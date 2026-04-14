// ---------------------------------------------------------
// CIS - Centro de Intervención Psicoeducativa
// Archivo JavaScript Principal
// ---------------------------------------------------------

function inicializarApp() {
  console.log("CIS JavaScript cargado correctamente.");

  // LOGOUT (portal familias)
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('cis_usuario');
      window.location.href = 'index.html';
    });
  }

  // Modificar botón "Zona Familias" si el usuario está registrado/logeado
  const sesionActiva = sessionStorage.getItem('cis_usuario');
  if (sesionActiva) {
    try {
      const usuarioObj = JSON.parse(sesionActiva);
      // Busca el botón que apunte a login.html (normalmente "Zona Familias")
      const botonZonaFamilias = document.querySelector('a.btn-nav[href="login.html"]');
      if (botonZonaFamilias && usuarioObj.nombre) {
        // En lugar de "Zona Familias", mostrar nombre y redirigir al portal
        const primerNombre = usuarioObj.nombre.split(' ')[0];
        botonZonaFamilias.textContent = `👤 Hola, ${primerNombre}`;
        botonZonaFamilias.href = 'portal.html';
      }
    } catch (e) {
      console.error("Error leyendo datos del usuario:", e);
    }
  }

  // 1. NAVEGACIÓN MÓVIL
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  // Cerrar menú al hacer clic en un enlace interno
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', () => {
      if (navLinks) navLinks.classList.remove('open');
    });
  });

  // 2. CONFIGURACIÓN DEL INPUT DE FECHA
  const fechaInput = document.getElementById('fecha');
  if (fechaInput) {
    fechaInput.setAttribute('min', new Date().toISOString().split('T')[0]);
  }

  // 3. FORMULARIO DE CITA
  const citaFormWrap = document.getElementById('citaFormWrap');
  const citaForm     = document.getElementById('citaForm');

  if (citaFormWrap) {
    const sesionRaw = sessionStorage.getItem('cis_usuario');

    if (!sesionRaw) {
      // ── Sin sesión: mostrar aviso de registro ──
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
      // ── Con sesión: rellenar datos automáticamente ──
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

    citaForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const nombre     = document.getElementById('nombre').value.trim();
      const telefono   = document.getElementById('telefono').value.trim();
      const email      = document.getElementById('email').value.trim();
      const profesional = document.getElementById('profesional').value;
      const fecha      = document.getElementById('fecha').value;
      const hora       = document.getElementById('hora').value;

      // Validación 1: Campos vacíos
      if (!nombre || !telefono || !email || !profesional || !fecha || !hora) {
        alert("⚠️ Por favor, rellena todos los campos obligatorios.");
        return;
      }

      // Validación 2: Teléfono español (se aceptan fijos y móviles)
      let telefonoLimpio = telefono.replace(/\s+/g, '');
      if (!telefonoLimpio.startsWith('+')) telefonoLimpio = '+34' + telefonoLimpio;
      const telRegex = /^\+34(?:[6789]\d{8}|\d{9})$/;
      if (!telRegex.test(telefonoLimpio)) {
        alert("⚠️ Por favor, introduce un número de teléfono español válido (ej: 612345678 o 912345678).");
        return;
      }
      document.getElementById('telefono').value = telefonoLimpio;

      // Validación 3: Email
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        alert("⚠️ Por favor, introduce un correo electrónico válido (ej: usuario@dominio.com).");
        return;
      }

      alert("✅ ¡Todo correcto! Redirigiendo a confirmación...");
      const params = new URLSearchParams(new FormData(citaForm)).toString();
      window.location.href = 'confirmar-cita.html?' + params;
    });
  }

  // 3.1 LOGIN → fetch a la API
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {

    // Contenedor de error inline
    const loginError = document.createElement('p');
    loginError.id = 'loginError';
    loginError.style.cssText = 'color:#c62828;background:#ffebee;border-left:4px solid #c62828;padding:.65rem 1rem;border-radius:6px;font-size:.9rem;margin-bottom:1rem;display:none;';
    loginForm.insertBefore(loginError, loginForm.firstChild);

    function mostrarErrorLogin(msg) {
      loginError.textContent = msg;
      loginError.style.display = 'block';
    }

    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      loginError.style.display = 'none';

      const email    = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const submitBtn = loginForm.querySelector('[type="submit"]');

      if (!email || !password) {
        mostrarErrorLogin('⚠️ Por favor, rellena todos los campos.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Entrando...';

      try {
        const resp = await fetch(API_BASE + '/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const datos = await resp.json();

        if (!datos.ok) {
          mostrarErrorLogin('⚠️ ' + datos.mensaje);
          submitBtn.disabled = false;
          submitBtn.textContent = 'Entrar al portal';
          return;
        }

        // Guardar sesión y redirigir
        sessionStorage.setItem('cis_usuario', JSON.stringify({
          id:       datos.usuario.id,
          nombre:   datos.usuario.apellido ? (datos.usuario.nombre + ' ' + datos.usuario.apellido) : datos.usuario.nombre,
          rol:      datos.usuario.rol === 'admin' ? 'Administrador' : 'Tutor Legal',
          telefono: datos.usuario.telefono,
          email:    datos.usuario.email,
          esNuevo:  false,
        }));
        window.location.href = 'portal.html';

      } catch (_err) {
        mostrarErrorLogin('⚠️ No se pudo conectar con el servidor. Comprueba que la API está activa.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Entrar al portal';
      }
    });
  }

  // 3.2 REGISTRO → fetch a la API
  const registroForm = document.getElementById('registroForm');
  if (registroForm) {

    // Contenedor de error inline
    const registroError = document.createElement('p');
    registroError.id = 'registroError';
    registroError.style.cssText = 'color:#c62828;background:#ffebee;border-left:4px solid #c62828;padding:.65rem 1rem;border-radius:6px;font-size:.9rem;margin-bottom:1rem;display:none;';
    registroForm.insertBefore(registroError, registroForm.firstChild);

    function mostrarErrorRegistro(msg) {
      registroError.textContent = msg;
      registroError.style.display = 'block';
    }

    registroForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      registroError.style.display = 'none';

      const nombre   = document.getElementById('nombre').value.trim();
      const apellido = document.getElementById('apellido').value.trim();
      const tlf      = document.getElementById('tlf').value.trim();
      const email    = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const submitBtn = registroForm.querySelector('[type="submit"]');

      // Validación cliente (rápida, antes de llamar a la API)
      if (!nombre || !apellido || !tlf || !email || !password) {
        mostrarErrorRegistro('⚠️ Por favor, rellena todos los campos.');
        return;
      }
      if (password.length < 8) {
        mostrarErrorRegistro('⚠️ La contraseña debe tener al menos 8 caracteres.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Creando cuenta...';

      try {
        const resp = await fetch(API_BASE + '/api/registro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, apellido, email, telefono: tlf, password }),
        });
        const datos = await resp.json();

        if (!datos.ok) {
          mostrarErrorRegistro('⚠️ ' + datos.mensaje);
          submitBtn.disabled = false;
          submitBtn.textContent = 'Crear perfil familiar';
          return;
        }

        // Guardar sesión con datos reales del servidor
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
        mostrarErrorRegistro('⚠️ No se pudo conectar con el servidor. Comprueba que la API está activa.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Crear perfil familiar';
      }
    });
  }

  // 4. CARRUSEL MOTIVACIONAL
  const track = document.getElementById('carouselTrack');
  if (track) {
    let currentSlide = 0;
    const slides = track.querySelectorAll('.carousel-slide');
    const dotsWrap = document.getElementById('carouselDots');
    
    if (slides.length > 0) {
      slides.forEach((_, i) => {
        const btn = document.createElement('button');
        btn.className = 'dot-indicator' + (i === 0 ? ' active' : '');
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

      function moveCarousel(dir) {
        goToSlide(currentSlide + dir);
      }

      const btnPrev = document.querySelector('.carousel-btn:first-of-type');
      const btnNext = document.querySelector('.carousel-btn:last-of-type');
      
      if (btnPrev) btnPrev.addEventListener('click', () => moveCarousel(-1));
      if (btnNext) btnNext.addEventListener('click', () => moveCarousel(1));

      document.querySelectorAll('.carousel-btn').forEach(btn => btn.removeAttribute('onclick'));
      setInterval(() => moveCarousel(1), 5000);
    }
  }

  // 5. PÁGINA DE CONFIRMAR CITA
  const dataTable = document.getElementById('dataTable');
  if (dataTable) {
    const params = new URLSearchParams(window.location.search);
    if (params.toString().length > 0) {
      let html = '';
      params.forEach((value, key) => {
        let label = key.charAt(0).toUpperCase() + key.slice(1);
        html += `<tr><td>${label}</td><td>${value || '-'}</td></tr>`;
      });
      dataTable.innerHTML = html;
    }

    window.confirmarCita = async function() {
      const confirmBtn = document.querySelector('.btn-primary[onclick="confirmarCita()"]');
      if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Enviando...';
      }

      const bodyData = {};
      params.forEach((value, key) => { bodyData[key] = value; });

      try {
        const res = await fetch(API_BASE + '/api/citas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyData)
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.mensaje || errData.error || 'Error al solicitar la cita');
        }

        const confirmWrap = document.getElementById('confirmWrap');
        const successMsg = document.getElementById('successMsg');
        if (confirmWrap) confirmWrap.classList.add('is-hidden');
        if (successMsg) successMsg.classList.remove('is-hidden');
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

    loginProfesionalForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      errEl.style.display = 'none';
      const email    = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const btn      = loginProfesionalForm.querySelector('[type="submit"]');

      if (!email || !password) { errEl.textContent = '⚠️ Rellena todos los campos.'; errEl.style.display = 'block'; return; }
      btn.disabled = true; btn.textContent = 'Verificando...';

      try {
        const resp  = await fetch(API_BASE + '/api/login-profesional', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const datos = await resp.json();
        if (!datos.ok) {
          errEl.textContent = '⚠️ ' + datos.mensaje; errEl.style.display = 'block';
          btn.disabled = false; btn.textContent = 'Entrar al área profesional';
          return;
        }
        sessionStorage.setItem('cis_pro', JSON.stringify({
          id: datos.usuario.id, nombre: datos.usuario.nombre,
          email: datos.usuario.email, telefono: datos.usuario.telefono, rol: datos.usuario.rol,
        }));
        window.location.href = 'profesional-portal.html';
      } catch (_) {
        errEl.textContent = '⚠️ No se pudo conectar con el servidor.'; errEl.style.display = 'block';
        btn.disabled = false; btn.textContent = 'Entrar al área profesional';
      }
    });
  }

  // ── REGISTRO PROFESIONAL ────────────────────────────────────
  const registroProfesionalForm = document.getElementById('registroProfesionalForm');
  if (registroProfesionalForm) {
    const errEl = document.createElement('p');
    errEl.style.cssText = 'color:#c62828;background:#ffebee;border-left:4px solid #c62828;padding:.65rem 1rem;border-radius:6px;font-size:.9rem;margin-bottom:1rem;display:none;';
    registroProfesionalForm.insertBefore(errEl, registroProfesionalForm.firstChild);

    registroProfesionalForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      errEl.style.display = 'none';
      const nombre       = document.getElementById('nombre').value.trim();
      const tlf          = document.getElementById('tlf').value.trim();
      const email        = document.getElementById('email').value.trim();
      const password     = document.getElementById('password').value;
      const codigoAcceso = document.getElementById('codigoAcceso').value.trim();
      const btn          = registroProfesionalForm.querySelector('[type="submit"]');

      if (!nombre || !tlf || !email || !password || !codigoAcceso) {
        errEl.textContent = '⚠️ Todos los campos son obligatorios.'; errEl.style.display = 'block'; return;
      }
      if (password.length < 8) {
        errEl.textContent = '⚠️ La contraseña debe tener al menos 8 caracteres.'; errEl.style.display = 'block'; return;
      }
      btn.disabled = true; btn.textContent = 'Creando cuenta...';

      try {
        const resp  = await fetch(API_BASE + '/api/registro-profesional', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, email, telefono: tlf, password, codigoAcceso }),
        });
        const datos = await resp.json();
        if (!datos.ok) {
          errEl.textContent = '⚠️ ' + datos.mensaje; errEl.style.display = 'block';
          btn.disabled = false; btn.textContent = 'Crear cuenta profesional';
          return;
        }
        sessionStorage.setItem('cis_pro', JSON.stringify({
          id: datos.usuario.id, nombre: datos.usuario.nombre,
          email: datos.usuario.email, telefono: datos.usuario.telefono, rol: datos.usuario.rol,
        }));
        window.location.href = 'profesional-portal.html';
      } catch (_) {
        errEl.textContent = '⚠️ No se pudo conectar con el servidor.'; errEl.style.display = 'block';
        btn.disabled = false; btn.textContent = 'Crear cuenta profesional';
      }
    });
  }

  // ── LOGIN ADMINISTRADOR ─────────────────────────────────────────
  const loginAdminForm = document.getElementById('loginAdminForm');
  if (loginAdminForm) {
    const errEl = document.createElement('p');
    errEl.style.cssText = 'color:#c62828;background:#ffebee;border-left:4px solid #c62828;padding:.65rem 1rem;border-radius:6px;font-size:.9rem;margin-bottom:1rem;display:none;';
    loginAdminForm.insertBefore(errEl, loginAdminForm.firstChild);

    loginAdminForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      errEl.style.display = 'none';
      const email    = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const btn      = loginAdminForm.querySelector('[type="submit"]');

      if (!email || !password) {
        errEl.textContent = '⚠️ Rellena todos los campos.'; errEl.style.display = 'block'; return;
      }
      btn.disabled = true; btn.textContent = 'Verificando...';

      try {
        const resp  = await fetch(API_BASE + '/api/login-admin', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const datos = await resp.json();
        if (!datos.ok) {
          errEl.textContent = '⚠️ ' + datos.mensaje; errEl.style.display = 'block';
          btn.disabled = false; btn.textContent = 'Entrar al panel';
          return;
        }
        sessionStorage.setItem('cis_admin', JSON.stringify({
          id: datos.usuario.id, nombre: datos.usuario.nombre,
          email: datos.usuario.email, rol: datos.usuario.rol,
        }));
        window.location.href = 'admin-portal.html';
      } catch (_) {
        errEl.textContent = '⚠️ No se pudo conectar con el servidor.'; errEl.style.display = 'block';
        btn.disabled = false; btn.textContent = 'Entrar al panel';
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
  // No mostrar en la propia página de política de cookies
  if (window.location.pathname.endsWith('cookies.html')) return;

  // Comprobar si ya hay consentimiento válido (guardado con timestamp de 12 meses)
  function consentExpired() {
    const raw = localStorage.getItem('cookie_consent');
    if (!raw) return true;
    try {
      const data = JSON.parse(raw);
      const doceM = 12 * 30 * 24 * 60 * 60 * 1000;
      return (Date.now() - data.ts) > doceM;
    } catch (_) { return true; }
  }

  if (!consentExpired()) return;

  // Construir el banner
  const banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Aviso de cookies');

  // La ruta a cookies.html es relativa: puede estar en html/ o en raíz
  const estaEnHtml = window.location.pathname.includes('/html/');
  const urlCookies = estaEnHtml ? 'cookies.html' : 'html/cookies.html';

  banner.innerHTML = `
    <p>🍪 Utilizamos cookies propias y de terceros para mejorar tu experiencia y analizar el tráfico web de forma anónima. <a href="${urlCookies}">Más información</a>.</p>
    <div class="cookie-banner-btns">
      <button class="cookie-btn-accept" id="cookieBtnAccept">Aceptar todas</button>
      <button class="cookie-btn-reject" id="cookieBtnReject">Solo necesarias</button>
    </div>
  `;

  document.body.appendChild(banner);

  // Animar entrada tras un frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => banner.classList.add('visible'));
  });

  function saveConsent(value) {
    localStorage.setItem('cookie_consent', JSON.stringify({ value: value, ts: Date.now() }));
    banner.classList.remove('visible');
    banner.addEventListener('transitionend', () => banner.remove(), { once: true });
  }

  document.getElementById('cookieBtnAccept').addEventListener('click', () => saveConsent('all'));
  document.getElementById('cookieBtnReject').addEventListener('click', () => saveConsent('necessary'));
})();
