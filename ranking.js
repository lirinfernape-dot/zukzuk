let tipoActual = 'likes';

async function cargarRanking(tipo) {
    tipoActual = tipo;
    
    // Actualizar tabs
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('tab' + tipo.charAt(0).toUpperCase() + tipo.slice(1)).classList.add('active');
    
    try {
        const respuesta = await fetch(`http://127.0.0.1:5000/api/ranking/${tipo}`);
        const datos = await respuesta.json();
        const contenedor = document.getElementById('rankingList');
        contenedor.innerHTML = '';
        
        if (datos.length === 0) {
            contenedor.innerHTML = `
                <div class="alert alert-secondary">
                    No hay datos disponibles.
                </div>
            `;
            return;
        }
        
        datos.forEach((item, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
            
            let html = `
                <div class="rank-card">
                    <div class="rank-number">${medal}</div>
            `;
            
            if (tipo === 'creadores') {
                html += `
                    <img 
                        src="http://127.0.0.1:5000/uploads/avatars/${item.avatar || 'default_avatar.png'}"
                        class="rank-avatar"
                        onerror="this.src='default_avatar.png'"
                    >
                    <div class="rank-info">
                        <h5 class="mb-0">${item.nombre}</h5>
                        <div class="rank-stats">
                            📁 ${item.total_juegos} juegos 
                            ❤️ ${item.total_likes} likes 
                            👁 ${item.total_visitas} visitas
                        </div>
                    </div>
                    <button class="btn btn-outline-info btn-sm" onclick="verPerfil(${item.id})">
                        Ver Perfil
                    </button>
                `;
            } else {
                html += `
                    <img 
                        src="http://127.0.0.1:5000/uploads/juegos/miniaturas/${item.miniatura || 'default_game.png'}"
                        class="rank-avatar"
                        onerror="this.src='default_game.png'"
                        style="border-radius:10px;"
                    >
                    <div class="rank-info">
                        <h5 class="mb-0">${item.nombre}</h5>
                        <div class="rank-stats">
                            ❤️ ${item.likes} likes 
                            👁 ${item.visitas} visitas 
                            ⭐ ${item.favoritos} favoritos
                        </div>
                    </div>
                    <button class="btn btn-success btn-sm" onclick="verJuego(${item.id})">
                        Ver Juego
                    </button>
                `;
            }
            
            html += `</div>`;
            contenedor.innerHTML += html;
        });
        
    } catch (error) {
        console.error(error);
        document.getElementById('rankingList').innerHTML = `
            <div class="alert alert-danger">
                No se pudo cargar el ranking.
            </div>
        `;
    }
}

function verPerfil(id) {
    window.location.href = `perfil.html?id=${id}`;
}

function verJuego(id) {
    window.location.href = `juego.html?id=${id}`;
}

// Cargar ranking inicial
cargarRanking('likes');