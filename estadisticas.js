// Configuración de la URL
const API_URL = 'https://zukzuk-fvhn.onrender.com';

console.log('Estadísticas - API_URL:', API_URL);

const token = localStorage.getItem("token");

if (!token) {
    alert("Debes iniciar sesión.");
    window.location.href = "login.html";
}

async function cargarEstadisticas() {
    try {
        const respuesta = await fetch(`${API_URL}/api/stats/user`, {
            headers: {
                Authorization: "Bearer " + token
            }
        });
        
        const stats = await respuesta.json();
        
        document.getElementById("totalJuegos").textContent = stats.total_juegos || 0;
        document.getElementById("totalLikes").textContent = stats.total_likes || 0;
        document.getElementById("totalVisitas").textContent = stats.total_visitas || 0;
        document.getElementById("totalFavoritos").textContent = stats.total_favoritos || 0;
        document.getElementById("totalAmigos").textContent = stats.total_amigos || 0;
        document.getElementById("totalLogros").textContent = stats.total_logros || 0;
        
        cargarTopJuegos();
        
    } catch (error) {
        console.error("Error cargando estadísticas:", error);
        alert("No se pudieron cargar las estadísticas.");
    }
}

async function cargarTopJuegos() {
    try {
        const respuesta = await fetch(`${API_URL}/api/mygames`, {
            headers: {
                Authorization: "Bearer " + token
            }
        });
        
        const juegos = await respuesta.json();
        const contenedor = document.getElementById("topJuegos");
        contenedor.innerHTML = "";
        
        if (juegos.length === 0) {
            contenedor.innerHTML = `
                <div class="alert alert-secondary">
                    No has creado juegos aún.
                </div>
            `;
            return;
        }
        
        const top = juegos.sort((a, b) => b.visitas - a.visitas).slice(0, 5);
        
        top.forEach((juego, index) => {
            const medalla = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
            contenedor.innerHTML += `
                <div class="d-flex align-items-center bg-secondary p-2 mb-2 rounded">
                    <span class="me-3" style="width:40px;">${medalla}</span>
                    <span class="flex-grow-1">${juego.nombre}</span>
                    <span class="text-muted">👁 ${juego.visitas || 0} ❤️ ${juego.likes || 0}</span>
                    <button class="btn btn-sm btn-success ms-2" onclick="verJuego(${juego.id})">
                        Ver
                    </button>
                </div>
            `;
        });
        
    } catch (error) {
        console.error("Error cargando top juegos:", error);
        document.getElementById("topJuegos").innerHTML = `
            <div class="alert alert-secondary">
                No se pudieron cargar los juegos.
            </div>
        `;
    }
}

function verJuego(id) {
    window.location.href = `juego.html?id=${id}`;
}

cargarEstadisticas();