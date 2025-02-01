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

    // Create Bodies
    const createRandomBody = (index: number) => {
      const radius = 0.2 + Math.random() * 1.5;
      const mass = radius * (0.5 + Math.random() * 1.5);
      const angle = (index / params.numBodies) * Math.PI * 2;
      const distance = 5 + Math.random() * 10;
      
      const color = new THREE.Color().setHSL(Math.random(), 0.7, 0.5);

      return {
        mesh: new THREE.Mesh(
          new THREE.SphereGeometry(radius, 32, 32),
          new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.8
          })
        ),
        position: new THREE.Vector3(
          Math.cos(angle) * distance,
          (Math.random() - 0.5) * 10,
          Math.sin(angle) * distance
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * params.maxInitialVelocity,
          (Math.random() - 0.5) * params.maxInitialVelocity,
          (Math.random() - 0.5) * params.maxInitialVelocity
        ),
        mass,
        trail: [] as THREE.Vector3[]
      };
    };

    const bodies = Array.from({ length: params.numBodies }, (_, i) => createRandomBody(i));

    // Add special bodies
    [
      { color: 0xff0000, pos: [0, 0, 5], vel: [1.0, 0, 0] },
      { color: 0x00ff00, pos: [-5, 0, -2.5], vel: [0.5, 0, -0.866] },
      { color: 0x0000ff, pos: [5, 0, -2.5], vel: [-0.5, 0, 0.866] }
    ].forEach((spec, i) => {
      bodies[i] = {
        mesh: new THREE.Mesh(
          new THREE.SphereGeometry(1.5, 32, 32),
          new THREE.MeshBasicMaterial({ color: spec.color, transparent: true, opacity: 0.8 })
        ),
        position: new THREE.Vector3(...spec.pos),
        velocity: new THREE.Vector3(...spec.vel),
        mass: 2,
        trail: [] as THREE.Vector3[]
      };
    });

    bodies.forEach(body => {
      body.mesh.position.copy(body.position);
      scene.add(body.mesh);
    });

    // Trails
    const trailGeometries = bodies.map(() => new THREE.BufferGeometry());
    const trails = trailGeometries.map((geometry, i) => {
      const color = i < 3 ? bodies[i].mesh.material.color : new THREE.Color().setHSL(Math.random(), 0.7, 0.5);
      return new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({ color, opacity: 1, transparent: true, linewidth: 2 })
      );
    });
    trails.forEach(trail => scene.add(trail));

    // Animation Loop
    function animate() {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      bodies.forEach((body1, i) => {
        const force = new THREE.Vector3(0, 0, 0);
        
        bodies.forEach((body2, j) => {
          if (i !== j) {
            const r = body2.position.clone().sub(body1.position);
            const distance = r.length();
            force.add(
              r.normalize().multiplyScalar(params.gravitationalConstant * body1.mass * body2.mass / (distance * distance))
            );
          }
        });

        const acceleration = force.multiplyScalar(1 / body1.mass);
        body1.velocity.add(acceleration.multiplyScalar(params.timeStep));
        body1.position.add(body1.velocity.clone().multiplyScalar(params.timeStep));
        body1.mesh.position.copy(body1.position);

        body1.trail.push(body1.position.clone());
        if (body1.trail.length > params.trailLength) {
          body1.trail.shift();
        }
        trailGeometries[i].setFromPoints(body1.trail);
      });

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
              min="100"
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