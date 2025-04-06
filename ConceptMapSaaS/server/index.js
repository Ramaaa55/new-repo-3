const express = require('express');
const path = require('path');
const fs = require('fs');

// Inicializar la aplicación Express
const app = express();
let PORT = process.env.PORT || 0; // Puerto 0 hace que el sistema asigne un puerto disponible

// Middleware para procesar JSON y datos de formularios
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, '../public')));

// Ruta principal para servir la aplicación React
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Importar controladores
const conceptMapController = require('./controllers/conceptMapController');

// Rutas de la API
app.post('/api/generate-map', conceptMapController.generateMap);

// Iniciar el servidor con manejo de errores
const server = app.listen(PORT, () => {
  // Obtener el puerto asignado por el sistema
  PORT = server.address().port;
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`Accede a la aplicación en tu navegador usando la URL anterior`);
});

// Manejar errores del servidor
server.on('error', (error) => {
  console.error('Error al iniciar el servidor:', error);
  process.exit(1);
});
