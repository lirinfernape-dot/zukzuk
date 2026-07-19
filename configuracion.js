const token = localStorage.getItem("token");

console.log("Token:", token);

if (!token) {
    alert("Debes iniciar sesión.");
    window.location.href = "login.html";
}

// ==========================================
// CARGAR DATOS DEL PERFIL
// ==========================================

async function cargarPerfil() {
    console.log("Cargando perfil...");
    
    try {
        const respuesta = await fetch("http://127.0.0.1:5000/api/users/perfil", {
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        });
        
        if (!respuesta.ok) {
            if (respuesta.status === 401) {
                alert("Tu sesión ha expirado. Inicia sesión nuevamente.");
                localStorage.removeItem("token");
                localStorage.removeItem("usuario");
                window.location.href = "login.html";
                return;
            }
            alert(`Error ${respuesta.status}: No se pudo cargar el perfil.`);
            return;
        }
        
        const datos = await respuesta.json();
        
        if (!datos.correcto) {
            alert(datos.mensaje || "Error al cargar el perfil.");
            return;
        }
        
        const usuario = datos.usuario;
        console.log("Usuario cargado:", usuario);
        
        // Perfil
        document.getElementById("nombre").value = usuario.nombre || "";
        document.getElementById("correo").value = usuario.correo || "";
        document.getElementById("genero").value = usuario.genero || "No decirlo";
        document.getElementById("biografia").value = usuario.biografia || "";
        document.getElementById("fechaNacimiento").value = usuario.fecha_nacimiento || "";
        
        // ==========================================
        // AVATAR - CON VERIFICACIÓN
        // ==========================================
        const avatarPreview = document.getElementById("avatarPreview");
        console.log("Avatar desde BD:", usuario.avatar);
        
        if (usuario.avatar && usuario.avatar !== "default_avatar.png" && usuario.avatar !== "null" && usuario.avatar !== "") {
            const avatarUrl = `http://127.0.0.1:5000/uploads/avatars/${usuario.avatar}`;
            console.log("URL del avatar:", avatarUrl);
            
            // Verificar si la imagen existe
            try {
                const testResponse = await fetch(avatarUrl);
                if (testResponse.ok) {
                    console.log("✅ Avatar existe:", avatarUrl);
                    avatarPreview.src = avatarUrl;
                } else {
                    console.warn("❌ Avatar no encontrado:", avatarUrl);
                    avatarPreview.src = "default_avatar.png";
                }
            } catch (error) {
                console.error("Error verificando avatar:", error);
                avatarPreview.src = "default_avatar.png";
            }
        } else {
            console.log("Usando avatar por defecto");
            avatarPreview.src = "default_avatar.png";
        }
        
        // Manejar error de carga de imagen
        avatarPreview.onerror = function() {
            console.error("Error al cargar avatar, usando default:", this.src);
            this.src = "default_avatar.png";
        };
        
        // Cuenta
        document.getElementById("userId").textContent = usuario.id || "";
        document.getElementById("fechaRegistro").textContent = usuario.fecha_registro ? new Date(usuario.fecha_registro).toLocaleDateString() : "";
        document.getElementById("nivelUsuario").textContent = usuario.nivel || 1;
        document.getElementById("monedasUsuario").textContent = usuario.monedas || 0;
        
        // Cargar estadísticas
        cargarEstadisticas();
        
        console.log("Perfil cargado correctamente");
        
    } catch (error) {
        console.error("Error en cargarPerfil:", error);
        alert("No se pudo cargar el perfil. Error: " + error.message);
    }
}

// ==========================================
// CARGAR ESTADÍSTICAS
// ==========================================

async function cargarEstadisticas() {
    try {
        const respuesta = await fetch("http://127.0.0.1:5000/api/stats/user", {
            headers: {
                Authorization: "Bearer " + token
            }
        });
        
        if (!respuesta.ok) {
            return;
        }
        
        const stats = await respuesta.json();
        
        document.getElementById("totalJuegos").textContent = stats.total_juegos || 0;
        document.getElementById("totalAmigos").textContent = stats.total_amigos || 0;
        document.getElementById("totalLogros").textContent = stats.total_logros || 0;
        document.getElementById("totalLikes").textContent = stats.total_likes || 0;
        
    } catch (error) {
        console.error("Error en cargarEstadisticas:", error);
    }
}

// ==========================================
// GUARDAR PERFIL
// ==========================================

