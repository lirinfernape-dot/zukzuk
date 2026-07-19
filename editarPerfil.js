const token = localStorage.getItem("token");

if (!token) {
    alert("Debes iniciar sesión.");
    window.location.href = "login.html";
}

// ==========================================
// CARGAR DATOS DEL PERFIL
// ==========================================

async function cargarPerfil() {
    try {
        const respuesta = await fetch("http://127.0.0.1:5000/api/users/perfil", {
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
        console.error(error);
        alert("No se pudo cargar el perfil.");
    }
}

// ==========================================
// GUARDAR CAMBIOS
// ==========================================

document.getElementById("formEditarPerfil").addEventListener("submit", async function(e) {
    e.preventDefault();
    
    try {
        // 1. Actualizar nombre y género
        const respuesta = await fetch("http://127.0.0.1:5000/api/users/perfil", {
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
        
        // 2. Actualizar biografía
        const biografia = document.getElementById("biografia").value;
        await fetch("http://127.0.0.1:5000/api/users/biografia", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({ biografia: biografia })
        });
        
        // 3. Subir avatar si se seleccionó uno
        const avatarFile = document.getElementById("avatar").files[0];
        if (avatarFile) {
            const formData = new FormData();
            formData.append("avatar", avatarFile);
            
            await fetch("http://127.0.0.1:5000/api/users/avatar", {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + token
                },
                body: formData
            });
        }
        
        // Actualizar datos en localStorage
        const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));
        usuarioLocal.nombre = document.getElementById("nombre").value;
        localStorage.setItem("usuario", JSON.stringify(usuarioLocal));
        
        alert("✅ Perfil actualizado correctamente.");
        window.location.href = "perfil.html";
        
    } catch (error) {
        console.error(error);
        alert("Error al actualizar el perfil.");
    }
});

// ==========================================
// CAMBIAR CONTRASEÑA
// ==========================================

function cambiarContrasena() {
    const nuevaContrasena = prompt("Ingresa tu nueva contraseña:");
    
    if (!nuevaContrasena || nuevaContrasena.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres.");
        return;
    }
    
    // Aquí iría la llamada a la API para cambiar contraseña
    alert("🔧 Funcionalidad en desarrollo.");
}

// ==========================================
// INICIAR
// ==========================================

cargarPerfil();