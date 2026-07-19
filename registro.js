const formulario = document.getElementById("formRegistro");

// Cargar configuración
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:5000'
    : 'https://zukzuk-olcn.onrender.com';

formulario.addEventListener("submit", async function (e) {
    e.preventDefault();

    const usuario = {
        nombre: document.getElementById("nombre").value,
        correo: document.getElementById("correo").value,
        contrasena: document.getElementById("contrasena").value,
        fechaNacimiento: document.getElementById("fechaNacimiento").value,
        genero: document.getElementById("genero").value
    };

    try {
        const respuesta = await fetch(`${API_URL}/api/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(usuario)
        });

        const datos = await respuesta.json();
        alert(datos.mensaje);

        if (datos.correcto) {
            formulario.reset();
            // Redirigir al login después de registrarse
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        }
    } catch (error) {
        console.error("Error en registro:", error);
        alert("No se pudo conectar con el servidor. Verifica tu conexión.");
    }
});