'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface SimulationParams {
  numBodies: number;
  gravitationalConstant: number;
  timeStep: number;
  trailLength: number;
  maxInitialVelocity: number;
  maxMass: number;
}

export default function Home() {
  const [params, setParams] = useState<SimulationParams>({
    numBodies: 50,
    gravitationalConstant: 10,
    timeStep: 0.01,
    trailLength: 1000000,
    maxInitialVelocity: 0.5,
    maxMass: 2
  });

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number>();

  const resetSimulation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (rendererRef.current) {
      const domElement = rendererRef.current.domElement;
      domElement.parentElement?.removeChild(domElement);
      rendererRef.current.dispose();
    }
    init();
  };

  const init = () => {
    // Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera Setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(30, 20, 30);
    camera.lookAt(0, 0, 0);

    // Renderer Setup
    rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(rendererRef.current.domElement);

    // Controls
    const controls = new OrbitControls(camera, rendererRef.current.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Optimize vector calculations by pre-allocating vectors
    const tempVector = new THREE.Vector3();
    const tempForce = new THREE.Vector3();
    const tempAcceleration = new THREE.Vector3();
    const tempVelocity = new THREE.Vector3();

    // Use TypedArrays for better performance
    const positions = new Float32Array(params.numBodies * 3);
    const velocities = new Float32Array(params.numBodies * 3);
    const masses = new Float32Array(params.numBodies);

    // Create Bodies with optimized data structure
    const createRandomBody = (index: number) => {
      const radius = 0.2 + Math.random() * 1.5;
      const mass = radius * (0.5 + Math.random() * 1.5);
      const angle = (index / params.numBodies) * Math.PI * 2;
      const distance = 5 + Math.random() * 10;
      
      const i = index * 3;
      positions[i] = Math.cos(angle) * distance;
      positions[i + 1] = (Math.random() - 0.5) * 10;
      positions[i + 2] = Math.sin(angle) * distance;

      velocities[i] = (Math.random() - 0.5) * params.maxInitialVelocity;
      velocities[i + 1] = (Math.random() - 0.5) * params.maxInitialVelocity;
      velocities[i + 2] = (Math.random() - 0.5) * params.maxInitialVelocity;

      masses[index] = mass;

      const color = new THREE.Color().setHSL(Math.random(), 0.7, 0.5);
      return {
        mesh: new THREE.Mesh(
          new THREE.SphereGeometry(radius, 16, 16), // Reduced geometry complexity
          new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.8
          })
        ),
        trail: [] as THREE.Vector3[]
      };
    };

    const bodies = Array.from({ length: params.numBodies }, (_, i) => createRandomBody(i));

    // Special bodies setup
    [
      { color: 0xff0000, pos: [0, 0, 5], vel: [1.0, 0, 0], mass: 2 },
      { color: 0x00ff00, pos: [-5, 0, -2.5], vel: [0.5, 0, -0.866], mass: 2 },
      { color: 0x0000ff, pos: [5, 0, -2.5], vel: [-0.5, 0, 0.866], mass: 2 }
    ].forEach((spec, i) => {
      const idx = i * 3;
      positions[idx] = spec.pos[0];
      positions[idx + 1] = spec.pos[1];
      positions[idx + 2] = spec.pos[2];
      velocities[idx] = spec.vel[0];
      velocities[idx + 1] = spec.vel[1];
      velocities[idx + 2] = spec.vel[2];
      masses[i] = spec.mass;

      bodies[i] = {
        mesh: new THREE.Mesh(
          new THREE.SphereGeometry(1.5, 32, 32),
          new THREE.MeshBasicMaterial({ color: spec.color, transparent: true, opacity: 0.8 })
        ),
        trail: [] as THREE.Vector3[]
      };
    });

    // Initialize meshes
    bodies.forEach((body, i) => {
      const idx = i * 3;
      body.mesh.position.set(positions[idx], positions[idx + 1], positions[idx + 2]);
      scene.add(body.mesh);
    });

    // Optimize trails
    const trailGeometries = bodies.map(() => new THREE.BufferGeometry());
    const trails = trailGeometries.map((geometry, i) => {
      const color = i < 3 ? bodies[i].mesh.material.color : new THREE.Color().setHSL(Math.random(), 0.7, 0.5);
      return new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({ color, opacity: 1, transparent: true })
      );
    });
    trails.forEach(trail => scene.add(trail));

    // Optimized animation loop
    function animate() {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      // Update positions and velocities using TypedArrays
      for (let i = 0; i < params.numBodies; i++) {
        const i3 = i * 3;
        tempForce.set(0, 0, 0);
        
        for (let j = 0; j < params.numBodies; j++) {
          if (i !== j) {
            const j3 = j * 3;
            tempVector.set(
              positions[j3] - positions[i3],
              positions[j3 + 1] - positions[i3 + 1],
              positions[j3 + 2] - positions[i3 + 2]
            );
            
            const distance = tempVector.length();
            const forceMagnitude = params.gravitationalConstant * masses[i] * masses[j] / (distance * distance);
            tempVector.normalize().multiplyScalar(forceMagnitude);
            tempForce.add(tempVector);
          }
        }

        // Update velocity and position
        tempAcceleration.copy(tempForce).multiplyScalar(1 / masses[i]);
        tempVelocity.set(velocities[i3], velocities[i3 + 1], velocities[i3 + 2]);
        tempVelocity.add(tempAcceleration.multiplyScalar(params.timeStep));
        
        velocities[i3] = tempVelocity.x;
        velocities[i3 + 1] = tempVelocity.y;
        velocities[i3 + 2] = tempVelocity.z;
        
        positions[i3] += velocities[i3] * params.timeStep;
        positions[i3 + 1] += velocities[i3 + 1] * params.timeStep;
        positions[i3 + 2] += velocities[i3 + 2] * params.timeStep;

        // Update mesh position
        bodies[i].mesh.position.set(positions[i3], positions[i3 + 1], positions[i3 + 2]);

        // Update trail with less frequency for better performance
        if (animationFrameRef.current % 2 === 0) {
          bodies[i].trail.push(new THREE.Vector3(positions[i3], positions[i3 + 1], positions[i3 + 2]));
          if (bodies[i].trail.length > params.trailLength) {
            bodies[i].trail.shift();
          }
          trailGeometries[i].setFromPoints(bodies[i].trail);
        }
      }

      controls.update();
      rendererRef.current?.render(scene, camera);
    }

    animate();

    // Handle Resizing
    const handleResize = () => {
      if (!rendererRef.current) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  };

  useEffect(() => {
    init();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current) {
        const domElement = rendererRef.current.domElement;
        domElement.parentElement?.removeChild(domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  return (
    <main className="w-screen h-screen">
      <div className="absolute top-0 right-0 z-10 p-4 bg-black/50 text-white rounded-bl-lg">
        <h3 className="font-bold mb-2">Simulation Parameters</h3>
        <div className="space-y-2">
          <div>
            <label className="block text-sm">Number of Bodies</label>
            <input
              type="range"
              min="3"
              max="1000"
              value={params.numBodies}
              onChange={(e) => setParams(prev => ({
                ...prev,
                numBodies: parseInt(e.target.value)
              }))}
              className="w-full"
            />
            <span className="text-sm">{params.numBodies}</span>
          </div>

          <div>
            <label className="block text-sm">Gravitational Constant</label>
            <input
              type="range"
              min="1"
              max="20"
              step="0.1"
              value={params.gravitationalConstant}
              onChange={(e) => setParams(prev => ({
                ...prev,
                gravitationalConstant: parseFloat(e.target.value)
              }))}
              className="w-full"
            />
            <span className="text-sm">{params.gravitationalConstant}</span>
          </div>

          <div>
            <label className="block text-sm">Time Step</label>
            <input
              type="range"
              min="0.001"
              max="0.1"
              step="0.001"
              value={params.timeStep}
              onChange={(e) => setParams(prev => ({
                ...prev,
                timeStep: parseFloat(e.target.value)
              }))}
              className="w-full"
            />
            <span className="text-sm">{params.timeStep}</span>
          </div>

          <div>
            <label className="block text-sm">Trail Length</label>
            <input
              type="range"
              min="0"
              max="1000000"
              step="100"
              value={params.trailLength}
              onChange={(e) => setParams(prev => ({
                ...prev,
                trailLength: parseInt(e.target.value)
              }))}
              className="w-full"
            />
            <span className="text-sm">{params.trailLength}</span>
          </div>

          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
            onClick={resetSimulation}
          >
            Reset Simulation
          </button>
        </div>
      </div>
    </main>
  );
}