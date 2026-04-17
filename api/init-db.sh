#!/bin/bash
# Script para inicializar la base de datos en Railway
# Se ejecuta automáticamente después del despliegue

echo "🚀 Inicializando base de datos MySQL en Railway..."

if [ -z "$MYSQLHOST" ] || [ -z "$MYSQLUSER" ]; then
    echo "❌ Faltan variables de entorno MySQL necesarias. Verifica MYSQLHOST y MYSQLUSER."
    exit 1
fi

# Ir al directorio raíz del repositorio para leer cis_madrid.sql correctamente
cd "$(dirname "$0")/.." || exit 1

# Esperar a que MySQL esté listo
sleep 10

# Importar la estructura de la base de datos
# El archivo cis_madrid.sql crea y selecciona la base de datos cis_madrid por sí mismo.
mysql -h "$MYSQLHOST" -P "${MYSQLPORT:-3306}" -u "$MYSQLUSER" -p"$MYSQLPASSWORD" < cis_madrid.sql

if [ $? -eq 0 ]; then
    echo "✅ Base de datos inicializada correctamente"
else
    echo "❌ Error al inicializar la base de datos"
    exit 1
fi