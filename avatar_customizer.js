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
    glasses: 'none',
    bodyType: 'normal'
};

// ==========================================
// THREE.JS - ESCENA 3D
// ==========================================

let scene, camera, renderer, controls;
let avatarGroup;
let autoRotate = true;
let eyeL, eyeR, pupilL, pupilR;
let time = 0;

function initScene() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);

    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(5, 3.5, 7);
    camera.lookAt(0, 1.2, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
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
    controls.maxDistance = 12;
    controls.update();

    // ====================
    // ILUMINACIÓN PROFESIONAL
    // ====================
    
    // Luz ambiente suave
    const ambientLight = new THREE.AmbientLight(0x404060, 0.4);
    scene.add(ambientLight);

    // Luz principal (Key Light)
    const keyLight = new THREE.DirectionalLight(0xffeedd, 1.2);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Luz de relleno (Fill Light)
    const fillLight = new THREE.DirectionalLight(0x4488ff, 0.5);
    fillLight.position.set(-4, 2, -3);
    scene.add(fillLight);

    // Luz de borde (Rim Light)
    const rimLight = new THREE.DirectionalLight(0x88aaff, 0.8);
    rimLight.position.set(-2, 4, -5);
    scene.add(rimLight);

    // Luz de fondo
    const backLight = new THREE.DirectionalLight(0x6688ff, 0.3);
    backLight.position.set(0, 1, -8);
    scene.add(backLight);

    // Luz puntual para detalles
    const spotLight = new THREE.SpotLight(0x4488ff, 0.2);
    spotLight.position.set(2, 5, 3);
    scene.add(spotLight);

    // Hemisferio para iluminación de ambiente
    const hemiLight = new THREE.HemisphereLight(0x4488ff, 0x444422, 0.3);
    scene.add(hemiLight);

    // ====================
    // FONDO Y DECORACIÓN
    // ====================
    
    // Suelo con gradiente
    const floorGeo = new THREE.PlaneGeometry(12, 12);
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x0a0a1a,
        roughness: 0.8,
        metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    scene.add(floor);

    // Círculo de luz en el suelo
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

    // Grid decorativo
    const gridHelper = new THREE.GridHelper(8, 20, 0x444466, 0x333355);
    gridHelper.position.y = 0.001;
    scene.add(gridHelper);

    // Sombra suave
    const shadowGeo = new THREE.CircleGeometry(2, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.3
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
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
    
    // Animación de ojos (parpadeo suave)
    if (eyeL && eyeR) {
        const blink = Math.sin(time * 1.5) > 0.92 ? 0.1 : 1;
        eyeL.scale.y = blink;
        eyeR.scale.y = blink;
        // Las pupilas también parpadean
        if (pupilL && pupilR) {
            pupilL.scale.y = blink;
            pupilR.scale.y = blink;
        }
    }
    
    controls.update();
    renderer.render(scene, camera);
}

// ==========================================
// CREAR PERSONAJE PROFESIONAL 3D
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

    // ====================
    // MATERIALES PROFESIONALES
    // ====================
    
    const skinMat = new THREE.MeshStandardMaterial({
        color: skinColor,
        roughness: 0.6,
        metalness: 0.05,
        emissive: new THREE.Color(skinColor).multiplyScalar(0.02)
    });

    const skinMatShiny = new THREE.MeshStandardMaterial({
        color: skinColor,
        roughness: 0.4,
        metalness: 0.1,
        emissive: new THREE.Color(skinColor).multiplyScalar(0.03)
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
        metalness: 0.05,
        emissive: new THREE.Color(pantsColor).multiplyScalar(0.02)
    });

    const shoesMat = new THREE.MeshStandardMaterial({
        color: shoesColor,
        roughness: 0.7,
        metalness: 0.1
    });

    const hairMat = new THREE.MeshStandardMaterial({
        color: hairColor,
        roughness: 0.8,
        metalness: 0.05,
        emissive: new THREE.Color(hairColor).multiplyScalar(0.02)
    });

    // ====================
    // CUERPO
    // ====================
    
    // Torso - con forma anatómica
    const torsoGroup = new THREE.Group();
    
    // Torso principal
    const torsoGeo = new THREE.CylinderGeometry(
        isFemale ? 0.65 : 0.75,
        isFemale ? 0.55 : 0.7,
        0.9,
        12
    );
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.y = 0.45;
    torso.castShadow = true;
    torsoGroup.add(torso);

    // Pecho (diferente para hombre/mujer)
    if (isFemale) {
        // Senos (discretos)
        const breastMat = new THREE.MeshStandardMaterial({
            color: shirtColor,
            roughness: 0.5,
            metalness: 0.05
        });
        for (let side = -1; side <= 1; side += 2) {
            const breast = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), breastMat);
            breast.position.set(side * 0.25, 0.7, 0.25);
            breast.scale.set(1, 0.8, 0.7);
            torsoGroup.add(breast);
        }
    } else {
        // Hombros más anchos
        torso.scale.x = 1.1;
    }

    // Cintura
    const waistGeo = new THREE.CylinderGeometry(
        isFemale ? 0.45 : 0.55,
        isFemale ? 0.5 : 0.6,
        0.15,
        10
    );
    const waist = new THREE.Mesh(waistGeo, pantsMat);
    waist.position.y = 0.05;
    torsoGroup.add(waist);

    // Cuello - más detallado
    const neckGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.15, 10);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = 0.95;
    torsoGroup.add(neck);

    avatarGroup.add(torsoGroup);

    // ====================
    // CABEZA
    // ====================
    
    const headGroup = new THREE.Group();
    
    // Cabeza principal - forma más natural
    const headGeo = new THREE.SphereGeometry(0.4, 32, 32);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.1;
    head.scale.set(isFemale ? 0.95 : 1, 1.05, 0.95);
    head.castShadow = true;
    headGroup.add(head);

    // Mandíbula (más definida en hombres)
    if (isMale) {
        const jawGeo = new THREE.SphereGeometry(0.38, 16, 16);
        const jaw = new THREE.Mesh(jawGeo, skinMat);
        jaw.position.y = 0.92;
        jaw.scale.set(1.02, 0.3, 0.95);
        headGroup.add(jaw);
    }

    // ====================
    // OJOS - PROFESIONALES CON BRILLO
    // ====================
    
    // Órbita ocular
    const orbitMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.1,
        metalness: 0.1
    });

    // Ojo izquierdo
    const orbitL = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 24), orbitMat);
    orbitL.position.set(-0.17, 1.12, 0.36);
    orbitL.scale.set(1, 0.9, 0.6);
    headGroup.add(orbitL);

    // Ojo derecho
    const orbitR = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 24), orbitMat);
    orbitR.position.set(0.17, 1.12, 0.36);
    orbitR.scale.set(1, 0.9, 0.6);
    headGroup.add(orbitR);

    // Iris - color según género
    const irisColor = isMale ? 0x5C3D2E : (isFemale ? 0x4A90D9 : 0x6B4F3A);
    const irisMat = new THREE.MeshStandardMaterial({
        color: irisColor,
        roughness: 0.2,
        metalness: 0.1,
        emissive: new THREE.Color(irisColor).multiplyScalar(0.05)
    });

    const irisL = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 16), irisMat);
    irisL.position.set(-0.17, 1.1, 0.44);
    headGroup.add(irisL);

    const irisR = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 16), irisMat);
    irisR.position.set(0.17, 1.1, 0.44);
    headGroup.add(irisR);

    // Pupila
    const pupilMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        roughness: 0.1,
        metalness: 0.1
    });

    pupilL = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), pupilMat);
    pupilL.position.set(-0.17, 1.09, 0.48);
    headGroup.add(pupilL);

    pupilR = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), pupilMat);
    pupilR.position.set(0.17, 1.09, 0.48);
    headGroup.add(pupilR);

    // Brillo en los ojos (reflejo)
    const sparkleMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x88ccff,
        emissiveIntensity: 0.3,
        roughness: 0.1
    });

    const sparkleL = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), sparkleMat);
    sparkleL.position.set(-0.14, 1.13, 0.49);
    headGroup.add(sparkleL);

    const sparkleR = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), sparkleMat);
    sparkleR.position.set(0.21, 1.13, 0.49);
    headGroup.add(sparkleR);

    // ====================
    // CEJAS
    // ====================
    
    const browMat = new THREE.MeshStandardMaterial({
        color: hairColor,
        roughness: 0.8
    });

    for (let side = -1; side <= 1; side += 2) {
        const brow = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.015, 0.02), browMat);
        brow.position.set(side * 0.17, 1.18, 0.38);
        brow.rotation.z = side * 0.15;
        brow.rotation.x = -0.1;
        headGroup.add(brow);
    }

    // ====================
    // PESTAÑAS (más largas en femenino)
    // ====================
    
    if (isFemale) {
        const lashMat = new THREE.MeshStandardMaterial({
            color: 0x2D2D2D,
            roughness: 0.8
        });
        for (let side = -1; side <= 1; side += 2) {
            for (let i = 0; i < 8; i++) {
                const lash = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.03, 0.003), lashMat);
                const angle = (i / 8) * Math.PI - Math.PI/2;
                lash.position.set(
                    side * 0.2,
                    1.13 + Math.sin(angle) * 0.04,
                    0.38 + Math.cos(angle) * 0.04
                );
                lash.rotation.z = side * (0.1 + Math.cos(angle) * 0.3);
                lash.rotation.x = Math.sin(angle) * 0.2;
                headGroup.add(lash);
            }
        }
    }

    // ====================
    // BOCA
    // ====================
    
    const mouthMat = new THREE.MeshStandardMaterial({
        color: 0xCC8899,
        roughness: 0.5
    });

    // Labios
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.015, 0.01), mouthMat);
    mouth.position.set(0, 1.02, 0.42);
    headGroup.add(mouth);

    // Sonrisa (sutil)
    const smileMat = new THREE.MeshStandardMaterial({
        color: 0xCC8899,
        roughness: 0.5,
        transparent: true,
        opacity: 0.3
    });
    const smile = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.005, 0.01), smileMat);
    smile.position.set(0, 0.99, 0.42);
    headGroup.add(smile);

    // ====================
    // NARIZ
    // ====================
    
    const noseMat = new THREE.MeshStandardMaterial({
        color: skinColor,
        roughness: 0.7
    });
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), noseMat);
    nose.position.set(0, 1.06, 0.44);
    nose.scale.set(0.8, 0.6, 0.5);
    headGroup.add(nose);

    // ====================
    // OREJAS
    // ====================
    
    const earMat = new THREE.MeshStandardMaterial({
        color: skinColor,
        roughness: 0.7
    });
    for (let side = -1; side <= 1; side += 2) {
        const ear = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), earMat);
        ear.position.set(side * 0.42, 1.05, 0);
        ear.scale.set(0.3, 0.5, 0.2);
        headGroup.add(ear);
    }

    avatarGroup.add(headGroup);

    // ====================
    // CABELLO - PROFESIONAL
    // ====================
    
    const hairGroup = new THREE.Group();
    hairGroup.position.y = 1.1;

    const hairMatMain = new THREE.MeshStandardMaterial({
        color: hairColor,
        roughness: 0.7,
        metalness: 0.05
    });

    // Base del cabello
    const hairBase = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), hairMatMain);
    hairBase.position.y = 0.05;
    hairBase.scale.y = 0.55;
    hairGroup.add(hairBase);

    switch(personaje.hair) {
        case 'short':
            // Cabello corto con volumen natural
            for (let i = 0; i < 12; i++) {
                const clump = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), hairMatMain);
                const angle = (i / 12) * Math.PI * 2;
                const radius = 0.32 + Math.sin(i * 3) * 0.05;
                clump.position.set(
                    Math.sin(angle) * radius,
                    0.08 + Math.cos(angle * 2) * 0.04,
                    Math.cos(angle) * radius
                );
                clump.scale.set(1, 0.6 + Math.sin(i * 2) * 0.2, 1);
                hairGroup.add(clump);
            }
            break;
        case 'long':
            // Cabello largo con volumen
            const longMat = new THREE.MeshStandardMaterial({
                color: hairColor,
                roughness: 0.7,
                metalness: 0.05
            });
            
            // Capas de cabello largo
            for (let layer = 0; layer < 4; layer++) {
                const layerRadius = 0.38 - layer * 0.05;
                const layerY = 0.02 - layer * 0.06;
                for (let i = 0; i < 10; i++) {
                    const strand = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, 0.2, 6), longMat);
                    const angle = (i / 10) * Math.PI * 2 + layer * 0.3;
                    strand.position.set(
                        Math.sin(angle) * layerRadius,
                        layerY,
                        Math.cos(angle) * layerRadius
                    );
                    strand.rotation.x = Math.cos(angle) * 0.3;
                    strand.rotation.z = Math.sin(angle) * 0.3;
                    hairGroup.add(strand);
                }
            }
            
            // Cabello largo trasero (cola)
            for (let i = 0; i < 5; i++) {
                const tailPart = new THREE.Mesh(new THREE.CylinderGeometry(0.04 - i*0.005, 0.06 - i*0.005, 0.15, 8), longMat);
                tailPart.position.set(0, -0.05 - i*0.12, -0.35 - i*0.04);
                tailPart.rotation.x = 0.1 + i*0.08;
                hairGroup.add(tailPart);
            }
            break;
        case 'spiky':
            // Cabello spiky moderno
            for (let i = 0; i < 14; i++) {
                const spike = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.2, 6), hairMatMain);
                const angle = (i / 14) * Math.PI * 2;
                const radius = 0.3 + Math.sin(i * 2) * 0.05;
                spike.position.set(
                    Math.sin(angle) * radius,
                    0.12 + Math.cos(angle * 2) * 0.06,
                    Math.cos(angle) * radius
                );
                spike.rotation.x = Math.cos(angle) * 0.5;
                spike.rotation.z = Math.sin(angle) * 0.5;
                hairGroup.add(spike);
            }
            // Spikes superiores (más altos)
            for (let i = 0; i < 7; i++) {
                const topSpike = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.25, 6), hairMatMain);
                const angle = (i / 7) * Math.PI * 2 + 0.2;
                topSpike.position.set(
                    Math.sin(angle) * 0.15,
                    0.15 + Math.cos(angle * 2) * 0.05,
                    Math.cos(angle) * 0.15
                );
                topSpike.rotation.x = Math.cos(angle) * 0.3;
                topSpike.rotation.z = Math.sin(angle) * 0.3;
                hairGroup.add(topSpike);
            }
            break;
        case 'curly':
            // Cabello rizado con mucho volumen
            for (let i = 0; i < 30; i++) {
                const curl = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), hairMatMain);
                const angle = (i / 30) * Math.PI * 2;
                const radius = 0.35 + Math.sin(i * 4) * 0.08;
                curl.position.set(
                    Math.sin(angle) * radius,
                    0.06 + Math.cos(angle * 3) * 0.1,
                    Math.cos(angle) * radius
                );
                curl.scale.set(1, 0.7 + Math.sin(i * 2) * 0.3, 1);
                hairGroup.add(curl);
            }
            break;
        case 'ponytail':
            // Cola de caballo
            const ponyMatLocal = new THREE.MeshStandardMaterial({
                color: hairColor,
                roughness: 0.7,
                metalness: 0.05
            });
            
            // Base de la cola
            const ponyBase = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), ponyMatLocal);
            ponyBase.position.y = 0.05;
            ponyBase.scale.y = 0.5;
            hairGroup.add(ponyBase);
            
            // Cola (múltiples segmentos)
            for (let i = 0; i < 6; i++) {
                const tailSeg = new THREE.Mesh(new THREE.CylinderGeometry(0.03 - i*0.003, 0.05 - i*0.003, 0.12, 8), ponyMatLocal);
                tailSeg.position.set(0, -0.05 - i*0.1, -0.35 - i*0.03);
                tailSeg.rotation.x = 0.15 + i*0.08;
                hairGroup.add(tailSeg);
            }
            break;
        case 'bald':
            // Sin cabello - removemos la base
            hairGroup.remove(hairBase);
            break;
        default:
            break;
    }

    avatarGroup.add(hairGroup);

    // ====================
    // BRAZOS
    // ====================
    
    const armMat = new THREE.MeshStandardMaterial({
        color: skinColor,
        roughness: 0.6,
        metalness: 0.05
    });

    const armMatShirt = new THREE.MeshStandardMaterial({
        color: shirtColor,
        roughness: 0.5,
        metalness: 0.05
    });

    const armLength = isFemale ? 0.5 : 0.55;
    const armWidth = isFemale ? 0.07 : 0.09;

    for (let side = -1; side <= 1; side += 2) {
        // Brazo superior
        const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(armWidth, armWidth * 1.2, armLength, 8), armMat);
        upperArm.position.set(side * (isFemale ? 0.5 : 0.55), 0.7, 0);
        upperArm.rotation.z = side * 0.15;
        upperArm.rotation.x = -0.1;
        upperArm.castShadow = true;
        avatarGroup.add(upperArm);

        // Manga
        const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(armWidth * 1.1, armWidth * 1.3, 0.15, 8), armMatShirt);
        sleeve.position.set(side * (isFemale ? 0.5 : 0.55), 0.85, 0);
        sleeve.rotation.z = side * 0.15;
        avatarGroup.add(sleeve);

        // Antebrazo
        const foreArm = new THREE.Mesh(new THREE.CylinderGeometry(armWidth * 0.8, armWidth, armLength * 0.7, 8), armMat);
        foreArm.position.set(side * (isFemale ? 0.5 : 0.55), 0.35, 0);
        foreArm.rotation.z = side * 0.1;
        avatarGroup.add(foreArm);

        // Mano
        const hand = new THREE.Mesh(new THREE.SphereGeometry(armWidth * 0.9, 8, 8), armMat);
        hand.position.set(side * (isFemale ? 0.5 : 0.55), 0.05, 0);
        avatarGroup.add(hand);
    }

    // ====================
    // PIERNAS
    // ====================
    
    const legMatLocal = new THREE.MeshStandardMaterial({
        color: pantsColor,
        roughness: 0.6,
        metalness: 0.05
    });

    const legWidth = isFemale ? 0.08 : 0.1;
    const legWidthBottom = isFemale ? 0.1 : 0.13;

    for (let side = -1; side <= 1; side += 2) {
        // Muslo
        const thigh = new THREE.Mesh(new THREE.CylinderGeometry(legWidth, legWidth * 1.3, 0.35, 8), legMatLocal);
        thigh.position.set(side * (isFemale ? 0.15 : 0.18), 0.3, 0);
        thigh.castShadow = true;
        avatarGroup.add(thigh);

        // Pantorrilla
        const calf = new THREE.Mesh(new THREE.CylinderGeometry(legWidth * 0.8, legWidthBottom, 0.35, 8), legMatLocal);
        calf.position.set(side * (isFemale ? 0.15 : 0.18), 0.0, 0);
        avatarGroup.add(calf);
    }

    // ====================
    // ZAPATOS - ESTILO MODERNO
    // ====================
    
    for (let side = -1; side <= 1; side += 2) {
        // Zapato principal
        const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.08, 0.3), shoesMat);
        shoe.position.set(side * (isFemale ? 0.15 : 0.18), -0.02, 0.05);
        shoe.castShadow = true;
        avatarGroup.add(shoe);

        // Suela (detalle)
        const soleMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            roughness: 0.9
        });
        const sole = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.025, 0.32), soleMat);
        sole.position.set(side * (isFemale ? 0.15 : 0.18), -0.06, 0.05);
        avatarGroup.add(sole);

        // Cordones (detalle)
        if (isMale) {
            const laceMat = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.8
            });
            for (let l = -1; l <= 1; l += 2) {
                const lace = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.005, 0.02), laceMat);
                lace.position.set(side * (isFemale ? 0.15 : 0.18) + l * 0.04, 0.0, 0.02);
                avatarGroup.add(lace);
            }
        }
    }

    // ====================
    // ACCESORIOS - PROFESIONALES
    // ====================
    
    // Sombrero
    if (personaje.hat !== 'none') {
        const hatGroupLocal = new THREE.Group();
        const hatMatLocal = new THREE.MeshStandardMaterial({
            color: 0x2D2D2D,
            roughness: 0.6,
            metalness: 0.1
        });
        
        if (personaje.hat === 'tophat') {
            // Sombrero de copa elegante
            const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 0.35, 12), hatMatLocal);
            hatTop.position.y = 0.18;
            hatGroupLocal.add(hatTop);
            
            const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.04, 12), hatMatLocal);
            hatBrim.position.y = 0.02;
            hatGroupLocal.add(hatBrim);
            
            // Cinta decorativa
            const ribbonMatLocal = new THREE.MeshStandardMaterial({
                color: 0xE74C3C,
                roughness: 0.5,
                metalness: 0.1
            });
            const ribbon = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.04, 12), ribbonMatLocal);
            ribbon.position.y = 0.12;
            hatGroupLocal.add(ribbon);
            
        } else if (personaje.hat === 'cap') {
            // Gorra moderna
            const capMatLocal = new THREE.MeshStandardMaterial({
                color: 0x2D2D2D,
                roughness: 0.7
            });
            const cap = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), capMatLocal);
            cap.position.y = 0.05;
            cap.scale.y = 0.5;
            hatGroupLocal.add(cap);
            
            const visorMat = new THREE.MeshStandardMaterial({
                color: 0x1a1a2e,
                roughness: 0.8
            });
            const visor = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.03, 0.15), visorMat);
            visor.position.set(0, -0.02, 0.3);
            hatGroupLocal.add(visor);
            
        } else if (personaje.hat === 'crown') {
            // Corona real
            const crownMatLocal = new THREE.MeshStandardMaterial({
                color: 0xFFD700,
                metalness: 0.9,
                roughness: 0.1,
                emissive: new THREE.Color(0xFFD700).multiplyScalar(0.05)
            });
            
            const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.08, 12), crownMatLocal);
            crownBase.position.y = 0.04;
            hatGroupLocal.add(crownBase);
            
            for (let i = 0; i < 7; i++) {
                const spike = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.2, 4), crownMatLocal);
                const angle = (i / 7) * Math.PI * 2;
                spike.position.set(
                    Math.sin(angle) * 0.28,
                    0.16,
                    Math.cos(angle) * 0.28
                );
                hatGroupLocal.add(spike);
            }
            
            // Joyas en la corona
            const jewelMatLocal = new THREE.MeshStandardMaterial({
                color: 0xE74C3C,
                emissive: 0xE74C3C,
                emissiveIntensity: 0.2,
                metalness: 0.5
            });
            for (let i = 0; i < 5; i++) {
                const jewel = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), jewelMatLocal);
                const angle = (i / 5) * Math.PI * 2 + 0.3;
                jewel.position.set(
                    Math.sin(angle) * 0.28,
                    0.04,
                    Math.cos(angle) * 0.28
                );
                hatGroupLocal.add(jewel);
            }
        }
        
        hatGroupLocal.position.y = 1.2;
        avatarGroup.add(hatGroupLocal);
    }

    // Gafas
    if (personaje.glasses !== 'none') {
        const glassesGroupLocal = new THREE.Group();
        const glassesMatLocal = new THREE.MeshStandardMaterial({
            color: 0x2D2D2D,
            roughness: 0.2,
            metalness: 0.7
        });
        
        const lensMatLocal = new THREE.MeshStandardMaterial({
            color: personaje.glasses === 'sunglasses' ? 0x1a1a2e : 0x4488ff,
            transparent: true,
            opacity: personaje.glasses === 'sunglasses' ? 0.7 : 0.3,
            roughness: 0.1,
            metalness: 0.1
        });
        
        if (personaje.glasses === 'round' || personaje.glasses === 'sunglasses') {
            const lensL = new THREE.Mesh(new THREE.CircleGeometry(0.12, 24), lensMatLocal);
            lensL.position.set(-0.15, 0, 0);
            lensL.rotation.y = 0.2;
            glassesGroupLocal.add(lensL);
            
            const lensR = new THREE.Mesh(new THREE.CircleGeometry(0.12, 24), lensMatLocal);
            lensR.position.set(0.15, 0, 0);
            lensR.rotation.y = -0.2;
            glassesGroupLocal.add(lensR);
            
            const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.02), glassesMatLocal);
            bridge.position.set(0, 0, 0);
            glassesGroupLocal.add(bridge);
            
            // Marco de las gafas
            const frameMatLocal = new THREE.MeshStandardMaterial({
                color: personaje.glasses === 'sunglasses' ? 0x1a1a2e : 0x2D2D2D,
                roughness: 0.2,
                metalness: 0.5
            });
            
            const frameL = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 8, 16), frameMatLocal);
            frameL.position.set(-0.15, 0, 0);
            frameL.rotation.y = 0.2;
            glassesGroupLocal.add(frameL);
            
            const frameR = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 8, 16), frameMatLocal);
            frameR.position.set(0.15, 0, 0);
            frameR.rotation.y = -0.2;
            glassesGroupLocal.add(frameR);
            
            // Patillas
            const armL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.15), glassesMatLocal);
            armL.position.set(-0.15, 0.02, -0.1);
            glassesGroupLocal.add(armL);
            
            const armR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.15), glassesMatLocal);
            armR.position.set(0.15, 0.02, -0.1);
            glassesGroupLocal.add(armR);
        }
        
        glassesGroupLocal.position.set(0, 1.12, 0.4);
        avatarGroup.add(glassesGroupLocal);
    }

    // ====================
    // DETALLES DE ROPA
    // ====================
    
    // Cuello de la camisa
    const collarMat = new THREE.MeshStandardMaterial({
        color: shirtColor,
        roughness: 0.5,
        metalness: 0.05,
        emissive: new THREE.Color(shirtColor).multiplyScalar(0.02)
    });
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, 0.15), collarMat);
    collar.position.set(0, 0.92, 0.2);
    avatarGroup.add(collar);

    // Detalle de cinturón
    const beltMat = new THREE.MeshStandardMaterial({
        color: 0x2D2D2D,
        roughness: 0.5,
        metalness: 0.3
    });
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.04, 0.35), beltMat);
    belt.position.set(0, 0.15, 0);
    avatarGroup.add(belt);

    // Hebilla del cinturón
    const buckleMat = new THREE.MeshStandardMaterial({
        color: 0xFFD700,
        metalness: 0.8,
        roughness: 0.2
    });
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.02), buckleMat);
    buckle.position.set(0, 0.15, 0.18);
    avatarGroup.add(buckle);

    // ====================
    // ESCALA Y POSICIÓN FINAL
    // ====================
    
    // Escalar todo el personaje para que encaje bien
    avatarGroup.scale.set(0.9, 0.9, 0.9);
    
    // Posicionar en el centro
    avatarGroup.position.y = 0.5;

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
    const btn = document.querySelector('.viewer-controls button.active');
    if (btn) btn.classList.remove('active');
    event.target.classList.add('active');
}

function resetCamera() {
    camera.position.set(5, 3.5, 7);
    controls.target.set(0, 1.2, 0);
    controls.update();
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
        glasses: 'none',
        bodyType: 'normal'
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