// config.js - Configuración global de la aplicación
// Detectar automáticamente si estamos en producción o desarrollo

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:5000'  // Desarrollo local
    : 'https://zukzuk-olcn.onrender.com';  // Producción en Render

// También guardar la URL base
const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:5000'
    : 'https://zukzuk-olcn.onrender.com';

console.log('🔧 API_URL:', API_URL);
console.log('🔧 BASE_URL:', BASE_URL);