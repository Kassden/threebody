import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// Building Model
const buildingGeometry = new THREE.BoxGeometry(4, 4, 4);
const buildingMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
building.position.y = 2;
scene.add(building);

// Solar Panels
const panelGeometry = new THREE.PlaneGeometry(2, 1);
const panelMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const panel1 = new THREE.Mesh(panelGeometry, panelMaterial);
panel1.rotation.x = -Math.PI / 4;
panel1.position.set(-1, 4.1, 1);
scene.add(panel1);

const panel2 = new THREE.Mesh(panelGeometry, panelMaterial);
panel2.rotation.x = -Math.PI / 4;
panel2.position.set(1, 4.1, 1);
scene.add(panel2);

// Power Grid Connection
const gridGeometry = new THREE.CylinderGeometry(0.05, 0.05, 5, 32);
const gridMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const powerLine = new THREE.Mesh(gridGeometry, gridMaterial);
powerLine.position.set(6, 2, 0);
scene.add(powerLine);

// Energy Flow Animation
const energyMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
const energyPoints = [
    new THREE.Vector3(-1, 4.2, 1),
    new THREE.Vector3(0, 3, 0),
    new THREE.Vector3(6, 2, 0),
];
const energyGeometry = new THREE.BufferGeometry().setFromPoints(energyPoints);
const energyFlow = new THREE.Line(energyGeometry, energyMaterial);
scene.add(energyFlow);

// Camera Position
camera.position.set(8, 6, 8);
camera.lookAt(0, 2, 0);

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    energyFlow.material.color.offsetHSL(0.01, 0, 0); // Animate energy color
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Handle Resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});