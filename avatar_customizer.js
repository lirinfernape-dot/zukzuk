// Configuración de la URL
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:5000'
    : 'https://zukzuk-fvhn.onrender.com';

console.log('🎨 Avatar 3D - API_URL:', API_URL);

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

// ==========================================
// THREE.JS - ESCENA 3D
// ==========================================

let scene, camera, renderer, controls;
let avatarGroup;
let autoRotate = true;

function initScene() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);

    // Cámara
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(4, 3, 6);
    camera.lookAt(0, 1.2, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Controles
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.2, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;
    controls.update();

    // Luces
    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 8, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
    fillLight.position.set(-3, 2, -5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
    rimLight.position.set(-2, 3, -4);
    scene.add(rimLight);

    // Piso
    const gridHelper = new THREE.GridHelper(8, 20, 0x444466, 0x333355);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Sombra
    const shadowGeometry = new THREE.CircleGeometry(1.5, 32);
    const shadowMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.3
    });
    const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.001;
    scene.add(shadow);

    crearPersonaje();
    animate();

    window.addEventListener('resize', () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// ==========================================
// CREAR PERSONAJE 3D
// ==========================================

function crearPersonaje() {
    if (avatarGroup) {
        scene.remove(avatarGroup);
        avatarGroup.traverse((child) => {
            if (child.isMesh) {
                child.geometry.dispose();
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
    }

    avatarGroup = new THREE.Group();

    const skinColor = new THREE.Color(personaje.skin);
    const hairColor = new THREE.Color(personaje.hairColor);
    const shirtColor = new THREE.Color(personaje.shirt);
    const pantsColor = new THREE.Color(personaje.pants);
    const shoesColor = new THREE.Color(personaje.shoes);
    const eyeColor = new THREE.Color('#ffffff');
    const pupilColor = new THREE.Color('#2D2D2D');

    // ====================
    // CUERPO
    // ====================
    
    // Torso
    const torsoGeo = new THREE.BoxGeometry(0.8, 0.9, 0.5);
    const torsoMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.6, metalness: 0.1 });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 1.05;
    torso.castShadow = true;
    avatarGroup.add(torso);

    // Cuello
    const neckGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.15, 8);
    const neckMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.8 });
    const neck = new THREE.Mesh(neckGeo, neckMat);
    neck.position.y = 1.55;
    avatarGroup.add(neck);

    // ====================
    // CABEZA
    // ====================
    
    const headGeo = new THREE.SphereGeometry(0.35, 32, 32);
    const headMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.7 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.8;
    head.scale.y = 1.1;
    head.castShadow = true;
    avatarGroup.add(head);

    // ====================
    // OJOS
    // ====================
    
    const eyeGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const eyeMat = new THREE.MeshStandardMaterial({ color: eyeColor, roughness: 0.1 });
    
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.15, 1.9, 0.32);
    avatarGroup.add(eyeL);

    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.15, 1.9, 0.32);
    avatarGroup.add(eyeR);

    const pupilGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const pupilMat = new THREE.MeshStandardMaterial({ color: pupilColor, roughness: 0.1 });
    
    const pupilL = new THREE.Mesh(pupilGeo, pupilMat);
    pupilL.position.set(-0.15, 1.88, 0.38);
    avatarGroup.add(pupilL);

    const pupilR = new THREE.Mesh(pupilGeo, pupilMat);
    pupilR.position.set(0.15, 1.88, 0.38);
    avatarGroup.add(pupilR);

    // ====================
    // CABELLO
    // ====================
    
    const hairGroup = new THREE.Group();
    const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.8 });

    switch(personaje.hair) {
        case 'short':
            const shortHair = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), hairMat);
            shortHair.position.y = 0.05;
            shortHair.scale.y = 0.4;
            hairGroup.add(shortHair);
            break;
        case 'long':
            const longTop = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), hairMat);
            longTop.position.y = 0.05;
            longTop.scale.y = 0.5;
            hairGroup.add(longTop);
            
            const longBack = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 0.4, 8), hairMat);
            longBack.position.set(0, -0.15, -0.32);
            hairGroup.add(longBack);
            
            const longSideL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.15, 0.3, 8), hairMat);
            longSideL.position.set(-0.3, 0.0, 0);
            longSideL.rotation.z = 0.2;
            hairGroup.add(longSideL);
            
            const longSideR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.15, 0.3, 8), hairMat);
            longSideR.position.set(0.3, 0.0, 0);
            longSideR.rotation.z = -0.2;
            hairGroup.add(longSideR);
            break;
        case 'spiky':
            for (let i = 0; i < 7; i++) {
                const spike = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 6), hairMat);
                const angle = (i / 7) * Math.PI * 2;
                spike.position.set(Math.sin(angle) * 0.25, 0.2, Math.cos(angle) * 0.25);
                spike.rotation.x = Math.cos(angle) * 0.5;
                spike.rotation.z = Math.sin(angle) * 0.5;
                hairGroup.add(spike);
            }
            break;
        case 'curly':
            for (let i = 0; i < 12; i++) {
                const curl = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), hairMat);
                const angle = (i / 12) * Math.PI * 2;
                const radius = 0.28;
                curl.position.set(Math.sin(angle) * radius, 0.05 + Math.sin(angle * 2) * 0.05, Math.cos(angle) * radius);
                hairGroup.add(curl);
            }
            break;
        case 'ponytail':
            const ponyBase = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), hairMat);
            ponyBase.position.y = 0.05;
            ponyBase.scale.y = 0.5;
            hairGroup.add(ponyBase);
            
            const ponyTail = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.2, 0.4, 8), hairMat);
            ponyTail.position.set(0, -0.05, -0.35);
            ponyTail.rotation.x = 0.3;
            hairGroup.add(ponyTail);
            break;
        case 'bald':
            break;
        default:
            const defaultHair = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), hairMat);
            defaultHair.position.y = 0.05;
            defaultHair.scale.y = 0.4;
            hairGroup.add(defaultHair);
    }

    hairGroup.position.y = 1.8;
    avatarGroup.add(hairGroup);

    // ====================
    // BRAZOS
    // ====================
    
    const armMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.7 });
    const sleeveMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.6 });

    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.5, 8), armMat);
    armL.position.set(-0.5, 1.15, 0);
    armL.rotation.z = 0.2;
    armL.castShadow = true;
    avatarGroup.add(armL);
    
    const sleeveL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.2, 8), sleeveMat);
    sleeveL.position.set(-0.5, 1.3, 0);
    sleeveL.rotation.z = 0.2;
    avatarGroup.add(sleeveL);

    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.5, 8), armMat);
    armR.position.set(0.5, 1.15, 0);
    armR.rotation.z = -0.2;
    armR.castShadow = true;
    avatarGroup.add(armR);
    
    const sleeveR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.2, 8), sleeveMat);
    sleeveR.position.set(0.5, 1.3, 0);
    sleeveR.rotation.z = -0.2;
    avatarGroup.add(sleeveR);

    // ====================
    // PIERNAS
    // ====================
    
    const legMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.7 });

    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.5, 8), legMat);
    legL.position.set(-0.18, 0.35, 0);
    legL.castShadow = true;
    avatarGroup.add(legL);

    const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.5, 8), legMat);
    legR.position.set(0.18, 0.35, 0);
    legR.castShadow = true;
    avatarGroup.add(legR);

    // ====================
    // ZAPATOS
    // ====================
    
    const shoeMat = new THREE.MeshStandardMaterial({ color: shoesColor, roughness: 0.8 });

    const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.3), shoeMat);
    shoeL.position.set(-0.18, 0.1, 0.05);
    avatarGroup.add(shoeL);

    const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.3), shoeMat);
    shoeR.position.set(0.18, 0.1, 0.05);
    avatarGroup.add(shoeR);

    // ====================
    // ACCESORIOS
    // ====================
    
    // Sombrero
    if (personaje.hat !== 'none') {
        const hatGroup = new THREE.Group();
        const hatMat = new THREE.MeshStandardMaterial({ color: 0x2D2D2D, roughness: 0.8 });
        
        if (personaje.hat === 'tophat') {
            const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.3, 8), hatMat);
            hatTop.position.y = 0.15;
            hatGroup.add(hatTop);
            
            const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.05, 8), hatMat);
            hatBrim.position.y = 0.02;
            hatGroup.add(hatBrim);
        } else if (personaje.hat === 'cap') {
            const capMat = new THREE.MeshStandardMaterial({ color: 0xE74C3C, roughness: 0.8 });
            const cap = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), capMat);
            cap.position.y = 0.05;
            cap.scale.y = 0.5;
            hatGroup.add(cap);
            
            const visor = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.03, 0.15), hatMat);
            visor.position.set(0, -0.02, 0.3);
            hatGroup.add(visor);
        } else if (personaje.hat === 'crown') {
            const crownMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.8, roughness: 0.2 });
            const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.1, 8), crownMat);
            crownBase.position.y = 0.05;
            hatGroup.add(crownBase);
            
            for (let i = 0; i < 5; i++) {
                const spike = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.15, 4), crownMat);
                const angle = (i / 5) * Math.PI * 2;
                spike.position.set(Math.sin(angle) * 0.28, 0.15, Math.cos(angle) * 0.28);
                hatGroup.add(spike);
            }
        }
        
        hatGroup.position.y = 1.95;
        avatarGroup.add(hatGroup);
    }

    // Gafas
    if (personaje.glasses !== 'none') {
        const glassesGroup = new THREE.Group();
        const glassesMat = new THREE.MeshStandardMaterial({ color: 0x2D2D2D, roughness: 0.3, metalness: 0.5 });
        const lensMat = new THREE.MeshStandardMaterial({ 
            color: personaje.glasses === 'sunglasses' ? 0x000000 : 0x88CCFF, 
            transparent: true, 
            opacity: personaje.glasses === 'sunglasses' ? 0.7 : 0.3,
            roughness: 0.1
        });
        
        if (personaje.glasses === 'round' || personaje.glasses === 'sunglasses') {
            const lensL = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), lensMat);
            lensL.position.set(-0.15, 0, 0);
            lensL.rotation.y = 0.2;
            glassesGroup.add(lensL);
            
            const lensR = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), lensMat);
            lensR.position.set(0.15, 0, 0);
            lensR.rotation.y = -0.2;
            glassesGroup.add(lensR);
            
            const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.02), glassesMat);
            bridge.position.set(0, 0, 0);
            glassesGroup.add(bridge);
            
            const armL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.15), glassesMat);
            armL.position.set(-0.15, 0.02, -0.1);
            glassesGroup.add(armL);
            
            const armR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.15), glassesMat);
            armR.position.set(0.15, 0.02, -0.1);
            glassesGroup.add(armR);
        }
        
        glassesGroup.position.set(0, 1.9, 0.35);
        avatarGroup.add(glassesGroup);
    }

    scene.add(avatarGroup);
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
    crearPersonaje();
}

