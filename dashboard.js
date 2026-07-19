const token = localStorage.getItem("token");

if (!token) {

    alert("Debes iniciar sesión.");

    window.location.href = "login.html";

}

async function cargarJuegos() {

    try {

        const respuesta = await fetch(

            "http://127.0.0.1:5000/api/mygames",

            {

                headers: {

                    Authorization: "Bearer " + token

                }

            }

        );

        const juegos = await respuesta.json();

        const lista = document.getElementById("listaJuegos");

        lista.innerHTML = "";

        if (juegos.length === 0) {

            lista.innerHTML = `

                <div class="alert alert-secondary">

                    Todavía no has publicado ningún juego.

                </div>

            `;

            return;

        }

        juegos.forEach(juego => {

            lista.innerHTML += `

            <div class="card mb-3 shadow">

                <div class="card-body">

                    <h4>${juego.nombre}</h4>

                    <p>${juego.descripcion}</p>

                    <p>

                        👁 ${juego.visitas}

                        ❤️ ${juego.likes}

                        ⭐ ${juego.favoritos}

                    </p>

                    <div class="d-grid gap-2">

                        <button

                            class="btn btn-success"

                            onclick="verJuego(${juego.id})">

                            Ver Juego

                        </button>

                        <button

                            class="btn btn-warning"

                            onclick="editar(${juego.id})">

                            Editar

                        </button>

                        <button

                            class="btn btn-danger"

                            onclick="eliminar(${juego.id})">

                            Eliminar

                        </button>

                    </div>

                </div>

            </div>

            `;

        });

    }

    catch (error) {

        console.error(error);

        alert("No se pudieron cargar los juegos.");

    }

}

cargarJuegos();

function verJuego(id) {

    window.location.href = "juego.html?id=" + id;

}

function editar(id) {

    window.location.href = "editarJuego.html?id=" + id;

}

async function eliminar(id) {

    const confirmar = confirm(

        "¿Deseas eliminar este juego?"

    );

    if (!confirmar) {

        return;

    }

    try {

        const respuesta = await fetch(

            "http://127.0.0.1:5000/api/games/" + id,

            {

                method: "DELETE",

                headers: {

                    Authorization: "Bearer " + token

                }

            }

        );

        const datos = await respuesta.json();

        alert(datos.mensaje);

        cargarJuegos();

    }

    catch (error) {

        console.error(error);

        alert("No se pudo eliminar el juego.");

    }

    

}

async function subirArchivoJuego() {
    const archivoInput = document.getElementById("archivoJuego");
    const archivo = archivoInput.files[0];
    
    if (!archivo) {
        alert("Selecciona un archivo primero.");
        return;
    }

    // Obtener ID del juego desde algún lugar (ej: input hidden)
    // Por ahora asumimos que tienes un campo oculto con el ID
    const juegoId = document.getElementById("juegoId")?.value || 1;
    
    const formData = new FormData();
    formData.append("archivo", archivo);

    try {
        const respuesta = await fetch(
            `http://127.0.0.1:5000/api/games/${juegoId}/upload`,
            {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + token
                },
                body: formData
            }
        );

        const datos = await respuesta.json();
        
        if (datos.correcto) {
            alert("Archivo subido correctamente.");
        } else {
            alert(datos.mensaje || "Error al subir el archivo.");
        }
    } catch (error) {
        console.error(error);
        alert("No se pudo subir el archivo.");
    }
}