document.getElementById("formPerfil").addEventListener("submit", async function(e) {
    e.preventDefault();
    
    const boton = this.querySelector('button[type="submit"]');
    boton.disabled = true;
    boton.textContent = "Guardando...";
    
    try {
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
            alert(datos.mensaje || "Error al actualizar el perfil.");
            boton.disabled = false;
            boton.textContent = "💾 Guardar Cambios";
            return;
        }
        
        await fetch("http://127.0.0.1:5000/api/users/biografia", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({
                biografia: document.getElementById("biografia").value
            })
        });
        
        const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));
        if (usuarioLocal) {
            usuarioLocal.nombre = document.getElementById("nombre").value;
            localStorage.setItem("usuario", JSON.stringify(usuarioLocal));
        }
        
        alert("✅ Perfil actualizado correctamente.");
        cargarPerfil();
        
    } catch (error) {
        console.error("Error al guardar perfil:", error);
        alert("Error al actualizar el perfil.");
    } finally {
        boton.disabled = false;
        boton.textContent = "💾 Guardar Cambios";
    }
});

// ==========================================
// ACTUALIZAR AVATAR - CON VERIFICACIÓN
// ==========================================

document.getElementById("formAvatar").addEventListener("submit", async function(e) {
    e.preventDefault();
    
    const archivo = document.getElementById("avatarInput").files[0];
    if (!archivo) {
        alert("Selecciona una imagen.");
        return;
    }
    
    console.log("Subiendo archivo:", archivo.name, archivo.size, archivo.type);
    
    if (archivo.size > 5 * 1024 * 1024) {
        alert("La imagen es demasiado grande (máx 5MB).");
        return;
    }
    
    const boton = this.querySelector('button[type="submit"]');
    boton.disabled = true;
    boton.textContent = "Subiendo...";
    
    const formData = new FormData();
    formData.append("avatar", archivo);
    
    try {
        const respuesta = await fetch("http://127.0.0.1:5000/api/users/avatar", {
            method: "POST",
            headers: {
                Authorization: "Bearer " + token
            },
            body: formData
        });
        
        const datos = await respuesta.json();
        console.log("Respuesta del servidor:", datos);
        
        alert(datos.mensaje);
        
        if (datos.correcto) {
            console.log("✅ Avatar subido correctamente:", datos.avatar);
            console.log("URL del avatar:", datos.url);
            
            // Actualizar la vista previa
            const avatarPreview = document.getElementById("avatarPreview");
            
            // Usar la URL que devuelve el servidor
            if (datos.url) {
                avatarPreview.src = datos.url;
                console.log("Usando URL del servidor:", datos.url);
            } else {
                avatarPreview.src = `http://127.0.0.1:5000/uploads/avatars/${datos.avatar}`;
                console.log("Construyendo URL:", `http://127.0.0.1:5000/uploads/avatars/${datos.avatar}`);
            }
            
            avatarPreview.onerror = function() {
                console.error("Error al cargar el nuevo avatar");
                this.src = "default_avatar.png";
            };
            
            document.getElementById("avatarInput").value = "";
            
            // Recargar el perfil para actualizar todo
            setTimeout(cargarPerfil, 500);
        }
        
    } catch (error) {
        console.error("Error al subir avatar:", error);
        alert("Error al actualizar avatar: " + error.message);
    } finally {
        boton.disabled = false;
        boton.textContent = "🔄 Actualizar Avatar";
    }
});

// ==========================================
// CAMBIAR CONTRASEÑA
// ==========================================

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
        const respuesta = await fetch("http://127.0.0.1:5000/api/users/password", {
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
        console.error("Error al cambiar contraseña:", error);
        alert("Error al cambiar la contraseña.");
    } finally {
        boton.disabled = false;
        boton.textContent = "🔑 Cambiar Contraseña";
    }
});

// ==========================================
// ELIMINAR CUENTA
// ==========================================

function eliminarCuenta() {
    const confirmar = confirm("⚠️ ¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible.");
    if (!confirmar) return;
    
    const confirmar2 = confirm("Esto eliminará todos tus juegos, comentarios, likes y favoritos. ¿Continuar?");
    if (!confirmar2) return;
    
    const password = prompt("Ingresa tu contraseña para confirmar:");
    if (!password) return;
    
    alert("🔧 Funcionalidad en desarrollo. Por ahora, contacta al soporte.");
}

// ==========================================
// INICIAR
// ==========================================

document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM cargado, iniciando cargarPerfil...");
    cargarPerfil();
});