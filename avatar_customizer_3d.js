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
    gender: 'female',
    skin: '#F5D0B8',
    hair: 'long',
    hairColor: '#4A2F1A',
    shirt: '#FF69B4',
    pants: '#FF69B4',
    shoes: '#2D2D2D',
    hat: 'none',
    glasses: 'none',
    eyeColor: '#4A90D9'
};

let avatarGroup;
let autoRotate = true;
let wireframeMode = false;
let scene, camera, renderer, controls;
let time = 0;

// ==========================================
// INICIALIZAR ESCENA 3D
// ==========================================

function initScene() {
    const container = document.getElementById('avatarContainer');
    const width = container.clientWidth;
    const height = container.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d0d1a);

    camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
    camera.position.set(4, 3, 6);
    camera.lookAt(0, 1.2, 0);

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

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.2, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;
    controls.minDistance = 2.5;
    controls.maxDistance = 10;
    controls.update();

    // ====================
    // ILUMINACIÓN PROFESIONAL
    // ====================

    const ambientLight = new THREE.AmbientLight(0x8888ff, 0.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffeedd, 1.2);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.5);
    fillLight.position.set(-4, 2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x88aaff, 0.6);
    rimLight.position.set(-3, 4, -5);
    scene.add(rimLight);

    const hemiLight = new THREE.HemisphereLight(0x6688ff, 0x444422, 0.4);
    scene.add(hemiLight);

    // ====================
    // SUELO
    // ====================

    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x0d0d1a,
        roughness: 0.3,
        metalness: 0.8,
        transparent: true,
        opacity: 0.3
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    const gridHelper = new THREE.GridHelper(6, 12, 0x444488, 0x333366);
    gridHelper.position.y = 0.001;
    scene.add(gridHelper);

    const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.15
    });
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.8, 32), shadowMat);
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
    time += 0.01;
    
    // Animación de respiración suave
    if (avatarGroup) {
        const breath = Math.sin(time * 0.8) * 0.002;
        avatarGroup.position.y = breath;
    }
    
    controls.update();
    renderer.render(scene, camera);
}

