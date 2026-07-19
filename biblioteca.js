// Configuración de la URL
const API_URL = 'https://zukzuk-fvhn.onrender.com';

console.log('Biblioteca - API_URL:', API_URL);

const token = localStorage.getItem("token");

if (!token) {
    alert("Debes iniciar sesión.");
    window.location.href = "login.html";
}

async function cargarBiblioteca() {
    try {
        const respuesta = await fetch(`${API_URL}/api/library`, {
            headers: {
                Authorization: "Bearer " + token
            }
        });

        const juegos = await respuesta.json();
        const contenedor = document.getElementById("biblioteca");
        contenedor.innerHTML = "";

        if (juegos.length === 0) {
            contenedor.innerHTML = `
                <div class="alert alert-secondary">
                    No tienes juegos en tu biblioteca.
                </div>
            `;
            return;
        }

        juegos.forEach(juego => {
            const miniaturaUrl = juego.miniatura 
                ? `${API_URL}/uploads/juegos/${juego.miniatura}`
                : 'default_game.png';

            contenedor.innerHTML += `
                <div class="col-md-3 mb-4">
                    <div class="card h-100">
                        <img
                            src="${miniaturaUrl}"
                            class="card-img-top"
                            style="height:180px;object-fit:cover;"
                            onerror="this.src='default_game.png'"
                        >
                        <div class="card-body">
                            <h5>${juego.nombre}</h5>
                            <p>${juego.categoria || 'Sin categoría'}</p>
                            <button
                                class="btn btn-success w-100"
                                onclick="window.location='juego.html?id=${juego.id}'">
                                Abrir
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.error("Error cargando biblioteca:", error);
        document.getElementById("biblioteca").innerHTML = `
            <div class="alert alert-danger">
                No se pudieron cargar los juegos.
            </div>
        `;
    }
}

cargarBiblioteca();