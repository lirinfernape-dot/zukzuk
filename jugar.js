// Configuración de la URL
const API_URL = 'https://zukzuk-fvhn.onrender.com';

console.log('Jugar - API_URL:', API_URL);

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function cargarJuego() {
    try {
        const respuesta = await fetch(`${API_URL}/api/games/${id}`);
        const juego = await respuesta.json();
        
        document.getElementById("gameTitle").textContent = `🎮 ${juego.nombre}`;
        
        const frame = document.getElementById("gameFrame");
        
        if (juego.archivo && juego.archivo.endsWith('.zip')) {
            frame.srcdoc = `
                <html>
                    <body style="display:flex;justify-content:center;align-items:center;height:100vh;background:#1a1a1a;color:white;font-family:Arial;">
                        <div style="text-align:center;">
                            <h2>📦 ${juego.nombre}</h2>
                            <p>Versión: ${juego.version || '1.0.0'}</p>
                            <p style="color:#888;font-size:14px;">El juego está listo para jugar</p>
                            <div style="background:#2d2d2d;padding:20px;border-radius:10px;margin:20px auto;max-width:500px;">
                                <p style="color:#00d2ff;">🎮 Cargando juego...</p>
                                <div class="spinner-border text-info" role="status">
                                    <span class="visually-hidden">Cargando...</span>
                                </div>
                            </div>
                            <button onclick="window.location.href='juego.html?id=${id}'" 
                                    style="background:#28a745;color:white;border:none;padding:10px 30px;border-radius:5px;cursor:pointer;margin-top:20px;">
                                ↩️ Volver al juego
                            </button>
                        </div>
                    </body>
                </html>
            `;
        }
        
        await fetch(`${API_URL}/api/games/${id}/visit`, { method: "POST" });
        
    } catch (error) {
        console.error("Error cargando juego:", error);
        alert("No se pudo cargar el juego.");
    }
}

function salir() {
    window.location.href = "index.html";
}

cargarJuego();