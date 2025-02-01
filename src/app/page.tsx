'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function Home() {
  const [activeScene, setActiveScene] = useState<'hotel' | 'threebody'>('hotel');
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number>();
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const controlsRef = useRef<OrbitControls>();

  // Add this function to handle scene switching
  const switchScene = (sceneName: 'hotel' | 'threebody') => {
    setActiveScene(sceneName);
    
    // Clean up existing scene
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (rendererRef.current) {
      const domElement = rendererRef.current.domElement;
      domElement.parentElement?.removeChild(domElement);
      rendererRef.current.dispose();
    }
    
    // Initialize new scene
    init(sceneName);
  };

  // Modify init to accept scene type
  const init = async (sceneType: 'hotel' | 'threebody') => {
    // Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(sceneType === 'hotel' ? 0x87CEEB : 0x000000);
    sceneRef.current = scene;

    // Camera Setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(
      sceneType === 'hotel' ? 70 : 30,
      sceneType === 'hotel' ? 40 : 20,
      sceneType === 'hotel' ? 70 : 30
    );
    camera.lookAt(0, sceneType === 'hotel' ? 20 : 0, 0);
    cameraRef.current = camera;

    // Renderer Setup
    rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current.shadowMap.enabled = true;
    document.body.appendChild(rendererRef.current.domElement);

    // Controls
    controlsRef.current = new OrbitControls(camera, rendererRef.current.domElement);
    controlsRef.current.enableDamping = true;
    controlsRef.current.dampingFactor = 0.05;

    if (sceneType === 'hotel') {
      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);
      
      const sun = new THREE.Mesh(
        new THREE.SphereGeometry(5, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xffdd00 })
      );
      sun.position.set(50, 100, 50);
      scene.add(sun);

      const sunLight = new THREE.DirectionalLight(0xffffff, 1);
      sunLight.position.copy(sun.position);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      scene.add(sunLight);

      // Ground
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.MeshStandardMaterial({ 
          color: 0x90EE90,
          roughness: 0.8,
        })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      // Hotel Building
      const hotelGroup = new THREE.Group();

      // Main Building
      const mainBuilding = new THREE.Mesh(
        new THREE.BoxGeometry(20, 40, 15),
        new THREE.MeshStandardMaterial({ 
          color: 0xE8E8E8,
          roughness: 0.3,
          metalness: 0.2,
        })
      );
      mainBuilding.position.y = 20;
      mainBuilding.castShadow = true;
      mainBuilding.receiveShadow = true;
      hotelGroup.add(mainBuilding);

      // Porte-cochère
      const porteCochere = new THREE.Group();
      const canopy = new THREE.Mesh(
        new THREE.BoxGeometry(12, 0.3, 8),
        new THREE.MeshStandardMaterial({
          color: 0x999999,
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
            color: 0x999999,
            metalness: 0.7,
            roughness: 0.2,
          })
        );
        column.position.set(x, 3, 14);
        column.castShadow = true;
        porteCochere.add(column);
      });
      hotelGroup.add(porteCochere);

      // Cornices between floors
      for (let y = 1; y < 12; y++) {
        const cornice = new THREE.Mesh(
          new THREE.BoxGeometry(20.4, 0.3, 15.4),
          new THREE.MeshStandardMaterial({
            color: 0x999999,
            metalness: 0.8,
            roughness: 0.2,
          })
        );
        cornice.position.y = y * 3 + 3.5;
        cornice.castShadow = true;
        hotelGroup.add(cornice);
      }

      // Corner pillars
      const cornerPositions = [
        [-10, 7.5], [-10, -7.5], [10, 7.5], [10, -7.5]
      ];
      cornerPositions.forEach(([x, z]) => {
        const cornerPillar = new THREE.Mesh(
          new THREE.BoxGeometry(1, 40, 1),
          new THREE.MeshStandardMaterial({ 
            color: 0xE8E8E8,
            roughness: 0.3,
            metalness: 0.2,
          })
        );
        cornerPillar.position.set(x, 20, z);
        cornerPillar.castShadow = true;
        hotelGroup.add(cornerPillar);
      });

      // Hotel Sign
      const signGroup = new THREE.Group();
      const backplate = new THREE.Mesh(
        new THREE.BoxGeometry(12, 2, 0.2),
        new THREE.MeshStandardMaterial({
          color: 0x999999,
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
      hotelGroup.add(signGroup);

      // Rooftop Solar Panels
      const rooftopGroup = new THREE.Group();

      // Technical room
      const techRoom = new THREE.Mesh(
        new THREE.BoxGeometry(8, 4, 6),
        new THREE.MeshStandardMaterial({ 
          color: 0xE8E8E8,
          roughness: 0.3,
          metalness: 0.2,
        })
      );
      techRoom.position.y = 42.5;
      rooftopGroup.add(techRoom);

      // Solar Panel Arrays
      const createSolarPanel = (x: number, z: number) => {
        const panel = new THREE.Group();
        
        // Panel frame
        const frame = new THREE.Mesh(
          new THREE.BoxGeometry(3, 0.1, 2),
          new THREE.MeshStandardMaterial({ 
            color: 0x666666,
            metalness: 0.8,
          })
        );
        panel.add(frame);
        
        // Panel glass
        const glass = new THREE.Mesh(
          new THREE.BoxGeometry(2.8, 0.05, 1.8),
          new THREE.MeshPhysicalMaterial({
            color: 0x000033,
            metalness: 0.9,
            roughness: 0.1,
            clearcoat: 1,
          })
        );
        glass.position.y = 0.05;
        panel.add(glass);
        
        panel.position.set(x, 45, z);
        panel.rotation.x = -Math.PI / 6;
        panel.castShadow = true;
        return panel;
      };

      // Create solar panel sections
      const solarSections = [
        { x: -8, z: -5, cols: 3, rows: 3 },  // Back left
        { x: -8, z: 1, cols: 3, rows: 3 },   // Front left
        { x: 2, z: -5, cols: 3, rows: 3 },   // Back right
        { x: 2, z: 1, cols: 3, rows: 3 },    // Front right
      ];

      solarSections.forEach(section => {
        for (let x = 0; x < section.cols; x++) {
          for (let z = 0; z < section.rows; z++) {
            const panel = createSolarPanel(
              section.x + x * 3.2,
              section.z + z * 2.2
            );
            rooftopGroup.add(panel);
          }
        }
      });

      hotelGroup.add(rooftopGroup);
      scene.add(hotelGroup);

      // Battery Units
      const batteryGroup = new THREE.Group();
      const createBatteryUnit = (x: number) => {
        const unit = new THREE.Group();
        
        // Battery cabinet
        const cabinet = new THREE.Mesh(
          new THREE.BoxGeometry(3, 4, 2),
          new THREE.MeshStandardMaterial({
            color: 0x666666,
            metalness: 0.6,
            roughness: 0.2,
          })
        );
        cabinet.castShadow = true;
        unit.add(cabinet);

        // Status lights
        const light = new THREE.Mesh(
          new THREE.CircleGeometry(0.1, 16),
          new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        );
        light.position.set(0.5, 1, 1.01);
        unit.add(light);

        unit.position.set(x, 2, 10);
        return unit;
      };

      // Add battery units
      [-5, -1, 3, 7].forEach(x => {
        batteryGroup.add(createBatteryUnit(x));
      });
      scene.add(batteryGroup);

      // Power Grid
      const gridGroup = new THREE.Group();

      // Create utility poles
      const createUtilityPole = (x: number, z: number) => {
        const pole = new THREE.Group();

        // Wooden pole
        const wood = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.2, 12, 8),
          new THREE.MeshStandardMaterial({ color: 0x4d3300 })
        );
        wood.position.y = 6;
        pole.add(wood);

        // Cross beam
        const beam = new THREE.Mesh(
          new THREE.BoxGeometry(3, 0.2, 0.2),
          new THREE.MeshStandardMaterial({ color: 0x4d3300 })
        );
        beam.position.y = 11;
        pole.add(beam);

        // Insulators and connection points
        [-1, 0, 1].forEach(offset => {
          const insulator = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.1, 0.3, 8),
            new THREE.MeshStandardMaterial({ color: 0xcccccc })
          );
          insulator.position.set(offset, 11.2, 0);
          pole.add(insulator);
        });

        pole.position.set(x, 0, z);
        return pole;
      };

      // Add utility poles
      [15, 25, 35].forEach(x => {
        gridGroup.add(createUtilityPole(x, 10));
      });

      // Power Lines
      const createPowerLines = () => {
        const points = [];
        for (let i = 0; i <= 20; i++) {
          const t = i / 20;
          points.push(new THREE.Vector3(
            15 + t * 20, // x from 15 to 35
            11 + Math.sin(t * Math.PI) * -0.5, // y with slight downward curve
            10 // constant z
          ));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return new THREE.Line(
          geometry,
          new THREE.LineBasicMaterial({ color: 0x000000 })
        );
      };

      // Add three parallel power lines
      [-0.2, 0, 0.2].forEach(zOffset => {
        const line = createPowerLines();
        line.position.z += zOffset;
        gridGroup.add(line);
      });

      scene.add(gridGroup);

      // Energy Flow Visualization
      const createEnergyFlow = () => {
        // Path from solar panels to batteries
        const solarToBattery = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 45, 0),    // Roof
            new THREE.Vector3(0, 30, 8),    // Mid-point
            new THREE.Vector3(0, 4, 10),    // Batteries
          ]),
          new THREE.LineBasicMaterial({ 
            color: 0xffff00,
            transparent: true,
            opacity: 0.6,
          })
        );

        // Path from batteries to grid
        const batteryToGrid = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 4, 10),     // Batteries
            new THREE.Vector3(8, 4, 10),     // Mid-point
            new THREE.Vector3(15, 11, 10),   // First utility pole
          ]),
          new THREE.LineBasicMaterial({ 
            color: 0xffff00,
            transparent: true,
            opacity: 0.6,
          })
        );

        const energyFlowGroup = new THREE.Group();
        energyFlowGroup.add(solarToBattery);
        energyFlowGroup.add(batteryToGrid);
        return energyFlowGroup;
      };

      const energyFlow = createEnergyFlow();
      scene.add(energyFlow);

      // Animate energy flow
      const energyFlowMaterials = energyFlow.children.map(
        line => (line as THREE.Line).material as THREE.LineBasicMaterial
      );

      // Animation Loop
      function animate() {
        animationFrameRef.current = requestAnimationFrame(animate);
        controlsRef.current?.update();

        // Animate energy flow
        energyFlowMaterials.forEach(material => {
          material.opacity = 0.3 + Math.sin(Date.now() * 0.003) * 0.3;
          material.color.offsetHSL(0.005, 0, 0);
        });

        rendererRef.current?.render(scene, camera);
      }
      animate();
    } else {
      // Three Body System
      const bodies = [
        {
          mesh: new THREE.Mesh(
            new THREE.SphereGeometry(1, 32, 32),
            new THREE.MeshBasicMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.5 })
          ),
          position: new THREE.Vector3(0, 0, 5),
          velocity: new THREE.Vector3(0.5, 0, 0),
          mass: 1,
          trail: [] as THREE.Vector3[]
        },
        {
          mesh: new THREE.Mesh(
            new THREE.SphereGeometry(1, 32, 32),
            new THREE.MeshBasicMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 0.5 })
          ),
          position: new THREE.Vector3(-5, 0, -2.5),
          velocity: new THREE.Vector3(-0.25, 0, -0.433),
          mass: 1,
          trail: [] as THREE.Vector3[]
        },
        {
          mesh: new THREE.Mesh(
            new THREE.SphereGeometry(1, 32, 32),
            new THREE.MeshBasicMaterial({ color: 0x0000ff, emissive: 0x0000ff, emissiveIntensity: 0.5 })
          ),
          position: new THREE.Vector3(5, 0, -2.5),
          velocity: new THREE.Vector3(-0.25, 0, 0.433),
          mass: 1,
          trail: [] as THREE.Vector3[]
        }
      ];

      bodies.forEach(body => {
        body.mesh.position.copy(body.position);
        scene.add(body.mesh);
      });

      // Trails
      const trailMaterials = [
        new THREE.LineBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true }),
        new THREE.LineBasicMaterial({ color: 0x00ff00, opacity: 0.5, transparent: true }),
        new THREE.LineBasicMaterial({ color: 0x0000ff, opacity: 0.5, transparent: true })
      ];

      const trailGeometries = bodies.map(() => new THREE.BufferGeometry());
      const trails = trailGeometries.map((geometry, i) => 
        new THREE.Line(geometry, trailMaterials[i])
      );
      trails.forEach(trail => scene.add(trail));

      // Animation function for three-body
      const G = 1; // Gravitational constant
      const dt = 0.01; // Time step
      const maxTrailLength = 500;

      function animate() {
        animationFrameRef.current = requestAnimationFrame(animate);
        
        // Update positions and velocities
        bodies.forEach((body1, i) => {
          const force = new THREE.Vector3(0, 0, 0);
          
          bodies.forEach((body2, j) => {
            if (i !== j) {
              const r = body2.position.clone().sub(body1.position);
              const distance = r.length();
              force.add(
                r.normalize().multiplyScalar(G * body1.mass * body2.mass / (distance * distance))
              );
            }
          });

          const acceleration = force.multiplyScalar(1 / body1.mass);
          body1.velocity.add(acceleration.multiplyScalar(dt));
          body1.position.add(body1.velocity.clone().multiplyScalar(dt));
          body1.mesh.position.copy(body1.position);

          // Update trail
          body1.trail.push(body1.position.clone());
          if (body1.trail.length > maxTrailLength) {
            body1.trail.shift();
          }
          trailGeometries[i].setFromPoints(body1.trail);
        });

        controlsRef.current?.update();
        rendererRef.current?.render(scene, camera);
      }

      animate();
    }

    // Handle Resizing
    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current) return;
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  };

  useEffect(() => {
    init(activeScene);
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
      <nav className="absolute top-0 left-0 z-10 p-4">
        <button 
          className={`px-4 py-2 mr-2 rounded ${
            activeScene === 'hotel' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => switchScene('hotel')}
        >
          Solar Hotel
        </button>
        <button 
          className={`px-4 py-2 rounded ${
            activeScene === 'threebody' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => switchScene('threebody')}
        >
          Three Body
        </button>
      </nav>
    </main>
  );
}