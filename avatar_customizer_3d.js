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
// ESTADO DEL PERSONAJE - ESTILO SKYRIM
// ==========================================

let personaje = {
    race: 'nord',
    gender: 'male',
    skin: '#F5D0B8',
    hair: 'short',
    hairColor: '#8B6914',
    shirt: '#3B82F6',
    pants: '#1E3A5F',
    shoes: '#2D2D2D',
    hat: 'none',
    glasses: 'none',
    beard: 'none',
    scars: 'none'
};

// Razas de Skyrim
const razas = {
    nord: { 
        name: 'Nord', 
        skin: '#F5D0B8', 
        hair: '#8B6914', 
        desc: 'Famosos por su resistencia al frío y su talento como guerreros',
        traits: 'Altos, rubios, guerreros nórdicos'
    },
    imperial: { 
        name: 'Imperial', 
        skin: '#E8C4A0', 
        hair: '#4A2F1A', 
        desc: 'Hábiles diplomáticos y comerciantes de Cyrodiil',
        traits: 'Versátiles, diplomáticos, comerciantes'
    },
    dark_elf: { 
        name: 'Dark Elf', 
        skin: '#6B4F3A', 
        hair: '#2D2D2D', 
        desc: 'Elfos oscuros de Morrowind, conocidos por su destreza mágica',
        traits: 'Elfos oscuros, magos, asesinos'
    },
    high_elf: { 
        name: 'High Elf', 
        skin: '#F5D0B8', 
        hair: '#FFD700', 
        desc: 'Elfos altos de Summerset, maestros en la magia arcana',
        traits: 'Elfos altos, magos, nobles'
    },
    wood_elf: { 
        name: 'Wood Elf', 
        skin: '#D4A574', 
        hair: '#4A2F1A', 
        desc: 'Elfos boscosos de Valenwood, expertos cazadores',
        traits: 'Elfos boscosos, cazadores, sigilosos'
    },
    orc: { 
        name: 'Orc', 
        skin: '#6B8B3A', 
        hair: '#2D2D2D', 
        desc: 'Guerreros feroces de Orsinium, temidos en el campo de batalla',
        traits: 'Orcos, guerreros, herreros'
    },
    khajiit: { 
        name: 'Khajiit', 
        skin: '#8B6914', 
        hair: '#4A2F1A', 
        desc: 'Felinos humanoides de Elsweyr, astutos y ágiles',
        traits: 'Felinos, astutos, ladrones'
    },
    redguard: { 
        name: 'Redguard', 
        skin: '#8B6B4A', 
        hair: '#2D2D2D', 
        desc: 'Guerreros de Hammerfell, maestros de la espada',
        traits: 'Guerreros, maestros de espada, nobles'
    }
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
    camera.position.set(4.5, 3.5, 6.5);
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
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.2, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    controls.minDistance = 3;
    controls.maxDistance = 12;
    controls.update();

    // ====================
    // ILUMINACIÓN - Estilo Skyrim
    // ====================

    // Luz ambiente tenue
    const ambientLight = new THREE.AmbientLight(0x445566, 0.3);
    scene.add(ambientLight);

    // Luz principal (más dramática)
    const keyLight = new THREE.DirectionalLight(0xffeedd, 1.0);
    keyLight.position.set(5, 10, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);

    // Luz de relleno azulada (estilo Skyrim)
    const fillLight = new THREE.DirectionalLight(0x6688cc, 0.6);
    fillLight.position.set(-4, 2, -3);
    scene.add(fillLight);

    // Luz de borde (para resaltar siluetas)
    const rimLight = new THREE.DirectionalLight(0x88aaff, 0.8);
    rimLight.position.set(-3, 5, -6);
    scene.add(rimLight);

    // Luz hemisférica
    const hemiLight = new THREE.HemisphereLight(0x6688ff, 0x443322, 0.3);
    scene.add(hemiLight);

    // Luz puntual de ambiente
    const pointLight = new THREE.PointLight(0x4488ff, 0.2, 15);
    pointLight.position.set(0, 3, -2);
    scene.add(pointLight);

    // ====================
    // SUELO - Estilo Skyrim
    // ====================

    // Suelo de piedra
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        roughness: 0.9,
        metalness: 0.1,
        transparent: true,
        opacity: 0.5
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid decorativo
    const gridHelper = new THREE.GridHelper(8, 16, 0x444466, 0x333355);
    gridHelper.position.y = 0.001;
    scene.add(gridHelper);

    // Sombra
    const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.3
    });
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(2.0, 32), shadowMat);
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
    time += 0.005;
    
    // Movimiento sutil
    if (avatarGroup) {
        const breath = Math.sin(time * 0.5) * 0.003;
        avatarGroup.position.y = breath;
    }
    
    controls.update();
    renderer.render(scene, camera);
}

