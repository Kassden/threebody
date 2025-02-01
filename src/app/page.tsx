'use client';

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    const initThreeJS = async () => {
      const THREE = await import('three');
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls');
      const { TextureLoader } = THREE;
      const loader = new TextureLoader();

      // Scene Setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x87CEEB);
      
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      document.body.appendChild(renderer.domElement);

      // Orbit Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;

      // Sun
      const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
      const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffdd00 });
      const sun = new THREE.Mesh(sunGeometry, sunMaterial);
      sun.position.set(50, 100, 50);
      scene.add(sun);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);
      
      const sunLight = new THREE.DirectionalLight(0xffffff, 1);
      sunLight.position.copy(sun.position);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      scene.add(sunLight);

      // Load Textures
      const loadTexture = (url: string) => {
        return loader.load(`/textures/${url}`);
      };

      const textures = {
        building: loadTexture('building_facade.jpg'),
        ground: loadTexture('grass.jpg'),
        solar: loadTexture('solar_panel.jpg'),
        battery: loadTexture('metal.jpg'),
        windows: loadTexture('glass.jpg'),
      };

      // Apply texture repetition
      textures.ground.wrapS = textures.ground.wrapT = THREE.RepeatWrapping;
      textures.ground.repeat.set(20, 20);
      textures.building.wrapS = textures.building.wrapT = THREE.RepeatWrapping;
      textures.building.repeat.set(4, 8);

      // Ground with texture
      const groundGeometry = new THREE.PlaneGeometry(100, 100);
      const groundMaterial = new THREE.MeshStandardMaterial({ 
        map: textures.ground,
        roughness: 0.8,
      });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      // Hotel Building with texture
      const buildingGeometry = new THREE.BoxGeometry(20, 40, 15);
      const buildingMaterial = new THREE.MeshStandardMaterial({ 
        map: textures.building,
        roughness: 0.3,
        metalness: 0.2,
        normalMap: loadTexture('building_normal.jpg'),
      });
      const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
      building.position.y = 20;
      building.castShadow = true;
      building.receiveShadow = true;
      scene.add(building);

      // Windows with realistic glass texture
      const windowGeometry = new THREE.PlaneGeometry(2, 1.5);
      const windowMaterial = new THREE.MeshPhysicalMaterial({ 
        map: textures.windows,
        transparent: true,
        opacity: 0.3,
        metalness: 0.9,
        roughness: 0.1,
        envMapIntensity: 1,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
      });
      
      // Add windows to each side
      for (let i = 0; i < 4; i++) {
        for (let y = 0; y < 12; y++) {
          for (let x = 0; x < (i % 2 === 0 ? 4 : 3); x++) {
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.y = y * 3 + 5;
            
            if (i === 0) {
              window.position.z = 7.51;
              window.position.x = (x - 1.5) * 4;
            }
            if (i === 1) {
              window.position.x = 10.01;
              window.position.z = (x - 1) * 4;
              window.rotation.y = Math.PI / 2;
            }
            if (i === 2) {
              window.position.z = -7.51;
              window.position.x = (x - 1.5) * 4;
            }
            if (i === 3) {
              window.position.x = -10.01;
              window.position.z = (x - 1) * 4;
              window.rotation.y = Math.PI / 2;
            }
            scene.add(window);
          }
        }
      }

      // Solar Panels with texture
      const createSolarPanel = (x: number, z: number) => {
        const frame = new THREE.BoxGeometry(3, 0.1, 2);
        const frameMaterial = new THREE.MeshStandardMaterial({ 
          map: textures.battery,
          metalness: 0.8,
        });
        const panel = new THREE.Mesh(frame, frameMaterial);
        
        const glass = new THREE.BoxGeometry(2.8, 0.05, 1.8);
        const glassMaterial = new THREE.MeshPhysicalMaterial({
          map: textures.solar,
          metalness: 0.9,
          roughness: 0.1,
          clearcoat: 1,
        });
        const solarGlass = new THREE.Mesh(glass, glassMaterial);
        solarGlass.position.y = 0.05;
        panel.add(solarGlass);
        
        panel.position.set(x, 40.1, z);
        panel.rotation.x = -Math.PI / 6;
        panel.castShadow = true;
        return panel;
      };

      // Create rooftop solar panel array
      for (let x = -8; x <= 8; x += 4) {
        for (let z = -6; z <= 6; z += 3) {
          scene.add(createSolarPanel(x, z));
        }
      }

      // Battery units with texture
      const createBatteryUnit = (x: number) => {
        const container = new THREE.Group();
        
        // Battery cabinet
        const cabinetGeometry = new THREE.BoxGeometry(3, 4, 2);
        const cabinetMaterial = new THREE.MeshStandardMaterial({
          map: textures.battery,
          metalness: 0.6,
          roughness: 0.2,
        });
        const cabinet = new THREE.Mesh(cabinetGeometry, cabinetMaterial);
        cabinet.castShadow = true;
        container.add(cabinet);

        // Status lights
        const lightGeometry = new THREE.CircleGeometry(0.1, 32);
        const greenLight = new THREE.Mesh(
          lightGeometry,
          new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        );
        greenLight.position.set(0.5, 1, 1.01);
        container.add(greenLight);

        container.position.set(x, 2, 10);
        return container;
      };

      // Add battery units
      [-5, -1, 3, 7].forEach(x => scene.add(createBatteryUnit(x)));

      // Energy Flow Animation
      const createEnergyFlow = () => {
        const material = new THREE.LineBasicMaterial({ 
          color: 0xFFFF00,
          linewidth: 2,
        });
        
        const points = [
          new THREE.Vector3(0, 40, 0),    // Roof
          new THREE.Vector3(0, 30, 8),    // Building side
          new THREE.Vector3(0, 4, 10),    // Battery height
        ];
        
        return new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(points),
          material
        );
      };
      
      const energyFlow = createEnergyFlow();
      scene.add(energyFlow);

      // Camera Position
      camera.position.set(50, 30, 50);
      camera.lookAt(0, 20, 0);

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