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

      // Hotel Building Group
      const hotelGroup = new THREE.Group();

      // Main Building Structure
      const mainBuildingGeometry = new THREE.BoxGeometry(20, 40, 15);
      const buildingMaterial = new THREE.MeshStandardMaterial({ 
        map: textures.building,
        roughness: 0.3,
        metalness: 0.2,
        normalMap: loadTexture('building_normal.jpg'),
      });
      const mainBuilding = new THREE.Mesh(mainBuildingGeometry, buildingMaterial);
      mainBuilding.position.y = 20;
      mainBuilding.castShadow = true;
      mainBuilding.receiveShadow = true;
      hotelGroup.add(mainBuilding);

      // Grand Entrance
      const entranceGeometry = new THREE.BoxGeometry(8, 6, 4);
      const entranceMaterial = new THREE.MeshStandardMaterial({
        map: textures.building,
        metalness: 0.5,
        roughness: 0.2,
      });
      const entrance = new THREE.Mesh(entranceGeometry, entranceMaterial);
      entrance.position.set(0, 3, 9.5);
      hotelGroup.add(entrance);

      // Entrance Pillars
      const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.3, 6, 8);
      const pillarMaterial = new THREE.MeshStandardMaterial({
        map: textures.battery, // Using metal texture for pillars
        metalness: 0.7,
        roughness: 0.2,
      });

      [-3, 3].forEach(x => {
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillar.position.set(x, 3, 11);
        hotelGroup.add(pillar);
      });

      // Balconies
      const balconyGeometry = new THREE.BoxGeometry(3, 1, 2);
      const balconyMaterial = new THREE.MeshStandardMaterial({
        map: textures.battery,
        metalness: 0.6,
        roughness: 0.3,
      });

      // Add balconies to front and sides
      for (let y = 0; y < 12; y++) {
        for (let x = 0; x < 4; x++) {
          if (y > 1) { // Start after 2nd floor
            const balcony = new THREE.Mesh(balconyGeometry, balconyMaterial);
            balcony.position.set((x - 1.5) * 4, y * 3 + 5, 8);
            hotelGroup.add(balcony);

            // Balcony railing
            const railingGeometry = new THREE.BoxGeometry(3, 1, 0.1);
            const railing = new THREE.Mesh(railingGeometry, balconyMaterial);
            railing.position.set((x - 1.5) * 4, y * 3 + 6, 9);
            hotelGroup.add(railing);
          }
        }
      }

      // Porte-cochère
      const porteCochere = new THREE.Group();
      
      // Main canopy
      const canopyGeometry = new THREE.BoxGeometry(12, 0.3, 8);
      const canopyMaterial = new THREE.MeshStandardMaterial({
        map: textures.battery,
        metalness: 0.7,
        roughness: 0.2,
      });
      const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
      canopy.position.set(0, 6, 11);
      porteCochere.add(canopy);

      // Support columns
      [-5, 5].forEach(x => {
        const column = new THREE.Mesh(
          new THREE.CylinderGeometry(0.4, 0.4, 6, 8),
          pillarMaterial
        );
        column.position.set(x, 3, 14);
        porteCochere.add(column);
      });

      hotelGroup.add(porteCochere);

      // Define materials that will be reused
      const crownMaterial = new THREE.MeshStandardMaterial({
        map: textures.battery,
        metalness: 0.8,
        roughness: 0.2,
      });

      // Decorative Elements
      
      // Cornices between floors
      for (let y = 1; y < 12; y++) {
        const corniceGeometry = new THREE.BoxGeometry(20.4, 0.3, 15.4);
        const cornice = new THREE.Mesh(corniceGeometry, crownMaterial);
        cornice.position.y = y * 3 + 3.5;
        hotelGroup.add(cornice);
      }

      // Corner pillars
      const cornerPositions = [
        [-10, 7.5], [-10, -7.5], [10, 7.5], [10, -7.5]
      ];
      
      cornerPositions.forEach(([x, z]) => {
        const cornerPillar = new THREE.Mesh(
          new THREE.BoxGeometry(1, 40, 1),
          buildingMaterial
        );
        cornerPillar.position.set(x, 20, z);
        hotelGroup.add(cornerPillar);
      });

      // Hotel Name Sign (front of building)
      const createHotelSign = () => {
        const signGroup = new THREE.Group();
        
        const backplate = new THREE.Mesh(
          new THREE.BoxGeometry(12, 2, 0.2),
          new THREE.MeshStandardMaterial({
            map: textures.battery,
            metalness: 0.8,
            roughness: 0.2,
          })
        );
        signGroup.add(backplate);

        // Add glowing effect for night time
        const glow = new THREE.Mesh(
          new THREE.BoxGeometry(11.8, 1.8, 0.1),
          new THREE.MeshBasicMaterial({ color: 0x00ffff })
        );
        glow.position.z = 0.2;
        signGroup.add(glow);

        signGroup.position.set(0, 35, 7.6);
        return signGroup;
      };

      hotelGroup.add(createHotelSign());

      // Modify the createSolarPanel function
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
        
        // Remove the y position here since we'll set it in createSolarSection
        panel.position.set(x, 0, z);
        panel.rotation.x = -Math.PI / 6;
        panel.castShadow = true;
        return panel;
      };

      // Modify the solar sections configuration for better roof coverage
      const solarSections = [
        { x: -8, z: -5, cols: 3, rows: 3 },  // Back left
        { x: -8, z: 1, cols: 3, rows: 3 },   // Front left
        { x: 2, z: -5, cols: 3, rows: 3 },   // Back right
        { x: 2, z: 1, cols: 3, rows: 3 },    // Front right
      ];

      // Modify createSolarSection to position panels at correct roof height
      const createSolarSection = (startX: number, startZ: number, columns: number, rows: number) => {
        const section = new THREE.Group();
        for (let x = 0; x < columns; x++) {
          for (let z = 0; z < rows; z++) {
            const panel = createSolarPanel(
              startX + x * 3.2,
              startZ + z * 2.2
            );
            // Adjust height to match hotel roof (40 is building height)
            panel.position.y = 40.5; // Just above the roof terrace
            section.add(panel);
          }
        }
        return section;
      };

      // Rooftop Redesign
      const rooftopGroup = new THREE.Group();

      // Rooftop terrace
      const terraceGeometry = new THREE.BoxGeometry(22, 0.5, 17);
      const terrace = new THREE.Mesh(terraceGeometry, buildingMaterial);
      terrace.position.y = 40.25;
      rooftopGroup.add(terrace);

      // Technical room (center)
      const techRoomGeometry = new THREE.BoxGeometry(8, 4, 6);
      const techRoom = new THREE.Mesh(techRoomGeometry, buildingMaterial);
      techRoom.position.y = 42.5;
      rooftopGroup.add(techRoom);

      // After creating all sections, add them to rooftopGroup
      solarSections.forEach(section => {
        const solarSection = createSolarSection(
          section.x,
          section.z,
          section.cols,
          section.rows
        );
        rooftopGroup.add(solarSection);
      });

      // Add decorative parapet around roof edge
      const parapetGeometry = new THREE.BoxGeometry(24, 1.5, 19);
      const parapet = new THREE.Mesh(parapetGeometry, buildingMaterial);
      parapet.position.y = 41;
      rooftopGroup.add(parapet);

      // Add rooftop group to hotel
      hotelGroup.add(rooftopGroup);

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

      // Add the entire hotel group to the scene
      scene.add(hotelGroup);

      return () => {
        document.body.removeChild(renderer.domElement);
      };
    };

    initThreeJS();
  }, []);

  return null;
}