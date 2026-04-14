-- ============================================================
--  BASE DE DATOS: CIS - Centro de Intervención Psicoeducativa
--  Archivo: cis_madrid.sql
--  Versión: 1.0  |  Fecha: Marzo 2026
-- ============================================================

-- 1. Crear y seleccionar la base de datos
CREATE DATABASE IF NOT EXISTS cis_madrid
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_spanish_ci;

USE cis_madrid;


-- ============================================================
-- TABLA: profesionales
-- Almacena los perfiles de los profesionales del centro
-- ============================================================
CREATE TABLE IF NOT EXISTS profesionales (
  id          INT           AUTO_INCREMENT PRIMARY KEY,
  slug        VARCHAR(50)   NOT NULL UNIQUE     COMMENT 'Identificador único (ej: psicologa)',
  nombre      VARCHAR(100)  NOT NULL            COMMENT 'Nombre completo',
  titulo      VARCHAR(100)  NOT NULL            COMMENT 'Título o rol (ej: Psicóloga)',
  especialidad VARCHAR(200) NOT NULL            COMMENT 'Descripción breve de especialidad',
  descripcion TEXT                              COMMENT 'Biografía completa',
  formacion   TEXT                              COMMENT 'Formación académica (separada por |)',
  email       VARCHAR(100)                      COMMENT 'Email de contacto',
  foto        VARCHAR(200)                      COMMENT 'Nombre del archivo de foto',
  activo      TINYINT(1)    DEFAULT 1           COMMENT '1=activo, 0=oculto',
  orden       INT           DEFAULT 0           COMMENT 'Orden de aparición en la web',
  created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP
);

-- Datos iniciales de los profesionales
INSERT INTO profesionales (slug, nombre, titulo, especialidad, descripcion, formacion, email, foto, orden) VALUES
(
  'psicologa',
  'Dra. Ana García López',
  'Psicóloga',
  'Especialista en neuropsicología infantil y evaluación de trastornos del neurodesarrollo.',
  'Psicóloga especializada en neuropsicología infantil con más de 10 años de experiencia en la evaluación e intervención de niños y adolescentes con dificultades del aprendizaje.',
  'Doctora en Psicología – UCM|Máster en Neuropsicología Infantil – UAM|Especialista en TDAH y TEA – FEAADAH',
  'ana.garcia@cis-madrid.es',
  'psicologa.jpg',
  1
),
(
  'terapeuta',
  'Carlos Martínez Ruiz',
  'Terapeuta Ocupacional',
  'Especialista en integración sensorial, coordinación motora y autonomía personal.',
  'Terapeuta ocupacional con más de 8 años de experiencia trabajando con niños y adolescentes con dificultades en la integración sensorial y el procesamiento motor.',
  'Grado en Terapia Ocupacional – URJC|Máster en Integración Sensorial – USC|Certificado SIPT',
  'carlos.martinez@cis-madrid.es',
  'terapeuta.jpg',
  2
),
(
  'logopeda',
  'Laura Sánchez Moreno',
  'Logopeda',
  'Especialista en trastornos del habla, lenguaje y comunicación en población infantil.',
  'Logopeda con más de 7 años de experiencia en la evaluación e intervención de trastornos del habla, el lenguaje y la comunicación en población infantil y adolescente.',
  'Grado en Logopedia – Universidad de Alcalá|Máster en Trastornos de la Comunicación – UAM|Especialista en TEL y fonología',
  'laura.sanchez@cis-madrid.es',
  'logopeda.jpg',
  3
);


-- ============================================================
-- TABLA: tarifas
-- Gestión de los precios y tipos de sesión
-- ============================================================
CREATE TABLE IF NOT EXISTS tarifas (
  id          INT           AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(100)  NOT NULL            COMMENT 'Nombre del tipo de sesión',
  precio      DECIMAL(7,2)  NOT NULL            COMMENT 'Precio en euros',
  duracion    INT           NOT NULL            COMMENT 'Duración en minutos',
  descripcion VARCHAR(255)                      COMMENT 'Descripción breve',
  destacada   TINYINT(1)    DEFAULT 0           COMMENT '1=tarifa destacada (estilo especial)',
  etiqueta    VARCHAR(50)                       COMMENT 'Etiqueta badge (ej: Ahorro)',
  activa      TINYINT(1)    DEFAULT 1           COMMENT '1=visible en la web',
  orden       INT           DEFAULT 0
);

-- Datos iniciales de tarifas
INSERT INTO tarifas (nombre, precio, duracion, descripcion, destacada, etiqueta, orden) VALUES
('1ª Sesión',           75.00,  25, 'Primera toma de contacto y valoración inicial del caso.',   1, 'Inicial', 1),
('2ª Sesión y posteriores', 50.00, 50, 'Sesiones de seguimiento e intervención terapéutica.',    0, NULL,      2),
('Pack 4 Sesiones',    180.00,  50, 'Bono de 4 sesiones con precio especial.',                   0, 'Ahorro',  3),
('Informe de Evaluación',120.00, 0, 'Evaluación completa con informe detallado y orientaciones.',0, NULL,      4);


