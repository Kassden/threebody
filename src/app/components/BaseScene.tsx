'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface BaseSceneProps {
  containerId: string;
  onInit?: (scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) => Promise<void> | void;
  onAnimate?: () => void;
  cameraPosition?: THREE.Vector3;
  backgroundColor?: number;
}

export default function BaseScene({ 
  containerId, 
  onInit, 
  onAnimate,
  cameraPosition = new THREE.Vector3(0, 20, 0),
  backgroundColor = 0x000000 
}: BaseSceneProps) {
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const controlsRef = useRef<OrbitControls>();
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    let mounted = true;

    const init = async () => {
      // Scene Setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(backgroundColor);
      sceneRef.current = scene;

      // Camera Setup
      const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      camera.position.copy(cameraPosition);
      camera.lookAt(0, 20, 0);
      cameraRef.current = camera;

      // Renderer Setup
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Controls Setup
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controlsRef.current = controls;

      // Initialize scene content
      if (onInit) {
        await onInit(scene, camera, renderer);
      }

      if (!mounted) return;

      // Animation Loop
      function animate() {
        if (!mounted) return;
        animationFrameRef.current = requestAnimationFrame(animate);
        if (onAnimate) onAnimate();
        if (controls) controls.update();
        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      }
      animate();
    };

    init();

    // Handle Resizing
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      
      rendererRef.current.setSize(container.clientWidth, container.clientHeight);
      cameraRef.current.aspect = container.clientWidth / container.clientHeight;
      cameraRef.current.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      mounted = false;
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, [containerId, onInit, onAnimate, backgroundColor, cameraPosition]);

  return null;
} 