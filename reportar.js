// Configuración de la URL
const API_URL = 'https://zukzuk-fvhn.onrender.com';

console.log('Reportar - API_URL:', API_URL);

const token = localStorage.getItem("token");

if (!token) {
    alert("Debes iniciar sesión.");
    window.location.href = "login.html";
}

document.getElementById("formReportar").addEventListener("submit", function(e) {
    e.preventDefault();
    alert("✅ Reporte enviado. Revisaremos el contenido.");
    window.location.href = "index.html";
});