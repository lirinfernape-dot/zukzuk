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

let avatarGroup;
let autoRotate = true;
let wireframeMode = false;
let scene, camera, renderer, controls;

// ==========================================
// INICIALIZAR ESCENA 3D
// ==========================================

function initScene() {
    const container = document.getElementById('avatarContainer');
    const width = container.clientWidth;
    const height = container.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d0d1a);

    camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(3.5, 2.5, 5);
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
    controls.minDistance = 2;
    controls.maxDistance = 8;
    controls.update();

    // Iluminación
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

    const gridHelper = new THREE.GridHelper(6, 12, 0x444488, 0x333366);
    gridHelper.position.y = 0.001;
    scene.add(gridHelper);

    const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.15
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
// CREAR PERSONAJE 3D ESTILO ROBLOX
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
    const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.4, metalness: 0.05 });
    const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.8, metalness: 0.02 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.5, metalness: 0.05 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.6, metalness: 0.05 });
    const shoesMat = new THREE.MeshStandardMaterial({ color: shoesColor, roughness: 0.7, metalness: 0.1 });

    // ====================
    // CUERPO PRINCIPAL
    // ====================

    // Torso (diferente para hombre/mujer)
    const torsoWidth = isMale ? 0.65 : 0.55;
    const torso = new THREE.Mesh(
        new THREE.CylinderGeometry(torsoWidth, isMale ? 0.5 : 0.45, 0.75, 12),
        shirtMat
    );
    torso.position.y = 0.4;
    torso.castShadow = true;
    avatarGroup.add(torso);

    // Pecho (solo femenino - sutil)
    if (!isMale) {
        const chestMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.5 });
        const chest = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), chestMat);
        chest.position.set(0, 0.6, 0.25);
        chest.scale.set(1, 0.7, 0.5);
        avatarGroup.add(chest);
    }

    // Cuello
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.08, 8), skinMat);
    neck.position.y = 0.8;
    avatarGroup.add(neck);

    // ====================
    // CABEZA - GRANDE ESTILO ROBLOX
    // ====================

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.4, 32, 32), skinMat);
    head.position.y = 1.0;
    head.scale.set(1, 1.05, 0.95);
    head.castShadow = true;
    avatarGroup.add(head);

    // ====================
    // OJOS - GRANDES Y BONITOS
    // ====================

    const eyeWhiteMat = new THREE.MeshStandardMaterial({ 
        color: 0xffffff, 
        roughness: 0.1,
        emissive: 0x4488ff,
        emissiveIntensity: 0.05
    });
    const irisColor = isMale ? 0x5C3D2E : 0x4A90D9;
    const irisMat = new THREE.MeshStandardMaterial({ 
        color: irisColor, 
        roughness: 0.2,
        emissive: new THREE.Color(irisColor).multiplyScalar(0.1)
    });
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e });
    const sparkleMat = new THREE.MeshStandardMaterial({ 
        color: 0xffffff, 
        emissive: 0x88ccff,
        emissiveIntensity: 0.3
    });

    for (let side = -1; side <= 1; side += 2) {
        // Blanco del ojo
        const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), eyeWhiteMat);
        eyeWhite.position.set(side * 0.17, 1.02, 0.36);
        eyeWhite.scale.set(1, 0.9, 0.6);
        avatarGroup.add(eyeWhite);

        // Iris
        const iris = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), irisMat);
        iris.position.set(side * 0.17, 1.01, 0.44);
        avatarGroup.add(iris);

        // Pupila
        const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), pupilMat);
        pupil.position.set(side * 0.17, 1.00, 0.48);
        avatarGroup.add(pupil);

        // Brillo
        const sparkle = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), sparkleMat);
        sparkle.position.set(side * 0.14, 1.04, 0.50);
        avatarGroup.add(sparkle);
    }

    // Cejas
    const browMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.8 });
    for (let side = -1; side <= 1; side += 2) {
        const brow = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.02), browMat);
        brow.position.set(side * 0.18, 1.08, 0.40);
        brow.rotation.z = side * 0.1;
        brow.rotation.x = -0.1;
        avatarGroup.add(brow);
    }

    // Boca - sonrisa
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0xCC8899, roughness: 0.5 });
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.01), mouthMat);
    mouth.position.set(0, 0.93, 0.42);
    avatarGroup.add(mouth);

    // Nariz
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), skinMat);
    nose.position.set(0, 0.98, 0.44);
    nose.scale.set(0.8, 0.6, 0.5);
    avatarGroup.add(nose);

    // Orejas
    for (let side = -1; side <= 1; side += 2) {
        const ear = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), skinMat);
        ear.position.set(side * 0.42, 0.98, 0);
        ear.scale.set(0.3, 0.5, 0.2);
        avatarGroup.add(ear);
    }

    // ====================
    // CABELLO - COMPARTIDO ENTRE GÉNEROS
    // ====================

    const hairGroup = new THREE.Group();

    if (personaje.hair !== 'bald') {
        const hairBase = new THREE.Mesh(
            new THREE.SphereGeometry(0.42, 16, 16, 0, Math.PI*2, 0, Math.PI/2),
            hairMat
        );
        hairBase.position.y = 0.05;
        hairBase.scale.y = 0.55;
        hairGroup.add(hairBase);

        switch(personaje.hair) {
            case 'short':
                for (let i = 0; i < 10; i++) {
                    const clump = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), hairMat);
                    const angle = (i / 10) * Math.PI * 2;
                    clump.position.set(Math.sin(angle)*0.32, 0.06, Math.cos(angle)*0.32);
                    clump.scale.set(1, 0.6, 1);
                    hairGroup.add(clump);
                }
                break;
            case 'long':
                const longMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.7 });
                // Cabello largo
                for (let i = 0; i < 8; i++) {
                    const strand = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, 0.15, 6), longMat);
                    const angle = (i / 8) * Math.PI * 2;
                    strand.position.set(Math.sin(angle)*0.30, -0.05, Math.cos(angle)*0.30);
                    strand.rotation.x = Math.cos(angle) * 0.3;
                    strand.rotation.z = Math.sin(angle) * 0.3;
                    hairGroup.add(strand);
                }
                break;
            case 'spiky':
                const spikyBase = new THREE.Mesh(
                    new THREE.SphereGeometry(0.38, 16, 16, 0, Math.PI*2, 0, Math.PI/2),
                    hairMat
                );
                spikyBase.position.y = 0.05;
                spikyBase.scale.y = 0.4;
                hairGroup.add(spikyBase);
                for (let i = 0; i < 12; i++) {
                    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.18, 6), hairMat);
                    const angle = (i / 12) * Math.PI * 2;
                    spike.position.set(Math.sin(angle)*0.28, 0.15, Math.cos(angle)*0.28);
                    spike.rotation.x = Math.cos(angle) * 0.5;
                    spike.rotation.z = Math.sin(angle) * 0.5;
                    hairGroup.add(spike);
                }
                break;
            case 'curly':
                for (let i = 0; i < 25; i++) {
                    const curl = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), hairMat);
                    const angle = (i / 25) * Math.PI * 2;
                    curl.position.set(Math.sin(angle)*0.33, 0.06 + Math.sin(i*3)*0.04, Math.cos(angle)*0.33);
                    hairGroup.add(curl);
                }
                break;
            case 'ponytail':
                const ponyMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.7 });
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
    // BRAZOS
    // ====================

    const armMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.5 });
    
    for (let side = -1; side <= 1; side += 2) {
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.4, 8), armMat);
        arm.position.set(side * 0.45, 0.55, 0);
        arm.rotation.z = side * 0.15;
        arm.castShadow = true;
        avatarGroup.add(arm);

        const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), armMat);
        hand.position.set(side * 0.45, 0.05, 0);
        avatarGroup.add(hand);
    }

    // ====================
    // PIERNAS
    // ====================

    const legWidth = isMale ? 0.075 : 0.065;
    for (let side = -1; side <= 1; side += 2) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(legWidth, legWidth*1.2, 0.45, 8), pantsMat);
        leg.position.set(side * 0.17, 0.25, 0);
        leg.castShadow = true;
        avatarGroup.add(leg);
    }

    // ====================
    // ZAPATOS
    // ====================

    for (let side = -1; side <= 1; side += 2) {
        const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.25), shoesMat);
        shoe.position.set(side * 0.17, 0.02, 0.03);
        shoe.castShadow = true;
        avatarGroup.add(shoe);
    }

    // ====================
    // ACCESORIOS - COMPARTIDOS ENTRE GÉNEROS
    // ====================

    // Sombrero (compartido)
    if (personaje.hat !== 'none') {
        const hatGroup = new THREE.Group();
        const hatMat2 = new THREE.MeshStandardMaterial({ color: 0x2D2D2D, roughness: 0.6 });
        
        if (personaje.hat === 'tophat') {
            const top = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 0.25, 8), hatMat2);
            top.position.y = 0.12;
            hatGroup.add(top);
            const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.04, 8), hatMat2);
            brim.position.y = 0.02;
            hatGroup.add(brim);
            // Cinta
            const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xE74C3C });
            const ribbon = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 8), ribbonMat);
            ribbon.position.y = 0.08;
            hatGroup.add(ribbon);
        } else if (personaje.hat === 'cap') {
            const cap = new THREE.Mesh(
                new THREE.SphereGeometry(0.24, 8, 8, 0, Math.PI*2, 0, Math.PI/2),
                hatMat2
            );
            cap.position.y = 0.05;
            cap.scale.y = 0.5;
            hatGroup.add(cap);
            const visor = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.02, 0.10), hatMat2);
            visor.position.set(0, -0.02, 0.24);
            hatGroup.add(visor);
        } else if (personaje.hat === 'crown') {
            const crownMat = new THREE.MeshStandardMaterial({ 
                color: 0xFFD700, 
                metalness: 0.9, 
                roughness: 0.1 
            });
            const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.06, 8), crownMat);
            base.position.y = 0.03;
            hatGroup.add(base);
            for (let i = 0; i < 7; i++) {
                const spike = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.14, 4), crownMat);
                const angle = (i / 7) * Math.PI * 2;
                spike.position.set(Math.sin(angle)*0.22, 0.11, Math.cos(angle)*0.22);
                hatGroup.add(spike);
            }
            // Joyas
            const jewelMat = new THREE.MeshStandardMaterial({ 
                color: 0xE74C3C, 
                emissive: 0xE74C3C,
                emissiveIntensity: 0.2
            });
            for (let i = 0; i < 5; i++) {
                const jewel = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), jewelMat);
                const angle = (i / 5) * Math.PI * 2 + 0.3;
                jewel.position.set(Math.sin(angle)*0.22, 0.03, Math.cos(angle)*0.22);
                hatGroup.add(jewel);
            }
        }
        hatGroup.position.y = 1.12;
        avatarGroup.add(hatGroup);
    }

    // Gafas (compartidas)
    if (personaje.glasses !== 'none') {
        const glassesGroup = new THREE.Group();
        const glassMat = new THREE.MeshStandardMaterial({
            color: personaje.glasses === 'sunglasses' ? 0x1a1a2e : 0x4488ff,
            transparent: true,
            opacity: personaje.glasses === 'sunglasses' ? 0.6 : 0.25,
            roughness: 0.1
        });
        const frameMat = new THREE.MeshStandardMaterial({ 
            color: 0x2D2D2D, 
            roughness: 0.2, 
            metalness: 0.5 
        });

        if (personaje.glasses === 'round' || personaje.glasses === 'sunglasses') {
            for (let side = -1; side <= 1; side += 2) {
                const lens = new THREE.Mesh(new THREE.CircleGeometry(0.09, 16), glassMat);
                lens.position.set(side * 0.13, 0, 0);
                lens.rotation.y = side * 0.1;
                glassesGroup.add(lens);

                const frame = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.015, 8, 16), frameMat);
                frame.position.set(side * 0.13, 0, 0);
                frame.rotation.y = side * 0.1;
                glassesGroup.add(frame);
            }
            const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.015, 0.015), frameMat);
            bridge.position.set(0, 0, 0);
            glassesGroup.add(bridge);
        } else if (personaje.glasses === 'nerd') {
            for (let side = -1; side <= 1; side += 2) {
                const lens = new THREE.Mesh(new THREE.CircleGeometry(0.11, 16), glassMat);
                lens.position.set(side * 0.15, 0, 0);
                lens.rotation.y = side * 0.1;
                glassesGroup.add(lens);

                const frame = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.02, 8, 16), frameMat);
                frame.position.set(side * 0.15, 0, 0);
                frame.rotation.y = side * 0.1;
                glassesGroup.add(frame);
            }
            const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.02), frameMat);
            bridge.position.set(0, 0, 0);
            glassesGroup.add(bridge);
        }
        glassesGroup.position.set(0, 1.04, 0.40);
        avatarGroup.add(glassesGroup);
    }

    // Collar de la camisa
    const collarMat = new THREE.MeshStandardMaterial({ 
        color: shirtColor, 
        roughness: 0.5,
        emissive: new THREE.Color(shirtColor).multiplyScalar(0.02)
    });
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.02, 0.10), collarMat);
    collar.position.set(0, 0.8, 0.18);
    avatarGroup.add(collar);

    // ====================
    // DETALLES FEMENINOS
    // ====================
    
    if (!isMale) {
        // Pestañas (femenino)
        const lashMat = new THREE.MeshStandardMaterial({ color: 0x2D2D2D });
        for (let side = -1; side <= 1; side += 2) {
            for (let i = 0; i < 5; i++) {
                const lash = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.025, 0.003), lashMat);
                const angle = (i / 5) * Math.PI - Math.PI/2;
                lash.position.set(
                    side * 0.20,
                    1.03 + Math.sin(angle) * 0.03,
                    0.38 + Math.cos(angle) * 0.03
                );
                lash.rotation.z = side * (0.1 + Math.cos(angle) * 0.3);
                lash.rotation.x = Math.sin(angle) * 0.2;
                avatarGroup.add(lash);
            }
        }
    }

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
    if (avatarGroup) {
        avatarGroup.traverse((child) => {
            if (child.isMesh) {
                child.material.wireframe = wireframeMode;
            }
        });
    }
}

function toggleAutoRotate() {
    autoRotate = !autoRotate;
    controls.autoRotate = autoRotate;
    document.querySelectorAll('.viewer-controls button').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
}

function resetCamera() {
    camera.position.set(3.5, 2.5, 5);
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
        let targetKey = '';
        if (parentId === 'skinColors') targetKey = 'skin';
        else if (parentId === 'hairColors') targetKey = 'hairColor';
        else targetKey = 'shirt';
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
    const genders = ['male', 'female'];
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
        crearPersonaje();
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

document.addEventListener('DOMContentLoaded', function() {
    initScene();
    cargarPersonaje();
    obtenerMonedas();
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initScene();
    cargarPersonaje();
    obtenerMonedas();
}