// Configuración de la URL
const API_URL = 'https://zukzuk-fvhn.onrender.com';

console.log('Juego - API_URL:', API_URL);

const parametros = new URLSearchParams(window.location.search);
const id = parametros.get("id");
const token = localStorage.getItem("token");

let dioLike = false;
let esFavorito = false;

async function registrarVisita() {
    try {
        await fetch(`${API_URL}/api/games/${id}/visit`, {
            method: "POST"
        });
    } catch (error) {
        console.error("Error registrando visita:", error);
    }
}

async function cargarJuego() {
    try {
        const respuesta = await fetch(`${API_URL}/api/games/${id}`);
        
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
        
        const miniaturaUrl = juego.miniatura 
            ? `${API_URL}/uploads/juegos/${juego.miniatura}`
            : 'default_game.png';
        document.getElementById("miniatura").src = miniaturaUrl;
        
    } catch (error) {
        console.error("Error cargando juego:", error);
        alert("No se pudo cargar el juego.");
    }
}

async function comprobarLike() {
    if (!token) return;
    try {
        const respuesta = await fetch(`${API_URL}/api/games/${id}/like`, {
            headers: {
                Authorization: "Bearer " + token
            }
        });
        const datos = await respuesta.json();
        dioLike = datos.like;
        actualizarBotonLike();
    } catch (error) {
        console.error("Error comprobando like:", error);
    }
}

function actualizarBotonLike() {
    const boton = document.getElementById("btnLike");
    if (!boton) return;
    if (dioLike) {
        boton.className = "btn btn-secondary";
        boton.textContent = "💔 Quitar Like";
    } else {
        boton.className = "btn btn-danger";
        boton.textContent = "❤️ Like";
    }
}

async function darLike() {
    if (!token) {
        alert("Debes iniciar sesión.");
        return;
    }
    const metodo = dioLike ? "DELETE" : "POST";
    try {
        const respuesta = await fetch(`${API_URL}/api/games/${id}/like`, {
            method: metodo,
            headers: {
                Authorization: "Bearer " + token
            }
        });
        const datos = await respuesta.json();
        if (datos.correcto) {
            dioLike = !dioLike;
            actualizarBotonLike();
            cargarJuego();
        }
    } catch (error) {
        console.error("Error dando like:", error);
    }
}

async function comprobarFavorito() {
    if (!token) return;
    try {
        const respuesta = await fetch(`${API_URL}/api/games/${id}/favorite`, {
            headers: {
                Authorization: "Bearer " + token
            }
        });
        const datos = await respuesta.json();
        esFavorito = datos.favorito;
        actualizarBotonFavorito();
    } catch (error) {
        console.error("Error comprobando favorito:", error);
    }
}

function actualizarBotonFavorito() {
    const boton = document.getElementById("btnFavorito");
    if (!boton) return;
    if (esFavorito) {
        boton.className = "btn btn-secondary";
        boton.textContent = "⭐ Quitar Favorito";
    } else {
        boton.className = "btn btn-warning";
        boton.textContent = "⭐ Agregar a Favoritos";
    }
}

async function favorito() {
    if (!token) {
        alert("Debes iniciar sesión.");
        return;
    }
    const metodo = esFavorito ? "DELETE" : "POST";
    try {
        const respuesta = await fetch(`${API_URL}/api/games/${id}/favorite`, {
            method: metodo,
            headers: {
                Authorization: "Bearer " + token
            }
        });
        const datos = await respuesta.json();
        if (datos.correcto) {
            esFavorito = !esFavorito;
            actualizarBotonFavorito();
            cargarJuego();
        }
    } catch (error) {
        console.error("Error en favorito:", error);
    }
}

function jugar() {
    window.location.href = `jugar.html?id=${id}`;
}

function reportar() {
    window.location.href = `reportar.html?id=${id}`;
}

async function iniciar() {
    await registrarVisita();
    await cargarJuego();
    await comprobarLike();
    await comprobarFavorito();
    document.getElementById("btnLike").addEventListener("click", darLike);
    document.getElementById("btnFavorito").addEventListener("click", favorito);
    document.getElementById("jugar").addEventListener("click", jugar);
}

iniciar();