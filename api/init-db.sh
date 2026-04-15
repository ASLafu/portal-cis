#!/bin/bash
# Script para inicializar la base de datos en Railway
# Se ejecuta automáticamente después del despliegue

echo "🚀 Inicializando base de datos MySQL en Railway..."

# Esperar a que MySQL esté listo
sleep 10

# Importar la estructura de la base de datos
mysql -h $MYSQLHOST -u $MYSQLUSER -p$MYSQLPASSWORD $MYSQLDATABASE < cis_madrid.sql

if [ $? -eq 0 ]; then
    echo "✅ Base de datos inicializada correctamente"
else
    echo "❌ Error al inicializar la base de datos"
    exit 1
fi