-- ============================================================
-- TABLA: cursos_escuela_padres
-- Cursos disponibles en la Escuela de Padres
-- ============================================================
CREATE TABLE IF NOT EXISTS cursos_escuela_padres (
  id          INT           AUTO_INCREMENT PRIMARY KEY,
  titulo      VARCHAR(200)  NOT NULL            COMMENT 'Título del curso',
  descripcion TEXT                              COMMENT 'Descripción detallada',
  duracion    VARCHAR(100)                      COMMENT 'Duración (ej: 4 semanas, 2h/semana)',
  precio      DECIMAL(7,2)  DEFAULT 0.00        COMMENT '0 = incluido en sesión, otro = precio propio',
  plazas      INT           DEFAULT 15          COMMENT 'Número máximo de participantes',
  modalidad   ENUM('presencial','online','mixta') DEFAULT 'presencial',
  activo      TINYINT(1)    DEFAULT 1,
  orden       INT           DEFAULT 0,
  created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP
);

-- Datos iniciales de cursos
INSERT INTO cursos_escuela_padres (titulo, descripcion, duracion, modalidad, orden) VALUES
('Cómo manejar las rabietas y la frustración',
 'Aprende estrategias prácticas para manejar con calma y eficacia los momentos de explosión emocional de tu hijo.',
 '2 sesiones de 2h', 'presencial', 1),
('Estrategias para trabajar en casa con niños con TDAH',
 'Pautas concretas para el día a día: tareas, rutinas, organización y manejo conductual.',
 '3 sesiones de 1.5h', 'presencial', 2),
('Comunicación efectiva con hijos con TEA',
 'Técnicas de comunicación aumentativa, apoyos visuales y estrategias para anticipar cambios.',
 '2 sesiones de 2h', 'mixta', 3),
('Técnicas para mejorar la lectoescritura en casa',
 'Actividades sencillas para apoyar el proceso lector y escritor en niños con dificultades.',
 '2 sesiones de 2h', 'presencial', 4),
('Normas, límites y disciplina positiva',
 'Cómo establecer normas claras y consecuencias desde el respeto y la afectividad.',
 '4 sesiones de 1.5h', 'presencial', 5),
('Gestión emocional para toda la familia',
 'Herramientas para que padres e hijos aprendan a reconocer, expresar y regular sus emociones.',
 '3 sesiones de 2h', 'mixta', 6);


-- ============================================================
-- TABLA: citas
-- Solicitudes de reserva de cita desde el formulario web
-- ============================================================
CREATE TABLE IF NOT EXISTS citas (
  id              INT           AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(100)  NOT NULL            COMMENT 'Nombre completo del solicitante',
  telefono        VARCHAR(20)   NOT NULL             COMMENT 'Teléfono de contacto',
  email           VARCHAR(100)  NOT NULL             COMMENT 'Correo electrónico',
  profesional_id  INT           NOT NULL             COMMENT 'FK a profesionales.id',
  fecha           DATE          NOT NULL             COMMENT 'Fecha solicitada',
  hora            VARCHAR(5)    NOT NULL             COMMENT 'Hora solicitada (ej: 10:00)',
  motivo          TEXT                               COMMENT 'Motivo de la consulta',
  estado          ENUM('pendiente','confirmada','cancelada')
                                DEFAULT 'pendiente'  COMMENT 'Estado de gestión',
  notas_internas  TEXT                               COMMENT 'Notas del equipo (no visibles al cliente)',
  created_at      DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (profesional_id) REFERENCES profesionales(id) ON DELETE RESTRICT
);


-- ============================================================
-- TABLA: inscripciones_cursos
-- Registro de familias apuntadas a cursos de Escuela de Padres
-- ============================================================
CREATE TABLE IF NOT EXISTS inscripciones_cursos (
  id          INT           AUTO_INCREMENT PRIMARY KEY,
  curso_id    INT           NOT NULL             COMMENT 'FK a cursos_escuela_padres.id',
  nombre      VARCHAR(100)  NOT NULL             COMMENT 'Nombre del padre/madre',
  email       VARCHAR(100)  NOT NULL             COMMENT 'Email de contacto',
  telefono    VARCHAR(20)                        COMMENT 'Teléfono opcional',
  comentario  TEXT                               COMMENT 'Comentario o situación del hijo',
  estado      ENUM('pendiente','confirmada','cancelada') DEFAULT 'pendiente',
  created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (curso_id) REFERENCES cursos_escuela_padres(id) ON DELETE CASCADE
);


