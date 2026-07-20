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

let vistaActual = 'front';

// ==========================================
// GENERADOR DE AVATAR EN SVG
// ==========================================

function generarAvatarSVG(personaje, vista) {
    const skin = personaje.skin;
    const hairColor = personaje.hairColor;
    const shirtColor = personaje.shirt;
    const pantsColor = personaje.pants;
    const shoesColor = personaje.shoes;
    const isMale = personaje.gender === 'male';
    const isFemale = personaje.gender === 'female';

    // Posición de la cabeza según vista
    let headX = 50, headY = 30;
    let bodyY = 55;
    let scale = 1;

    if (vista === 'front') {
        // Vista frontal
    } else if (vista === 'side') {
        // Vista lateral - desplazamos un poco
        headX = 45;
    } else if (vista === 'back') {
        // Vista trasera
        headX = 50;
    }

    // ====================
    // CONSTRUIR SVG
    // ====================
    
    let svg = `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">`;
    
    // === CABELLO (detrás de la cabeza) ===
    if (personaje.hair !== 'bald') {
        let hairSvg = '';
        switch(personaje.hair) {
            case 'short':
                hairSvg = `
                    <ellipse cx="${headX}" cy="${headY - 2}" rx="24" ry="20" fill="${hairColor}" opacity="0.95"/>
                    <ellipse cx="${headX - 10}" cy="${headY + 2}" rx="8" ry="12" fill="${hairColor}" opacity="0.9"/>
                    <ellipse cx="${headX + 10}" cy="${headY + 2}" rx="8" ry="12" fill="${hairColor}" opacity="0.9"/>
                `;
                break;
            case 'long':
                hairSvg = `
                    <ellipse cx="${headX}" cy="${headY - 2}" rx="24" ry="22" fill="${hairColor}" opacity="0.95"/>
                    <ellipse cx="${headX - 12}" cy="${headY + 5}" rx="8" ry="16" fill="${hairColor}" opacity="0.9"/>
                    <ellipse cx="${headX + 12}" cy="${headY + 5}" rx="8" ry="16" fill="${hairColor}" opacity="0.9"/>
                    <ellipse cx="${headX}" cy="${headY + 15}" rx="10" ry="14" fill="${hairColor}" opacity="0.85"/>
                    <path d="M${headX - 6} ${headY + 25} Q${headX} ${headY + 40} ${headX + 6} ${headY + 25}" fill="${hairColor}" opacity="0.8"/>
                `;
                break;
            case 'spiky':
                hairSvg = `
                    <ellipse cx="${headX}" cy="${headY - 2}" rx="22" ry="18" fill="${hairColor}" opacity="0.95"/>
                    <polygon points="${headX - 20},${headY - 5} ${headX - 10},${headY - 20} ${headX},${headY - 8}" fill="${hairColor}"/>
                    <polygon points="${headX - 5},${headY - 10} ${headX + 5},${headY - 25} ${headX + 15},${headY - 12}" fill="${hairColor}"/>
                    <polygon points="${headX + 10},${headY - 5} ${headX + 20},${headY - 18} ${headX + 25},${headY - 3}" fill="${hairColor}"/>
                    <polygon points="${headX - 15},${headY + 2} ${headX - 22},${headY - 8} ${headX - 28},${headY + 5}" fill="${hairColor}"/>
                    <polygon points="${headX + 15},${headY + 2} ${headX + 22},${headY - 8} ${headX + 28},${headY + 5}" fill="${hairColor}"/>
                `;
                break;
            case 'curly':
                hairSvg = `
                    <ellipse cx="${headX}" cy="${headY - 2}" rx="24" ry="20" fill="${hairColor}" opacity="0.95"/>
                    <circle cx="${headX - 16}" cy="${headY - 4}" r="6" fill="${hairColor}"/>
                    <circle cx="${headX - 8}" cy="${headY - 10}" r="7" fill="${hairColor}"/>
                    <circle cx="${headX}" cy="${headY - 12}" r="8" fill="${hairColor}"/>
                    <circle cx="${headX + 8}" cy="${headY - 10}" r="7" fill="${hairColor}"/>
                    <circle cx="${headX + 16}" cy="${headY - 4}" r="6" fill="${hairColor}"/>
                    <circle cx="${headX - 12}" cy="${headY + 5}" r="5" fill="${hairColor}"/>
                    <circle cx="${headX + 12}" cy="${headY + 5}" r="5" fill="${hairColor}"/>
                `;
                break;
            case 'ponytail':
                hairSvg = `
                    <ellipse cx="${headX}" cy="${headY - 2}" rx="22" ry="18" fill="${hairColor}" opacity="0.95"/>
                    <ellipse cx="${headX}" cy="${headY + 8}" rx="8" ry="14" fill="${hairColor}" opacity="0.9"/>
                    <path d="M${headX - 4} ${headY + 18} Q${headX - 8} ${headY + 32} ${headX} ${headY + 40} Q${headX + 8} ${headY + 32} ${headX + 4} ${headY + 18}" fill="${hairColor}" opacity="0.85"/>
                    <ellipse cx="${headX}" cy="${headY + 30}" rx="5" ry="10" fill="${hairColor}" opacity="0.8"/>
                `;
                break;
            default:
                hairSvg = `
                    <ellipse cx="${headX}" cy="${headY - 2}" rx="22" ry="18" fill="${hairColor}" opacity="0.95"/>
                `;
        }
        svg += hairSvg;
    }

    // === CUERPO ===
    // Cuerpo principal
    const bodyWidth = isMale ? 26 : 22;
    const bodyHeight = 28;
    svg += `
        <rect x="${headX - bodyWidth/2}" y="${bodyY}" width="${bodyWidth}" height="${bodyHeight}" rx="6" fill="${shirtColor}"/>
        <rect x="${headX - (isMale ? 20 : 16)}" y="${bodyY + bodyHeight - 4}" width="${isMale ? 40 : 32}" height="6" rx="3" fill="${pantsColor}"/>
    `;

    // Brazos
    const armY = bodyY + 8;
    const armLength = isMale ? 24 : 22;
    svg += `
        <rect x="${headX - bodyWidth/2 - 6}" y="${armY}" width="6" height="${armLength}" rx="3" fill="${skin}"/>
        <rect x="${headX + bodyWidth/2}" y="${armY}" width="6" height="${armLength}" rx="3" fill="${skin}"/>
        <circle cx="${headX - bodyWidth/2 - 3}" cy="${armY + armLength}" r="4" fill="${skin}"/>
        <circle cx="${headX + bodyWidth/2 + 3}" cy="${armY + armLength}" r="4" fill="${skin}"/>
    `;

    // Piernas
    const legWidth = isMale ? 7 : 5.5;
    const legHeight = isMale ? 28 : 26;
    const legSpacing = isMale ? 10 : 8;
    svg += `
        <rect x="${headX - legSpacing - legWidth}" y="${bodyY + bodyHeight}" width="${legWidth}" height="${legHeight}" rx="3" fill="${pantsColor}"/>
        <rect x="${headX + legSpacing}" y="${bodyY + bodyHeight}" width="${legWidth}" height="${legHeight}" rx="3" fill="${pantsColor}"/>
    `;

    // Zapatos
    svg += `
        <ellipse cx="${headX - legSpacing - legWidth/2}" cy="${bodyY + bodyHeight + legHeight + 2}" rx="${isMale ? 7 : 6}" ry="4" fill="${shoesColor}"/>
        <ellipse cx="${headX + legSpacing + legWidth/2}" cy="${bodyY + bodyHeight + legHeight + 2}" rx="${isMale ? 7 : 6}" ry="4" fill="${shoesColor}"/>
    `;

    // === CUELLO ===
    svg += `
        <rect x="${headX - 6}" y="${bodyY - 4}" width="12" height="8" rx="3" fill="${skin}"/>
    `;

    // === CABEZA ===
    const headRadius = isMale ? 20 : 18;
    const headRadiusY = isMale ? 22 : 20;
    svg += `
        <ellipse cx="${headX}" cy="${headY}" rx="${headRadius}" ry="${headRadiusY}" fill="${skin}"/>
    `;

    // === OJOS ===
    if (vista === 'front') {
        const eyeY = headY - 2;
        const eyeSpacing = isMale ? 10 : 9;
        // Blanco del ojo
        svg += `
            <ellipse cx="${headX - eyeSpacing}" cy="${eyeY}" rx="6" ry="7" fill="white"/>
            <ellipse cx="${headX + eyeSpacing}" cy="${eyeY}" rx="6" ry="7" fill="white"/>
        `;
        // Iris
        const irisColor = isMale ? '#5C3D2E' : (isFemale ? '#4A90D9' : '#6B4F3A');
        svg += `
            <ellipse cx="${headX - eyeSpacing}" cy="${eyeY}" rx="4" ry="5" fill="${irisColor}"/>
            <ellipse cx="${headX + eyeSpacing}" cy="${eyeY}" rx="4" ry="5" fill="${irisColor}"/>
        `;
        // Pupila
        svg += `
            <circle cx="${headX - eyeSpacing}" cy="${eyeY}" r="2.5" fill="#1a1a2e"/>
            <circle cx="${headX + eyeSpacing}" cy="${eyeY}" r="2.5" fill="#1a1a2e"/>
        `;
        // Brillo en los ojos
        svg += `
            <circle cx="${headX - eyeSpacing - 2}" cy="${eyeY - 2}" r="1.5" fill="white" opacity="0.8"/>
            <circle cx="${headX + eyeSpacing - 2}" cy="${eyeY - 2}" r="1.5" fill="white" opacity="0.8"/>
        `;
        // Cejas
        const browY = eyeY - 8;
        svg += `
            <line x1="${headX - eyeSpacing - 6}" y1="${browY}" x2="${headX - eyeSpacing + 4}" y2="${browY - 2}" stroke="${hairColor}" stroke-width="2" stroke-linecap="round"/>
            <line x1="${headX + eyeSpacing - 4}" y1="${browY - 2}" x2="${headX + eyeSpacing + 6}" y2="${browY}" stroke="${hairColor}" stroke-width="2" stroke-linecap="round"/>
        `;
        // Pestañas (solo en femenino)
        if (isFemale) {
            svg += `
                <line x1="${headX - eyeSpacing - 4}" y1="${eyeY - 5}" x2="${headX - eyeSpacing - 2}" y2="${eyeY - 9}" stroke="#2D2D2D" stroke-width="1.2"/>
                <line x1="${headX - eyeSpacing}" y1="${eyeY - 6}" x2="${headX - eyeSpacing}" y2="${eyeY - 10}" stroke="#2D2D2D" stroke-width="1.2"/>
                <line x1="${headX - eyeSpacing + 4}" y1="${eyeY - 5}" x2="${headX - eyeSpacing + 2}" y2="${eyeY - 9}" stroke="#2D2D2D" stroke-width="1.2"/>
                <line x1="${headX + eyeSpacing - 4}" y1="${eyeY - 5}" x2="${headX + eyeSpacing - 2}" y2="${eyeY - 9}" stroke="#2D2D2D" stroke-width="1.2"/>
                <line x1="${headX + eyeSpacing}" y1="${eyeY - 6}" x2="${headX + eyeSpacing}" y2="${eyeY - 10}" stroke="#2D2D2D" stroke-width="1.2"/>
                <line x1="${headX + eyeSpacing + 4}" y1="${eyeY - 5}" x2="${headX + eyeSpacing + 2}" y2="${eyeY - 9}" stroke="#2D2D2D" stroke-width="1.2"/>
            `;
        }
    } else if (vista === 'side') {
        // Ojo lateral (un solo ojo)
        const eyeX = headX + 8;
        const eyeY = headY - 2;
        svg += `
            <ellipse cx="${eyeX}" cy="${eyeY}" rx="6" ry="7" fill="white"/>
            <ellipse cx="${eyeX}" cy="${eyeY}" rx="4" ry="5" fill="${isMale ? '#5C3D2E' : '#4A90D9'}"/>
            <circle cx="${eyeX}" cy="${eyeY}" r="2.5" fill="#1a1a2e"/>
            <circle cx="${eyeX - 2}" cy="${eyeY - 2}" r="1.5" fill="white" opacity="0.8"/>
        `;
    } else if (vista === 'back') {
        // No se ven los ojos desde atrás
    }

    // === BOCA ===
    if (vista === 'front' || vista === 'side') {
        const mouthX = headX;
        const mouthY = headY + 12;
        const mouthWidth = isMale ? 8 : 7;
        if (isMale) {
            svg += `
                <path d="M${mouthX - mouthWidth/2} ${mouthY} Q${mouthX} ${mouthY + 4} ${mouthX + mouthWidth/2} ${mouthY}" stroke="#B35" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            `;
        } else {
            svg += `
                <path d="M${mouthX - mouthWidth/2} ${mouthY} Q${mouthX} ${mouthY + 4} ${mouthX + mouthWidth/2} ${mouthY}" stroke="#B35" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                <ellipse cx="${mouthX}" cy="${mouthY + 2}" rx="${mouthWidth/2 - 1}" ry="2" fill="#CC8899" opacity="0.4"/>
            `;
        }
    }

    // === NARIZ ===
    if (vista === 'front' || vista === 'side') {
        const noseX = headX;
        const noseY = headY + 6;
        svg += `
            <circle cx="${noseX}" cy="${noseY}" r="2" fill="${skin}" opacity="0.6"/>
            <circle cx="${noseX}" cy="${noseY}" r="1.2" fill="${skin}" opacity="0.8"/>
        `;
    }

    // === OREJAS ===
    if (vista === 'front') {
        svg += `
            <ellipse cx="${headX - headRadius - 2}" cy="${headY}" rx="4" ry="7" fill="${skin}"/>
            <ellipse cx="${headX + headRadius + 2}" cy="${headY}" rx="4" ry="7" fill="${skin}"/>
        `;
    }

    // === ACCESORIOS ===
    
    // Sombrero
    if (personaje.hat !== 'none') {
        const hatX = headX;
        const hatY = headY - headRadiusY - 2;
        if (personaje.hat === 'tophat') {
            svg += `
                <rect x="${hatX - 16}" y="${hatY - 25}" width="32" height="25" rx="3" fill="#2D2D2D"/>
                <rect x="${hatX - 22}" y="${hatY}" width="44" height="5" rx="2" fill="#2D2D2D"/>
                <rect x="${hatX - 14}" y="${hatY - 20}" width="28" height="4" fill="#E74C3C" opacity="0.8"/>
            `;
        } else if (personaje.hat === 'cap') {
            svg += `
                <path d="M${hatX - 22} ${hatY + 2} Q${hatX} ${hatY - 12} ${hatX + 22} ${hatY + 2} L${hatX + 22} ${hatY + 6} L${hatX - 22} ${hatY + 6} Z" fill="#E74C3C"/>
                <rect x="${hatX - 18}" y="${hatY + 4}" width="36" height="4" rx="2" fill="#2D2D2D"/>
            `;
        } else if (personaje.hat === 'crown') {
            svg += `
                <rect x="${hatX - 16}" y="${hatY - 10}" width="32" height="12" rx="2" fill="#FFD700"/>
                <polygon points="${hatX - 18},${hatY - 14} ${hatX - 12},${hatY - 6} ${hatX - 6},${hatY - 14} ${hatX},${hatY - 6} ${hatX + 6},${hatY - 14} ${hatX + 12},${hatY - 6} ${hatX + 18},${hatY - 14}" fill="#FFD700"/>
                ${[0, 1, 2, 3, 4].map(i => {
                    const angle = (i / 5) * Math.PI * 2;
                    const x = hatX + Math.sin(angle) * 12;
                    const y = hatY - 4 + Math.cos(angle) * 4;
                    return `<circle cx="${x}" cy="${y}" r="2.5" fill="#E74C3C"/>`;
                }).join('')}
            `;
        }
    }

    // Gafas
    if (personaje.glasses !== 'none') {
        const glassX = headX;
        const glassY = headY - 2;
        const glassSize = 8;
        if (personaje.glasses === 'round' || personaje.glasses === 'sunglasses') {
            const glassColor = personaje.glasses === 'sunglasses' ? 'rgba(26,26,46,0.7)' : 'rgba(68,136,255,0.3)';
            svg += `
                <circle cx="${glassX - 12}" cy="${glassY}" r="${glassSize}" fill="${glassColor}" stroke="#2D2D2D" stroke-width="1.5"/>
                <circle cx="${glassX + 12}" cy="${glassY}" r="${glassSize}" fill="${glassColor}" stroke="#2D2D2D" stroke-width="1.5"/>
                <line x1="${glassX - 4}" y1="${glassY}" x2="${glassX + 4}" y2="${glassY}" stroke="#2D2D2D" stroke-width="1.5"/>
            `;
        }
        if (personaje.glasses === 'nerd') {
            svg += `
                <circle cx="${glassX - 12}" cy="${glassY}" r="9" fill="rgba(68,136,255,0.15)" stroke="#2D2D2D" stroke-width="2"/>
                <circle cx="${glassX + 12}" cy="${glassY}" r="9" fill="rgba(68,136,255,0.15)" stroke="#2D2D2D" stroke-width="2"/>
                <line x1="${glassX - 3}" y1="${glassY}" x2="${glassX + 3}" y2="${glassY}" stroke="#2D2D2D" stroke-width="2"/>
            `;
        }
    }

    // === SOMBRA Y DETALLES FINALES ===
    // Sombra bajo los pies
    svg += `
        <ellipse cx="${headX}" cy="${bodyY + bodyHeight + legHeight + 6}" rx="${isMale ? 30 : 25}" ry="4" fill="rgba(0,0,0,0.2)"/>
    `;

    // === TEXTO DE INFO ===
    if (vista === 'front') {
        svg += `
            <text x="50" y="118" text-anchor="middle" font-size="6" fill="#555" font-family="Arial">${isMale ? 'Cool Guy' : isFemale ? 'Cutie Pie' : 'Avatar'} • HD</text>
        `;
    }

    svg += `</svg>`;
    return svg;
}

// ==========================================
// RENDERIZAR AVATAR
// ==========================================

function renderizarAvatar() {
    const container = document.getElementById('avatarContainer');
    const svg = generarAvatarSVG(personaje, vistaActual);
    
    container.innerHTML = `
        <div style="width:100%;height:100%;display:flex;justify-content:center;align-items:center;flex-direction:column;">
            <div class="avatar-svg">${svg}</div>
            <div style="position:absolute;bottom:10px;right:15px;font-size:10px;color:#444;text-align:right;">
                <div>🎨 HD • ${personaje.gender === 'male' ? 'Chico' : personaje.gender === 'female' ? 'Chica' : 'Neutro'}</div>
                <div>💇 ${personaje.hair} • 👕 ${personaje.shirt}</div>
            </div>
        </div>
    `;
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