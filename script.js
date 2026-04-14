import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Initialize AOS
AOS.init({
  duration: 800,
  once: false,
  mirror: false,
  offset: 50,
  easing: 'ease-out-cubic'
});

// --- Three.js setup ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#0b1120');
scene.fog = new THREE.FogExp2('#0b1120', 0.0035);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(7, 3.5, 11);
camera.lookAt(0, 1.2, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
container.appendChild(renderer.domElement);

// Controls with auto-rotate
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.04;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.0;
controls.enableZoom = true;
controls.enablePan = false;
controls.maxPolarAngle = Math.PI / 2.1;
controls.minDistance = 5;
controls.maxDistance = 18;
controls.target.set(0, 1.5, 0);

// --- Lighting (soft and warm) ---
const ambient = new THREE.AmbientLight(0x404c70, 0.45);
scene.add(ambient);

const mainLight = new THREE.DirectionalLight(0xfff5e6, 1.3);
mainLight.position.set(5, 10, 7);
mainLight.castShadow = true;
mainLight.receiveShadow = true;
mainLight.shadow.mapSize.width = 1024;
mainLight.shadow.mapSize.height = 1024;
const d = 12;
mainLight.shadow.camera.left = -d;
mainLight.shadow.camera.right = d;
mainLight.shadow.camera.top = d;
mainLight.shadow.camera.bottom = -d;
mainLight.shadow.camera.near = 1;
mainLight.shadow.camera.far = 25;
mainLight.shadow.bias = -0.0008;
scene.add(mainLight);

const fillLight1 = new THREE.PointLight(0x6688ff, 0.9);
fillLight1.position.set(-4, 3, 5);
scene.add(fillLight1);

const fillLight2 = new THREE.PointLight(0xffaa88, 0.6);
fillLight2.position.set(3, 2, -6);
scene.add(fillLight2);

const backLight = new THREE.PointLight(0xaa9cff, 0.5);
backLight.position.set(-2, 2.5, -8);
scene.add(backLight);

// --- Starfield ---
const starsGeo = new THREE.BufferGeometry();
const starsCount = 2400;
const positions = new Float32Array(starsCount * 3);
for (let i = 0; i < starsCount * 3; i += 3) {
  const r = 40 + Math.random() * 50;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos((Math.random() * 2) - 1);
  positions[i] = Math.sin(phi) * Math.cos(theta) * r;
  positions[i + 1] = Math.sin(phi) * Math.sin(theta) * r;
  positions[i + 2] = Math.cos(phi) * r;
}
starsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const starsMat = new THREE.PointsMaterial({ color: 0xe0eaff, size: 0.09, transparent: true });
const stars = new THREE.Points(starsGeo, starsMat);
scene.add(stars);

// --- Main 3D Centerpiece ---
const centerGroup = new THREE.Group();

// Core glowing knot
const knotGeo = new THREE.TorusKnotGeometry(1.5, 0.42, 140, 20);
const knotMat = new THREE.MeshStandardMaterial({
  color: 0x6d8cff,
  emissive: new THREE.Color(0x1a2e6b),
  roughness: 0.25,
  metalness: 0.45,
  transparent: true,
  opacity: 0.95
});
const knot = new THREE.Mesh(knotGeo, knotMat);
knot.castShadow = true;
knot.receiveShadow = true;
knot.position.y = 1.9;
centerGroup.add(knot);

// Wireframe overlay
const wireKnot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1.53, 0.44, 140, 20),
  new THREE.MeshBasicMaterial({ color: 0xb8ccff, wireframe: true, transparent: true, opacity: 0.2 })
);
wireKnot.position.y = 1.9;
centerGroup.add(wireKnot);

// Floating rings
const ring1 = new THREE.Mesh(
  new THREE.TorusGeometry(2.2, 0.04, 24, 200),
  new THREE.MeshStandardMaterial({ color: 0xffb08c, emissive: new THREE.Color(0x442211), roughness: 0.4 })
);
ring1.position.y = 1.9;
ring1.rotation.x = Math.PI / 2;
ring1.rotation.z = 0.5;
ring1.receiveShadow = true;
centerGroup.add(ring1);

const ring2 = new THREE.Mesh(
  new THREE.TorusGeometry(2.7, 0.03, 20, 200),
  new THREE.MeshStandardMaterial({ color: 0xaaccff, emissive: new THREE.Color(0x112244), roughness: 0.5, transparent: true, opacity: 0.7 })
);
ring2.position.y = 2.0;
ring2.rotation.x = 1.2;
ring2.rotation.y = 0.8;
ring2.receiveShadow = true;
centerGroup.add(ring2);