// ==========================================
// CREAR PERSONAJE ESTILO SKAIRYM
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

    const skin = new THREE.Color(personaje.skin);
    const hair = new THREE.Color(personaje.hairColor);
    const shirt = new THREE.Color(personaje.shirt);
    const pants = new THREE.Color(personaje.pants);
    const shoes = new THREE.Color(personaje.shoes);
    const eye = new THREE.Color(personaje.eyeColor || '#4A90D9');
    const isFemale = personaje.gender === 'female';

    // ====================
    // MATERIALES DE CALIDAD
    // ====================

    const skinMat = new THREE.MeshStandardMaterial({
        color: skin,
        roughness: 0.3,
        metalness: 0.02,
        emissive: skin.clone().multiplyScalar(0.02)
    });

    const skinMatShiny = new THREE.MeshStandardMaterial({
        color: skin,
        roughness: 0.2,
        metalness: 0.05,
        emissive: skin.clone().multiplyScalar(0.03)
    });

    const hairMat = new THREE.MeshStandardMaterial({
        color: hair,
        roughness: 0.6,
        metalness: 0.02,
        emissive: hair.clone().multiplyScalar(0.02)
    });

    const shirtMat = new THREE.MeshStandardMaterial({
        color: shirt,
        roughness: 0.4,
        metalness: 0.05,
        emissive: shirt.clone().multiplyScalar(0.03)
    });

    const pantsMat = new THREE.MeshStandardMaterial({
        color: pants,
        roughness: 0.5,
        metalness: 0.05,
        emissive: pants.clone().multiplyScalar(0.02)
    });

    const shoesMat = new THREE.MeshStandardMaterial({
        color: shoes,
        roughness: 0.6,
        metalness: 0.1
    });

    // ====================
    // CUERPO - Proporciones Skairym
    // ====================

    // Torso (más estilizado)
    const torsoGeo = new THREE.CylinderGeometry(
        isFemale ? 0.5 : 0.55,
        isFemale ? 0.4 : 0.45,
        0.75,
        16
    );
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.y = 0.45;
    torso.castShadow = true;
    avatarGroup.add(torso);

    // Cintura (más definida)
    const waistGeo = new THREE.CylinderGeometry(
        isFemale ? 0.35 : 0.4,
        isFemale ? 0.4 : 0.45,
        0.12,
        12
    );
    const waist = new THREE.Mesh(waistGeo, pantsMat);
    waist.position.y = 0.1;
    avatarGroup.add(waist);

    // Cuello (elegante)
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.1, 10), skinMat);
    neck.position.y = 0.85;
    avatarGroup.add(neck);

    // ====================
    // CABEZA - Estilo Skairym (más ovalada)
    // ====================

    const headGeo = new THREE.SphereGeometry(0.35, 32, 32);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.05;
    head.scale.set(1, 1.1, 0.95);
    head.castShadow = true;
    avatarGroup.add(head);

    // ====================
    // OJOS - Grandes estilo anime
    // ====================

    const eyeWhiteMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.1,
        emissive: 0x4488ff,
        emissiveIntensity: 0.03
    });

    const irisMat = new THREE.MeshStandardMaterial({
        color: eye,
        roughness: 0.2,
        emissive: eye.clone().multiplyScalar(0.15)
    });

    const pupilMat = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a2e,
        roughness: 0.1
    });

    const sparkleMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x88ccff,
        emissiveIntensity: 0.8
    });

    for (let side = -1; side <= 1; side += 2) {
        // Blanco del ojo (más grande)
        const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), eyeWhiteMat);
        eyeWhite.position.set(side * 0.17, 1.07, 0.35);
        eyeWhite.scale.set(1, 0.85, 0.5);
        avatarGroup.add(eyeWhite);

        // Iris (más grande)
        const iris = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), irisMat);
        iris.position.set(side * 0.17, 1.06, 0.44);
        avatarGroup.add(iris);

        // Pupila
        const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), pupilMat);
        pupil.position.set(side * 0.17, 1.05, 0.48);
        avatarGroup.add(pupil);

        // Brillo principal
        const sparkle = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), sparkleMat);
        sparkle.position.set(side * 0.13, 1.09, 0.50);
        avatarGroup.add(sparkle);

        // Brillo secundario
        const sparkle2 = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), sparkleMat);
        sparkle2.position.set(side * 0.21, 1.04, 0.50);
        sparkle2.material = sparkleMat.clone();
        sparkle2.material.emissiveIntensity = 0.4;
        avatarGroup.add(sparkle2);
    }

    // ====================
    // CEJAS - Delgadas y elegantes
    // ====================

    const browMat = new THREE.MeshStandardMaterial({ 
        color: hair, 
        roughness: 0.8,
        transparent: true,
        opacity: 0.8
    });

    for (let side = -1; side <= 1; side += 2) {
        const brow = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.015, 0.02), browMat);
        brow.position.set(side * 0.17, 1.14, 0.38);
        brow.rotation.z = side * 0.12;
        brow.rotation.x = -0.05;
        avatarGroup.add(brow);
    }

    // ====================
    // BOCA - Pequeña y bonita
    // ====================

    const mouthMat = new THREE.MeshStandardMaterial({
        color: 0xCC8899,
        roughness: 0.5,
        transparent: true,
        opacity: 0.8
    });

    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.015, 0.01), mouthMat);
    mouth.position.set(0, 0.97, 0.42);
    avatarGroup.add(mouth);

    // Sonrisa
    const smileMat = new THREE.MeshStandardMaterial({
        color: 0xCC8899,
        roughness: 0.5,
        transparent: true,
        opacity: 0.3
    });
    const smile = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.005, 0.01), smileMat);
    smile.position.set(0, 0.95, 0.42);
    avatarGroup.add(smile);

    // ====================
    // NARIZ - Pequeña
    // ====================

    const noseMat = new THREE.MeshStandardMaterial({
        color: skin,
        roughness: 0.6
    });
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), noseMat);
    nose.position.set(0, 1.02, 0.46);
    nose.scale.set(0.7, 0.5, 0.5);
    avatarGroup.add(nose);

    // ====================
    // OREJAS - Pequeñas
    // ====================

    for (let side = -1; side <= 1; side += 2) {
        const ear = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), skinMat);
        ear.position.set(side * 0.38, 1.02, 0);
        ear.scale.set(0.3, 0.5, 0.2);
        avatarGroup.add(ear);
    }

    // ====================
    // CABELLO - Estilo Skairym
    // ====================

    const hairGroup = new THREE.Group();

    if (personaje.hair !== 'bald') {
        const hairMatMain = new THREE.MeshStandardMaterial({
            color: hair,
            roughness: 0.6,
            metalness: 0.02,
            emissive: hair.clone().multiplyScalar(0.02)
        });

        // Base del cabello
        const hairBase = new THREE.Mesh(
            new THREE.SphereGeometry(0.38, 16, 16, 0, Math.PI*2, 0, Math.PI/2),
            hairMatMain
        );
        hairBase.position.y = 0.05;
        hairBase.scale.y = 0.5;
        hairGroup.add(hairBase);

        switch(personaje.hair) {
            case 'short':
                for (let i = 0; i < 10; i++) {
                    const clump = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), hairMatMain);
                    const angle = (i / 10) * Math.PI * 2;
                    clump.position.set(
                        Math.sin(angle) * 0.32,
                        0.06 + Math.cos(angle * 2) * 0.04,
                        Math.cos(angle) * 0.32
                    );
                    clump.scale.set(1, 0.6 + Math.sin(i * 2) * 0.2, 1);
                    hairGroup.add(clump);
                }
                break;
            case 'long':
                // Cabello largo estilo Skairym
                const longMat = new THREE.MeshStandardMaterial({
                    color: hair,
                    roughness: 0.6,
                    metalness: 0.02
                });
                
                // Capas de cabello
                for (let layer = 0; layer < 4; layer++) {
                    const layerRadius = 0.34 - layer * 0.04;
                    for (let i = 0; i < 12; i++) {
                        const strand = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.03, 0.18, 6), longMat);
                        const angle = (i / 12) * Math.PI * 2 + layer * 0.3;
                        strand.position.set(
                            Math.sin(angle) * layerRadius,
                            0.02 - layer * 0.07,
                            Math.cos(angle) * layerRadius
                        );
                        strand.rotation.x = Math.cos(angle) * 0.3;
                        strand.rotation.z = Math.sin(angle) * 0.3;
                        hairGroup.add(strand);
                    }
                }
                
                // Mechones frontales
                for (let i = -2; i <= 2; i++) {
                    if (i === 0) continue;
                    const strand = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.025, 0.12, 6), longMat);
                    strand.position.set(i * 0.06, 0.08, 0.32 + Math.abs(i) * 0.02);
                    strand.rotation.x = 0.2;
                    strand.rotation.z = i * 0.15;
                    hairGroup.add(strand);
                }
                break;
            case 'spiky':
                for (let i = 0; i < 12; i++) {
                    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.18, 6), hairMatMain);
                    const angle = (i / 12) * Math.PI * 2;
                    spike.position.set(
                        Math.sin(angle) * 0.28,
                        0.12 + Math.cos(angle * 2) * 0.05,
                        Math.cos(angle) * 0.28
                    );
                    spike.rotation.x = Math.cos(angle) * 0.5;
                    spike.rotation.z = Math.sin(angle) * 0.5;
                    hairGroup.add(spike);
                }
                break;
            case 'curly':
                for (let i = 0; i < 30; i++) {
                    const curl = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), hairMatMain);
                    const angle = (i / 30) * Math.PI * 2;
                    curl.position.set(
                        Math.sin(angle) * 0.33,
                        0.06 + Math.cos(angle * 3) * 0.08,
                        Math.cos(angle) * 0.33
                    );
                    curl.scale.set(1, 0.8 + Math.sin(i * 2) * 0.2, 1);
                    hairGroup.add(curl);
                }
                break;
            case 'ponytail':
                const ponyMat = new THREE.MeshStandardMaterial({
                    color: hair,
                    roughness: 0.6,
                    metalness: 0.02
                });
                
                // Cola de caballo
                for (let i = 0; i < 8; i++) {
                    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, 0.12, 6), ponyMat);
                    tail.position.set(0, -0.05 - i*0.08, -0.34 - i*0.03);
                    tail.rotation.x = 0.15 + i*0.06;
                    hairGroup.add(tail);
                }
                break;
            case 'twintails':
                // Dos colas (estilo anime)
                const twinMat = new THREE.MeshStandardMaterial({
                    color: hair,
                    roughness: 0.6,
                    metalness: 0.02
                });
                for (let side = -1; side <= 1; side += 2) {
                    for (let i = 0; i < 6; i++) {
                        const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, 0.12, 6), twinMat);
                        tail.position.set(side * 0.25, -0.02 - i*0.07, -0.15 - i*0.02);
                        tail.rotation.x = 0.2 + i*0.05;
                        tail.rotation.z = side * 0.2;
                        hairGroup.add(tail);
                    }
                }
                break;
        }
        hairGroup.position.y = 1.05;
        avatarGroup.add(hairGroup);
    }

    // ====================
    // BRAZOS - Delgados y elegantes
    // ====================

    const armMat = new THREE.MeshStandardMaterial({
        color: skin,
        roughness: 0.3,
        metalness: 0.02
    });

    for (let side = -1; side <= 1; side += 2) {
        // Brazo superior
        const upperArm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.055, 0.07, 0.4, 8),
            armMat
        );
        upperArm.position.set(side * 0.5, 0.7, 0);
        upperArm.rotation.z = side * 0.15;
        upperArm.castShadow = true;
        avatarGroup.add(upperArm);

        // Antebrazo
        const foreArm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.045, 0.055, 0.35, 8),
            armMat
        );
        foreArm.position.set(side * 0.5, 0.35, 0);
        foreArm.rotation.z = side * 0.1;
        avatarGroup.add(foreArm);

        // Mano
        const hand = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), armMat);
        hand.position.set(side * 0.5, 0.05, 0);
        avatarGroup.add(hand);
    }

    // ====================
    // PIERNAS - Elegantes
    // ====================

    const legMat = new THREE.MeshStandardMaterial({
        color: pants,
        roughness: 0.4,
        metalness: 0.05
    });

    for (let side = -1; side <= 1; side += 2) {
        // Muslo
        const thigh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.08, 0.35, 8),
            legMat
        );
        thigh.position.set(side * 0.15, 0.35, 0);
        thigh.castShadow = true;
        avatarGroup.add(thigh);

        // Pantorrilla
        const calf = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.06, 0.35, 8),
            legMat
        );
        calf.position.set(side * 0.15, 0.05, 0);
        avatarGroup.add(calf);

        // Zapatos
        const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.22), shoesMat);
        shoe.position.set(side * 0.15, -0.02, 0.02);
        shoe.castShadow = true;
        avatarGroup.add(shoe);
    }

    // ====================
    // ACCESORIOS
    // ====================

    // Sombrero
    if (personaje.hat !== 'none') {
        const hatGroup = new THREE.Group();
        const hatMat2 = new THREE.MeshStandardMaterial({
            color: 0x2D2D2D,
            roughness: 0.5,
            metalness: 0.1
        });
        
        if (personaje.hat === 'tophat') {
            const top = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 0.25, 12), hatMat2);
            top.position.y = 0.12;
            hatGroup.add(top);
            const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.04, 12), hatMat2);
            brim.position.y = 0.02;
            hatGroup.add(brim);
        } else if (personaje.hat === 'cap') {
            const cap = new THREE.Mesh(
                new THREE.SphereGeometry(0.24, 8, 8, 0, Math.PI*2, 0, Math.PI/2),
                hatMat2
            );
            cap.position.y = 0.05;
            cap.scale.y = 0.5;
            hatGroup.add(cap);
            const visor = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.02, 0.1), hatMat2);
            visor.position.set(0, -0.02, 0.24);
            hatGroup.add(visor);
        } else if (personaje.hat === 'crown') {
            const crownMat = new THREE.MeshStandardMaterial({
                color: 0xFFD700,
                metalness: 0.9,
                roughness: 0.1
            });
            const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.06, 12), crownMat);
            base.position.y = 0.03;
            hatGroup.add(base);
            for (let i = 0; i < 7; i++) {
                const spike = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.14, 4), crownMat);
                const angle = (i / 7) * Math.PI * 2;
                spike.position.set(Math.sin(angle)*0.22, 0.11, Math.cos(angle)*0.22);
                hatGroup.add(spike);
            }
        }
        hatGroup.position.y = 1.18;
        avatarGroup.add(hatGroup);
    }

    // Gafas
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
                const lens = new THREE.Mesh(new THREE.CircleGeometry(0.09, 20), glassMat);
                lens.position.set(side * 0.13, 0, 0);
                lens.rotation.y = side * 0.1;
                glassesGroup.add(lens);

                const frame = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.015, 8, 20), frameMat);
                frame.position.set(side * 0.13, 0, 0);
                frame.rotation.y = side * 0.1;
                glassesGroup.add(frame);
            }
            const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.015, 0.015), frameMat);
            bridge.position.set(0, 0, 0);
            glassesGroup.add(bridge);
        }
        glassesGroup.position.set(0, 1.08, 0.42);
        avatarGroup.add(glassesGroup);
    }

    // ====================
    // DETALLES FINALES
    // ====================

    // Cuello de camisa
    const collarMat = new THREE.MeshStandardMaterial({
        color: shirt,
        roughness: 0.4,
        metalness: 0.05
    });
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, 0.08), collarMat);
    collar.position.set(0, 0.82, 0.18);
    avatarGroup.add(collar);

    // Cinturón
    const beltMat = new THREE.MeshStandardMaterial({
        color: 0x2D2D2D,
        roughness: 0.5,
        metalness: 0.3
    });
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, 0.2), beltMat);
    belt.position.set(0, 0.12, 0);
    avatarGroup.add(belt);

    // ====================
    // DETALLES FEMENINOS
    // ====================

    if (isFemale) {
        // Pestañas superiores
        const lashMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e });
        for (let side = -1; side <= 1; side += 2) {
            for (let i = 0; i < 6; i++) {
                const lash = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.025, 0.003), lashMat);
                const angle = (i / 6) * Math.PI - Math.PI/2;
                lash.position.set(
                    side * 0.19,
                    1.09 + Math.sin(angle) * 0.03,
                    0.38 + Math.cos(angle) * 0.03
                );
                lash.rotation.z = side * (0.1 + Math.cos(angle) * 0.3);
                lash.rotation.x = Math.sin(angle) * 0.2;
                avatarGroup.add(lash);
            }
        }
    }

    // ====================
    // WIREFRAME
    // ====================

    if (wireframeMode) {
        avatarGroup.traverse((child) => {
            if (child.isMesh) {
                child.material.wireframe = true;
            }
        });
    }

    // Escala final
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
        hero: { gender: 'male', skin: '#F5D0B8', hair: 'spiky', hairColor: '#FFD700', shirt: '#EF4444', pants: '#1E3A5F', shoes: '#2D2D2D', hat: 'none', glasses: 'none', eyeColor: '#5C3D2E' },
        ninja: { gender: 'male', skin: '#F5D0B8', hair: 'bald', hairColor: '#000000', shirt: '#1A1A2E', pants: '#1A1A2E', shoes: '#000000', hat: 'none', glasses: 'none', eyeColor: '#2D2D2D' },
        princess: { gender: 'female', skin: '#F5D0B8', hair: 'long', hairColor: '#FFD700', shirt: '#FF69B4', pants: '#FF69B4', shoes: '#FFD700', hat: 'crown', glasses: 'none', eyeColor: '#4A90D9' },
        pirate: { gender: 'male', skin: '#E8C4A0', hair: 'long', hairColor: '#4A2F1A', shirt: '#000000', pants: '#2D2D2D', shoes: '#000000', hat: 'cap', glasses: 'sunglasses', eyeColor: '#2D2D2D' },
        robot: { gender: 'neutral', skin: '#C0C0C0', hair: 'bald', hairColor: '#000000', shirt: '#808080', pants: '#696969', shoes: '#2D2D2D', hat: 'none', glasses: 'round', eyeColor: '#00FF00' },
        alien: { gender: 'neutral', skin: '#00FF00', hair: 'bald', hairColor: '#000000', shirt: '#00CC00', pants: '#009900', shoes: '#006600', hat: 'none', glasses: 'none', eyeColor: '#FF0000' },
        kawaii: { gender: 'female', skin: '#F5D0B8', hair: 'long', hairColor: '#FF1493', shirt: '#FF69B4', pants: '#FF69B4', shoes: '#FFD700', hat: 'crown', glasses: 'none', eyeColor: '#FF1493' },
        emo: { gender: 'male', skin: '#F5D0B8', hair: 'long', hairColor: '#000000', shirt: '#1A1A2E', pants: '#1A1A2E', shoes: '#000000', hat: 'none', glasses: 'sunglasses', eyeColor: '#000000' }
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
    personaje = { gender: 'female', skin: '#F5D0B8', hair: 'long', hairColor: '#4A2F1A', shirt: '#FF69B4', pants: '#FF69B4', shoes: '#2D2D2D', hat: 'none', glasses: 'none', eyeColor: '#4A90D9' };
    actualizarInterfaz();
    crearPersonaje();
}

