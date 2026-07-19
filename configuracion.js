// Configuración de la URL
const API_URL = 'https://zukzuk-fvhn.onrender.com';

console.log('Configuración - API_URL:', API_URL);

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
        
        if (!respuesta.ok) {
            if (respuesta.status === 401) {
                alert("Tu sesión ha expirado.");
                localStorage.removeItem("token");
                localStorage.removeItem("usuario");
                window.location.href = "login.html";
                return;
            }
            alert("Error al cargar el perfil.");
            return;
        }
        
        const datos = await respuesta.json();
        const usuario = datos.usuario;
        
        document.getElementById("nombre").value = usuario.nombre || "";
        document.getElementById("correo").value = usuario.correo || "";
        document.getElementById("genero").value = usuario.genero || "No decirlo";
        document.getElementById("biografia").value = usuario.biografia || "";
        document.getElementById("fechaNacimiento").value = usuario.fecha_nacimiento || "";
        
        const avatarPreview = document.getElementById("avatarPreview");
        if (usuario.avatar && usuario.avatar !== "default_avatar.png") {
            avatarPreview.src = `${API_URL}/uploads/avatars/${usuario.avatar}`;
        } else {
            avatarPreview.src = "default_avatar.png";
        }
        
        document.getElementById("userId").textContent = usuario.id || "";
        document.getElementById("fechaRegistro").textContent = usuario.fecha_registro ? new Date(usuario.fecha_registro).toLocaleDateString() : "";
        document.getElementById("nivelUsuario").textContent = usuario.nivel || 1;
        document.getElementById("monedasUsuario").textContent = usuario.monedas || 0;
        
        cargarEstadisticas();
        
    } catch (error) {
        console.error("Error cargando perfil:", error);
        alert("No se pudo cargar el perfil.");
    }
}

async function cargarEstadisticas() {
    try {
        const respuesta = await fetch(`${API_URL}/api/stats/user`, {
            headers: {
                Authorization: "Bearer " + token
            }
        });
        
        if (!respuesta.ok) return;
        
        const stats = await respuesta.json();
        document.getElementById("totalJuegos").textContent = stats.total_juegos || 0;
        document.getElementById("totalAmigos").textContent = stats.total_amigos || 0;
        document.getElementById("totalLogros").textContent = stats.total_logros || 0;
        document.getElementById("totalLikes").textContent = stats.total_likes || 0;
        
    } catch (error) {
        console.error("Error cargando estadísticas:", error);
    }
}

document.getElementById("formPerfil").addEventListener("submit", async function(e) {
    e.preventDefault();
    const boton = this.querySelector('button[type="submit"]');
    boton.disabled = true;
    boton.textContent = "Guardando...";
    
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
        
        await fetch(`${API_URL}/api/users/biografia`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({
                biografia: document.getElementById("biografia").value
            })
        });
        
        alert("✅ Perfil actualizado correctamente.");
        cargarPerfil();
        
    } catch (error) {
        console.error("Error guardando perfil:", error);
        alert("Error al actualizar el perfil.");
    } finally {
        boton.disabled = false;
        boton.textContent = "💾 Guardar Cambios";
    }
});

document.getElementById("formAvatar").addEventListener("submit", async function(e) {
    e.preventDefault();
    const archivo = document.getElementById("avatarInput").files[0];
    if (!archivo) {
        alert("Selecciona una imagen.");
        return;
    }
    
    const boton = this.querySelector('button[type="submit"]');
    boton.disabled = true;
    boton.textContent = "Subiendo...";
    
    const formData = new FormData();
    formData.append("avatar", archivo);
    
    try {
        const respuesta = await fetch(`${API_URL}/api/users/avatar`, {
            method: "POST",
            headers: {
                Authorization: "Bearer " + token
            },
            body: formData
        });
        
        const datos = await respuesta.json();
        alert(datos.mensaje);
        if (datos.correcto) {
            document.getElementById("avatarPreview").src = `${API_URL}/uploads/avatars/${datos.avatar}`;
            document.getElementById("avatarInput").value = "";
        }
        
    } catch (error) {
        console.error("Error subiendo avatar:", error);
        alert("Error al actualizar avatar.");
    } finally {
        boton.disabled = false;
        boton.textContent = "🔄 Actualizar Avatar";
    }
});

document.getElementById("formPassword").addEventListener("submit", async function(e) {
    e.preventDefault();
    const actual = document.getElementById("passwordActual").value;
    const nueva = document.getElementById("passwordNueva").value;
    const confirmar = document.getElementById("passwordConfirmar").value;
    
    if (nueva.length < 6) {
        alert("La nueva contraseña debe tener al menos 6 caracteres.");
        return;
    }
    if (nueva !== confirmar) {
        alert("Las contraseñas no coinciden.");
        return;
    }
    
    const boton = this.querySelector('button[type="submit"]');
    boton.disabled = true;
    boton.textContent = "Cambiando...";
    
    try {
        const respuesta = await fetch(`${API_URL}/api/users/password`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({
                actual: actual,
                nueva: nueva
            })
        });
        
        const datos = await respuesta.json();
        alert(datos.mensaje);
        if (datos.correcto) {
            document.getElementById("formPassword").reset();
        }
        
    } catch (error) {
        console.error("Error cambiando contraseña:", error);
        alert("Error al cambiar la contraseña.");
    } finally {
        boton.disabled = false;
        boton.textContent = "🔑 Cambiar Contraseña";
    }
});

cargarPerfil();