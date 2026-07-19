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
    skin: '#F5D0B8',
    hair: 'short',
    hairColor: '#4A2F1A',
    shirt: '#3B82F6',
    pants: '#1E3A5F',
    shoes: '#2D2D2D',
    hat: 'none',
    glasses: 'none'
};

// Vista actual
let vistaActual = 'front';

// ==========================================
// IMÁGENES DE PERSONAJES (Avatar Mapping)
// ==========================================

// Mapeo de avatares según el género y estilo
function getAvatarUrl(personaje, vista) {
    // En producción, estas imágenes serían generadas por un servicio
    // o estarían en una carpeta de assets. Por ahora usamos un placeholder.
    
    const genderMap = {
        'male': 'chico',
        'female': 'chica',
        'neutral': 'neutral'
    };
    
    const gender = genderMap[personaje.gender] || 'chico';
    const hairMap = {
        'short': 'corto',
        'long': 'largo',
        'spiky': 'spiky',
        'curly': 'rizado',
        'ponytail': 'cola',
        'bald': 'calvo'
    };
    const hair = hairMap[personaje.hair] || 'corto';
    
    // URL base del avatar (usamos un generador de avatares)
    // Esta URL genera un avatar basado en los parámetros
    const baseUrl = `https://api.dicebear.com/7.x/avataaars/svg`;
    
    const params = new URLSearchParams({
        seed: `${personaje.gender}-${personaje.hair}-${personaje.skin}`,
        backgroundColor: 'transparent',
        skinColor: personaje.skin.replace('#', ''),
        hairColor: personaje.hairColor.replace('#', ''),
        clothesColor: personaje.shirt.replace('#', ''),
        accessoriesType: personaje.glasses !== 'none' ? personaje.glasses : 'blank',
        topType: personaje.hair === 'bald' ? 'eyepatch' : personaje.hair,
        facialHairType: 'blank',
        clotheType: 'blazerShirt',
        clotheColor: personaje.shirt.replace('#', ''),
        eyeType: 'default',
        eyebrowType: 'default',
        mouthType: 'smile',
        skinColor: personaje.skin.replace('#', ''),
        style: 'svg'
    });
    
    // Para vista 3D, usamos una imagen diferente
    if (vista === '3d') {
        return `${baseUrl}?${params.toString()}&rotate=45`;
    }
    
    return `${baseUrl}?${params.toString()}`;
}

// ==========================================
// RENDERIZAR AVATAR
// ==========================================

function renderizarAvatar() {
    const container = document.getElementById('avatarContainer');
    const avatarUrl = getAvatarUrl(personaje, vistaActual);
    
    container.innerHTML = `
        <div style="width:100%;height:100%;display:flex;justify-content:center;align-items:center;flex-direction:column;">
            <img src="${avatarUrl}" 
                 alt="Avatar" 
                 style="max-width:80%;max-height:80%;object-fit:contain;"
                 onerror="this.onerror=null;this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><rect width=%22200%22 height=%22200%22 fill=%22%231a1a3e%22/><text x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23444%22 font-size=%2230%22>🧑</text></svg>'">
        </div>
    `;
    
    // Mostrar información del personaje
    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = `
        position: absolute;
        bottom: 10px;
        right: 15px;
        font-size: 10px;
        color: #444;
        text-align: right;
    `;
    infoDiv.innerHTML = `
        <div>🎨 HD • ${personaje.gender === 'male' ? 'Chico' : personaje.gender === 'female' ? 'Chica' : 'Neutro'}</div>
        <div>💇 ${personaje.hair} • 👕 ${personaje.shirt}</div>
    `;
    container.appendChild(infoDiv);
}

// ==========================================
// FUNCIONES DE INTERACCIÓN
// ==========================================

function selectOption(element) {
    const option = element.dataset.option;
    const value = element.dataset.value;
    
    document.querySelectorAll(`[data-option="${option}"]`).forEach(el => {
        el.classList.remove('active');
    });
    
    element.classList.add('active');
    personaje[option] = value;
    renderizarAvatar();
}

function selectColor(element, key) {
    const color = element.dataset.color;
    
    document.querySelectorAll(`#${element.parentElement.id} .color-swatch`).forEach(el => {
        el.classList.remove('active');
    });
    
    element.classList.add('active');
    personaje[key] = color;
    renderizarAvatar();
}