// Floating orbs around
const smallGeo = new THREE.IcosahedronGeometry(0.22, 0);
const smallMat = new THREE.MeshStandardMaterial({ color: 0xffaa88, emissive: new THREE.Color(0x331100), roughness: 0.3 });
for (let i = 0; i < 6; i++) {
  const orb = new THREE.Mesh(smallGeo, smallMat.clone());
  const angle = (i / 6) * Math.PI * 2;
  orb.position.set(Math.cos(angle) * 3.0, 1.2 + Math.sin(i) * 0.5, Math.sin(angle) * 3.0);
  orb.castShadow = true;
  centerGroup.add(orb);
}

const sphereMat = new THREE.MeshStandardMaterial({ color: 0x8a9cff, emissive: new THREE.Color(0x112244), roughness: 0.25 });
const sphere1 = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), sphereMat);
sphere1.position.set(1.8, 2.8, 1.5);
sphere1.castShadow = true;
centerGroup.add(sphere1);

const sphere2 = sphere1.clone();
sphere2.material = sphereMat.clone();
sphere2.material.color.setHex(0xffaa7a);
sphere2.position.set(-2.0, 1.0, -1.8);
centerGroup.add(sphere2);

scene.add(centerGroup);

// Ground reflection plane
const planeGeo = new THREE.CircleGeometry(8, 32);
const planeMat = new THREE.MeshStandardMaterial({ color: 0x0e1a2b, transparent: true, opacity: 0.25, side: THREE.DoubleSide, roughness: 0.8, metalness: 0.1 });
const plane = new THREE.Mesh(planeGeo, planeMat);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -0.01;
plane.receiveShadow = true;
scene.add(plane);

// Floating particles
const particleGeo = new THREE.BufferGeometry();
const particleCount = 400;
const particlePos = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount * 3; i += 3) {
  const r = 2.5 + Math.random() * 3.5;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.random() * Math.PI * 2;
  particlePos[i] = Math.sin(theta) * Math.cos(phi) * r;
  particlePos[i + 1] = Math.sin(theta) * Math.sin(phi) * r + 1.8;
  particlePos[i + 2] = Math.cos(theta) * r;
}
particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
const particleMat = new THREE.PointsMaterial({ color: 0xb8c8ff, size: 0.03, transparent: true, blending: THREE.AdditiveBlending });
const particles = new THREE.Points(particleGeo, particleMat);
centerGroup.add(particles);

// Small floating cubes for extra detail
const cubeGeo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
const cubeMat = new THREE.MeshStandardMaterial({ color: 0xffccaa, emissive: 0x331100 });
for (let i = 0; i < 30; i++) {
  const cube = new THREE.Mesh(cubeGeo, cubeMat.clone());
  const radius = 2.8 + Math.random() * 1.5;
  const angle = Math.random() * Math.PI * 2;
  const height = 0.5 + Math.random() * 2.5;
  cube.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
  cube.castShadow = true;
  centerGroup.add(cube);
}

// --- Animation Loop ---
let lastAutoRotateReset = 0;
let autoRotateTimeout;

function animate() {
  requestAnimationFrame(animate);
  
  controls.update();
  
  // Subtle floating motion
  const time = Date.now() * 0.001;
  centerGroup.rotation.y = Math.sin(time * 0.1) * 0.1;
  centerGroup.position.y = Math.sin(time * 0.5) * 0.05;
  
  // Rotate stars slowly
  stars.rotation.y += 0.0002;
  stars.rotation.x += 0.0001;
  
  // Animate particles rotation
  particles.rotation.y += 0.005;
  particles.rotation.x = Math.sin(time * 0.3) * 0.1;
  
  renderer.render(scene, camera);
}

animate();

// --- Resize Handler ---
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- Auto-rotate behavior: stop on user interaction, resume after idle ---
function disableAutoRotateTemporarily() {
  controls.autoRotate = false;
  
  if (autoRotateTimeout) {
    clearTimeout(autoRotateTimeout);
  }
  
  autoRotateTimeout = setTimeout(() => {
    controls.autoRotate = true;
  }, 3000);
}

renderer.domElement.addEventListener('mousedown', disableAutoRotateTemporarily);
renderer.domElement.addEventListener('touchstart', disableAutoRotateTemporarily);

// Optional: also stop on mouse wheel
renderer.domElement.addEventListener('wheel', () => {
  if (controls.autoRotate) {
    disableAutoRotateTemporarily();
  }
});

console.log('✨ David Ajide · 3D portfolio with AOS — ready');