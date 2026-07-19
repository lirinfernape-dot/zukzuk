// Configuración de la URL
const API_URL = 'https://zukzuk-fvhn.onrender.com';

console.log('Logros - API_URL:', API_URL);

const token = localStorage.getItem("token");

if (!token) {
    alert("Debes iniciar sesión.");
    window.location.href = "login.html";
}

async function cargarLogros() {
    try {
        const respuesta = await fetch(`${API_URL}/api/achievements`, {
            headers: {
                Authorization: "Bearer " + token
            }
        });
        
        const logros = await respuesta.json();
        const contenedor = document.getElementById("listaLogros");
        contenedor.innerHTML = "";
        
        if (logros.length === 0) {
            contenedor.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-secondary">
                        No hay logros disponibles.
                    </div>
                </div>
            `;
            return;
        }
        
        let desbloqueados = logros.filter(l => l.desbloqueado).length;
        
        contenedor.innerHTML = `
            <div class="col-12 mb-3">
                <div class="alert alert-info">
                    🏆 Has desbloqueado ${desbloqueados} de ${logros.length} logros
                    (${Math.round(desbloqueados/logros.length*100)}%)
                </div>
            </div>
        `;
        
        logros.forEach(logro => {
            contenedor.innerHTML += `
                <div class="col-md-3 mb-4">
                    <div class="achievement-card ${logro.desbloqueado ? 'unlocked' : 'locked'}">
                        <div class="icon">${logro.icono || '🏆'}</div>
                        <h6>${logro.nombre}</h6>
                        <p class="small text-muted">${logro.descripcion}</p>
                        <span class="points">+${logro.puntos} pts</span>
                        ${logro.desbloqueado ? 
                            `<p class="fecha">✅ Desbloqueado: ${new Date(logro.fecha_desbloqueo).toLocaleDateString()}</p>` :
                            '<p class="fecha">🔒 Bloqueado</p>'
                        }
                    </div>
                </div>
            `;
        });
        
    } catch (error) {
        console.error("Error cargando logros:", error);
        document.getElementById("listaLogros").innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    No se pudieron cargar los logros.
                </div>
            </div>
        `;
    }
}

cargarLogros();