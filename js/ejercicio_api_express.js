const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = 3000;

// Configuración de conexión a la base de datos MySQL local
// Ajusta 'user', 'password' y 'database' según tu entorno local
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'mi_base' // Asegúrate de que esta base de datos exista
};

// Función auxiliar para crear y esperar los 20 segundos
const esperar20Segundos = () => new Promise(resolve => setTimeout(resolve, 20000));

app.get('/api/start-fetch', async (req, res) => {
    // Respondemos rápido al cliente para que no se quede bloqueada la petición en el navegador
    res.send('Proceso iniciado. Revisa la consola del servidor para ver el progreso de las 10 peticiones.');

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        // Creamos la tabla si no existe para almacenar los resultados
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS libros_busqueda (
                id INT AUTO_INCREMENT PRIMARY KEY,
                titulo VARCHAR(255),
                autor VARCHAR(255),
                anio_publicacion INT,
                fecha_peticion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("Tabla 'libros_busqueda' verificada/creada. Iniciando las 10 peticiones...");

        const maxPeticiones = 10;
        
        for (let i = 1; i <= maxPeticiones; i++) {
            console.log(`\n--- Realizando la petición número ${i} de ${maxPeticiones}... ---`);
            
            try {
                // Usamos la API de OpenLibrary con los parámetros solicitados. 
                // Añadimos el parámetro page para obtener resultados distintos si es necesario.
                const url = `https://openlibrary.org/search.json?q=node+express+javascript&page=${i}`;
                
                // Usamos fetch nativo de Node.js (disponible en Node 18+)
                const response = await fetch(url);
                const data = await response.json();

                // Extraemos los datos relevantes (por ejemplo, el primer libro de cada página o resultado)
                if (data.docs && data.docs.length > 0) {
                    const libro = data.docs[0]; // Tomamos el resultado más relevante de esa petición
                    const titulo = libro.title || 'Desconocido';
                    const autor = libro.author_name ? libro.author_name[0] : 'Desconocido';
                    const anio = libro.first_publish_year || null;

                    // Guardamos el dato en nuestra base de datos MySQL
                    await connection.execute(
                        'INSERT INTO libros_busqueda (titulo, autor, anio_publicacion) VALUES (?, ?, ?)',
                        [titulo, autor, anio]
                    );

                    console.log(`✅ Datos guardados: "${titulo}" por ${autor} (${anio})`);
                } else {
                    console.log('⚠️ No se encontraron documentos relevantes en esta petición.');
                }

            } catch (error) {
                console.error(`❌ Error al consultar la API en la petición ${i}:`, error.message);
            }

            // Si no es la última petición, esperamos los 20 segundos indicados
            if (i < maxPeticiones) {
                console.log('Esperando 20 segundos antes de la siguiente petición...');
                await esperar20Segundos();
            }
        }

        console.log('\n✅ Proceso de 10 peticiones finalizado completamente.');

    } catch (err) {
        console.error('Error de conexión a la base de datos MySQL:', err);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

app.listen(port, () => {
    console.log(`Servidor Express escuchando en http://localhost:${port}`);
    console.log(`Para iniciar el bloque de peticiones, abre el navegador y visita: http://localhost:${port}/api/start-fetch`);
});
