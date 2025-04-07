import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configuración para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Crear la aplicación Express
const app = express();

// Definir el puerto (predeterminado 3001, configurable)
const PORT = process.env.PORT || 3001;

// Servir archivos estáticos desde el directorio raíz del proyecto
app.use(express.static(join(__dirname, '..')));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '..', 'index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
  console.log(`Presiona Ctrl+C para detener el servidor`);
});