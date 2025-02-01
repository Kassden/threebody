'use client';

import { useCallback, useRef } from 'react';
import * as THREE from 'three';
import BaseScene from './BaseScene';

interface SceneProps {
  containerId: string;
}

interface SceneRefs {
  textures: {
    building: THREE.Texture;
    ground: THREE.Texture;
    solar: THREE.Texture;
    battery: THREE.Texture;
    windows: THREE.Texture;
  };
  hotelGroup: THREE.Group;
  rooftopGroup: THREE.Group;
}

export default function HotelScene({ containerId }: SceneProps) {
  const sceneRefsRef = useRef<SceneRefs>();

  const loadTextures = useCallback(async () => {
    const loader = new THREE.TextureLoader();
    const loadTexture = (url: string) => loader.load(`/textures/${url}`);

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

    return textures;
  }, []);

  const createGround = useCallback((scene: THREE.Scene, textures: SceneRefs['textures']) => {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({ 
        map: textures.ground,
        roughness: 0.8,
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
  }, []);

  const createPorteCochere = useCallback((textures: SceneRefs['textures']) => {
    const porteCochere = new THREE.Group();
    
    // Main canopy
    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(12, 0.3, 8),
      new THREE.MeshStandardMaterial({
        map: textures.battery,
        metalness: 0.7,
        roughness: 0.2,
      })
    );
    canopy.position.set(0, 6, 11);
    canopy.castShadow = true;
    porteCochere.add(canopy);

    // Support columns
    [-5, 5].forEach(x => {
      const column = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 6, 8),
        new THREE.MeshStandardMaterial({
          map: textures.battery,
          metalness: 0.7,
          roughness: 0.2,
        })
      );
      column.position.set(x, 3, 14);
      column.castShadow = true;
      porteCochere.add(column);
    });

    return porteCochere;
  }, []);

  const createDecorativeElements = useCallback((textures: SceneRefs['textures']) => {
    const decorativeGroup = new THREE.Group();

    // Cornices between floors
    const crownMaterial = new THREE.MeshStandardMaterial({
      map: textures.battery,
      metalness: 0.8,
      roughness: 0.2,
    });

    for (let y = 1; y < 12; y++) {
      const cornice = new THREE.Mesh(
        new THREE.BoxGeometry(20.4, 0.3, 15.4),
        crownMaterial
      );
      cornice.position.y = y * 3 + 3.5;
      cornice.castShadow = true;
      decorativeGroup.add(cornice);
    }

    // Corner pillars
    const cornerPositions = [
      [-10, 7.5], [-10, -7.5], [10, 7.5], [10, -7.5]
    ];
    
    cornerPositions.forEach(([x, z]) => {
      const cornerPillar = new THREE.Mesh(
        new THREE.BoxGeometry(1, 40, 1),
        new THREE.MeshStandardMaterial({ 
          map: textures.building,
          roughness: 0.3,
          metalness: 0.2,
        })
      );
      cornerPillar.position.set(x, 20, z);
      cornerPillar.castShadow = true;
      decorativeGroup.add(cornerPillar);
    });

    // Hotel Sign
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

    const glow = new THREE.Mesh(
      new THREE.BoxGeometry(11.8, 1.8, 0.1),
      new THREE.MeshBasicMaterial({ 
        color: 0x00ffff,
        transparent: true,
        opacity: 0.8,
      })
    );
    glow.position.z = 0.2;
    signGroup.add(glow);

    signGroup.position.set(0, 35, 7.6);
    decorativeGroup.add(signGroup);

    return decorativeGroup;
  }, []);

  const createHotel = useCallback((textures: SceneRefs['textures']) => {
    const hotelGroup = new THREE.Group();

    // Main Building
    const mainBuilding = new THREE.Mesh(
      new THREE.BoxGeometry(20, 40, 15),
      new THREE.MeshStandardMaterial({ 
        map: textures.building,
        roughness: 0.3,
        metalness: 0.2,
        normalMap: textures.building,
      })
    );
    mainBuilding.position.y = 20;
    mainBuilding.castShadow = true;
    mainBuilding.receiveShadow = true;
    hotelGroup.add(mainBuilding);

    // Add porte-cochère
    const porteCochere = createPorteCochere(textures);
    hotelGroup.add(porteCochere);

    // Add decorative elements
    const decorativeElements = createDecorativeElements(textures);
    hotelGroup.add(decorativeElements);

    return hotelGroup;
  }, [createPorteCochere, createDecorativeElements]);

  const handleInit = useCallback(async (scene: THREE.Scene) => {
    try {
      // Load textures first
      const textures = await loadTextures();
      
      // Create ground
      createGround(scene, textures);

      // Create hotel
      const hotelGroup = createHotel(textures);
      scene.add(hotelGroup);

      // Add sun and lighting
      const sun = new THREE.Mesh(
        new THREE.SphereGeometry(5, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xffdd00 })
      );
      sun.position.set(50, 100, 50);
      scene.add(sun);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);
      
      const sunLight = new THREE.DirectionalLight(0xffffff, 1);
      sunLight.position.copy(sun.position);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      scene.add(sunLight);

      // Store refs for animation
      sceneRefsRef.current = {
        textures,
        hotelGroup,
        rooftopGroup: new THREE.Group(),
      };

      console.log('Scene initialized successfully');
    } catch (error) {
      console.error('Error initializing scene:', error);
    }
  }, [createGround, createHotel, loadTextures]);

  return (
    <BaseScene
      containerId={containerId}
      onInit={handleInit}
      cameraPosition={new THREE.Vector3(50, 30, 50)}
      backgroundColor={0x87CEEB}
    />
  );
} 