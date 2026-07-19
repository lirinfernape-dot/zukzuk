async function cargarJuegos() {

    try {

        const respuesta = await fetch("http://127.0.0.1:5000/api/games");

        const juegos = await respuesta.json();

        const contenedor = document.getElementById("listaJuegos");

        contenedor.innerHTML = "";

        juegos.forEach(juego => {

            contenedor.innerHTML += `

            <div class="col-md-4 mb-4">

                <div class="card bg-dark text-white h-100">

                    <img
                        src="http://127.0.0.1:5000/uploads/juegos/miniaturas/${juego.miniatura}"
                        class="card-img-top"
                        style="height:200px; object-fit:cover;">

                    <div class="card-body">

                        <h5>${juego.nombre}</h5>

                        <p>${juego.descripcion}</p>

                        <small>

                            👁 ${juego.visitas}

                            ❤️ ${juego.likes}

                            ⭐ ${juego.favoritos}

                        </small>

                    </div>

                </div>

            </div>

            `;

        });

    }

    catch(error){

        console.error(error);

    }

}

cargarJuegos();

// Obtener monedas del usuario
async function obtenerMonedas() {
    try {
        const token = localStorage.getItem("token");
        const respuesta = await fetch("http://127.0.0.1:5000/api/users/perfil", {
            headers: {
                Authorization: "Bearer " + token
            }
        });
        const datos = await respuesta.json();
        if (datos.correcto) {
            document.getElementById("monedasUsuario").textContent = datos.usuario.monedas || 0;
        }
    } catch (error) {
        console.error(error);
    }
}

// Llamar a la función
obtenerMonedas();
