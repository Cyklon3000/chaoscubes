import '/htmlLib/ThreeJS/LandingPage/cubeWave.css'
import * as THREE from 'three'

const scene = new THREE.Scene()

// Setup camera
const camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#cubes'),
});

renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
camera.position.z = 30;

// Create cube mesh
const geometry = new THREE.BoxGeometry(100, 100, 100, 1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xFF6347, wireframe: true });
const cube = new THREE.Mesh(geometry, material);

scene.add(cube)
cube.position.z += -100


var clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    var deltaTime = clock.getDelta();

    // Rotate mesh, given in rotations per second 
    cube.rotation.x += 0.30 * (2 * Math.PI) * deltaTime;
    cube.rotation.y += 0.15 * (2 * Math.PI) * deltaTime;

    // Update screen
    renderer.render(scene, camera);
}

animate()