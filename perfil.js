const params = new URLSearchParams(window.location.search);
const usuarioId = params.get("id");
const token = localStorage.getItem("token");

let usuarioActual = null;

// ==========================================
// CARGAR PERFIL
// ==========================================

async function cargarPerfil() {
    try {
        let url = "http://127.0.0.1:5000/api/users/perfil";
        
        if (usuarioId) {
            url = `http://127.0.0.1:5000/api/users/perfil/${usuarioId}`;
        }
        
        const respuesta = await fetch(url, {
            headers: {
                Authorization: "Bearer " + token
            }
        });
        
        if (!respuesta.ok) {
            if (respuesta.status === 401) {
                alert("Debes iniciar sesión.");
                window.location.href = "login.html";
                return;
            }
            alert("Usuario no encontrado.");
            window.location.href = "index.html";
            return;
        }
        
        const datos = await respuesta.json();
        
        if (!datos.correcto) {
            alert(datos.mensaje || "Error al cargar el perfil.");
            return;
        }
        
        usuarioActual = datos.usuario;
        
        mostrarPerfil(usuarioActual);
        cargarJuegosUsuario(usuarioActual.id);
        
    } catch (error) {
        console.error("Error en cargarPerfil:", error);
        document.getElementById("nombrePerfil").textContent = "Error al cargar";
        alert("No se pudo cargar el perfil. Verifica que el servidor esté ejecutándose.");
    }
}

// ==========================================
// MOSTRAR PERFIL
// ==========================================

function mostrarPerfil(usuario) {
    document.getElementById("nombrePerfil").textContent = usuario.nombre || "Sin nombre";
    document.getElementById("biografiaPerfil").textContent = usuario.biografia || "Sin biografía";
    document.getElementById("nivel").textContent = usuario.nivel || 1;
    document.getElementById("monedas").textContent = usuario.monedas || 0;
    document.getElementById("nombreJuegos").textContent = usuario.nombre || "Usuario";
    
    // Mostrar avatar - CORREGIDO
    const avatarImg = document.getElementById("avatar");
    
    if (usuario.avatar && usuario.avatar !== "default_avatar.png" && usuario.avatar !== "null" && usuario.avatar !== "") {
        avatarImg.src = `http://127.0.0.1:5000/uploads/avatars/${usuario.avatar}`;
        console.log("Avatar cargado:", avatarImg.src);
    } else {
        avatarImg.src = "default_avatar.png";
        console.log("Avatar por defecto");
    }
    
    // Manejar error de carga de imagen
    avatarImg.onerror = function() {
        console.error("Error al cargar avatar:", this.src);
        this.src = "default_avatar.png";
    };
    
    const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));
    if (usuarioLocal && usuarioLocal.id === usuario.id) {
        document.getElementById("btnEditarPerfil").style.display = "inline-block";
    }
    
    // Mostrar botón de agregar amigo si es otro usuario
    if (usuarioLocal && usuarioId && usuarioLocal.id != usuarioId) {
        document.getElementById("btnAgregarAmigo").style.display = "inline-block";
    }
}

// ==========================================
// CARGAR JUEGOS DEL USUARIO
// ==========================================

async function cargarJuegosUsuario(idUsuario) {
    try {
        const respuesta = await fetch(
            `http://127.0.0.1:5000/api/mygames/${idUsuario}`
        );
        
        if (!respuesta.ok) {
            throw new Error(`Error ${respuesta.status}`);
        }
        
        const juegos = await respuesta.json();
        const contenedor = document.getElementById("juegosUsuario");
        contenedor.innerHTML = "";
        
        if (juegos.length === 0) {
            contenedor.innerHTML = `
                <div class="alert alert-secondary">
                    Este usuario no ha publicado juegos aún.
                </div>
            `;
            return;
        }
        
        juegos.forEach(juego => {
            const miniaturaUrl = juego.miniatura ? 
                `http://127.0.0.1:5000/uploads/juegos/miniaturas/${juego.miniatura}` :
                'default_game.png';
            
            contenedor.innerHTML += `
                <div class="col-md-4 mb-3">
                    <div class="card bg-secondary h-100">
                        <img 
                            src="${miniaturaUrl}"
                            class="card-img-top"
                            style="height:150px;object-fit:cover;"
                            onerror="this.src='default_game.png'"
                        >
                        <div class="card-body">
                            <h6>${juego.nombre}</h6>
                            <p class="small text-muted">${juego.descripcion || 'Sin descripción'}</p>
                            <p class="small">
                                👁 ${juego.visitas || 0} 
                                ❤️ ${juego.likes || 0}
                            </p>
                            <button 
                                class="btn btn-success btn-sm w-100"
                                onclick="window.location.href='juego.html?id=${juego.id}'"
                            >
                                Ver Juego
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
    } catch (error) {
        console.error("Error en cargarJuegosUsuario:", error);
        document.getElementById("juegosUsuario").innerHTML = `
            <div class="alert alert-danger">
                No se pudieron cargar los juegos.
            </div>
        `;
    }
}

// ==========================================
// AGREGAR AMIGO
// ==========================================

async function agregarAmigo() {
    if (!usuarioActual) return;
    
    try {
        const respuesta = await fetch("http://127.0.0.1:5000/api/friends/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({
                amigo_id: usuarioActual.id
            })
        });
        
        const datos = await respuesta.json();
        alert(datos.mensaje);
        
        if (datos.correcto) {
            document.getElementById("btnAgregarAmigo").textContent = "✅ Amigo";
            document.getElementById("btnAgregarAmigo").disabled = true;
        }
        
    } catch (error) {
        console.error("Error al agregar amigo:", error);
        alert("Error al agregar amigo.");
    }
}

// ==========================================
// INICIAR
// ==========================================

// Verificar token al cargar
if (!token) {
    alert("Debes iniciar sesión.");
    window.location.href = "login.html";
} else {
    cargarPerfil();
}