const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const token = localStorage.getItem("token");

async function cargarJuego() {
    try {
        const respuesta = await fetch(`http://127.0.0.1:5000/api/games/${id}`);
        const juego = await respuesta.json();
        
        document.getElementById("gameTitle").textContent = `🎮 ${juego.nombre}`;
        
        // Cargar el juego en el iframe
        const frame = document.getElementById("gameFrame");
        const archivoUrl = `http://127.0.0.1:5000/uploads/juegos/${juego.archivo}`;
        
        // Si es un archivo .zip, mostramos un mensaje
        if (juego.archivo && juego.archivo.endsWith('.zip')) {
            frame.srcdoc = `
                <html>
                    <body style="display:flex;justify-content:center;align-items:center;height:100vh;background:#1a1a1a;color:white;font-family:Arial;">
                        <div style="text-align:center;">
                            <h2>📦 Juego cargado</h2>
                            <p>El archivo ${juego.archivo} está listo para jugar</p>
                            <p style="color:#888;font-size:14px;">(En una versión completa, aquí se ejecutaría el juego)</p>
                            <button onclick="window.location.href='index.html'" 
                                    style="background:#28a745;color:white;border:none;padding:10px 30px;border-radius:5px;cursor:pointer;margin-top:20px;">
                                Volver al inicio
                            </button>
                        </div>
                    </body>
                </html>
            `;
        }
        
        // Registrar visita
        await fetch(`http://127.0.0.1:5000/api/games/${id}/visit`, { method: "POST" });
        
    } catch (error) {
        console.error(error);
        alert("No se pudo cargar el juego.");
    }
}

function salir() {
    window.location.href = "index.html";
}

cargarJuego();