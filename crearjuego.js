// Configuración de la URL
const API_URL = 'https://zukzuk-fvhn.onrender.com';

console.log('Crear Juego - API_URL:', API_URL);

const token = localStorage.getItem("token");

if (!token) {
    alert("Debes iniciar sesión.");
    window.location.href = "login.html";
}

async function crearJuego() {
    const nombre = document.getElementById("nombre").value;
    const descripcion = document.getElementById("descripcion").value;
    const categoria = document.getElementById("categoria").value;
    const miniatura = document.getElementById("miniatura").files[0];
    const archivo = document.getElementById("archivoJuego").files[0];

    if (!nombre || !descripcion) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("descripcion", descripcion);
    formData.append("categoria", categoria);
    
    if (miniatura) {
        formData.append("miniatura", miniatura);
    }
    
    if (archivo) {
        formData.append("archivo", archivo);
    }

    try {
        const respuesta = await fetch(`${API_URL}/api/games/create`, {
            method: "POST",
            headers: {
                Authorization: "Bearer " + token
            },
            body: formData
        });

        const datos = await respuesta.json();

        if (datos.correcto) {
            alert("Juego creado correctamente.");
            window.location.href = "dashboard.html";
        } else {
            alert(datos.mensaje || "Error al crear el juego.");
        }
    } catch (error) {
        console.error("Error creando juego:", error);
        alert("No se pudo conectar con el servidor.");
    }
}