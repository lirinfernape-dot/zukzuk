// Configuración de la URL
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:5000'
    : 'https://zukzuk-fvhn.onrender.com';

console.log('🎨 Avatar Studio 3D - API_URL:', API_URL);

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

let avatarGroup;
let autoRotate = true;
let wireframeMode = false;
let scene, camera, renderer, controls;

// ==========================================
// INICIALIZAR ESCENA 3D
// ==========================================

function initScene() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d0d1a);

    // Cámara
    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(3, 2.5, 5);
    camera.lookAt(0, 1, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Controles
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.2, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.update();

    // ====================
    // ILUMINACIÓN PROFESIONAL
    // ====================

    // Luz ambiente
    const ambientLight = new THREE.AmbientLight(0x404060, 0.4);
    scene.add(ambientLight);

    // Luz principal
    const keyLight = new THREE.DirectionalLight(0xffeedd, 1.2);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Luz de relleno
    const fillLight = new THREE.DirectionalLight(0x4488ff, 0.5);
    fillLight.position.set(-4, 2, -3);
    scene.add(fillLight);

    // Luz de borde
    const rimLight = new THREE.DirectionalLight(0x88aaff, 0.6);
    rimLight.position.set(-2, 4, -5);
    scene.add(rimLight);

    // Luz de fondo
    const backLight = new THREE.DirectionalLight(0x6688ff, 0.2);
    backLight.position.set(0, 1, -8);
    scene.add(backLight);

    // Hemisferio
    const hemiLight = new THREE.HemisphereLight(0x4488ff, 0x444422, 0.3);
    scene.add(hemiLight);

    // ====================
    // FONDO Y DECORACIÓN
    // ====================

    // Suelo
    const floorGeo = new THREE.PlaneGeometry(10, 10);
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x0d0d1a,
        roughness: 0.8,
        metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    scene.add(floor);

    // Círculo de luz
    const glowGeo = new THREE.RingGeometry(0.5, 2.5, 64);
    const glowMat = new THREE.MeshBasicMaterial({
        color: 0x4488ff,
        transparent: true,
        opacity: 0.05,
        side: THREE.DoubleSide
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = 0.001;
    scene.add(glow);

    // Grid
    const gridHelper = new THREE.GridHelper(6, 15, 0x444466, 0x333355);
    gridHelper.position.y = 0.001;
    scene.add(gridHelper);

    // Sombra
    const shadowGeo = new THREE.CircleGeometry(1.8, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.25
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.002;
    scene.add(shadow);

    // Crear personaje
    crearPersonaje();

    // Animación
    animate();

    // Resize
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
// CREAR PERSONAJE 3D PROFESIONAL
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
    const isMale = personaje.gender === 'male';

    // Materiales
    const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.5, metalness: 0.05 });
    const skinMatShiny = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.3, metalness: 0.1 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.5, metalness: 0.05 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.6, metalness: 0.05 });
    const shoesMat = new THREE.MeshStandardMaterial({ color: shoesColor, roughness: 0.7, metalness: 0.1 });
    const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.8, metalness: 0.05 });

    // ====================
    // CUERPO
    // ====================

    // Torso
    const torsoGeo = new THREE.CylinderGeometry(isMale ? 0.7 : 0.6, isMale ? 0.55 : 0.5, 0.85, 12);
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.y = 0.45;
    torso.castShadow = true;
    avatarGroup.add(torso);

    // Cuello
    const neckGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.12, 8);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = 0.92;
    avatarGroup.add(neck);

    // ====================
    // CABEZA
    // ====================

    const headGeo = new THREE.SphereGeometry(0.38, 32, 32);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.1;
    head.scale.set(1, 1.05, 0.95);
    head.castShadow = true;
    avatarGroup.add(head);

    // ====================
    // OJOS
    // ====================

    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
    const irisMat = new THREE.MeshStandardMaterial({ 
        color: isMale ? 0x5C3D2E : 0x4A90D9, 
        roughness: 0.2 
    });
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e });

    for (let side = -1; side <= 1; side += 2) {
        // Blanco del ojo
        const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), eyeWhiteMat);
        eyeWhite.position.set(side * 0.16, 1.12, 0.35);
        eyeWhite.scale.set(1, 0.9, 0.6);
        avatarGroup.add(eyeWhite);

        // Iris
        const iris = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), irisMat);
        iris.position.set(side * 0.16, 1.11, 0.42);
        avatarGroup.add(iris);

        // Pupila
        const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), pupilMat);
        pupil.position.set(side * 0.16, 1.10, 0.45);
        avatarGroup.add(pupil);

        // Brillo
        const sparkleMat = new THREE.MeshStandardMaterial({ 
            color: 0xffffff, 
            emissive: 0x88ccff,
            emissiveIntensity: 0.3 
        });
        const sparkle = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), sparkleMat);
        sparkle.position.set(side * 0.13, 1.14, 0.46);
        avatarGroup.add(sparkle);
    }

    // ====================
    // CABELLO
    // ====================

    const hairGroup = new THREE.Group();

    if (personaje.hair !== 'bald') {
        switch(personaje.hair) {
            case 'short':
                const shortHair = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16, 0, Math.PI*2, 0, Math.PI/2), hairMat);
                shortHair.position.y = 0.05;
                shortHair.scale.y = 0.5;
                hairGroup.add(shortHair);
                break;
            case 'long':
                const longTop = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16, 0, Math.PI*2, 0, Math.PI/2), hairMat);
                longTop.position.y = 0.05;
                longTop.scale.y = 0.55;
                hairGroup.add(longTop);
                
                for (let i = 0; i < 3; i++) {
                    const strand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.15, 6), hairMat);
                    strand.position.set(0, -0.05 - i*0.1, -0.32 - i*0.04);
                    strand.rotation.x = 0.1 + i*0.08;
                    hairGroup.add(strand);
                }
                break;
            case 'spiky':
                const spikyBase = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16, 0, Math.PI*2, 0, Math.PI/2), hairMat);
                spikyBase.position.y = 0.05;
                spikyBase.scale.y = 0.4;
                hairGroup.add(spikyBase);
                for (let i = 0; i < 9; i++) {
                    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.2, 6), hairMat);
                    const angle = (i / 9) * Math.PI * 2;
                    spike.position.set(Math.sin(angle)*0.28, 0.15, Math.cos(angle)*0.28);
                    spike.rotation.x = Math.cos(angle) * 0.5;
                    spike.rotation.z = Math.sin(angle) * 0.5;
                    hairGroup.add(spike);
                }
                break;
            case 'curly':
                for (let i = 0; i < 20; i++) {
                    const curl = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), hairMat);
                    const angle = (i / 20) * Math.PI * 2;
                    curl.position.set(Math.sin(angle)*0.32, 0.06 + Math.sin(i*3)*0.04, Math.cos(angle)*0.32);
                    hairGroup.add(curl);
                }
                break;
            case 'ponytail':
                const ponyBase = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16, 0, Math.PI*2, 0, Math.PI/2), hairMat);
                ponyBase.position.y = 0.05;
                ponyBase.scale.y = 0.5;
                hairGroup.add(ponyBase);
                for (let i = 0; i < 4; i++) {
                    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.045, 0.12, 6), hairMat);
                    tail.position.set(0, -0.05 - i*0.08, -0.32 - i*0.03);
                    tail.rotation.x = 0.15 + i*0.06;
                    hairGroup.add(tail);
                }
                break;
        }
        hairGroup.position.y = 1.1;
        avatarGroup.add(hairGroup);
    }

    // ====================
    // BRAZOS
    // ====================

    for (let side = -1; side <= 1; side += 2) {
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.5, 8), skinMat);
        arm.position.set(side * 0.5, 0.7, 0);
        arm.rotation.z = side * 0.15;
        arm.castShadow = true;
        avatarGroup.add(arm);

        const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), skinMat);
        hand.position.set(side * 0.5, 0.05, 0);
        avatarGroup.add(hand);
    }

    // ====================
    // PIERNAS
    // ====================

    const legWidth = isMale ? 0.08 : 0.065;
    for (let side = -1; side <= 1; side += 2) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(legWidth, legWidth*1.2, 0.55, 8), pantsMat);
        leg.position.set(side * 0.18, 0.3, 0);
        leg.castShadow = true;
        avatarGroup.add(leg);
    }

    // ====================
    // ZAPATOS
    // ====================

    for (let side = -1; side <= 1; side += 2) {
        const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.06, 0.28), shoesMat);
        shoe.position.set(side * 0.18, 0.02, 0.04);
        shoe.castShadow = true;
        avatarGroup.add(shoe);
    }

    // ====================
    // ACCESORIOS
    // ====================

    // Sombrero
    if (personaje.hat !== 'none') {
        const hatGroup = new THREE.Group();
        const hatMat = new THREE.MeshStandardMaterial({ color: 0x2D2D2D, roughness: 0.6 });
        
        if (personaje.hat === 'tophat') {
            const top = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.32, 0.3, 8), hatMat);
            top.position.y = 0.15;
            hatGroup.add(top);
            const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.04, 8), hatMat);
            brim.position.y = 0.02;
            hatGroup.add(brim);
        } else if (personaje.hat === 'cap') {
            const cap = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8, 0, Math.PI*2, 0, Math.PI/2), hatMat);
            cap.position.y = 0.05;
            cap.scale.y = 0.5;
            hatGroup.add(cap);
            const visor = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.12), hatMat);
            visor.position.set(0, -0.02, 0.28);
            hatGroup.add(visor);
        } else if (personaje.hat === 'crown') {
            const crownMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.9, roughness: 0.1 });
            const base = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.08, 8), crownMat);
            base.position.y = 0.04;
            hatGroup.add(base);
            for (let i = 0; i < 7; i++) {
                const spike = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.18, 4), crownMat);
                const angle = (i / 7) * Math.PI * 2;
                spike.position.set(Math.sin(angle)*0.26, 0.15, Math.cos(angle)*0.26);
                hatGroup.add(spike);
            }
        }
        hatGroup.position.y = 1.25;
        avatarGroup.add(hatGroup);
    }

    // Gafas
    if (personaje.glasses !== 'none') {
        const glassesGroup = new THREE.Group();
        const glassMat = new THREE.MeshStandardMaterial({ 
            color: personaje.glasses === 'sunglasses' ? 0x1a1a2e : 0x4488ff,
            transparent: true,
            opacity: personaje.glasses === 'sunglasses' ? 0.7 : 0.3,
            roughness: 0.1
        });
        
        if (personaje.glasses === 'round' || personaje.glasses === 'sunglasses') {
            for (let side = -1; side <= 1; side += 2) {
                const lens = new THREE.Mesh(new THREE.CircleGeometry(0.1, 16), glassMat);
                lens.position.set(side * 0.14, 0, 0);
                lens.rotation.y = side * 0.1;
                glassesGroup.add(lens);
            }
        }
        glassesGroup.position.set(0, 1.13, 0.4);
        avatarGroup.add(glassesGroup);
    }

    // Aplicar wireframe si está activado
    if (wireframeMode) {
        avatarGroup.traverse((child) => {
            if (child.isMesh) {
                child.material.wireframe = true;
            }
        });
    }

    // Escala
    avatarGroup.scale.set(0.9, 0.9, 0.9);
    scene.add(avatarGroup);
}

