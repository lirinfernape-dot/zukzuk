// Configuración de la URL
const API_URL = 'https://zukzuk-fvhn.onrender.com';

console.log('Login - API_URL:', API_URL);

const formulario = document.querySelector("form");

formulario.addEventListener("submit", async function (e) {
    e.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasena").value;

    try {
        const url = `${API_URL}/api/login`;
        console.log('Enviando login a:', url);

        const respuesta = await fetch(url, {
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
        console.log('Respuesta login:', datos);

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
        alert("No se pudo conectar con el servidor. Error: " + error.message);
    }
});