function randomPersonaje() {
    const genders = ['male', 'female'];
    const hairs = ['short', 'long', 'spiky', 'curly', 'ponytail', 'twintails', 'bald'];
    const hairColors = ['#4A2F1A', '#000000', '#8B6914', '#FFD700', '#FF6B35', '#FF1493', '#00BFFF', '#FFFFFF'];
    const shirts = ['#3B82F6', '#EF4444', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#1A1A2E', '#FF69B4'];
    const skins = ['#F5D0B8', '#E8C4A0', '#D4A574', '#C4956A', '#B0885E', '#8B6B4A', '#6B4F3A', '#4A3524'];
    const eyeColors = ['#4A90D9', '#5C3D2E', '#FF1493', '#00FF00', '#FFD700', '#000000', '#FF0000'];
    
    personaje.gender = genders[Math.floor(Math.random() * genders.length)];
    personaje.hair = hairs[Math.floor(Math.random() * hairs.length)];
    personaje.hairColor = hairColors[Math.floor(Math.random() * hairColors.length)];
    personaje.shirt = shirts[Math.floor(Math.random() * shirts.length)];
    personaje.pants = shirts[Math.floor(Math.random() * shirts.length)];
    personaje.skin = skins[Math.floor(Math.random() * skins.length)];
    personaje.eyeColor = eyeColors[Math.floor(Math.random() * eyeColors.length)];
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