// ==========================================
// FUNCIONES DE CONTROL
// ==========================================

function toggleWireframe() {
    wireframeMode = !wireframeMode;
    avatarGroup.traverse((child) => {
        if (child.isMesh) {
            child.material.wireframe = wireframeMode;
        }
    });
}

function toggleAutoRotate() {
    autoRotate = !autoRotate;
    controls.autoRotate = autoRotate;
    document.querySelectorAll('.viewer-controls button').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
}

function resetCamera() {
    camera.position.set(3, 2.5, 5);
    controls.target.set(0, 1.2, 0);
    controls.update();
}

// ==========================================
// FUNCIONES DE INTERACCIÓN
// ==========================================

function selectOption(element) {
    const option = element.dataset.option;
    const value = element.dataset.value;
    
    document.querySelectorAll(`[data-option="${option}"]`).forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    personaje[option] = value;
    crearPersonaje();
}

function selectColor(element, key) {
    const color = element.dataset.color;
    document.querySelectorAll(`#${element.parentElement.id} .color-swatch`).forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    personaje[key] = color;
    crearPersonaje();
}

function aplicarPreset(tipo) {
    const presets = {
        hero: { gender: 'male', skin: '#F5D0B8', hair: 'spiky', hairColor: '#FFD700', shirt: '#EF4444', hat: 'none', glasses: 'none' },
        ninja: { gender: 'male', skin: '#F5D0B8', hair: 'bald', hairColor: '#000000', shirt: '#1A1A2E', hat: 'none', glasses: 'none' },
        princess: { gender: 'female', skin: '#F5D0B8', hair: 'long', hairColor: '#FFD700', shirt: '#FF69B4', hat: 'crown', glasses: 'none' },
        pirate: { gender: 'male', skin: '#E8C4A0', hair: 'long', hairColor: '#4A2F1A', shirt: '#000000', hat: 'cap', glasses: 'sunglasses' },
        robot: { gender: 'neutral', skin: '#C0C0C0', hair: 'bald', hairColor: '#000000', shirt: '#808080', hat: 'none', glasses: 'round' },
        alien: { gender: 'neutral', skin: '#00FF00', hair: 'bald', hairColor: '#000000', shirt: '#00CC00', hat: 'none', glasses: 'none' }
    };
    if (presets[tipo]) {
        Object.assign(personaje, presets[tipo]);
        actualizarInterfaz();
        crearPersonaje();
    }
}

function actualizarInterfaz() {
    document.querySelectorAll('.style-btn').forEach(el => {
        const option = el.dataset.option;
        const value = el.dataset.value;
        el.classList.toggle('active', personaje[option] === value);
    });
    document.querySelectorAll('.color-swatch').forEach(el => {
        const color = el.dataset.color;
        const parentId = el.parentElement.id;
        let targetKey = parentId === 'skinColors' ? 'skin' : parentId === 'hairColors' ? 'hairColor' : null;
        if (targetKey) {
            el.classList.toggle('active', personaje[targetKey] === color);
        }
    });
}

function resetPersonaje() {
    personaje = { gender: 'male', skin: '#F5D0B8', hair: 'short', hairColor: '#4A2F1A', shirt: '#3B82F6', pants: '#1E3A5F', shoes: '#2D2D2D', hat: 'none', glasses: 'none' };
    actualizarInterfaz();
    crearPersonaje();
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
    crearPersonaje();
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
            crearPersonaje();
        }
    } catch (error) {
        console.error("Error cargando personaje:", error);
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

initScene();
cargarPersonaje();
obtenerMonedas();