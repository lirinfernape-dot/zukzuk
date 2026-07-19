const formulario = document.querySelector("form");

// Cargar configuración
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:5000'
    : 'https://zukzuk-olcn.onrender.com';

formulario.addEventListener("submit", async function (e) {
    e.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasena").value;

    try {
        const respuesta = await fetch(`${API_URL}/api/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                correo: correo,
                contrasena: contrasena
            })
        });

        const datos = await respuesta.json();

        if (datos.correcto) {
            localStorage.setItem("usuario", JSON.stringify(datos.usuario));
            localStorage.setItem("token", datos.token);
            alert("¡Bienvenido " + datos.usuario.nombre + "!");
            window.location.href = "index.html";
        } else {
            alert(datos.mensaje);
        }
    } catch (error) {
        console.error("Error en login:", error);
        alert("No se pudo conectar con el servidor. Verifica tu conexión.");
    }
});