-- ============================================================
-- TABLA: frases_motivacionales
-- Frases del carrusel (gestionables desde el futuro panel admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS frases_motivacionales (
  id      INT           AUTO_INCREMENT PRIMARY KEY,
  frase   TEXT          NOT NULL    COMMENT 'Texto de la frase',
  autor   VARCHAR(100)  DEFAULT 'Equipo CIS' COMMENT 'Autoría',
  activa  TINYINT(1)    DEFAULT 1,
  orden   INT           DEFAULT 0
);

-- Frases iniciales
INSERT INTO frases_motivacionales (frase, autor, orden) VALUES
('Cada niño es único. Su progreso no se mide en comparación con otros, sino en superación de sí mismo.', 'Equipo CIS', 1),
('El aprendizaje no sigue un camino recto. A veces necesita desvíos, pausas y mucho amor.', 'Centro de Intervención Sicoeducativa', 2),
('Los límites de un niño nunca los define un diagnóstico. Los define el apoyo que recibe.', 'Equipo CIS', 3),
('Acompañar a una familia es tan importante como acompañar al niño. El cambio empieza en casa.', 'Centro de Intervención Sicoeducativa', 4),
('Cada logro, por pequeño que sea, merece ser celebrado. Eso es lo que nos mueve cada día.', 'Equipo CIS', 5);


-- ============================================================
-- VISTA ÚTIL: vista_citas_completas
-- Une citas con el nombre del profesional (útil para el panel admin)
-- ============================================================
CREATE OR REPLACE VIEW vista_citas_completas AS
SELECT
  c.id,
  c.nombre       AS cliente_nombre,
  c.telefono,
  c.email,
  p.nombre       AS profesional_nombre,
  p.titulo       AS profesional_titulo,
  c.fecha,
  c.hora,
  c.motivo,
  c.estado,
  c.created_at
FROM citas c
JOIN profesionales p ON c.profesional_id = p.id
ORDER BY c.fecha ASC, c.hora ASC;


-- ============================================================
-- TABLA: usuarios
-- Familias registradas en el portal privado
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id            INT           AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(100)  NOT NULL             COMMENT 'Nombre del tutor legal o profesional',
  apellido      VARCHAR(100)  NOT NULL             COMMENT 'Apellido(s) del tutor legal o profesional',
  email         VARCHAR(100)  NOT NULL UNIQUE       COMMENT 'Email de acceso (único)',
  telefono      VARCHAR(20)                        COMMENT 'Teléfono de contacto',
  password_hash VARCHAR(255)  NOT NULL             COMMENT 'Contraseña hasheada con bcrypt',
  rol           ENUM('familia','profesional','admin')
                              DEFAULT 'familia'    COMMENT 'Rol del usuario',
  activo        TINYINT(1)    DEFAULT 1            COMMENT '1=activo, 0=bloqueado',
  created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP
);

-- Si ya tienes la tabla usuarios creada, ejecuta este ALTER para añadir el rol profesional:
-- ALTER TABLE usuarios MODIFY COLUMN rol ENUM('familia','profesional','admin') DEFAULT 'familia';


-- ============================================================
-- TABLA: pacientes
-- Perfiles de los niños/as que se tratan en el centro
-- ============================================================
CREATE TABLE IF NOT EXISTS pacientes (
  id                    INT           AUTO_INCREMENT PRIMARY KEY,
  nombre                VARCHAR(100)  NOT NULL             COMMENT 'Nombre completo del niño/a',
  fecha_nacimiento      DATE                               COMMENT 'Fecha de nacimiento',
  genero                ENUM('masculino','femenino','otro'),
  diagnostico_principal VARCHAR(200)                      COMMENT 'Diagnóstico o motivo principal de consulta',
  observaciones         TEXT                              COMMENT 'Notas clínicas del profesional',
  profesional_id        INT                               COMMENT 'FK a usuarios (rol=profesional) - NULL hasta que el padre asigne',
  tutor_usuario_id      INT                               COMMENT 'FK a usuarios (rol=familia) vinculado',
  activo                TINYINT(1)    DEFAULT 1,
  created_at            DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (profesional_id)   REFERENCES usuarios(id) ON DELETE RESTRICT,
  FOREIGN KEY (tutor_usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);


-- ============================================================
-- TABLA: consentimientos
-- Solicitudes de vinculación enviadas al tutor legal
-- ============================================================
CREATE TABLE IF NOT EXISTS consentimientos (
  id               INT           AUTO_INCREMENT PRIMARY KEY,
  paciente_id      INT           NOT NULL             COMMENT 'FK a pacientes.id',
  email_tutor      VARCHAR(100)  NOT NULL             COMMENT 'Email del tutor legal al que se envía',
  nombre_tutor     VARCHAR(100)                       COMMENT 'Nombre del tutor (informativo)',
  token            VARCHAR(64)   NOT NULL UNIQUE      COMMENT 'Token único para aceptar/rechazar (64 hex)',
  estado           ENUM('pendiente','aceptado','rechazado')
                                 DEFAULT 'pendiente',
  fecha_envio      DATETIME      DEFAULT CURRENT_TIMESTAMP,
  fecha_respuesta  DATETIME                           COMMENT 'Fecha en que el tutor respondió',

  FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
);


