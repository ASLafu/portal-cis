// ==========================================================
//  CIS – Portal de Familias
//  Capa de datos simulada (sustituible por una API real)
// ==========================================================

const CIS_DATA = {

  /* -------------------------------------------------------
     PERFIL DEL TUTOR
  ------------------------------------------------------- */
  usuario: {
    nombre:    "Marina López",
    rol:       "Tutora Legal / Madre",
    telefono:  "+34 612 345 678",
    email:     "marinalopez@ejemplo.com",
    paciente: {
      nombre: "Leo Martín López",
      edad:   7,
      ref:    "TEA y Trastorno del Habla",
    },
  },

  /* -------------------------------------------------------
     CITAS
     estado: "proxima" | "pendiente" | "realizada" | "cancelada"
  ------------------------------------------------------- */
  citas: [
    {
      id: 1,
      fecha:        "2026-04-15",
      hora:         "17:00",
      duracion:     "50 min",
      profesional:  "Laura Sánchez",
      especialidad: "Logopedia",
      consulta:     "Consulta 2",
      estado:       "proxima",
    },
    {
      id: 2,
      fecha:        "2026-04-22",
      hora:         "10:00",
      duracion:     "50 min",
      profesional:  "Dra. Ana García",
      especialidad: "Psicología",
      consulta:     "Consulta 1",
      estado:       "pendiente",
    },
    {
      id: 3,
      fecha:        "2026-04-29",
      hora:         "17:00",
      duracion:     "50 min",
      profesional:  "Laura Sánchez",
      especialidad: "Logopedia",
      consulta:     "Consulta 2",
      estado:       "pendiente",
    },
    {
      id: 4,
      fecha:        "2026-04-08",
      hora:         "10:00",
      duracion:     "50 min",
      profesional:  "Carlos Martínez",
      especialidad: "Terapia Ocupacional",
      consulta:     "Sala TO",
      estado:       "realizada",
    },
    {
      id: 5,
      fecha:        "2026-04-01",
      hora:         "17:00",
      duracion:     "50 min",
      profesional:  "Laura Sánchez",
      especialidad: "Logopedia",
      consulta:     "Consulta 2",
      estado:       "realizada",
    },
    {
      id: 6,
      fecha:        "2026-03-25",
      hora:         "10:00",
      duracion:     "50 min",
      profesional:  "Dra. Ana García",
      especialidad: "Psicología",
      consulta:     "Consulta 1",
      estado:       "realizada",
    },
    {
      id: 7,
      fecha:        "2026-03-11",
      hora:         "17:00",
      duracion:     "50 min",
      profesional:  "Laura Sánchez",
      especialidad: "Logopedia",
      consulta:     "Consulta 2",
      estado:       "cancelada",
    },
  ],

  /* -------------------------------------------------------
     SESIONES / DIARIO
  ------------------------------------------------------- */
  sesiones: [
    {
      fecha:     "2026-04-08",
      titulo:    "Trabajo de vocabulario con tarjetas de acción",
      contenido: "Trabajo con tarjetas de vocabulario sobre acciones cotidianas. Leo identificó correctamente 18 de 20 fichas. Mejora notoria en la velocidad de denominación. Se propone ampliar el set de tarjetas la próxima sesión.",
      evaluador: "Carlos Martínez (Terapeuta Ocupacional)",
    },
    {
      fecha:     "2026-04-01",
      titulo:    "Discriminación fonológica /r/ fuerte",
      contenido: "Hemos trabajado la discriminación fonológica de la /r/ fuerte usando juegos con marionetas. Leo ha estado muy receptivo y participativo. Para avanzar en casa: juego del \"Rey Mago\" 10 minutos al día antes de cenar.",
      evaluador: "Laura Sánchez (Logopeda)",
    },
    {
      fecha:     "2026-03-25",
      titulo:    "Control de la frustración en lectura",
      contenido: "Trabajo sobre control de la frustración durante ejercicios de lectura continua. Se le entregó a Leo una \"tarjeta de pausa\" que usó con éxito emocional en dos ocasiones durante la sesión.",
      evaluador: "Dra. Ana García (Psicóloga)",
    },
    {
      fecha:     "2026-03-18",
      titulo:    "Secuenciación temporal y narrativa",
      contenido: "Leo ordenó correctamente secuencias de 4 viñetas e identificó nexos temporales (primero, luego, después) en 3 de 4 ejercicios. Inicio de trabajo con texto expositivo corto.",
      evaluador: "Laura Sánchez (Logopeda)",
    },
  ],

  /* -------------------------------------------------------
     FACTURACIÓN
     estado: "pagado" | "pendiente"
  ------------------------------------------------------- */
  facturacion: [
    {
      ref:         "#00912",
      descripcion: "Bono Mensual (4 Sesiones)",
      fecha:       "2026-04-01",
      metodo:      "Tarjeta acabada en 4022",
      importe:     180,
      estado:      "pagado",
    },
    {
      ref:         "#00845",
      descripcion: "Bono Mensual (4 Sesiones)",
      fecha:       "2026-03-01",
      metodo:      "Tarjeta acabada en 4022",
      importe:     180,
      estado:      "pagado",
    },
    {
      ref:         "#00801",
      descripcion: "Sesión Suelta – Psicología",
      fecha:       "2026-02-10",
      metodo:      "Transferencia Bancaria",
      importe:     50,
      estado:      "pagado",
    },
    {
      ref:         "#00762",
      descripcion: "Sesión Suelta – Evaluación Inicial",
      fecha:       "2026-01-20",
      metodo:      "Transferencia Bancaria",
      importe:     75,
      estado:      "pagado",
    },
  ],
};