// ==========================================
// CREAR PERSONAJE ESTILO SKYRIM
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

    const raza = razas[personaje.race] || razas.nord;
    const skin = new THREE.Color(personaje.skin);
    const hair = new THREE.Color(personaje.hairColor);
    const shirt = new THREE.Color(personaje.shirt);
    const pants = new THREE.Color(personaje.pants);
    const shoes = new THREE.Color(personaje.shoes);
    const isMale = personaje.gender === 'male';
    const isElf = ['dark_elf', 'high_elf', 'wood_elf'].includes(personaje.race);
    const isOrc = personaje.race === 'orc';
    const isKhajiit = personaje.race === 'khajiit';

    // ====================
    // MATERIALES - Estilo realista
    // ====================

    const skinMat = new THREE.MeshStandardMaterial({
        color: skin,
        roughness: 0.6,
        metalness: 0.05,
        emissive: skin.clone().multiplyScalar(0.01)
    });

    const skinMatShiny = new THREE.MeshStandardMaterial({
        color: skin,
        roughness: 0.4,
        metalness: 0.1,
        emissive: skin.clone().multiplyScalar(0.02)
    });

    const hairMat = new THREE.MeshStandardMaterial({
        color: hair,
        roughness: 0.8,
        metalness: 0.02
    });

    const shirtMat = new THREE.MeshStandardMaterial({
        color: shirt,
        roughness: 0.7,
        metalness: 0.05,
        emissive: shirt.clone().multiplyScalar(0.01)
    });

    const pantsMat = new THREE.MeshStandardMaterial({
        color: pants,
        roughness: 0.8,
        metalness: 0.05
    });

    const shoesMat = new THREE.MeshStandardMaterial({
        color: shoes,
        roughness: 0.9,
        metalness: 0.1
    });

    // ====================
    // CUERPO - Estilo Skyrim
    // ====================

    // Torso (más robusto)
    const torsoWidth = isMale ? 0.6 : 0.5;
    const torsoGeo = new THREE.CylinderGeometry(torsoWidth, 0.5, 0.8, 12);
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.y = 0.45;
    torso.castShadow = true;
    avatarGroup.add(torso);

    // Cintura
    const waistGeo = new THREE.CylinderGeometry(0.45, 0.5, 0.12, 10);
    const waist = new THREE.Mesh(waistGeo, pantsMat);
    waist.position.y = 0.08;
    avatarGroup.add(waist);

    // Cuello
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.12, 10), skinMat);
    neck.position.y = 0.88;
    avatarGroup.add(neck);

    // ====================
    // CABEZA - Según raza
    // ====================

    let headScale = { x: 1, y: 1.05, z: 0.95 };
    
    // Ajustes por raza
    if (isElf) {
        headScale = { x: 0.95, y: 1.1, z: 0.9 }; // Elfos: cabezas más alargadas
    } else if (isOrc) {
        headScale = { x: 1.05, y: 1.0, z: 1.0 }; // Orcos: cabezas más anchas
    } else if (isKhajiit) {
        headScale = { x: 0.95, y: 1.0, z: 0.9 }; // Khajiit: cabezas más estrechas
    }

    const headGeo = new THREE.SphereGeometry(0.38, 32, 32);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.05;
    head.scale.set(headScale.x, headScale.y, headScale.z);
    head.castShadow = true;
    avatarGroup.add(head);

    // ====================
    // OREJAS - Especiales por raza
    // ====================

    if (isElf) {
        // Orejas de elfo (puntiagudas)
        for (let side = -1; side <= 1; side += 2) {
            const ear = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.2, 6), skinMat);
            ear.position.set(side * 0.4, 1.08, 0);
            ear.rotation.z = side * 0.3;
            ear.rotation.x = 0.2;
            avatarGroup.add(ear);
        }
    } else if (isKhajiit) {
        // Orejas de Khajiit (felinas)
        for (let side = -1; side <= 1; side += 2) {
            const ear = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.15, 6), skinMat);
            ear.position.set(side * 0.35, 1.15, 0);
            ear.rotation.z = side * 0.4;
            ear.rotation.x = -0.2;
            avatarGroup.add(ear);
        }
    } else {
        // Orejas humanas
        for (let side = -1; side <= 1; side += 2) {
            const ear = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), skinMat);
            ear.position.set(side * 0.4, 1.02, 0);
            ear.scale.set(0.3, 0.5, 0.2);
            avatarGroup.add(ear);
        }
    }

    // ====================
    // OJOS - Con carácter
    // ====================

    const eyeWhiteMat = new THREE.MeshStandardMaterial({
        color: 0xf0f0f0,
        roughness: 0.1,
        emissive: 0x4488ff,
        emissiveIntensity: 0.02
    });

    const eyeColor = isElf ? '#4A90D9' : isOrc ? '#FF6B00' : isKhajiit ? '#FFD700' : '#5C3D2E';
    const irisMat = new THREE.MeshStandardMaterial({
        color: eyeColor,
        roughness: 0.3,
        emissive: new THREE.Color(eyeColor).multiplyScalar(0.05)
    });

    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e });
    const sparkleMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x88ccff,
        emissiveIntensity: 0.3
    });

    for (let side = -1; side <= 1; side += 2) {
        const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), eyeWhiteMat);
        eyeWhite.position.set(side * 0.16, 1.07, 0.36);
        eyeWhite.scale.set(1, 0.85, 0.5);
        avatarGroup.add(eyeWhite);

        const iris = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 16), irisMat);
        iris.position.set(side * 0.16, 1.06, 0.44);
        avatarGroup.add(iris);

        const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), pupilMat);
        pupil.position.set(side * 0.16, 1.05, 0.48);
        avatarGroup.add(pupil);

        const sparkle = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), sparkleMat);
        sparkle.position.set(side * 0.13, 1.09, 0.49);
        avatarGroup.add(sparkle);
    }

    // ====================
    // CEJAS - Según raza
    // ====================

    const browMat = new THREE.MeshStandardMaterial({ 
        color: hair, 
        roughness: 0.8,
        transparent: true,
        opacity: 0.7
    });

    const browWidth = isElf ? 0.06 : 0.08;
    for (let side = -1; side <= 1; side += 2) {
        const brow = new THREE.Mesh(new THREE.BoxGeometry(browWidth, 0.015, 0.02), browMat);
        brow.position.set(side * 0.17, 1.14, 0.38);
        brow.rotation.z = side * 0.08;
        brow.rotation.x = -0.08;
        avatarGroup.add(brow);
    }

    // ====================
    // BOCA - Serie y determinada
    // ====================

    const mouthMat = new THREE.MeshStandardMaterial({
        color: 0xBB7799,
        roughness: 0.5
    });
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.015, 0.01), mouthMat);
    mouth.position.set(0, 0.96, 0.42);
    avatarGroup.add(mouth);

    // ====================
    // NARIZ - Según raza
    // ====================

    const noseMat = new THREE.MeshStandardMaterial({
        color: skin,
        roughness: 0.7
    });
    
    let noseScale = { x: 0.8, y: 0.6, z: 0.5 };
    if (isElf) noseScale = { x: 0.7, y: 0.7, z: 0.4 };
    else if (isOrc) noseScale = { x: 0.9, y: 0.5, z: 0.6 };
    
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), noseMat);
    nose.position.set(0, 1.02, 0.46);
    nose.scale.set(noseScale.x, noseScale.y, noseScale.z);
    avatarGroup.add(nose);

    // ====================
    // BARBA - Estilo Skyrim
    // ====================

    if (personaje.beard !== 'none' && isMale) {
        const beardMat = new THREE.MeshStandardMaterial({
            color: hair,
            roughness: 0.9
        });
        
        if (personaje.beard === 'short') {
            const beard = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.05), beardMat);
            beard.position.set(0, 0.92, 0.44);
            avatarGroup.add(beard);
        } else if (personaje.beard === 'long') {
            const beard = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.06), beardMat);
            beard.position.set(0, 0.90, 0.44);
            avatarGroup.add(beard);
        } else if (personaje.beard === 'braided') {
            const beard1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.05), beardMat);
            beard1.position.set(-0.03, 0.90, 0.44);
            avatarGroup.add(beard1);
            const beard2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.05), beardMat);
            beard2.position.set(0.03, 0.90, 0.44);
            avatarGroup.add(beard2);
        }
    }

    // ====================
    // CABELLO - Estilo Skyrim
    // ====================

    const hairGroup = new THREE.Group();

    if (personaje.hair !== 'bald') {
        const hairMatMain = new THREE.MeshStandardMaterial({
            color: hair,
            roughness: 0.8,
            metalness: 0.02
        });

        // Base del cabello
        const hairBase = new THREE.Mesh(
            new THREE.SphereGeometry(0.4, 16, 16, 0, Math.PI*2, 0, Math.PI/2),
            hairMatMain
        );
        hairBase.position.y = 0.05;
        hairBase.scale.y = 0.5;
        hairGroup.add(hairBase);

        switch(personaje.hair) {
            case 'short':
                for (let i = 0; i < 8; i++) {
                    const clump = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), hairMatMain);
                    const angle = (i / 8) * Math.PI * 2;
                    clump.position.set(Math.sin(angle)*0.34, 0.06, Math.cos(angle)*0.34);
                    clump.scale.set(1, 0.6, 1);
                    hairGroup.add(clump);
                }
                break;
            case 'long':
                const longMat = new THREE.MeshStandardMaterial({
                    color: hair,
                    roughness: 0.8
                });
                for (let layer = 0; layer < 3; layer++) {
                    for (let i = 0; i < 12; i++) {
                        const strand = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.03, 0.15, 6), longMat);
                        const angle = (i / 12) * Math.PI * 2 + layer * 0.3;
                        strand.position.set(
                            Math.sin(angle) * 0.32,
                            0.02 - layer * 0.06,
                            Math.cos(angle) * 0.32
                        );
                        strand.rotation.x = Math.cos(angle) * 0.3;
                        strand.rotation.z = Math.sin(angle) * 0.3;
                        hairGroup.add(strand);
                    }
                }
                break;
            case 'braided':
                const braidMat = new THREE.MeshStandardMaterial({
                    color: hair,
                    roughness: 0.8
                });
                // Trenzas
                for (let side = -1; side <= 1; side += 2) {
                    for (let i = 0; i < 4; i++) {
                        const braid = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.12, 6), braidMat);
                        braid.position.set(side * 0.15, -0.02 - i*0.08, -0.25 - i*0.02);
                        braid.rotation.x = 0.1 + i*0.05;
                        braid.rotation.z = side * 0.2;
                        hairGroup.add(braid);
                    }
                }
                break;
            case 'topknot':
                const knotMat = new THREE.MeshStandardMaterial({
                    color: hair,
                    roughness: 0.8
                });
                // Moño superior
                const knot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), knotMat);
                knot.position.set(0, 0.15, 0);
                knot.scale.set(1, 0.7, 1);
                hairGroup.add(knot);
                break;
        }
        hairGroup.position.y = 1.05;
        avatarGroup.add(hairGroup);
    }

    // ====================
    // BRAZOS - Robusto estilo Skyrim
    // ====================

    const armMat = new THREE.MeshStandardMaterial({
        color: skin,
        roughness: 0.5,
        metalness: 0.05
    });

    for (let side = -1; side <= 1; side += 2) {
        const arm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.065, 0.08, 0.45, 8),
            armMat
        );
        arm.position.set(side * 0.55, 0.7, 0);
        arm.rotation.z = side * 0.15;
        arm.castShadow = true;
        avatarGroup.add(arm);

        const foreArm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.055, 0.065, 0.35, 8),
            armMat
        );
        foreArm.position.set(side * 0.55, 0.35, 0);
        foreArm.rotation.z = side * 0.1;
        avatarGroup.add(foreArm);

        const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), armMat);
        hand.position.set(side * 0.55, 0.05, 0);
        avatarGroup.add(hand);
    }

    // ====================
    // PIERNAS - Fuertes estilo Skyrim
    // ====================

    const legMat = new THREE.MeshStandardMaterial({
        color: pants,
        roughness: 0.7,
        metalness: 0.05
    });

    const legWidth = isMale ? 0.075 : 0.06;
    for (let side = -1; side <= 1; side += 2) {
        const thigh = new THREE.Mesh(
            new THREE.CylinderGeometry(legWidth, legWidth*1.2, 0.35, 8),
            legMat
        );
        thigh.position.set(side * 0.17, 0.35, 0);
        thigh.castShadow = true;
        avatarGroup.add(thigh);

        const calf = new THREE.Mesh(
            new THREE.CylinderGeometry(legWidth*0.8, legWidth*1.1, 0.35, 8),
            legMat
        );
        calf.position.set(side * 0.17, 0.05, 0);
        avatarGroup.add(calf);

        const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.07, 0.28), shoesMat);
        shoe.position.set(side * 0.17, -0.02, 0.03);
        shoe.castShadow = true;
        avatarGroup.add(shoe);
    }

    // ====================
    // ACCESORIOS - Estilo Skyrim
    // ====================

    // Sombrero/Casco
    if (personaje.hat !== 'none') {
        const hatGroup = new THREE.Group();
        const hatMat = new THREE.MeshStandardMaterial({
            color: 0x2D2D2D,
            roughness: 0.7,
            metalness: 0.3
        });
        
        if (personaje.hat === 'helmet') {
            // Casco nórdico
            const helm = new THREE.Mesh(new THREE.SphereGeometry(0.38, 8, 8, 0, Math.PI*2, 0, Math.PI/2), hatMat);
            helm.position.y = 0.05;
            helm.scale.y = 0.6;
            hatGroup.add(helm);
            
            const hornMat = new THREE.MeshStandardMaterial({ color: 0x8B6B4A, roughness: 0.8 });
            for (let side = -1; side <= 1; side += 2) {
                const horn = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.15, 6), hornMat);
                horn.position.set(side * 0.25, 0.08, -0.15);
                horn.rotation.x = 0.3;
                horn.rotation.z = side * 0.3;
                hatGroup.add(horn);
            }
        } else if (personaje.hat === 'hood') {
            // Capa
            const hoodMat = new THREE.MeshStandardMaterial({
                color: 0x2D2D2D,
                roughness: 0.9
            });
            const hood = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 8, 0, Math.PI*2, 0, Math.PI/2), hoodMat);
            hood.position.y = 0.05;
            hood.scale.y = 0.7;
            hatGroup.add(hood);
        }
        hatGroup.position.y = 1.18;
        avatarGroup.add(hatGroup);
    }

    // ====================
    // DETALLES - Escaras y marcas (Skyrim)
    // ====================

    if (personaje.scars !== 'none') {
        const scarMat = new THREE.MeshStandardMaterial({
            color: 0xCC8899,
            roughness: 0.3,
            transparent: true,
            opacity: 0.5
        });
        
        if (personaje.scars === 'cheek') {
            const scar = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.04, 0.01), scarMat);
            scar.position.set(0.15, 1.02, 0.44);
            avatarGroup.add(scar);
        } else if (personaje.scars === 'eye') {
            const scar = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.015, 0.01), scarMat);
            scar.position.set(0.12, 1.08, 0.42);
            avatarGroup.add(scar);
        } else if (personaje.scars === 'forehead') {
            const scar = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, 0.01), scarMat);
            scar.position.set(0, 1.14, 0.42);
            avatarGroup.add(scar);
        }
    }

    // ====================
    // DETALLES FINALES
    // ====================

    // Collar de camisa
    const collarMat = new THREE.MeshStandardMaterial({
        color: shirt,
        roughness: 0.7,
        metalness: 0.05
    });
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.02, 0.08), collarMat);
    collar.position.set(0, 0.82, 0.18);
    avatarGroup.add(collar);

    // Cinturón
    const beltMat = new THREE.MeshStandardMaterial({
        color: 0x2D2D2D,
        roughness: 0.7,
        metalness: 0.3
    });
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.03, 0.22), beltMat);
    belt.position.set(0, 0.1, 0);
    avatarGroup.add(belt);

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

    avatarGroup.scale.set(0.85, 0.85, 0.85);
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
    camera.position.set(4.5, 3.5, 6.5);
    controls.target.set(0, 1.2, 0);
    controls.update();
}

