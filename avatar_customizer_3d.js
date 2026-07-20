// ============================================
// ZUKZUK AVATAR STUDIO 3D
// avatar_customizer_3d.js
// PARTE 1
// ============================================

// ============================================
// CONFIGURACIÓN
// ============================================

const API_URL =
window.location.hostname === "localhost" ||
window.location.hostname === "127.0.0.1"
?
"http://127.0.0.1:5000"
:
"https://zukzuk-fvhn.onrender.com";

const token = localStorage.getItem("token");

// ============================================
// THREE.JS
// ============================================

let scene;
let camera;
let renderer;
let controls;
let clock;

let avatar;

// modelos

let head;
let torso;
let leftArm;
let rightArm;
let leftLeg;
let rightLeg;

// materiales

let skinMaterial;
let shirtMaterial;
let pantsMaterial;

// ============================================
// DATOS DEL PERSONAJE
// ============================================

const avatarData={

gender:"male",

height:50,

width:50,

head:50,

shoulders:50,

waist:50,

hips:50,

chest:15,

arms:50,

legs:50,

skin:"#F7D6BF",

shirt:"#3B82F6",

pants:"#2D2D2D"

};

// ============================================
// INICIAR
// ============================================

window.addEventListener("DOMContentLoaded",()=>{

initScene();

createAvatar();

setupEvents();

animate();

});

// ============================================
// ESCENA
// ============================================

function initScene(){

const container=document.getElementById("viewer3d");

scene=new THREE.Scene();

scene.background=new THREE.Color(0x202124);

camera=new THREE.PerspectiveCamera(

35,

container.clientWidth/container.clientHeight,

0.1,

100

);

camera.position.set(0,1.7,4);

renderer=new THREE.WebGLRenderer({

antialias:true

});

renderer.setSize(

container.clientWidth,

container.clientHeight

);

renderer.shadowMap.enabled=true;

container.appendChild(renderer.domElement);

controls=new THREE.OrbitControls(

camera,

renderer.domElement

);

controls.enableDamping=true;

controls.enablePan=false;

controls.target.set(0,1.2,0);

clock=new THREE.Clock();

// luces

const hemi=new THREE.HemisphereLight(

0xffffff,

0x444444,

1.2

);

scene.add(hemi);

const dir=new THREE.DirectionalLight(

0xffffff,

1.8

);

dir.position.set(4,8,4);

dir.castShadow=true;

scene.add(dir);

// suelo

const floor=new THREE.Mesh(

new THREE.PlaneGeometry(20,20),

new THREE.MeshStandardMaterial({

color:0x2b2d31

})

);

floor.rotation.x=-Math.PI/2;

floor.receiveShadow=true;

scene.add(floor);

window.addEventListener("resize",resizeScene);

}

// ============================================
// CREAR AVATAR
// ============================================

function createAvatar(){

avatar=new THREE.Group();

skinMaterial=new THREE.MeshStandardMaterial({

color:avatarData.skin,

roughness:0.8

});

shirtMaterial=new THREE.MeshStandardMaterial({

color:avatarData.shirt

});

pantsMaterial=new THREE.MeshStandardMaterial({

color:avatarData.pants

});

// cabeza

head=new THREE.Mesh(

new THREE.SphereGeometry(

0.35,

32,

32

),

skinMaterial

);

head.position.y=2.0;

avatar.add(head);

// torso

torso=new THREE.Mesh(

new THREE.BoxGeometry(

0.75,

0.9,

0.35

),

shirtMaterial

);

torso.position.y=1.2;

avatar.add(torso);

// brazo izquierdo

leftArm=new THREE.Mesh(

new THREE.BoxGeometry(

0.22,

0.75,

0.22

),

shirtMaterial

);

leftArm.position.set(

-0.55,

1.2,

0

);

avatar.add(leftArm);

// brazo derecho

rightArm=leftArm.clone();

rightArm.position.x=0.55;

avatar.add(rightArm);

// pierna izquierda

leftLeg=new THREE.Mesh(

new THREE.BoxGeometry(

0.25,

0.9,

0.25

),

pantsMaterial

);

leftLeg.position.set(

-0.18,

0.25,

0

);

avatar.add(leftLeg);

// pierna derecha

rightLeg=leftLeg.clone();

rightLeg.position.x=0.18;

avatar.add(rightLeg);

scene.add(avatar);

}

// ============================================
// EVENTOS
// ============================================

function setupEvents(){

document.querySelectorAll("input[type=range]")

.forEach(slider=>{

slider.addEventListener("input",updateBody);

});

}

// ============================================
// ANIMACIÓN
// ============================================

