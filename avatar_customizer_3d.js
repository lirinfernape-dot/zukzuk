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

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d0d1a);

    camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(4, 3, 6);
    camera.lookAt(0, 1.2, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.2, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;
    controls.minDistance = 2.5;
    controls.maxDistance = 10;
    controls.update();

    // Iluminación suave y bonita
    const ambientLight = new THREE.AmbientLight(0x8888ff, 0.3);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffeedd, 1.0);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.4);
    fillLight.position.set(-4, 2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x88aaff, 0.5);
    rimLight.position.set(-3, 4, -5);
    scene.add(rimLight);

    const hemiLight = new THREE.HemisphereLight(0x6688ff, 0x444422, 0.3);
    scene.add(hemiLight);

    // Suelo
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x0d0d1a,
        roughness: 0.8,
        metalness: 0.1
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    scene.add(floor);

    // Grid decorativo
    const gridHelper = new THREE.GridHelper(6, 12, 0x444488, 0x333366);
    gridHelper.position.y = 0.001;
    scene.add(gridHelper);

    // Sombra suave
    const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.2
    });
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.5, 32), shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.002;
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
// CREAR PERSONAJE BONITO ESTILO ROBLOX
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
    const isFemale = personaje.gender === 'female';

    // Materiales suaves y bonitos
    const skinMat = new THREE.MeshStandardMaterial({ 
        color: skinColor, 
        roughness: 0.4, 
        metalness: 0.05,
        emissive: new THREE.Color(skinColor).multiplyScalar(0.02)
    });

    const shirtMat = new THREE.MeshStandardMaterial({ 
        color: shirtColor, 
        roughness: 0.5, 
        metalness: 0.05,
        emissive: new THREE.Color(shirtColor).multiplyScalar(0.03)
    });

    const pantsMat = new THREE.MeshStandardMaterial({ 
        color: pantsColor, 
        roughness: 0.6, 
        metalness: 0.05 
    });

    const shoesMat = new THREE.MeshStandardMaterial({ 
        color: shoesColor, 
        roughness: 0.7, 
        metalness: 0.1 
    });

    const hairMat = new THREE.MeshStandardMaterial({ 
        color: hairColor, 
        roughness: 0.8, 
        metalness: 0.02 
    });

    // ====================
    // CUERPO - Estilo Roblox (cabeza grande, cuerpo proporcionado)
    // ====================

    // Torso
    const torsoGeo = new THREE.CylinderGeometry(
        isFemale ? 0.55 : 0.65,
        isFemale ? 0.45 : 0.55,
        0.75,
        12
    );
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.y = 0.4;
    torso.castShadow = true;
    avatarGroup.add(torso);

    // Cuello (corto y gordito)
    const neckGeo = new THREE.CylinderGeometry(0.2, 0.22, 0.08, 8);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = 0.8;
    avatarGroup.add(neck);

    // ====================
    // CABEZA - Grande estilo Roblox
    // ====================

    const headGeo = new THREE.SphereGeometry(0.42, 32, 32);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.0;
    head.scale.set(1, 1.05, 0.95);
    head.castShadow = true;
    avatarGroup.add(head);

    // ====================
    // OJOS - Grandes y brillantes estilo Roblox
    // ====================

    // Base blanca (más grande)
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ 
        color: 0xffffff, 
        roughness: 0.1,
        emissive: 0x4488ff,
        emissiveIntensity: 0.05
    });

    // Iris (color según género)
    const irisColor = isMale ? 0x5C3D2E : (isFemale ? 0x4A90D9 : 0x6B4F3A);
    const irisMat = new THREE.MeshStandardMaterial({ 
        color: irisColor, 
        roughness: 0.2,
        emissive: new THREE.Color(irisColor).multiplyScalar(0.1)
    });

    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.1 });

    for (let side = -1; side <= 1; side += 2) {
        // Blanco del ojo (más grande)
        const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), eyeWhiteMat);
        eyeWhite.position.set(side * 0.18, 1.02, 0.38);
        eyeWhite.scale.set(1, 0.9, 0.6);
        avatarGroup.add(eyeWhite);

        // Iris
        const iris = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), irisMat);
        iris.position.set(side * 0.18, 1.01, 0.46);
        avatarGroup.add(iris);

        // Pupila
        const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), pupilMat);
        pupil.position.set(side * 0.18, 1.00, 0.50);
        avatarGroup.add(pupil);

        // Brillo (destello)
        const sparkleMat = new THREE.MeshStandardMaterial({ 
            color: 0xffffff, 
            emissive: 0x88ccff,
            emissiveIntensity: 0.5,
            roughness: 0.1
        });
        const sparkle = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), sparkleMat);
        sparkle.position.set(side * 0.15, 1.04, 0.52);
        avatarGroup.add(sparkle);
        
        // Segundo brillo más pequeño
        const sparkle2 = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), sparkleMat);
        sparkle2.position.set(side * 0.21, 0.98, 0.52);
        avatarGroup.add(sparkle2);
    }

    // ====================
    // CEJAS - Simpáticas
    // ====================

    const browMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.8 });
    for (let side = -1; side <= 1; side += 2) {
        const brow = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.02), browMat);
        brow.position.set(side * 0.18, 1.08, 0.40);
        brow.rotation.z = side * 0.1;
        brow.rotation.x = -0.1;
        avatarGroup.add(brow);
    }

    // ====================
    // BOCA - Sonrisa linda
    // ====================

    const mouthMat = new THREE.MeshStandardMaterial({ 
        color: 0xCC8899, 
        roughness: 0.5,
        emissive: 0xCC8899,
        emissiveIntensity: 0.05
    });
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.01), mouthMat);
    mouth.position.set(0, 0.93, 0.44);
    avatarGroup.add(mouth);

    // Sonrisa
    const smileMat = new THREE.MeshStandardMaterial({ 
        color: 0xCC8899, 
        roughness: 0.5,
        transparent: true,
        opacity: 0.3
    });
    const smile = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.005, 0.01), smileMat);
    smile.position.set(0, 0.91, 0.44);
    avatarGroup.add(smile);

    // ====================
    // NARIZ - Pequeña y bonita
    // ====================

    const noseMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.6 });
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), noseMat);
    nose.position.set(0, 0.98, 0.46);
    nose.scale.set(0.8, 0.6, 0.5);
    avatarGroup.add(nose);

    // ====================
    // OREJAS - Pequeñas
    // ====================

    const earMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.6 });
    for (let side = -1; side <= 1; side += 2) {
        const ear = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), earMat);
        ear.position.set(side * 0.44, 0.98, 0);
        ear.scale.set(0.3, 0.5, 0.2);
        avatarGroup.add(ear);
    }

    // ====================
    // CABELLO - Bonito y estilizado
    // ====================

    const hairGroup = new THREE.Group();

    if (personaje.hair !== 'bald') {
        const hairMatMain = new THREE.MeshStandardMaterial({ 
            color: hairColor, 
            roughness: 0.7,
            metalness: 0.02
        });

        // Base del cabello
        const hairBase = new THREE.Mesh(new THREE.SphereGeometry(0.44, 16, 16, 0, Math.PI*2, 0, Math.PI/2), hairMatMain);
        hairBase.position.y = 0.05;
        hairBase.scale.y = 0.55;
        hairGroup.add(hairBase);

        switch(personaje.hair) {
            case 'short':
                for (let i = 0; i < 10; i++) {
                    const clump = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), hairMatMain);
                    const angle = (i / 10) * Math.PI * 2;
                    clump.position.set(Math.sin(angle)*0.34, 0.06 + Math.cos(angle*2)*0.04, Math.cos(angle)*0.34);
                    clump.scale.set(1, 0.6, 1);
                    hairGroup.add(clump);
                }
                break;
            case 'long':
                const longMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.7 });
                const frontHair = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16, 0, Math.PI*2, 0, Math.PI/2), longMat);
                frontHair.position.y = 0.05;
                frontHair.scale.y = 0.5;
                hairGroup.add(frontHair);
                
                for (let i = 0; i < 4; i++) {
                    const strand = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, 0.15, 6), longMat);
                    strand.position.set(0, -0.05 - i*0.1, -0.34 - i*0.04);
                    strand.rotation.x = 0.1 + i*0.08;
                    hairGroup.add(strand);
                }
                break;
            case 'spiky':
                const spikyBase = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16, 0, Math.PI*2, 0, Math.PI/2), hairMatMain);
                spikyBase.position.y = 0.05;
                spikyBase.scale.y = 0.4;
                hairGroup.add(spikyBase);
                for (let i = 0; i < 10; i++) {
                    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.18, 6), hairMatMain);
                    const angle = (i / 10) * Math.PI * 2;
                    spike.position.set(Math.sin(angle)*0.30, 0.15, Math.cos(angle)*0.30);
                    spike.rotation.x = Math.cos(angle) * 0.5;
                    spike.rotation.z = Math.sin(angle) * 0.5;
                    hairGroup.add(spike);
                }
                break;
            case 'curly':
                for (let i = 0; i < 25; i++) {
                    const curl = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), hairMatMain);
                    const angle = (i / 25) * Math.PI * 2;
                    curl.position.set(Math.sin(angle)*0.35, 0.06 + Math.sin(i*3)*0.04, Math.cos(angle)*0.35);
                    curl.scale.set(1, 0.8, 1);
                    hairGroup.add(curl);
                }
                break;
            case 'ponytail':
                const ponyMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.7 });
                const ponyBase2 = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16, 0, Math.PI*2, 0, Math.PI/2), ponyMat);
                ponyBase2.position.y = 0.05;
                ponyBase2.scale.y = 0.5;
                hairGroup.add(ponyBase2);
                for (let i = 0; i < 5; i++) {
                    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, 0.12, 6), ponyMat);
                    tail.position.set(0, -0.05 - i*0.08, -0.34 - i*0.03);
                    tail.rotation.x = 0.15 + i*0.06;
                    hairGroup.add(tail);
                }
                break;
        }
        hairGroup.position.y = 1.0;
        avatarGroup.add(hairGroup);
    }

    // ====================
    // BRAZOS - Gorditos y bonitos
    // ====================

    const armMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.5 });
    
    for (let side = -1; side <= 1; side += 2) {
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.4, 8), armMat);
        arm.position.set(side * 0.45, 0.55, 0);
        arm.rotation.z = side * 0.15;
        arm.castShadow = true;
        avatarGroup.add(arm);

        const hand = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), armMat);
        hand.position.set(side * 0.45, 0.05, 0);
        avatarGroup.add(hand);
    }

    // ====================
    // PIERNAS - Gorditas estilo Roblox
    // =================================
    
    const legMat2 = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.6 });
    const legWidth2 = isFemale ? 0.07 : 0.085;
    
    for (let side = -1; side <= 1; side += 2) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(legWidth2, legWidth2*1.2, 0.45, 8), legMat2);
        leg.position.set(side * 0.17, 0.25, 0);
        leg.castShadow = true;
        avatarGroup.add(leg);
    }

    // ====================
    // ZAPATOS - Bonitos
    // ====================

    for (let side = -1; side <= 1; side += 2) {
        const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.25), shoesMat);
        shoe.position.set(side * 0.17, 0.02, 0.03);
        shoe.castShadow = true;
        avatarGroup.add(shoe);
        
        // Suela
        const soleMat2 = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.9 });
        const sole = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.02, 0.27), soleMat2);
        sole.position.set(side * 0.17, -0.01, 0.03);
        avatarGroup.add(sole);
    }

    // ====================
    // ACCESORIOS - Bonitos
    // ====================

    // Sombrero
    if (personaje.hat !== 'none') {
        const hatGroup2 = new THREE.Group();
        const hatMat2 = new THREE.MeshStandardMaterial({ color: 0x2D2D2D, roughness: 0.6 });
        
        if (personaje.hat === 'tophat') {
            const top = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.30, 0.28, 8), hatMat2);
            top.position.y = 0.14;
            hatGroup2.add(top);
            const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 8), hatMat2);
            brim.position.y = 0.02;
            hatGroup2.add(brim);
            // Cinta
            const ribbonMat2 = new THREE.MeshStandardMaterial({ color: 0xE74C3C });
            const ribbon = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.03, 8), ribbonMat2);
            ribbon.position.y = 0.1;
            hatGroup2.add(ribbon);
        } else if (personaje.hat === 'cap') {
            const cap = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 8, 0, Math.PI*2, 0, Math.PI/2), hatMat2);
            cap.position.y = 0.05;
            cap.scale.y = 0.5;
            hatGroup2.add(cap);
            const visor = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.02, 0.10), hatMat2);
            visor.position.set(0, -0.02, 0.26);
            hatGroup2.add(visor);
        } else if (personaje.hat === 'crown') {
            const crownMat2 = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.9, roughness: 0.1 });
            const base = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.06, 8), crownMat2);
            base.position.y = 0.03;
            hatGroup2.add(base);
            for (let i = 0; i < 7; i++) {
                const spike = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.16, 4), crownMat2);
                const angle = (i / 7) * Math.PI * 2;
                spike.position.set(Math.sin(angle)*0.24, 0.13, Math.cos(angle)*0.24);
                hatGroup2.add(spike);
            }
            // Joyas
            const jewelMat2 = new THREE.MeshStandardMaterial({ 
                color: 0xE74C3C, 
                emissive: 0xE74C3C,
                emissiveIntensity: 0.2
            });
            for (let i = 0; i < 5; i++) {
                const jewel = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), jewelMat2);
                const angle = (i / 5) * Math.PI * 2 + 0.3;
                jewel.position.set(Math.sin(angle)*0.24, 0.03, Math.cos(angle)*0.24);
                hatGroup2.add(jewel);
            }
        }
        hatGroup2.position.y = 1.15;
        avatarGroup.add(hatGroup2);
    }

    // Gafas
    if (personaje.glasses !== 'none') {
        const glassesGroup2 = new THREE.Group();
        const glassMat2 = new THREE.MeshStandardMaterial({ 
            color: personaje.glasses === 'sunglasses' ? 0x1a1a2e : 0x4488ff,
            transparent: true,
            opacity: personaje.glasses === 'sunglasses' ? 0.6 : 0.25,
            roughness: 0.1,
            metalness: 0.1
        });
        const frameMat2 = new THREE.MeshStandardMaterial({ 
            color: 0x2D2D2D, 
            roughness: 0.2,
            metalness: 0.5
        });
        
        if (personaje.glasses === 'round' || personaje.glasses === 'sunglasses') {
            for (let side = -1; side <= 1; side += 2) {
                const lens = new THREE.Mesh(new THREE.CircleGeometry(0.09, 16), glassMat2);
                lens.position.set(side * 0.13, 0, 0);
                lens.rotation.y = side * 0.1;
                glassesGroup2.add(lens);
                
                const frame = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.015, 8, 16), frameMat2);
                frame.position.set(side * 0.13, 0, 0);
                frame.rotation.y = side * 0.1;
                glassesGroup2.add(frame);
            }
            const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.015, 0.015), frameMat2);
            bridge.position.set(0, 0, 0);
            glassesGroup2.add(bridge);
        }
        glassesGroup2.position.set(0, 1.04, 0.42);
        avatarGroup.add(glassesGroup2);
    }

    // ====================
    // DETALLES FINALES
    // ====================
    
    // Collar de la camisa
    const collarMat = new THREE.MeshStandardMaterial({ 
        color: shirtColor, 
        roughness: 0.5,
        emissive: new THREE.Color(shirtColor).multiplyScalar(0.02)
    });
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.02, 0.10), collarMat);
    collar.position.set(0, 0.8, 0.18);
    avatarGroup.add(collar);

    // Aplicar wireframe si está activado
    if (wireframeMode) {
        avatarGroup.traverse((child) => {
            if (child.isMesh) {
                child.material.wireframe = true;
            }
        });
    }

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
    camera.position.set(4, 3, 6);
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