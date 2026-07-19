// Configuración de la URL
const API_URL = 'https://zukzuk-fvhn.onrender.com';

console.log('Notificaciones - API_URL:', API_URL);

const token = localStorage.getItem("token");

if (!token) {
    alert("Debes iniciar sesión.");
    window.location.href = "login.html";
}

async function cargarNotificaciones() {
    try {
        const respuesta = await fetch(`${API_URL}/api/notifications`, {
            headers: {
                Authorization: "Bearer " + token
            }
        });
        
        const notificaciones = await respuesta.json();
        const contenedor = document.getElementById("listaNotificaciones");
        contenedor.innerHTML = "";
        
        if (notificaciones.length === 0) {
            contenedor.innerHTML = `
                <div class="alert alert-secondary">
                    No tienes notificaciones.
                </div>
            `;
            return;
        }
        
        let noLeidas = 0;
        
        notificaciones.forEach(noti => {
            if (!noti.leido) noLeidas++;
            
            const icono = noti.tipo === 'like' ? '❤️' : 
                         noti.tipo === 'comentario' ? '💬' :
                         noti.tipo === 'visita' ? '👁' :
                         noti.tipo === 'amigo' ? '👥' : '📌';
            
            contenedor.innerHTML += `
                <div class="noti-card ${noti.leido ? 'leida' : ''}" id="noti-${noti.id}">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <span class="noti-tipo">${icono}</span>
                            <span>${noti.mensaje}</span>
                        </div>
                        <div class="text-end">
                            <span class="noti-fecha">${new Date(noti.fecha).toLocaleDateString()}</span>
                            ${!noti.leido ? `
                                <button class="btn btn-sm btn-outline-info ms-2" onclick="marcarLeida(${noti.id})">
                                    ✓
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        
        document.getElementById("contadorNotificaciones").textContent = 
            `${noLeidas} notificaciones no leídas`;
        
    } catch (error) {
        console.error("Error cargando notificaciones:", error);
        document.getElementById("listaNotificaciones").innerHTML = `
            <div class="alert alert-danger">
                No se pudieron cargar las notificaciones.
            </div>
        `;
    }
}

async function marcarLeida(notificacionId) {
    try {
        await fetch(`${API_URL}/api/notifications/${notificacionId}/read`, {
            method: "PUT",
            headers: {
                Authorization: "Bearer " + token
            }
        });
        
        document.getElementById(`noti-${notificacionId}`).classList.add('leida');
        cargarNotificaciones();
        
    } catch (error) {
        console.error("Error marcando leída:", error);
        alert("Error al marcar como leída.");
    }
}

cargarNotificaciones();