function animate(){

requestAnimationFrame(animate);

controls.update();

renderer.render(scene,camera);

}

// ============================================
// RESIZE
// ============================================

function resizeScene(){

const container=document.getElementById("viewer3d");

camera.aspect=

container.clientWidth/

container.clientHeight;

camera.updateProjectionMatrix();

renderer.setSize(

container.clientWidth,

container.clientHeight

);

}
// ============================================
// ACTUALIZAR CUERPO
// ============================================

function updateBody(){

avatarData.height=parseFloat(
document.getElementById("height").value
);

avatarData.width=parseFloat(
document.getElementById("width").value
);

avatarData.head=parseFloat(
document.getElementById("head").value
);

avatarData.shoulders=parseFloat(
document.getElementById("shoulders").value
);

avatarData.waist=parseFloat(
document.getElementById("waist").value
);

avatarData.hips=parseFloat(
document.getElementById("hips").value
);

avatarData.chest=parseFloat(
document.getElementById("chest").value
);

avatarData.arms=parseFloat(
document.getElementById("arms").value
);

avatarData.legs=parseFloat(
document.getElementById("legs").value
);

// actualizar números

document.getElementById("heightValue").innerText=avatarData.height;
document.getElementById("widthValue").innerText=avatarData.width;
document.getElementById("headValue").innerText=avatarData.head;
document.getElementById("shouldersValue").innerText=avatarData.shoulders;
document.getElementById("waistValue").innerText=avatarData.waist;
document.getElementById("hipsValue").innerText=avatarData.hips;
document.getElementById("chestValue").innerText=avatarData.chest;
document.getElementById("armsValue").innerText=avatarData.arms;
document.getElementById("legsValue").innerText=avatarData.legs;

applyBody();

}

// ============================================
// APLICAR CAMBIOS
// ============================================

function applyBody(){

// altura

const heightScale=0.7+(avatarData.height/100)*0.6;

avatar.scale.y=heightScale;

// ancho

const widthScale=0.8+(avatarData.width/100)*0.5;

torso.scale.x=widthScale;

// cabeza

const headScale=0.8+(avatarData.head/100)*0.8;

head.scale.set(

headScale,

headScale,

headScale

);

// hombros

const shoulderScale=

0.8+(avatarData.shoulders/100)*0.7;

leftArm.position.x=-(0.45*shoulderScale);

rightArm.position.x=(0.45*shoulderScale);

// brazos

const armScale=

0.7+(avatarData.arms/100)*0.7;

leftArm.scale.y=armScale;
rightArm.scale.y=armScale;

// piernas

const legScale=

0.7+(avatarData.legs/100)*0.8;

leftLeg.scale.y=legScale;
rightLeg.scale.y=legScale;

// cintura

const waistScale=

1.3-(avatarData.waist/100)*0.45;

torso.scale.z=waistScale;

// caderas

const hipScale=

0.8+(avatarData.hips/100)*0.5;

leftLeg.position.x=-0.18*hipScale;
rightLeg.position.x=0.18*hipScale;

// pecho

if(avatarData.gender=="female"){

const chestScale=

1+(avatarData.chest/30)*0.25;

torso.scale.z*=chestScale;

}

}

// ============================================
// CAMBIAR GÉNERO
// ============================================

document.querySelectorAll(".gender")

.forEach(button=>{

button.addEventListener("click",()=>{

document.querySelectorAll(".gender")

.forEach(x=>x.classList.remove("active"));

button.classList.add("active");

if(button.innerText.includes("Hombre"))
avatarData.gender="male";

if(button.innerText.includes("Mujer"))
avatarData.gender="female";

if(button.innerText.includes("Neutro"))
avatarData.gender="neutral";

updateGender();

});

});

// ============================================
// CUERPO MASCULINO / FEMENINO
// ============================================

function updateGender(){

if(avatarData.gender=="male"){

torso.scale.set(

1,

1,

1

);

head.scale.set(

1,

1,

1

);

}

if(avatarData.gender=="female"){

torso.scale.set(

0.88,

1,

0.95

);

head.scale.set(

0.92,

0.92,

0.92

);

}

if(avatarData.gender=="neutral"){

torso.scale.set(

0.94,

1,

0.98

);

head.scale.set(

0.96,

0.96,

0.96

);

}

applyBody();

}

// ============================================
// COLORES DE PIEL
// ============================================

document.querySelectorAll(".color")

.forEach(color=>{

color.addEventListener("click",()=>{

document.querySelectorAll(".color")

.forEach(c=>c.classList.remove("active"));

color.classList.add("active");

avatarData.skin=

color.style.background;

skinMaterial.color.set(

avatarData.skin

);

});

});