function cambiarVista(vista) {
    vistaActual = vista;
    document.querySelectorAll('.view-controls button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    renderizarAvatar();
}

// ==========================================
// PRESETS
// ==========================================

function aplicarPreset(tipo) {
    const presets = {
        hero: { 
            gender: 'male', skin: '#F5D0B8', hair: 'spiky', hairColor: '#FFD700', 
            shirt: '#EF4444', pants: '#1E3A5F', shoes: '#2D2D2D', hat: 'none', glasses: 'none' 
        },
        ninja: { 
            gender: 'male', skin: '#F5D0B8', hair: 'bald', hairColor: '#000000', 
            shirt: '#1A1A2E', pants: '#1A1A2E', shoes: '#000000', hat: 'none', glasses: 'none' 
        },
        princess: { 
            gender: 'female', skin: '#F5D0B8', hair: 'long', hairColor: '#FFD700', 
            shirt: '#FF69B4', pants: '#FF69B4', shoes: '#FFD700', hat: 'crown', glasses: 'none' 
        },
        pirate: { 
            gender: 'male', skin: '#E8C4A0', hair: 'long', hairColor: '#4A2F1A', 
            shirt: '#000000', pants: '#2D2D2D', shoes: '#000000', hat: 'cap', glasses: 'sunglasses' 
        },
        robot: { 
            gender: 'neutral', skin: '#C0C0C0', hair: 'bald', hairColor: '#000000', 
            shirt: '#808080', pants: '#696969', shoes: '#2D2D2D', hat: 'none', glasses: 'round' 
        },
        alien: { 
            gender: 'neutral', skin: '#00FF00', hair: 'bald', hairColor: '#000000', 
            shirt: '#00CC00', pants: '#009900', shoes: '#006600', hat: 'none', glasses: 'none' 
        }
    };
    
    if (presets[tipo]) {
        const p = presets[tipo];
        for (let key in p) {
            personaje[key] = p[key];
        }
        actualizarInterfaz();
        renderizarAvatar();
    }
}

function actualizarInterfaz() {
    document.querySelectorAll('.style-btn').forEach(el => {
        const option = el.dataset.option;
        const value = el.dataset.value;
        if (personaje[option] === value) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
    
    document.querySelectorAll('.color-swatch').forEach(el => {
        const color = el.dataset.color;
        const parentId = el.parentElement.id;
        let targetKey = '';
        if (parentId === 'skinColors') targetKey = 'skin';
        else if (parentId === 'hairColors') targetKey = 'hairColor';
        if (personaje[targetKey] === color) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
}

function resetPersonaje() {
    personaje = {
        gender: 'male',
        skin: '#F5D0B8',
        hair: 'short',
        hairColor: '#4A2F1A',
        shirt: '#3B82F6',
        pants: '#1E3A5F',
        shoes: '#2D2D2D',
        hat: 'none',
        glasses: 'none'
    };
    actualizarInterfaz();
    renderizarAvatar();
}

function randomPersonaje() {
    const genders = ['male', 'female', 'neutral'];
    const hairs = ['short', 'long', 'spiky', 'curly', 'ponytail', 'bald'];
    const hairColors = ['#4A2F1A', '#000000', '#8B6914', '#FFD700', '#FF6B35', '#FF1493', '#00BFFF', '#FFFFFF'];
    const shirts = ['#3B82F6', '#EF4444', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#1A1A2E'];
    const skins = ['#F5D0B8', '#E8C4A0', '#D4A574', '#C4956A', '#B0885E', '#8B6B4A', '#6B4F3A', '#4A3524'];
    
    personaje.gender = genders[Math.floor(Math.random() * genders.length)];
    personaje.hair = hairs[Math.floor(Math.random() * hairs.length)];
    personaje.hairColor = hairColors[Math.floor(Math.random() * hairColors.length)];
    personaje.shirt = shirts[Math.floor(Math.random() * shirts.length)];
    personaje.skin = skins[Math.floor(Math.random() * skins.length)];
    personaje.hat = Math.random() > 0.7 ? ['tophat', 'cap', 'crown'][Math.floor(Math.random() * 3)] : 'none';
    personaje.glasses = Math.random() > 0.7 ? ['round', 'sunglasses', 'nerd'][Math.floor(Math.random() * 3)] : 'none';
    
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
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
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
            headers: {
                Authorization: "Bearer " + token
            }
        });
        
        const datos = await respuesta.json();
        
        if (datos.correcto && datos.personaje) {
            personaje = { ...personaje, ...datos.personaje };
            actualizarInterfaz();
            renderizarAvatar();
        }
    } catch (error) {
        console.error("Error cargando personaje:", error);
    }
}

async function obtenerMonedas() {
    try {
        const respuesta = await fetch(`${API_URL}/api/users/perfil`, {
            headers: {
                Authorization: "Bearer " + token
            }
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