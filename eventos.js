const token = localStorage.getItem("token");

async function cargarEventos() {
    try {
        const respuesta = await fetch("http://127.0.0.1:5000/api/events/active");
        const eventos = await respuesta.json();
        const contenedor = document.getElementById("listaEventos");
        contenedor.innerHTML = "";
        
        if (eventos.length === 0) {
            contenedor.innerHTML = `
                <div class="alert alert-secondary">
                    No hay eventos activos en este momento.
                </div>
            `;
            return;
        }
        
        eventos.forEach(evento => {
            const tipoClass = evento.tipo || 'normal';
            
            contenedor.innerHTML += `
                <div class="event-card">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h5>${evento.nombre}</h5>
                            <p class="text-muted">${evento.descripcion || 'Sin descripción'}</p>
                            <div>
                                <span class="event-type ${tipoClass}">${evento.tipo || 'Normal'}</span>
                                ${evento.recompensa ? `<span class="event-reward ms-2">🪙 +${evento.recompensa} monedas</span>` : ''}
                            </div>
                            ${evento.fecha_inicio ? `<p class="small text-muted mt-2">Inicia: ${new Date(evento.fecha_inicio).toLocaleDateString()}</p>` : ''}
                        </div>
                        <div>
                            <button class="btn btn-success" onclick="participarEvento(${evento.id})">
                                🎯 Participar
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
    } catch (error) {
        console.error(error);
        document.getElementById("listaEventos").innerHTML = `
            <div class="alert alert-danger">
                No se pudieron cargar los eventos.
            </div>
        `;
    }
}

async function participarEvento(eventoId) {
    if (!token) {
        alert("Debes iniciar sesión.");
        window.location.href = "login.html";
        return;
    }
    
    try {
        const respuesta = await fetch(`http://127.0.0.1:5000/api/events/participate/${eventoId}`, {
            method: "POST",
            headers: {
                Authorization: "Bearer " + token
            }
        });
        
        const datos = await respuesta.json();
        alert(datos.mensaje + (datos.recompensa ? ` Ganaste ${datos.recompensa} monedas!` : ''));
        
        if (datos.correcto) {
            cargarEventos();
        }
        
    } catch (error) {
        console.error(error);
        alert("Error al participar en el evento.");
    }
}

cargarEventos();