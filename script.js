import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.162.0/build/three.module.js';

// Debugging: Log script load
console.log("Script loaded!");
console.log("THREE.js version:", THREE.REVISION);

// Scene, Camera, and Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Debugging: Log canvas
console.log("Canvas appended to DOM:", renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5).normalize();
scene.add(directionalLight);

// Create Tree
const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 16);
const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
trunk.position.y = 1.5;
scene.add(trunk);

const foliageGeometry = new THREE.SphereGeometry(1.5, 16, 16);
const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
foliage.position.y = 3.5;
scene.add(foliage);

// Debugging: Log scene objects
console.log("Scene objects:", scene.children);

// Rain System
const rainGeometry = new THREE.BufferGeometry();
const raindropCount = 1000;
const raindropPositions = new Float32Array(raindropCount * 3);

for (let i = 0; i < raindropCount * 3; i += 3) {
    raindropPositions[i] = Math.random() * 20 - 10;
    raindropPositions[i + 1] = Math.random() * 20 + 10;
    raindropPositions[i + 2] = Math.random() * 20 - 10;
}

rainGeometry.setAttribute('position', new THREE.BufferAttribute(raindropPositions, 3));
const rainMaterial = new THREE.PointsMaterial({
    color: 0xAAAAFF,
    size: 0.1,
    transparent: true
});
const rain = new THREE.Points(rainGeometry, rainMaterial);
scene.add(rain);

// Debugging: Log rain system
console.log("Rain system initialized:", rain);

// Growth Parameters
let foliageScale = 1;
const maxScale = 2;
let isGrowing = false;
let isShrinking = false;
let rainStarted = false; // Flag to check if rain has started

// Camera Position
camera.position.set(0, 5, 10);

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    if (rainStarted) {
        // Update Rain
        const positions = rainGeometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] -= 0.5;

            if (positions[i + 1] < -5) {
                positions[i + 1] = Math.random() * 20 + 10;
                positions[i] = Math.random() * 20 - 10;
                positions[i + 2] = Math.random() * 20 - 10;
            }

            const dx = positions[i] - foliage.position.x;
            const dy = positions[i + 1] - foliage.position.y;
            const dz = positions[i + 2] - foliage.position.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            const currentRadius = 1.5 * foliageScale;

            if (distance < currentRadius && !isShrinking) {
                isGrowing = true;
                positions[i + 1] = Math.random() * 20 + 10;
            }
        }
        rainGeometry.attributes.position.needsUpdate = true;

        // Handle Growth and Shrinkage
        if (isGrowing) {
            foliageScale = Math.min(foliageScale + 0.005, maxScale);
            foliage.scale.set(foliageScale, foliageScale, foliageScale);

            if (foliageScale >= maxScale) {
                isGrowing = false;
                isShrinking = true;
            }
        }

        if (isShrinking) {
            foliageScale = Math.max(foliageScale - 0.005, 1);
            foliage.scale.set(foliageScale, foliageScale, foliageScale);

            if (foliageScale <= 1) {
                isShrinking = false;
            }
        }
    }

    renderer.render(scene, camera);
}

animate();

// Handle Window Resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// from here Ground
const groundGeometry = new THREE.PlaneGeometry(20, 20);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x228B22, // Green for grass
    side: THREE.DoubleSide
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Rotate to lay flat
ground.position.y = -0.5; // Slightly below the tree trunk
scene.add(ground);

// Shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

trunk.castShadow = true;
foliage.castShadow = true;
ground.receiveShadow = true;

directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;

//Rain Sound
let rainSound = new Audio('rainsound.mp3');

document.addEventListener('click', () => {
    if (!rainStarted) {
        rainStarted = true;
        // Start rain sound and loop
        rainSound.loop = true;
        rainSound.play().catch(error => {
            console.error('Error playing sound:', error);
        });
    }
});

// Add a Start Button
const startButton = document.createElement('button');
startButton.innerText = 'Start to Rain';
startButton.style.position = 'absolute';
startButton.style.top = '20px';
startButton.style.left = '20px';
startButton.style.fontSize = '16px';
startButton.style.padding = '10px 20px';
startButton.style.backgroundColor = '#00BFFF';
startButton.style.color = '#fff';
startButton.style.border = 'none';
startButton.style.borderRadius = '5px';
startButton.style.cursor = 'pointer';
document.body.appendChild(startButton);

startButton.addEventListener('click', () => {
    if (!rainStarted) {
        rainStarted = true;
        rainSound.loop = true;
        rainSound.play().catch(error => {
            console.error('Error playing sound:', error);
        });
    }
});

