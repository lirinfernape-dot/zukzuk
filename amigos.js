const token = localStorage.getItem("token");

if (!token) {
    alert("Debes iniciar sesión.");
    window.location.href = "login.html";
}

async function cargarAmigos() {
    try {
        const respuesta = await fetch("http://127.0.0.1:5000/api/friends", {
            headers: {
                Authorization: "Bearer " + token
            }
        });
        
        const amigos = await respuesta.json();
        const contenedor = document.getElementById("listaAmigos");
        contenedor.innerHTML = "";
        
        if (amigos.length === 0) {
            contenedor.innerHTML = `
                <div class="alert alert-secondary">
                    No tienes amigos aún. Agrega amigos desde sus perfiles.
                </div>
            `;
            return;
        }
        
        amigos.forEach(amigo => {
            contenedor.innerHTML += `
                <div class="friend-card">
                    <div class="d-flex align-items-center">
                        <img 
                            src="http://127.0.0.1:5000/uploads/avatars/${amigo.avatar || 'default_avatar.png'}"
                            class="friend-avatar"
                            onerror="this.src='default_avatar.png'"
                        >
                        <span class="friend-name">${amigo.nombre}</span>
                    </div>
                    <div>
                        <button class="btn-ver-perfil" onclick="verPerfil(${amigo.id})">
                            Ver Perfil
                        </button>
                        <button class="btn btn-danger btn-sm ms-2" onclick="eliminarAmigo(${amigo.id})">
                            ✕
                        </button>
                    </div>
                </div>
            `;
        });
        
    } catch (error) {
        console.error(error);
        document.getElementById("listaAmigos").innerHTML = `
            <div class="alert alert-danger">
                No se pudieron cargar los amigos.
            </div>
        `;
    }
}

function verPerfil(id) {
    window.location.href = `perfil.html?id=${id}`;
}

async function eliminarAmigo(amigoId) {
    if (!confirm("¿Deseas eliminar este amigo?")) return;
    
    try {
        const respuesta = await fetch(`http://127.0.0.1:5000/api/friends/remove/${amigoId}`, {
            method: "DELETE",
            headers: {
                Authorization: "Bearer " + token
            }
        });
        
        const datos = await respuesta.json();
        alert(datos.mensaje);
        cargarAmigos();
        
    } catch (error) {
        console.error(error);
        alert("Error al eliminar amigo.");
    }
}

cargarAmigos();