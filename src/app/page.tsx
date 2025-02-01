'use client';

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    const initThreeJS = async () => {
      const THREE = await import('three');
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls');

      // Scene Setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x87CEEB); // Sky blue background
      
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      document.body.appendChild(renderer.domElement);

      // Orbit Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;

      // Improved Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);
      
      const sunLight = new THREE.DirectionalLight(0xffffff, 1);
      sunLight.position.set(50, 100, 50);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      scene.add(sunLight);

      // Ground
      const groundGeometry = new THREE.PlaneGeometry(50, 50);
      const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x90EE90,
        roughness: 0.8,
      });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      // Building
      const buildingGeometry = new THREE.BoxGeometry(8, 12, 8);
      const buildingMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xE8E8E8,
        roughness: 0.3,
        metalness: 0.2,
      });
      const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
      building.position.y = 6;
      building.castShadow = true;
      building.receiveShadow = true;
      scene.add(building);

      // Windows
      const windowGeometry = new THREE.PlaneGeometry(1, 1.5);
      const windowMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x87CEEB,
        metalness: 1,
        roughness: 0,
      });
      
      // Add windows to each side
      for (let i = 0; i < 4; i++) {
        for (let y = 0; y < 3; y++) {
          const window = new THREE.Mesh(windowGeometry, windowMaterial);
          window.position.y = y * 3 + 3;
          if (i === 0) window.position.z = 4.01;
          if (i === 1) {
            window.position.x = 4.01;
            window.rotation.y = Math.PI / 2;
          }
          if (i === 2) window.position.z = -4.01;
          if (i === 3) {
            window.position.x = -4.01;
            window.rotation.y = Math.PI / 2;
          }
          scene.add(window);
        }
      }

      // Solar Panel Array
      const createSolarPanel = (x: number, z: number) => {
        const frame = new THREE.BoxGeometry(2.5, 0.1, 1.5);
        const frameMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x666666,
          metalness: 0.8,
        });
        const panel = new THREE.Mesh(frame, frameMaterial);
        
        const glass = new THREE.BoxGeometry(2.3, 0.05, 1.3);
        const glassMaterial = new THREE.MeshStandardMaterial({
          color: 0x000033,
          metalness: 0.9,
          roughness: 0.1,
        });
        const solarGlass = new THREE.Mesh(glass, glassMaterial);
        solarGlass.position.y = 0.05;
        panel.add(solarGlass);
        
        panel.position.set(x, 6.1, z);
        panel.rotation.x = -Math.PI / 4;
        panel.castShadow = true;
        return panel;
      };

      // Create solar panel array
      const panels = [
        createSolarPanel(-2.5, 2),
        createSolarPanel(0, 2),
        createSolarPanel(2.5, 2),
        createSolarPanel(-2.5, 0),
        createSolarPanel(0, 0),
        createSolarPanel(2.5, 0),
      ];
      panels.forEach(panel => scene.add(panel));

      // Energy Flow Animation
      const energyMaterial = new THREE.LineBasicMaterial({ 
        color: 0xFFFF00,
        linewidth: 2,
      });
      
      const createEnergyLine = () => {
        const points = [
          new THREE.Vector3(0, 6.2, 1),
          new THREE.Vector3(0, 5, 4),
          new THREE.Vector3(6, 2, 4),
        ];
        return new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(points),
          energyMaterial
        );
      };
      
      const energyFlow = createEnergyLine();
      scene.add(energyFlow);

      // Camera Position
      camera.position.set(20, 15, 20);
      camera.lookAt(0, 5, 0);

      // Animation Loop
      function animate() {
        requestAnimationFrame(animate);
        controls.update();
        energyFlow.material.color.offsetHSL(0.01, 0, 0);
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