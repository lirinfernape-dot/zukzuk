const token = localStorage.getItem("token");

if (!token) {
    alert("Debes iniciar sesión.");
    window.location.href = "login.html";
}

let tipoActual = 'inbox';

async function cargarMensajes(tipo) {
    tipoActual = tipo;
    
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('tab' + tipo.charAt(0).toUpperCase() + tipo.slice(1)).classList.add('active');
    
    try {
        const url = tipo === 'inbox' 
            ? "http://127.0.0.1:5000/api/messages/inbox"
            : "http://127.0.0.1:5000/api/messages/sent";
        
        const respuesta = await fetch(url, {
            headers: {
                Authorization: "Bearer " + token
            }
        });
        
        const mensajes = await respuesta.json();
        const contenedor = document.getElementById("listaMensajes");
        contenedor.innerHTML = "";
        
        if (mensajes.length === 0) {
            contenedor.innerHTML = `
                <div class="alert alert-secondary">
                    No tienes mensajes.
                </div>
            `;
            return;
        }
        
        mensajes.forEach(msg => {
            const avatar = tipo === 'inbox' ? msg.remitente_avatar : 'default_avatar.png';
            const nombre = tipo === 'inbox' ? msg.remitente_nombre : msg.destinatario_nombre;
            
            contenedor.innerHTML += `
                <div class="msg-card ${msg.leido ? 'leido' : ''}" onclick="verMensaje(${msg.id})">
                    <div class="d-flex align-items-center">
                        <img 
                            src="http://127.0.0.1:5000/uploads/avatars/${avatar || 'default_avatar.png'}"
                            class="msg-avatar"
                            onerror="this.src='default_avatar.png'"
                        >
                        <div class="ms-3 flex-grow-1">
                            <strong>${nombre}</strong>
                            <p class="mb-0">${msg.mensaje.substring(0, 50)}${msg.mensaje.length > 50 ? '...' : ''}</p>
                        </div>
                        <div class="text-end">
                            <span class="msg-fecha">${new Date(msg.fecha).toLocaleDateString()}</span>
                            ${!msg.leido && tipo === 'inbox' ? '<span class="badge bg-danger ms-2">Nuevo</span>' : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        
    } catch (error) {
        console.error(error);
        document.getElementById("listaMensajes").innerHTML = `
            <div class="alert alert-danger">
                No se pudieron cargar los mensajes.
            </div>
        `;
    }
}

function verMensaje(id) {
    // Marcar como leído
    fetch(`http://127.0.0.1:5000/api/messages/${id}/read`, {
        method: "PUT",
        headers: {
            Authorization: "Bearer " + token
        }
    });
    
    // Recargar mensajes
    cargarMensajes(tipoActual);
}

function nuevoMensaje() {
    const destinatario = prompt("ID del usuario al que quieres enviar mensaje:");
    if (!destinatario) return;
    
    const mensaje = prompt("Escribe tu mensaje:");
    if (!mensaje) return;
    
    enviarMensaje(parseInt(destinatario), mensaje);
}

async function enviarMensaje(destinatarioId, mensaje) {
    try {
        const respuesta = await fetch("http://127.0.0.1:5000/api/messages/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({
                destinatario_id: destinatarioId,
                mensaje: mensaje
            })
        });
        
        const datos = await respuesta.json();
        alert(datos.mensaje);
        
        if (datos.correcto) {
            cargarMensajes(tipoActual);
        }
        
    } catch (error) {
        console.error(error);
        alert("Error al enviar mensaje.");
    }
}

cargarMensajes('inbox');