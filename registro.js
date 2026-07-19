// Configuración de la URL
const API_URL = 'https://zukzuk-fvhn.onrender.com';

console.log('Registro - API_URL:', API_URL);

const formulario = document.getElementById("formRegistro");

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
        const url = `${API_URL}/api/register`;
        console.log('Enviando registro a:', url);
        console.log('Datos:', usuario);

        const respuesta = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(usuario)
        });

        const datos = await respuesta.json();
        console.log('Respuesta registro:', datos);

        alert(datos.mensaje);

        if (datos.correcto) {
            formulario.reset();
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        }
    } catch (error) {
        console.error("Error en registro:", error);
        alert("No se pudo conectar con el servidor. Error: " + error.message);
    }
});