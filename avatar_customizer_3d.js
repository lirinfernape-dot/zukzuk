// Configuración de la URL
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:5000'
    : 'https://zukzuk-fvhn.onrender.com';

console.log('🎨 Avatar Studio - API_URL:', API_URL);

const token = localStorage.getItem("token");

if (!token) {
    alert("Debes iniciar sesión.");
    window.location.href = "login.html";
}

// ==========================================
// ESTADO DEL PERSONAJE
// ==========================================

let personaje = {
    gender: 'male',
    skin: 'F5D0B8',
    hairColor: '4A2F1A',
    shirt: '3B82F6',
    pants: '1E3A5F'
};

let autoRotate = true;

// ==========================================
// GENERAR URL DE ROBLOX
// ==========================================

function generarURLRoblox() {
    const gender = personaje.gender;
    const skinColor = personaje.skin;
    const hairColor = personaje.hairColor;
    const shirtColor = personaje.shirt;
    const pantsColor = personaje.pants;

    // Usamos el servicio de Roblox para generar el avatar
    // La URL base de Roblox Avatar
    const baseUrl = 'https://www.roblox.com/avatar-thumbnail/image';
    
    // Parámetros para un avatar personalizado
    const params = new URLSearchParams({
        userId: Math.floor(Math.random() * 1000000) + 1,
        width: 420,
        height: 420,
        format: 'png'
    });

    // Usamos un generador de avatares alternativo
    // https://github.com/roblox-avatar/avatar-maker
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${gender}-${skinColor}-${hairColor}&backgroundColor=transparent&skinColor=${skinColor}&hairColor=${hairColor}&clothesColor=${shirtColor}`;

    return avatarUrl;
}

// ==========================================
// RENDERIZAR AVATAR
// ==========================================

function renderizarAvatar() {
    const container = document.getElementById('avatarContainer');
    
    // Usar la API de Roblox para mostrar el avatar
    const robloxUrl = `https://www.roblox.com/headshot-thumbnail/image?userId=1&width=420&height=420&format=png`;
    
    // Para personajes personalizados, usamos un generador de avatares
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${personaje.gender}-${personaje.skin}-${personaje.hairColor}&backgroundColor=transparent&skinColor=${personaje.skin}&hairColor=${personaje.hairColor}&clothesColor=${personaje.shirt}`;

    container.innerHTML = `
        <div style="width:100%;height:100%;display:flex;justify-content:center;align-items:center;flex-direction:column;background:radial-gradient(ellipse at center, #1a1a3e 0%, #0d0d1a 100%);">
            <img src="${avatarUrl}" 
                 alt="Avatar" 
                 style="max-width:70%;max-height:70%;object-fit:contain;filter:drop-shadow(0 0 30px rgba(0,210,255,0.1));"
                 onerror="this.onerror=null;this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><rect width=%22200%22 height=%22200%22 fill=%22%231a1a3e%22/><text x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23444%22 font-size=%2230%22>🧑</text></svg>'">
            <div style="position:absolute;bottom:20px;color:#444;font-size:11px;text-align:center;">
                <span style="color:#555;">${personaje.gender === 'male' ? '👨 Chico' : personaje.gender === 'female' ? '👩 Chica' : '🧑 Neutro'}</span>
                <span style="margin-left:15px;color:#555;">🎨 ${personaje.skin}</span>
                <span style="margin-left:15px;color:#555;">👕 ${personaje.shirt}</span>
            </div>
        </div>
    `;

    // Guardar en localStorage para el perfil
    localStorage.setItem('avatarData', JSON.stringify(personaje));
}

// ==========================================
// FUNCIONES DE INTERACCIÓN
// ==========================================

function actualizarAvatar() {
    // Obtener valores seleccionados
    const genderEl = document.querySelector('.style-btn.active[data-option="gender"]');
    if (genderEl) personaje.gender = genderEl.dataset.value || 'male';
    
    renderizarAvatar();
}

function selectColor(element) {
    const color = element.dataset.color;
    const parentId = element.parentElement.id;
    
    // Desactivar todos en el grupo
    document.querySelectorAll(`#${parentId} .color-swatch`).forEach(el => {
        el.classList.remove('active');
    });
    
    element.classList.add('active');
    
    // Asignar el color
    if (parentId === 'skinColors') personaje.skin = color;
    else if (parentId === 'hairColors') personaje.hairColor = color;
    else personaje.shirt = color;
    
    renderizarAvatar();
}

function toggleAutoRotate() {
    autoRotate = !autoRotate;
    document.querySelectorAll('.viewer-controls button').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
}

