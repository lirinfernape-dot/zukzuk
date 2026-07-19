// Configuración de la URL
const API_URL = 'https://zukzuk-fvhn.onrender.com';

console.log('Index - API_URL:', API_URL);

async function cargarJuegos() {
    try {
        const respuesta = await fetch(`${API_URL}/api/games`);
        const juegos = await respuesta.json();
        const contenedor = document.getElementById("listaJuegos");
        contenedor.innerHTML = "";

        juegos.forEach(juego => {
            const miniaturaUrl = juego.miniatura 
                ? `${API_URL}/uploads/juegos/miniaturas/${juego.miniatura}`
                : 'default_game.png';

            contenedor.innerHTML += `
                <div class="col-md-4 mb-4">
                    <div class="card bg-dark text-white h-100">
                        <img
                            src="${miniaturaUrl}"
                            class="card-img-top"
                            style="height:200px; object-fit:cover;"
                            onerror="this.src='default_game.png'"
                        >
                        <div class="card-body">
                            <h5>${juego.nombre}</h5>
                            <p>${juego.descripcion || 'Sin descripción'}</p>
                            <small>
                                👁 ${juego.visitas || 0}
                                ❤️ ${juego.likes || 0}
                                ⭐ ${juego.favoritos || 0}
                            </small>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error cargando juegos:", error);
        document.getElementById("listaJuegos").innerHTML = `
            <div class="alert alert-danger">
                No se pudieron cargar los juegos. Verifica tu conexión.
            </div>
        `;
    }
}

cargarJuegos();