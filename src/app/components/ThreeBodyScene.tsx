'use client';

import { useEffect } from 'react';

export default function ThreeBodyScene() {
  useEffect(() => {
    const initThreeJS = async () => {
      const THREE = await import('three');
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls');

      // Scene Setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);
      
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);

      // Orbit Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;

      // Three Body System
      const bodies = [
        {
          mesh: new THREE.Mesh(
            new THREE.SphereGeometry(1, 32, 32),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
          ),
          position: new THREE.Vector3(0, 0, 5),
          velocity: new THREE.Vector3(0.5, 0, 0),
          mass: 1
        },
        {
          mesh: new THREE.Mesh(
            new THREE.SphereGeometry(1, 32, 32),
            new THREE.MeshBasicMaterial({ color: 0x00ff00 })
          ),
          position: new THREE.Vector3(-5, 0, -2.5),
          velocity: new THREE.Vector3(-0.25, 0, -0.433),
          mass: 1
        },
        {
          mesh: new THREE.Mesh(
            new THREE.SphereGeometry(1, 32, 32),
            new THREE.MeshBasicMaterial({ color: 0x0000ff })
          ),
          position: new THREE.Vector3(5, 0, -2.5),
          velocity: new THREE.Vector3(-0.25, 0, 0.433),
          mass: 1
        }
      ];

      bodies.forEach(body => {
        body.mesh.position.copy(body.position);
        scene.add(body.mesh);
      });

      // Add trails
      const trails = bodies.map(() => {
        const points = [];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
          color: 0xffffff,
          opacity: 0.5,
          transparent: true
        });
        return {
          points,
          line: new THREE.Line(geometry, material)
        };
      });

      trails.forEach(trail => scene.add(trail.line));

      // Camera Position
      camera.position.set(0, 20, 0);
      camera.lookAt(0, 0, 0);

      const G = 1; // Gravitational constant
      const dt = 0.01; // Time step

      // Calculate gravitational force between two bodies
      const calculateForce = (body1: any, body2: any) => {
        const r = body2.position.clone().sub(body1.position);
        const distance = r.length();
        const force = r.normalize().multiplyScalar(G * body1.mass * body2.mass / (distance * distance));
        return force;
      };

      // Animation Loop
      function animate() {
        requestAnimationFrame(animate);

        // Update positions and velocities
        for (let i = 0; i < bodies.length; i++) {
          const force = new THREE.Vector3(0, 0, 0);
          
          // Calculate total force on body i
          for (let j = 0; j < bodies.length; j++) {
            if (i !== j) {
              force.add(calculateForce(bodies[i], bodies[j]));
            }
          }

          // Update velocity and position
          const acceleration = force.multiplyScalar(1 / bodies[i].mass);
          bodies[i].velocity.add(acceleration.multiplyScalar(dt));
          bodies[i].position.add(bodies[i].velocity.clone().multiplyScalar(dt));
          bodies[i].mesh.position.copy(bodies[i].position);

          // Update trails
          trails[i].points.push(bodies[i].position.clone());
          if (trails[i].points.length > 500) {
            trails[i].points.shift();
          }
          trails[i].line.geometry.setFromPoints(trails[i].points);
        }

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

      return () => {
        document.body.removeChild(renderer.domElement);
      };
    };

    initThreeJS();
  }, []);

  return null;
} 