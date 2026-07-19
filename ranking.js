// Configuración de la URL
const API_URL = 'https://zukzuk-fvhn.onrender.com';

console.log('Ranking - API_URL:', API_URL);

let tipoActual = 'likes';

async function cargarRanking(tipo) {
    tipoActual = tipo;
    
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const tabMap = {
        'likes': 'tabLikes',
        'visitas': 'tabVisitas',
        'creadores': 'tabCreadores'
    };
    document.getElementById(tabMap[tipo]).classList.add('active');
    
    try {
        const respuesta = await fetch(`${API_URL}/api/ranking/${tipo}`);
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
                const avatarUrl = item.avatar && item.avatar !== "default_avatar.png"
                    ? `${API_URL}/uploads/avatars/${item.avatar}`
                    : 'default_avatar.png';
                    
                html += `
                    <img 
                        src="${avatarUrl}"
                        class="rank-avatar"
                        onerror="this.src='default_avatar.png'"
                    >
                    <div class="rank-info">
                        <h5 class="mb-0">${item.nombre}</h5>
                        <div class="rank-stats">
                            📁 ${item.total_juegos || 0} juegos 
                            ❤️ ${item.total_likes || 0} likes 
                            👁 ${item.total_visitas || 0} visitas
                        </div>
                    </div>
                    <button class="btn btn-outline-info btn-sm" onclick="verPerfil(${item.id})">
                        Ver Perfil
                    </button>
                `;
            } else {
                const miniaturaUrl = item.miniatura 
                    ? `${API_URL}/uploads/juegos/miniaturas/${item.miniatura}`
                    : 'default_game.png';
                    
                html += `
                    <img 
                        src="${miniaturaUrl}"
                        class="rank-avatar"
                        onerror="this.src='default_game.png'"
                        style="border-radius:10px;"
                    >
                    <div class="rank-info">
                        <h5 class="mb-0">${item.nombre}</h5>
                        <div class="rank-stats">
                            ❤️ ${item.likes || 0} likes 
                            👁 ${item.visitas || 0} visitas 
                            ⭐ ${item.favoritos || 0} favoritos
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
        console.error("Error cargando ranking:", error);
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

cargarRanking('likes');