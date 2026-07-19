// Configuración de la URL
const API_URL = 'https://zukzuk-fvhn.onrender.com';

console.log('Inicio - API_URL:', API_URL);

async function cargarInicio() {
    try {
        const respuesta = await fetch(`${API_URL}/api/store`);
        const juegos = await respuesta.json();
        const lista = document.getElementById("listaJuegos");
        lista.innerHTML = "";

        juegos.forEach(juego => {
            const miniaturaUrl = juego.miniatura 
                ? `${API_URL}/uploads/juegos/${juego.miniatura}`
                : 'default_game.png';

            lista.innerHTML += `
                <div class="col-md-3">
                    <div class="card mb-4 shadow">
                        <img
                            src="${miniaturaUrl}"
                            class="card-img-top"
                            style="height:180px;object-fit:cover;"
                            onerror="this.src='default_game.png'"
                        >
                        <div class="card-body">
                            <h5>${juego.nombre}</h5>
                            <p>${juego.descripcion || 'Sin descripción'}</p>
                            <p>
                                ❤️ ${juego.likes || 0}
                                👁 ${juego.visitas || 0}
                            </p>
                            <button
                                class="btn btn-success w-100"
                                onclick="abrirJuego(${juego.id})">
                                Ver Juego
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error cargando inicio:", error);
        document.getElementById("listaJuegos").innerHTML = `
            <div class="alert alert-danger">
                No se pudieron cargar los juegos. Verifica tu conexión.
            </div>
        `;
    }
}

function abrirJuego(id) {
    window.location.href = `juego.html?id=${id}`;
}

async function buscarJuego() {
    const texto = document.getElementById("busqueda").value;
    try {
        const respuesta = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(texto)}`);
        const juegos = await respuesta.json();
        mostrarJuegos(juegos);
    } catch (error) {
        console.error("Error buscando:", error);
        alert("Error al buscar juegos.");
    }
}

cargarInicio();