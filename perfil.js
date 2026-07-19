// Configuración de la URL
const API_URL = 'https://zukzuk-fvhn.onrender.com';

console.log('Perfil - API_URL:', API_URL);

const params = new URLSearchParams(window.location.search);
const usuarioId = params.get("id");
const token = localStorage.getItem("token");

let usuarioActual = null;

async function cargarPerfil() {
    try {
        let url = `${API_URL}/api/users/perfil`;
        
        if (usuarioId) {
            url = `${API_URL}/api/users/perfil/${usuarioId}`;
        }
        
        console.log('Cargando perfil desde:', url);

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
        alert("No se pudo cargar el perfil. Error: " + error.message);
    }
}

function mostrarPerfil(usuario) {
    document.getElementById("nombrePerfil").textContent = usuario.nombre || "Sin nombre";
    document.getElementById("biografiaPerfil").textContent = usuario.biografia || "Sin biografía";
    document.getElementById("nivel").textContent = usuario.nivel || 1;
    document.getElementById("monedas").textContent = usuario.monedas || 0;
    document.getElementById("nombreJuegos").textContent = usuario.nombre || "Usuario";
    
    const avatarImg = document.getElementById("avatar");
    if (usuario.avatar && usuario.avatar !== "default_avatar.png") {
        avatarImg.src = `${API_URL}/uploads/avatars/${usuario.avatar}`;
    } else {
        avatarImg.src = "default_avatar.png";
    }
    
    avatarImg.onerror = function() {
        this.src = "default_avatar.png";
    };
    
    const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));
    if (usuarioLocal && usuarioLocal.id === usuario.id) {
        document.getElementById("btnEditarPerfil").style.display = "inline-block";
    }
    
    if (usuarioLocal && usuarioId && usuarioLocal.id != usuarioId) {
        document.getElementById("btnAgregarAmigo").style.display = "inline-block";
    }
}

async function cargarJuegosUsuario(idUsuario) {
    try {
        const respuesta = await fetch(`${API_URL}/api/mygames/${idUsuario}`);
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
                `${API_URL}/uploads/juegos/miniaturas/${juego.miniatura}` :
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

async function agregarAmigo() {
    if (!usuarioActual) return;
    
    try {
        const respuesta = await fetch(`${API_URL}/api/friends/add`, {
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

if (!token) {
    alert("Debes iniciar sesión.");
    window.location.href = "login.html";
} else {
    cargarPerfil();
}