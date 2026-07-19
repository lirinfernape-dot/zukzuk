// ==========================================
// VARIABLES
// ==========================================

const parametros = new URLSearchParams(window.location.search);

const id = parametros.get("id");

const token = localStorage.getItem("token");

let dioLike = false;
let esFavorito = false;


// ==========================================
// REGISTRAR VISITA
// ==========================================

async function registrarVisita() {

    try {

        await fetch(
            "http://127.0.0.1:5000/api/games/" + id + "/visit",
            {
                method: "POST"
            }
        );

    } catch (error) {

        console.error(error);

    }

}


// ==========================================
// CARGAR JUEGO
// ==========================================

async function cargarJuego() {

    try {

        const respuesta = await fetch(
            "http://127.0.0.1:5000/api/games/" + id
        );

        if (!respuesta.ok) {

            alert("Juego no encontrado.");

            window.location.href = "index.html";

            return;

        }

        const juego = await respuesta.json();

        document.getElementById("nombre").textContent = juego.nombre;
        document.getElementById("descripcion").textContent = juego.descripcion;
        document.getElementById("categoria").textContent = juego.categoria;
        document.getElementById("version").textContent = juego.version;
        document.getElementById("likes").textContent = juego.likes;
        document.getElementById("favoritos").textContent = juego.favoritos;
        document.getElementById("visitas").textContent = juego.visitas;

        document.getElementById("miniatura").src =
            "http://127.0.0.1:5000/uploads/juegos/" +
            juego.miniatura;

    } catch (error) {

        console.error(error);

        alert("No se pudo cargar el juego.");

    }

}


// ==========================================
// COMPROBAR LIKE
// ==========================================

async function comprobarLike() {

    if (!token) return;

    try {

        const respuesta = await fetch(

            "http://127.0.0.1:5000/api/games/" + id + "/like",

            {

                headers: {

                    Authorization: "Bearer " + token

                }

            }

        );

        const datos = await respuesta.json();

        dioLike = datos.like;

        actualizarBotonLike();

    }

    catch (error) {

        console.error(error);

    }

}


// ==========================================
// ACTUALIZAR BOTÓN LIKE
// ==========================================

function actualizarBotonLike() {

    const boton = document.getElementById("btnLike");

    if (!boton) return;

    if (dioLike) {

        boton.className = "btn btn-secondary";

        boton.textContent = "💔 Quitar Like";

    }

    else {

        boton.className = "btn btn-danger";

        boton.textContent = "❤️ Like";

    }

}


// ==========================================
// LIKE
// ==========================================

async function darLike() {

    if (!token) {

        alert("Debes iniciar sesión.");

        return;

    }

    const metodo = dioLike ? "DELETE" : "POST";

    const respuesta = await fetch(

        "http://127.0.0.1:5000/api/games/" + id + "/like",

        {

            method: metodo,

            headers: {

                Authorization: "Bearer " + token

            }

        }

    );

    const datos = await respuesta.json();

    if (datos.correcto) {

        dioLike = !dioLike;

        actualizarBotonLike();

        cargarJuego();

    }

}


// ==========================================
// COMPROBAR FAVORITO
// ==========================================

async function comprobarFavorito() {

    if (!token) return;

    const respuesta = await fetch(

        "http://127.0.0.1:5000/api/games/" + id + "/favorite",

        {

            headers: {

                Authorization: "Bearer " + token

            }

        }

    );

    const datos = await respuesta.json();

    esFavorito = datos.favorito;

    actualizarBotonFavorito();

}


// ==========================================
// ACTUALIZAR BOTÓN FAVORITO
// ==========================================

function actualizarBotonFavorito() {

    const boton = document.getElementById("btnFavorito");

    if (!boton) return;

    if (esFavorito) {

        boton.className = "btn btn-secondary";

        boton.textContent = "⭐ Quitar Favorito";

    }

    else {

        boton.className = "btn btn-warning";

        boton.textContent = "⭐ Agregar a Favoritos";

    }

}


// ==========================================
// FAVORITO
// ==========================================

async function favorito() {

    if (!token) {

        alert("Debes iniciar sesión.");

        return;

    }

    const metodo = esFavorito ? "DELETE" : "POST";

    const respuesta = await fetch(

        "http://127.0.0.1:5000/api/games/" + id + "/favorite",

        {

            method: metodo,

            headers: {

                Authorization: "Bearer " + token

            }

        }

    );

    const datos = await respuesta.json();

    if (datos.correcto) {

        esFavorito = !esFavorito;

        actualizarBotonFavorito();

        cargarJuego();

    }

}


// ==========================================
// BOTÓN JUGAR
// ==========================================

function jugar() {

    alert("Próximamente podrás jugar este juego.");

}

function reportar() {
    window.location.href = `reportar.html?id=${id}`;
}


// ==========================================
// INICIAR
// ==========================================

async function iniciar() {

    await registrarVisita();

    await cargarJuego();

    await comprobarLike();

    await comprobarFavorito();

    document
        .getElementById("btnLike")
        .addEventListener("click", darLike);

    document
        .getElementById("btnFavorito")
        .addEventListener("click", favorito);

    document
        .getElementById("jugar")
        .addEventListener("click", jugar);

}

iniciar();