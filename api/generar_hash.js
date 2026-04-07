// Ejecuta: node generar_hash.js > sql_admin.txt
const bcrypt = require('bcryptjs');

const nombre     = 'Ana Sara Lafuente';   // <-- Tu nombre
const email      = 'a.lafuente.defrutos@gmail.com';        // <-- Tu email real
const telefono   = '+34605426298';        // <-- Tu teléfono
const contraseña = '12345678';          // <-- Tu contraseña

bcrypt.hash(contraseña, 12).then(hash => {
  const sql = `
-- Ejecuta esto en phpMyAdmin > base de datos cis_madrid > pestaña SQL
-- ================================================================

-- Elimina admin anterior si existe
DELETE FROM usuarios WHERE rol = 'admin';

-- Crea tu cuenta de administradora
INSERT INTO usuarios (nombre, email, telefono, password_hash, rol, activo)
VALUES (
  '${nombre}',
  '${email}',
  '${telefono}',
  '${hash}',
  'admin',
  1
);

-- ================================================================
-- Contraseña usada: ${contraseña}
-- ================================================================
`;

  console.log(sql);
});