function selectColor(element, key) {
    const color = element.dataset.color;
    
    document.querySelectorAll(`#${element.parentElement.id} .color-swatch`).forEach(el => {
        el.classList.remove('active');
    });
    
    element.classList.add('active');
    personaje[key] = color;
    crearPersonaje();
}

function toggleAutoRotate() {
    autoRotate = !autoRotate;
    controls.autoRotate = autoRotate;
    document.querySelector('.viewer-controls button.active')?.classList.remove('active');
    event.target.classList.add('active');
}

function resetCamera() {
    camera.position.set(4, 3, 6);
    controls.target.set(0, 1.2, 0);
    controls.update();
}

// ==========================================
// PRESETS
// ==========================================

function aplicarPreset(tipo) {
    const presets = {
        hero: { skin: '#F5D0B8', hair: 'short', hairColor: '#FFD700', shirt: '#EF4444', hat: 'none', glasses: 'none' },
        ninja: { skin: '#F5D0B8', hair: 'bald', hairColor: '#000000', shirt: '#1A1A2E', hat: 'none', glasses: 'none' },
        princess: { skin: '#F5D0B8', hair: 'long', hairColor: '#FFD700', shirt: '#FF69B4', hat: 'crown', glasses: 'none' },
        pirate: { skin: '#E8C4A0', hair: 'long', hairColor: '#4A2F1A', shirt: '#000000', hat: 'cap', glasses: 'sunglasses' },
        robot: { skin: '#C0C0C0', hair: 'bald', hairColor: '#000000', shirt: '#808080', hat: 'none', glasses: 'round' },
        alien: { skin: '#00FF00', hair: 'bald', hairColor: '#000000', shirt: '#00CC00', hat: 'none', glasses: 'none' }
    };
    
    if (presets[tipo]) {
        const p = presets[tipo];
        for (let key in p) {
            personaje[key] = p[key];
        }
        actualizarInterfaz();
        crearPersonaje();
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
    crearPersonaje();
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
            crearPersonaje();
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

initScene();
cargarPersonaje();
obtenerMonedas();