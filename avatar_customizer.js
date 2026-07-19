// Configuración de la URL
const API_URL = 'https://zukzuk-fvhn.onrender.com';

console.log('Avatar Customizer - API_URL:', API_URL);

const token = localStorage.getItem("token");

if (!token) {
    alert("Debes iniciar sesión.");
    window.location.href = "login.html";
}

// ==========================================
// ESTADO DEL PERSONAJE
// ==========================================

let personaje = {
    skin_color: '#F5D0B8',
    hair_style: 'default',
    hair_color: '#4A2F1A',
    eye_color: '#5C3D2E',
    shirt_color: '#3B82F6',
    pants_color: '#1E3A5F',
    shoes_color: '#2D2D2D',
    hat_style: 'none',
    glasses_style: 'none',
    body_type: 'normal',
    gender_avatar: 'male'
};

// ==========================================
// CARGAR DATOS DEL PERSONAJE
// ==========================================

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
            console.log('Personaje cargado:', personaje);
        }
        
        // Actualizar la interfaz
        actualizarInterfaz();
        renderizarAvatar();
        
    } catch (error) {
        console.error("Error cargando personaje:", error);
        renderizarAvatar();
    }
}

// ==========================================
// ACTUALIZAR INTERFAZ
// ==========================================

function actualizarInterfaz() {
    // Actualizar opciones seleccionadas
    document.querySelectorAll('.style-option').forEach(el => {
        const option = el.dataset.option;
        const value = el.dataset.value;
        if (personaje[option] === value) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
    
    // Actualizar colores
    document.querySelectorAll('.color-option').forEach(el => {
        const color = el.dataset.color;
        const parentId = el.parentElement.id;
        let targetKey = '';
        
        if (parentId === 'skinColors') targetKey = 'skin_color';
        else if (parentId === 'hairColors') targetKey = 'hair_color';
        
        if (personaje[targetKey] === color) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
}

// ==========================================
// RENDERIZAR AVATAR (SVG)
// ==========================================

function renderizarAvatar() {
    const canvas = document.getElementById('avatarCanvas');
    
    const skin = personaje.skin_color;
    const hair = personaje.hair_color;
    const shirt = personaje.shirt_color;
    const pants = personaje.pants_color;
    const shoes = personaje.shoes_color;
    const eyes = personaje.eye_color;
    const gender = personaje.gender_avatar;
    const hairStyle = personaje.hair_style;
    
    let hairSVG = '';
    
    // Diferentes estilos de cabello
    switch(hairStyle) {
        case 'long':
            hairSVG = `
                <ellipse cx="50" cy="25" rx="22" ry="35" fill="${hair}" opacity="0.9"/>
                <ellipse cx="30" cy="30" rx="10" ry="20" fill="${hair}" opacity="0.8"/>
                <ellipse cx="70" cy="30" rx="10" ry="20" fill="${hair}" opacity="0.8"/>
            `;
            break;
        case 'spiky':
            hairSVG = `
                <polygon points="50,5 40,25 30,15 35,28 25,22 38,35 50,40" fill="${hair}"/>
                <polygon points="50,5 60,25 70,15 65,28 75,22 62,35 50,40" fill="${hair}"/>
                <polygon points="50,5 45,20 55,20" fill="${hair}"/>
            `;
            break;
        case 'curly':
            hairSVG = `
                <circle cx="35" cy="20" r="12" fill="${hair}"/>
                <circle cx="50" cy="15" r="13" fill="${hair}"/>
                <circle cx="65" cy="20" r="12" fill="${hair}"/>
                <circle cx="30" cy="30" r="10" fill="${hair}"/>
                <circle cx="70" cy="30" r="10" fill="${hair}"/>
            `;
            break;
        case 'ponytail':
            hairSVG = `
                <ellipse cx="50" cy="20" rx="20" ry="25" fill="${hair}"/>
                <ellipse cx="50" cy="45" rx="10" ry="20" fill="${hair}"/>
            `;
            break;
        case 'bald':
            hairSVG = ``;
            break;
        default: // 'default'
            hairSVG = `
                <ellipse cx="50" cy="22" rx="20" ry="18" fill="${hair}"/>
                <ellipse cx="40" cy="20" rx="10" ry="12" fill="${hair}"/>
                <ellipse cx="60" cy="20" rx="10" ry="12" fill="${hair}"/>
            `;
            break;
    }
    
    const svg = `
        <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
            <!-- Cuerpo -->
            <rect x="30" y="55" width="40" height="35" rx="5" fill="${shirt}"/>
            
            <!-- Pantalones -->
            <rect x="32" y="88" width="14" height="20" rx="3" fill="${pants}"/>
            <rect x="54" y="88" width="14" height="20" rx="3" fill="${pants}"/>
            
            <!-- Zapatos -->
            <ellipse cx="37" cy="108" rx="10" ry="5" fill="${shoes}"/>
            <ellipse cx="63" cy="108" rx="10" ry="5" fill="${shoes}"/>
            
            <!-- Brazos -->
            <rect x="22" y="60" width="8" height="25" rx="4" fill="${skin}"/>
            <rect x="70" y="60" width="8" height="25" rx="4" fill="${skin}"/>
            
            <!-- Manos -->
            <circle cx="26" cy="87" r="5" fill="${skin}"/>
            <circle cx="74" cy="87" r="5" fill="${skin}"/>
            
            <!-- Cuello -->
            <rect x="42" y="50" width="16" height="8" rx="2" fill="${skin}"/>
            
            <!-- Cabeza -->
            <ellipse cx="50" cy="30" rx="22" ry="25" fill="${skin}"/>
            
            <!-- Cabello (según estilo) -->
            ${hairSVG}
            
            <!-- Ojos -->
            <ellipse cx="42" cy="28" rx="4" ry="5" fill="white"/>
            <ellipse cx="58" cy="28" rx="4" ry="5" fill="white"/>
            <circle cx="43" cy="28" r="3" fill="${eyes}"/>
            <circle cx="59" cy="28" r="3" fill="${eyes}"/>
            
            <!-- Pupilas -->
            <circle cx="43" cy="28" r="1.5" fill="black"/>
            <circle cx="59" cy="28" r="1.5" fill="black"/>
            
            <!-- Boca -->
            ${gender === 'female' ? `
                <path d="M44 38 Q50 44 56 38" stroke="#B35" stroke-width="1.5" fill="none"/>
            ` : `
                <path d="M44 38 Q50 41 56 38" stroke="#B35" stroke-width="1.5" fill="none"/>
            `}
            
            <!-- Cejas -->
            <line x1="38" y1="22" x2="46" y2="20" stroke="#4A2F1A" stroke-width="1.5"/>
            <line x1="54" y1="20" x2="62" y2="22" stroke="#4A2F1A" stroke-width="1.5"/>
            
            <!-- Accesorios: Sombrero -->
            ${personaje.hat_style === 'top_hat' ? `
                <rect x="38" y="5" width="24" height="15" rx="2" fill="#2D2D2D"/>
                <rect x="32" y="18" width="36" height="5" rx="2" fill="#2D2D2D"/>
            ` : ''}
            ${personaje.hat_style === 'cap' ? `
                <path d="M25 20 Q50 10 75 20 L75 25 L25 25 Z" fill="#E74C3C"/>
                <path d="M45 20 L45 25 L55 25 L55 20" fill="#2D2D2D"/>
            ` : ''}
            
            <!-- Gafas -->
            ${personaje.glasses_style === 'round' ? `
                <circle cx="42" cy="28" r="7" fill="none" stroke="#2D2D2D" stroke-width="1.5"/>
                <circle cx="58" cy="28" r="7" fill="none" stroke="#2D2D2D" stroke-width="1.5"/>
                <line x1="49" y1="28" x2="51" y2="28" stroke="#2D2D2D" stroke-width="1.5"/>
            ` : ''}
            ${personaje.glasses_style === 'sunglasses' ? `
                <rect x="35" y="24" width="30" height="10" rx="3" fill="#2D2D2D" opacity="0.8"/>
            ` : ''}
        </svg>
    `;
    
    canvas.innerHTML = svg;
}

// ==========================================
// FUNCIONES DE INTERACCIÓN
// ==========================================

function selectOption(element) {
    const option = element.dataset.option;
    const value = element.dataset.value;
    
    // Desactivar todas las opciones del mismo grupo
    document.querySelectorAll(`[data-option="${option}"]`).forEach(el => {
        el.classList.remove('active');
    });
    
    // Activar la seleccionada
    element.classList.add('active');
    
    // Actualizar personaje
    personaje[option] = value;
    
    // Re-renderizar
    renderizarAvatar();
}

function selectColor(element, key) {
    const color = element.dataset.color;
    
    // Desactivar todas las del mismo grupo
    document.querySelectorAll(`#${element.parentElement.id} .color-option`).forEach(el => {
        el.classList.remove('active');
    });
    
    // Activar la seleccionada
    element.classList.add('active');
    
    // Actualizar personaje
    personaje[key] = color;
    
    // Re-renderizar
    renderizarAvatar();
}

// ==========================================
// GUARDAR PERSONAJE
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
        
        if (datos.correcto) {
            alert("✅ Personaje guardado correctamente!");
        } else {
            alert("❌ Error: " + datos.mensaje);
        }
    } catch (error) {
        console.error("Error guardando personaje:", error);
        alert("Error al guardar el personaje.");
    }
}

// ==========================================
// RESET PERSONAJE
// ==========================================

function resetPersonaje() {
    personaje = {
        skin_color: '#F5D0B8',
        hair_style: 'default',
        hair_color: '#4A2F1A',
        eye_color: '#5C3D2E',
        shirt_color: '#3B82F6',
        pants_color: '#1E3A5F',
        shoes_color: '#2D2D2D',
        hat_style: 'none',
        glasses_style: 'none',
        body_type: 'normal',
        gender_avatar: 'male'
    };
    
    actualizarInterfaz();
    renderizarAvatar();
}

// ==========================================
// PRESETS
// ==========================================

function aplicarPreset(tipo) {
    const presets = {
        hero: {
            skin_color: '#F5D0B8',
            hair_style: 'spiky',
            hair_color: '#FFD700',
            eye_color: '#3B82F6',
            shirt_color: '#EF4444',
            pants_color: '#1E3A5F',
            shoes_color: '#2D2D2D',
            hat_style: 'none',
            glasses_style: 'none',
            gender_avatar: 'male'
        },
        ninja: {
            skin_color: '#F5D0B8',
            hair_style: 'bald',
            hair_color: '#000000',
            eye_color: '#2D2D2D',
            shirt_color: '#1A1A2E',
            pants_color: '#1A1A2E',
            shoes_color: '#000000',
            hat_style: 'none',
            glasses_style: 'none',
            gender_avatar: 'male'
        },
        princess: {
            skin_color: '#F5D0B8',
            hair_style: 'long',
            hair_color: '#FFD700',
            eye_color: '#FF6B6B',
            shirt_color: '#FF69B4',
            pants_color: '#FF69B4',
            shoes_color: '#FFD700',
            hat_style: 'top_hat',
            glasses_style: 'none',
            gender_avatar: 'female'
        },
        pirate: {
            skin_color: '#E8C4A0',
            hair_style: 'long',
            hair_color: '#4A2F1A',
            eye_color: '#2D2D2D',
            shirt_color: '#000000',
            pants_color: '#2D2D2D',
            shoes_color: '#000000',
            hat_style: 'cap',
            glasses_style: 'sunglasses',
            gender_avatar: 'male'
        },
        robot: {
            skin_color: '#C0C0C0',
            hair_style: 'bald',
            hair_color: '#000000',
            eye_color: '#00FF00',
            shirt_color: '#808080',
            pants_color: '#696969',
            shoes_color: '#2D2D2D',
            hat_style: 'none',
            glasses_style: 'round',
            gender_avatar: 'neutral'
        },
        alien: {
            skin_color: '#00FF00',
            hair_style: 'bald',
            hair_color: '#000000',
            eye_color: '#FF0000',
            shirt_color: '#00CC00',
            pants_color: '#009900',
            shoes_color: '#006600',
            hat_style: 'none',
            glasses_style: 'none',
            gender_avatar: 'neutral'
        }
    };
    
    if (presets[tipo]) {
        personaje = { ...personaje, ...presets[tipo] };
        actualizarInterfaz();
        renderizarAvatar();
    }
}

// ==========================================
// OBTENER MONEDAS
// ==========================================

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