function resetCamera() {
    // Reiniciar vista
}

// ==========================================
// PRESETS
// ==========================================

function aplicarPreset(tipo) {
    const presets = {
        hero: { gender: 'male', skin: 'F5D0B8', hairColor: 'FFD700', shirt: 'EF4444' },
        ninja: { gender: 'male', skin: 'F5D0B8', hairColor: '000000', shirt: '1A1A2E' },
        princess: { gender: 'female', skin: 'F5D0B8', hairColor: 'FFD700', shirt: 'FF69B4' },
        pirate: { gender: 'male', skin: 'E8C4A0', hairColor: '4A2F1A', shirt: '000000' },
        robot: { gender: 'neutral', skin: 'C0C0C0', hairColor: '000000', shirt: '808080' },
        alien: { gender: 'neutral', skin: '00FF00', hairColor: '000000', shirt: '00CC00' }
    };
    
    if (presets[tipo]) {
        Object.assign(personaje, presets[tipo]);
        actualizarInterfaz();
        renderizarAvatar();
    }
}

function actualizarInterfaz() {
    // Actualizar botones de género
    document.querySelectorAll('.style-btn').forEach(el => {
        const option = el.dataset.option;
        if (option === 'gender') {
            el.classList.toggle('active', personaje[option] === el.dataset.value);
        }
    });
    
    // Actualizar colores
    document.querySelectorAll('.color-swatch').forEach(el => {
        const color = el.dataset.color;
        const parentId = el.parentElement.id;
        let targetKey = '';
        if (parentId === 'skinColors') targetKey = 'skin';
        else if (parentId === 'hairColors') targetKey = 'hairColor';
        else targetKey = 'shirt';
        if (personaje[targetKey] === color) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
}

function resetPersonaje() {
    personaje = { gender: 'male', skin: 'F5D0B8', hairColor: '4A2F1A', shirt: '3B82F6', pants: '1E3A5F' };
    actualizarInterfaz();
    renderizarAvatar();
}

function randomPersonaje() {
    const genders = ['male', 'female', 'neutral'];
    const skins = ['F5D0B8', 'E8C4A0', 'D4A574', 'C4956A', 'B0885E', '8B6B4A', '6B4F3A', '4A3524'];
    const hairColors = ['4A2F1A', '000000', '8B6914', 'FFD700', 'FF6B35', 'FF1493', '00BFFF', 'FFFFFF'];
    const shirts = ['3B82F6', 'EF4444', '22C55E', 'F59E0B', '8B5CF6', 'EC4899', '14B8A6', '1A1A2E'];
    
    personaje.gender = genders[Math.floor(Math.random() * genders.length)];
    personaje.skin = skins[Math.floor(Math.random() * skins.length)];
    personaje.hairColor = hairColors[Math.floor(Math.random() * hairColors.length)];
    personaje.shirt = shirts[Math.floor(Math.random() * shirts.length)];
    
    actualizarInterfaz();
    renderizarAvatar();
}

// ==========================================
// GUARDAR Y CARGAR
// ==========================================

async function guardarPersonaje() {
    try {
        const respuesta = await fetch(`${API_URL}/api/avatar/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
            body: JSON.stringify(personaje)
        });
        const datos = await respuesta.json();
        alert(datos.correcto ? "✅ Personaje guardado correctamente!" : "❌ Error: " + datos.mensaje);
    } catch (error) {
        console.error("Error guardando personaje:", error);
        alert("Error al guardar el personaje.");
    }
}

async function cargarPersonaje() {
    try {
        const respuesta = await fetch(`${API_URL}/api/avatar/load`, {
            headers: { "Authorization": "Bearer " + token }
        });
        const datos = await respuesta.json();
        if (datos.correcto && datos.personaje) {
            Object.assign(personaje, datos.personaje);
            actualizarInterfaz();
            renderizarAvatar();
        }
    } catch (error) {
        console.error("Error cargando personaje:", error);
        renderizarAvatar();
    }
}

async function obtenerMonedas() {
    try {
        const respuesta = await fetch(`${API_URL}/api/users/perfil`, {
            headers: { "Authorization": "Bearer " + token }
        });
        const datos = await respuesta.json();
        if (datos.correcto) {
            document.getElementById('monedasUsuario').textContent = datos.usuario.monedas || 0;
        }
    } catch (error) {
        console.error("Error obteniendo monedas:", error);
    }
}

// ==========================================
// INICIAR
// ==========================================

cargarPersonaje();
obtenerMonedas();
renderizarAvatar();