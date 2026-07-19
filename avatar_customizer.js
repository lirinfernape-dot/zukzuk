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
let eyeL, eyeR, pupilL, pupilR;
let time = 0;

function initScene() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(4, 3, 6);
    camera.lookAt(0, 1.2, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

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

    const backLight = new THREE.DirectionalLight(0x4466ff, 0.1);
    backLight.position.set(0, 2, -5);
    scene.add(backLight);

    // Piso
    const gridHelper = new THREE.GridHelper(8, 20, 0x444466, 0x333355);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    const shadowGeometry = new THREE.CircleGeometry(1.8, 32);
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
    time += 0.01;
    
    // Animación de ojos (parpadeo)
    if (eyeL && eyeR) {
        const blink = Math.sin(time * 2) > 0.95 ? 0.1 : 1;
        eyeL.scale.y = blink;
        eyeR.scale.y = blink;
    }
    
    controls.update();
    renderer.render(scene, camera);
}

// ==========================================
// CREAR PERSONAJE ESTILO ROBLOX
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

    // ====================
    // CUERPO - Estilo Roblox
    // ====================
    
    // Torso (más redondeado estilo Roblox)
    const torsoGeo = new THREE.BoxGeometry(0.9, 1.0, 0.6);
    // Redondear bordes con bevel
    const torsoMat = new THREE.MeshStandardMaterial({ 
        color: shirtColor, 
        roughness: 0.5, 
        metalness: 0.05,
        emissive: new THREE.Color(shirtColor).multiplyScalar(0.05)
    });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 1.1;
    torso.castShadow = true;
    avatarGroup.add(torso);

    // Cintura (más estrecha para femenino)
    const waistScaleX = isMale ? 0.85 : 0.7;
    const waistGeo = new THREE.BoxGeometry(waistScaleX, 0.2, 0.5);
    const waistMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.6 });
    const waist = new THREE.Mesh(waistGeo, waistMat);
    waist.position.y = 0.7;
    avatarGroup.add(waist);

    // Cuello
    const neckGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.15, 8);
    const neckMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.7 });
    const neck = new THREE.Mesh(neckGeo, neckMat);
    neck.position.y = 1.6;
    avatarGroup.add(neck);

    // ====================
    // CABEZA - Estilo Roblox (más grande)
    // ====================
    
    const headGeo = new THREE.SphereGeometry(0.45, 32, 32);
    const headMat = new THREE.MeshStandardMaterial({ 
        color: skinColor, 
        roughness: 0.6,
        emissive: new THREE.Color(skinColor).multiplyScalar(0.02)
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.85;
    head.scale.set(1, 1.1, 0.95);
    head.castShadow = true;
    avatarGroup.add(head);

    // ====================
    // OJOS - CON BRILLO Y ANIMACIÓN
    // ====================
    
    // Base blanca del ojo
    const eyeBaseGeo = new THREE.SphereGeometry(0.12, 24, 24);
    const eyeBaseMat = new THREE.MeshStandardMaterial({ 
        color: 0xffffff, 
        roughness: 0.1,
        emissive: new THREE.Color(0x4488ff).multiplyScalar(0.05)
    });
    
    const eyeBaseL = new THREE.Mesh(eyeBaseGeo, eyeBaseMat);
    eyeBaseL.position.set(-0.18, 1.92, 0.4);
    avatarGroup.add(eyeBaseL);

    const eyeBaseR = new THREE.Mesh(eyeBaseGeo, eyeBaseMat);
    eyeBaseR.position.set(0.18, 1.92, 0.4);
    avatarGroup.add(eyeBaseR);

    // Iris (color según género)
    const irisColor = isMale ? 0x5C3D2E : 0x4A90D9;
    const irisGeo = new THREE.SphereGeometry(0.07, 16, 16);
    const irisMat = new THREE.MeshStandardMaterial({ 
        color: irisColor, 
        roughness: 0.2,
        emissive: new THREE.Color(irisColor).multiplyScalar(0.1)
    });
    
    const irisL = new THREE.Mesh(irisGeo, irisMat);
    irisL.position.set(-0.18, 1.9, 0.5);
    avatarGroup.add(irisL);

    const irisR = new THREE.Mesh(irisGeo, irisMat);
    irisR.position.set(0.18, 1.9, 0.5);
    avatarGroup.add(irisR);

    // Pupila
    const pupilGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.1 });
    
    pupilL = new THREE.Mesh(pupilGeo, pupilMat);
    pupilL.position.set(-0.18, 1.88, 0.56);
    avatarGroup.add(pupilL);

    pupilR = new THREE.Mesh(pupilGeo, pupilMat);
    pupilR.position.set(0.18, 1.88, 0.56);
    avatarGroup.add(pupilR);

    // Brillo en los ojos (destello)
    const sparkleGeo = new THREE.SphereGeometry(0.025, 8, 8);
    const sparkleMat = new THREE.MeshStandardMaterial({ 
        color: 0xffffff, 
        emissive: 0x88ccff,
        emissiveIntensity: 0.5
    });
    
    const sparkleL = new THREE.Mesh(sparkleGeo, sparkleMat);
    sparkleL.position.set(-0.14, 1.94, 0.56);
    avatarGroup.add(sparkleL);

    const sparkleR = new THREE.Mesh(sparkleGeo, sparkleMat);
    sparkleR.position.set(0.22, 1.94, 0.56);
    avatarGroup.add(sparkleR);

    // ====================
    // CABELLO - Estilo Roblox
    // ====================
    
    const hairGroup = new THREE.Group();
    const hairMat = new THREE.MeshStandardMaterial({ 
        color: hairColor, 
        roughness: 0.8,
        emissive: new THREE.Color(hairColor).multiplyScalar(0.03)
    });

    // Cabello base (cubre toda la cabeza)
    const hairBase = new THREE.Mesh(new THREE.SphereGeometry(0.48, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), hairMat);
    hairBase.position.y = 0.05;
    hairBase.scale.y = 0.5;
    hairGroup.add(hairBase);

    switch(personaje.hair) {
        case 'short':
            // Cabello corto con volumen
            for (let i = 0; i < 8; i++) {
                const clump = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), hairMat);
                const angle = (i / 8) * Math.PI * 2;
                clump.position.set(Math.sin(angle) * 0.3, 0.1 + Math.cos(angle * 2) * 0.05, Math.cos(angle) * 0.3);
                clump.scale.set(1, 0.6, 1);
                hairGroup.add(clump);
            }
            break;
        case 'long':
            // Cabello largo
            const longHairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.8 });
            // Parte frontal
            const frontHair = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), longHairMat);
            frontHair.position.y = 0.05;
            frontHair.scale.y = 0.55;
            hairGroup.add(frontHair);
            
            // Cabello largo trasero (cola)
            for (let i = 0; i < 3; i++) {
                const tailPart = new THREE.Mesh(new THREE.CylinderGeometry(0.1 - i*0.02, 0.15 - i*0.02, 0.15, 8), longHairMat);
                tailPart.position.set(0, -0.05 - i*0.12, -0.4 - i*0.05);
                tailPart.rotation.x = 0.1 + i*0.1;
                hairGroup.add(tailPart);
            }
            break;
        case 'spiky':
            // Cabello spiky estilo anime
            for (let i = 0; i < 9; i++) {
                const spike = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.25, 6), hairMat);
                const angle = (i / 9) * Math.PI * 2;
                const radius = 0.3;
                spike.position.set(Math.sin(angle) * radius, 0.2 + Math.cos(angle * 2) * 0.05, Math.cos(angle) * radius);
                spike.rotation.x = Math.cos(angle) * 0.6;
                spike.rotation.z = Math.sin(angle) * 0.6;
                hairGroup.add(spike);
            }
            // Spikes superiores
            for (let i = 0; i < 5; i++) {
                const topSpike = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.2, 6), hairMat);
                const angle = (i / 5) * Math.PI * 2 + 0.3;
                topSpike.position.set(Math.sin(angle) * 0.15, 0.25, Math.cos(angle) * 0.15);
                topSpike.rotation.x = Math.cos(angle) * 0.4;
                topSpike.rotation.z = Math.sin(angle) * 0.4;
                hairGroup.add(topSpike);
            }
            break;
        case 'curly':
            // Cabello rizado
            for (let i = 0; i < 20; i++) {
                const curl = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), hairMat);
                const angle = (i / 20) * Math.PI * 2;
                const radius = 0.3 + Math.sin(i * 3) * 0.08;
                curl.position.set(Math.sin(angle) * radius, 0.08 + Math.cos(angle * 2) * 0.1, Math.cos(angle) * radius);
                curl.scale.set(1, 0.8 + Math.sin(i * 2) * 0.2, 1);
                hairGroup.add(curl);
            }
            break;
        case 'ponytail':
            // Cola de caballo
            const ponyMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.8 });
            // Base
            const ponyBase = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), ponyMat);
            ponyBase.position.y = 0.05;
            ponyBase.scale.y = 0.5;
            hairGroup.add(ponyBase);
            
            // Cola
            for (let i = 0; i < 4; i++) {
                const tailPart = new THREE.Mesh(new THREE.CylinderGeometry(0.06 - i*0.01, 0.1 - i*0.01, 0.15, 8), ponyMat);
                tailPart.position.set(0, -0.05 - i*0.12, -0.38 - i*0.04);
                tailPart.rotation.x = 0.2 + i*0.1;
                hairGroup.add(tailPart);
            }
            break;
        case 'bald':
            // Sin cabello - removemos la base
            hairGroup.remove(hairBase);
            break;
        default:
            // Corto por defecto
            break;
    }

    hairGroup.position.y = 1.85;
    avatarGroup.add(hairGroup);

    // ====================
    // BRAZOS - Estilo Roblox
    // ====================
    
    const armMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.6 });
    const sleeveMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.5 });

    // Brazos más gruesos estilo Roblox
    const armWidth = 0.1;
    const armLength = 0.55;
    
    // Brazo izquierdo
    const armL = new THREE.Mesh(new THREE.CylinderGeometry(armWidth, armWidth * 1.2, armLength, 8), armMat);
    armL.position.set(-0.55, 1.25, 0);
    armL.rotation.z = 0.3;
    armL.rotation.x = -0.2;
    armL.castShadow = true;
    avatarGroup.add(armL);
    
    // Manga izquierda
    const sleeveL = new THREE.Mesh(new THREE.CylinderGeometry(armWidth * 1.1, armWidth * 1.3, 0.2, 8), sleeveMat);
    sleeveL.position.set(-0.55, 1.4, 0);
    sleeveL.rotation.z = 0.3;
    avatarGroup.add(sleeveL);

    // Brazo derecho
    const armR = new THREE.Mesh(new THREE.CylinderGeometry(armWidth, armWidth * 1.2, armLength, 8), armMat);
    armR.position.set(0.55, 1.25, 0);
    armR.rotation.z = -0.3;
    armR.rotation.x = 0.2;
    armR.castShadow = true;
    avatarGroup.add(armR);
    
    // Manga derecha
    const sleeveR = new THREE.Mesh(new THREE.CylinderGeometry(armWidth * 1.1, armWidth * 1.3, 0.2, 8), sleeveMat);
    sleeveR.position.set(0.55, 1.4, 0);
    sleeveR.rotation.z = -0.3;
    avatarGroup.add(sleeveR);

    // ====================
    // PIERNAS - Estilo Roblox
    // ====================
    
    const legMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.6 });
    const legWidth = isMale ? 0.12 : 0.09;
    const legWidthBottom = isMale ? 0.15 : 0.11;

    // Pierna izquierda
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(legWidth, legWidthBottom, 0.6, 8), legMat);
    legL.position.set(-0.2, 0.35, 0);
    legL.castShadow = true;
    avatarGroup.add(legL);

    // Pierna derecha
    const legR = new THREE.Mesh(new THREE.CylinderGeometry(legWidth, legWidthBottom, 0.6, 8), legMat);
    legR.position.set(0.2, 0.35, 0);
    legR.castShadow = true;
    avatarGroup.add(legR);

    // ====================
    // ZAPATOS - Estilo Roblox
    // ====================
    
    const shoeMat = new THREE.MeshStandardMaterial({ color: shoesColor, roughness: 0.7 });

    // Zapatos más grandes estilo Roblox
    const shoeScale = isMale ? 1 : 0.9;
    
    const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.2 * shoeScale, 0.1, 0.35 * shoeScale), shoeMat);
    shoeL.position.set(-0.2, 0.08, 0.05);
    shoeL.castShadow = true;
    avatarGroup.add(shoeL);

    const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.2 * shoeScale, 0.1, 0.35 * shoeScale), shoeMat);
    shoeR.position.set(0.2, 0.08, 0.05);
    shoeR.castShadow = true;
    avatarGroup.add(shoeR);

    // ====================
    // DIFERENCIAS DE GÉNERO
    // ====================
    
    if (isMale) {
        // Hombros más anchos
        torso.scale.x = 1.1;
        // Cintura más recta
        waist.scale.x = 1.0;
    } else {
        // Hombros más estrechos
        torso.scale.x = 0.9;
        // Cintura más estrecha (curvas)
        waist.scale.x = 0.8;
        // Pestañas (opcional)
        const lashMat = new THREE.MeshStandardMaterial({ color: 0x2D2D2D });
        for (let side = -1; side <= 1; side += 2) {
            for (let i = 0; i < 5; i++) {
                const lash = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.025, 0.005), lashMat);
                const angle = (i / 5) * Math.PI - Math.PI/2;
                lash.position.set(side * 0.22, 1.96 + Math.sin(angle) * 0.04, 0.4 + Math.cos(angle) * 0.04);
                lash.rotation.z = side * (0.2 + Math.cos(angle) * 0.2);
                lash.rotation.x = Math.sin(angle) * 0.2;
                avatarGroup.add(lash);
            }
        }
    }

    // ====================
    // ACCESORIOS
    // ====================
    
    // Sombrero
    if (personaje.hat !== 'none') {
        const hatGroup = new THREE.Group();
        const hatMat = new THREE.MeshStandardMaterial({ color: 0x2D2D2D, roughness: 0.7 });
        
        if (personaje.hat === 'tophat') {
            const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.3, 8), hatMat);
            hatTop.position.y = 0.15;
            hatGroup.add(hatTop);
            
            const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.05, 8), hatMat);
            hatBrim.position.y = 0.02;
            hatGroup.add(hatBrim);
            
            // Cinta del sombrero
            const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xE74C3C });
            const ribbon = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.05, 8), ribbonMat);
            ribbon.position.y = 0.1;
            hatGroup.add(ribbon);
            
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
            const crownMat = new THREE.MeshStandardMaterial({ 
                color: 0xFFD700, 
                metalness: 0.9, 
                roughness: 0.1,
                emissive: new THREE.Color(0xFFD700).multiplyScalar(0.1)
            });
            const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.1, 8), crownMat);
            crownBase.position.y = 0.05;
            hatGroup.add(crownBase);
            
            for (let i = 0; i < 7; i++) {
                const spike = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.18, 4), crownMat);
                const angle = (i / 7) * Math.PI * 2;
                spike.position.set(Math.sin(angle) * 0.28, 0.15, Math.cos(angle) * 0.28);
                hatGroup.add(spike);
            }
            
            // Joyas en la corona
            const jewelMat = new THREE.MeshStandardMaterial({ 
                color: 0xE74C3C, 
                emissive: 0xE74C3C,
                emissiveIntensity: 0.3
            });
            for (let i = 0; i < 5; i++) {
                const jewel = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), jewelMat);
                const angle = (i / 5) * Math.PI * 2 + 0.3;
                jewel.position.set(Math.sin(angle) * 0.28, 0.08, Math.cos(angle) * 0.28);
                hatGroup.add(jewel);
            }
        }
        
        hatGroup.position.y = 2.0;
        avatarGroup.add(hatGroup);
    }

    // Gafas
    if (personaje.glasses !== 'none') {
        const glassesGroup = new THREE.Group();
        const glassesMat = new THREE.MeshStandardMaterial({ 
            color: 0x2D2D2D, 
            roughness: 0.2, 
            metalness: 0.7 
        });
        const lensMat = new THREE.MeshStandardMaterial({ 
            color: personaje.glasses === 'sunglasses' ? 0x1a1a2e : 0x4488ff, 
            transparent: true, 
            opacity: personaje.glasses === 'sunglasses' ? 0.7 : 0.3,
            roughness: 0.1,
            metalness: 0.1
        });
        
        if (personaje.glasses === 'round' || personaje.glasses === 'sunglasses') {
            const lensL = new THREE.Mesh(new THREE.CircleGeometry(0.12, 24), lensMat);
            lensL.position.set(-0.15, 0, 0);
            lensL.rotation.y = 0.2;
            glassesGroup.add(lensL);
            
            const lensR = new THREE.Mesh(new THREE.CircleGeometry(0.12, 24), lensMat);
            lensR.position.set(0.15, 0, 0);
            lensR.rotation.y = -0.2;
            glassesGroup.add(lensR);
            
            const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.02), glassesMat);
            bridge.position.set(0, 0, 0);
            glassesGroup.add(bridge);
            
            // Marco de las gafas
            const frameMat = new THREE.MeshStandardMaterial({ 
                color: personaje.glasses === 'sunglasses' ? 0x1a1a2e : 0x2D2D2D,
                roughness: 0.3,
                metalness: 0.5
            });
            
            const frameL = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 8, 16), frameMat);
            frameL.position.set(-0.15, 0, 0);
            frameL.rotation.y = 0.2;
            glassesGroup.add(frameL);
            
            const frameR = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 8, 16), frameMat);
            frameR.position.set(0.15, 0, 0);
            frameR.rotation.y = -0.2;
            glassesGroup.add(frameR);
            
            // Patillas
            const armL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.15), glassesMat);
            armL.position.set(-0.15, 0.02, -0.1);
            glassesGroup.add(armL);
            
            const armR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.15), glassesMat);
            armR.position.set(0.15, 0.02, -0.1);
            glassesGroup.add(armR);
        }
        
        glassesGroup.position.set(0, 1.92, 0.42);
        avatarGroup.add(glassesGroup);
    }

    // ====================
    // DETALLE: BRILLO EN LA ROPA (Efecto "Cool Guy")
    // ====================
    
    // Línea decorativa en la camisa
    const detailMat = new THREE.MeshStandardMaterial({ 
        color: 0xffffff, 
        emissive: 0x4488ff,
        emissiveIntensity: 0.05,
        transparent: true,
        opacity: 0.3
    });
    const detailLine = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.02, 0.02), detailMat);
    detailLine.position.set(0, 1.3, 0.32);
    avatarGroup.add(detailLine);

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
        hero: { gender: 'male', skin: '#F5D0B8', hair: 'spiky', hairColor: '#FFD700', shirt: '#EF4444', hat: 'none', glasses: 'none' },
        ninja: { gender: 'male', skin: '#F5D0B8', hair: 'bald', hairColor: '#000000', shirt: '#1A1A2E', hat: 'none', glasses: 'none' },
        princess: { gender: 'female', skin: '#F5D0B8', hair: 'long', hairColor: '#FFD700', shirt: '#FF69B4', hat: 'crown', glasses: 'none' },
        pirate: { gender: 'male', skin: '#E8C4A0', hair: 'long', hairColor: '#4A2F1A', shirt: '#000000', hat: 'cap', glasses: 'sunglasses' },
        robot: { gender: 'neutral', skin: '#C0C0C0', hair: 'bald', hairColor: '#000000', shirt: '#808080', hat: 'none', glasses: 'round' },
        alien: { gender: 'neutral', skin: '#00FF00', hair: 'bald', hairColor: '#000000', shirt: '#00CC00', hat: 'none', glasses: 'none' }
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