// ==========================================
// FUNCIONES DE INTERACCIÓN
// ==========================================

function selectRace(race) {
    const raza = razas[race];
    if (raza) {
        personaje.race = race;
        personaje.skin = raza.skin;
        personaje.hairColor = raza.hair;
        
        // Actualizar UI
        document.querySelectorAll('.race-btn').forEach(el => el.classList.remove('active'));
        document.querySelector(`[data-race="${race}"]`).classList.add('active');
        
        // Actualizar descripción
        document.getElementById('raceDesc').textContent = raza.desc;
        document.getElementById('raceTraits').textContent = raza.traits;
        document.getElementById('raceName').textContent = raza.name;
        
        crearPersonaje();
    }
}

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
        nord: { race: 'nord', gender: 'male', skin: '#F5D0B8', hair: 'long', hairColor: '#8B6914', shirt: '#3B82F6', pants: '#1E3A5F', shoes: '#2D2D2D', hat: 'helmet', glasses: 'none', beard: 'short', scars: 'none' },
        elf: { race: 'high_elf', gender: 'male', skin: '#F5D0B8', hair: 'long', hairColor: '#FFD700', shirt: '#8B5CF6', pants: '#4A2F1A', shoes: '#2D2D2D', hat: 'none', glasses: 'none', beard: 'none', scars: 'none' },
        orc: { race: 'orc', gender: 'male', skin: '#6B8B3A', hair: 'short', hairColor: '#2D2D2D', shirt: '#2D2D2D', pants: '#1A1A2E', shoes: '#000000', hat: 'helmet', glasses: 'none', beard: 'short', scars: 'forehead' },
        khajiit: { race: 'khajiit', gender: 'male', skin: '#8B6914', hair: 'short', hairColor: '#4A2F1A', shirt: '#F59E0B', pants: '#8B6914', shoes: '#2D2D2D', hat: 'hood', glasses: 'none', beard: 'none', scars: 'none' },
        imperial: { race: 'imperial', gender: 'male', skin: '#E8C4A0', hair: 'short', hairColor: '#4A2F1A', shirt: '#EF4444', pants: '#1E3A5F', shoes: '#2D2D2D', hat: 'none', glasses: 'none', beard: 'short', scars: 'none' },
        dark_elf: { race: 'dark_elf', gender: 'male', skin: '#6B4F3A', hair: 'long', hairColor: '#2D2D2D', shirt: '#1A1A2E', pants: '#1A1A2E', shoes: '#000000', hat: 'none', glasses: 'none', beard: 'none', scars: 'eye' },
        redguard: { race: 'redguard', gender: 'male', skin: '#8B6B4A', hair: 'braided', hairColor: '#2D2D2D', shirt: '#EF4444', pants: '#2D2D2D', shoes: '#000000', hat: 'none', glasses: 'none', beard: 'long', scars: 'cheek' },
        wood_elf: { race: 'wood_elf', gender: 'male', skin: '#D4A574', hair: 'long', hairColor: '#4A2F1A', shirt: '#22C55E', pants: '#4A2F1A', shoes: '#2D2D2D', hat: 'hood', glasses: 'none', beard: 'none', scars: 'none' }
    };
    if (presets[tipo]) {
        Object.assign(personaje, presets[tipo]);
        actualizarInterfaz();
        // Actualizar raza en UI
        document.querySelectorAll('.race-btn').forEach(el => el.classList.remove('active'));
        document.querySelector(`[data-race="${personaje.race}"]`)?.classList.add('active');
        const raza = razas[personaje.race];
        if (raza) {
            document.getElementById('raceDesc').textContent = raza.desc;
            document.getElementById('raceTraits').textContent = raza.traits;
            document.getElementById('raceName').textContent = raza.name;
        }
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
    personaje = { 
        race: 'nord', 
        gender: 'male', 
        skin: '#F5D0B8', 
        hair: 'short', 
        hairColor: '#8B6914', 
        shirt: '#3B82F6', 
        pants: '#1E3A5F', 
        shoes: '#2D2D2D', 
        hat: 'none', 
        glasses: 'none',
        beard: 'none',
        scars: 'none'
    };
    actualizarInterfaz();
    selectRace('nord');
}

