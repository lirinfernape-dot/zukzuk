// Configuración de la URL
const API_URL = 'https://zukzuk-fvhn.onrender.com';

console.log('Editar Perfil - API_URL:', API_URL);

const token = localStorage.getItem("token");

if (!token) {
    alert("Debes iniciar sesión.");
    window.location.href = "login.html";
}

async function cargarPerfil() {
    try {
        const respuesta = await fetch(`${API_URL}/api/users/perfil`, {
            headers: {
                Authorization: "Bearer " + token
            }
        });
        
        const datos = await respuesta.json();
        const usuario = datos.usuario;
        
        document.getElementById("nombre").value = usuario.nombre || "";
        document.getElementById("genero").value = usuario.genero || "No decirlo";
        document.getElementById("biografia").value = usuario.biografia || "";
        
    } catch (error) {
        console.error("Error cargando perfil:", error);
        alert("No se pudo cargar el perfil.");
    }
}

cargarPerfil();

document.getElementById("formEditarPerfil").addEventListener("submit", async function(e) {
    e.preventDefault();
    
    try {
        const respuesta = await fetch(`${API_URL}/api/users/perfil`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({
                nombre: document.getElementById("nombre").value,
                genero: document.getElementById("genero").value
            })
        });
        
        const datos = await respuesta.json();
        
        if (!datos.correcto) {
            alert(datos.mensaje);
            return;
        }
        
        const biografia = document.getElementById("biografia").value;
        await fetch(`${API_URL}/api/users/biografia`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({ biografia: biografia })
        });
        
        const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));
        usuarioLocal.nombre = document.getElementById("nombre").value;
        localStorage.setItem("usuario", JSON.stringify(usuarioLocal));
        
        alert("✅ Perfil actualizado correctamente.");
        window.location.href = "perfil.html";
        
    } catch (error) {
        console.error("Error actualizando perfil:", error);
        alert("Error al actualizar el perfil.");
    }
});

function cambiarContrasena() {
    const nuevaContrasena = prompt("Ingresa tu nueva contraseña:");
    
    if (!nuevaContrasena || nuevaContrasena.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres.");
        return;
    }
    
    // Aquí iría la llamada a la API para cambiar contraseña
    alert("🔧 Funcionalidad en desarrollo.");
}