function randomPersonaje() {
    const races = ['nord', 'imperial', 'dark_elf', 'high_elf', 'wood_elf', 'orc', 'khajiit', 'redguard'];
    const hairs = ['short', 'long', 'braided', 'topknot', 'bald'];
    const hairColors = ['#4A2F1A', '#000000', '#8B6914', '#FFD700', '#FF6B35', '#FF1493', '#00BFFF', '#FFFFFF'];
    const shirts = ['#3B82F6', '#EF4444', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#1A1A2E'];
    const beards = ['none', 'short', 'long', 'braided'];
    const scars = ['none', 'cheek', 'eye', 'forehead'];
    const hats = ['none', 'helmet', 'hood'];
    
    const race = races[Math.floor(Math.random() * races.length)];
    personaje.race = race;
    const raza = razas[race];
    personaje.skin = raza.skin;
    personaje.hairColor = raza.hair;
    personaje.hair = hairs[Math.floor(Math.random() * hairs.length)];
    personaje.shirt = shirts[Math.floor(Math.random() * shirts.length)];
    personaje.gender = Math.random() > 0.5 ? 'male' : 'female';
    personaje.beard = beards[Math.floor(Math.random() * beards.length)];
    personaje.scars = scars[Math.floor(Math.random() * scars.length)];
    personaje.hat = hats[Math.floor(Math.random() * hats.length)];
    personaje.glasses = 'none';
    personaje.pants = '#1E3A5F';
    personaje.shoes = '#2D2D2D';
    
    actualizarInterfaz();
    document.querySelectorAll('.race-btn').forEach(el => el.classList.remove('active'));
    document.querySelector(`[data-race="${personaje.race}"]`)?.classList.add('active');
    if (raza) {
        document.getElementById('raceDesc').textContent = raza.desc;
        document.getElementById('raceTraits').textContent = raza.traits;
        document.getElementById('raceName').textContent = raza.name;
    }
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
            const raza = razas[personaje.race];
            if (raza) {
                document.getElementById('raceDesc').textContent = raza.desc;
                document.getElementById('raceTraits').textContent = raza.traits;
                document.getElementById('raceName').textContent = raza.name;
            }
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