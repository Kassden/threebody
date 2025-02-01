'use client';

import { useCallback, useRef } from 'react';
import * as THREE from 'three';
import BaseScene from './BaseScene';

interface SceneProps {
  containerId: string;
}

interface Body {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  mass: number;
}

interface Trail {
  points: THREE.Vector3[];
  line: THREE.Line;
}

export default function ThreeBodyScene({ containerId }: SceneProps) {
  const bodiesRef = useRef<Body[]>([]);
  const trailsRef = useRef<Trail[]>([]);

  const handleInit = useCallback((scene: THREE.Scene) => {
    // Three Body System
    const bodies: Body[] = [
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
      const points: THREE.Vector3[] = [];
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

    // Store references
    bodiesRef.current = bodies;
    trailsRef.current = trails;
  }, []);

  const calculateForce = useCallback((body1: Body, body2: Body) => {
    const G = 1; // Gravitational constant
    const r = body2.position.clone().sub(body1.position);
    const distance = r.length();
    return r.normalize().multiplyScalar(G * body1.mass * body2.mass / (distance * distance));
  }, []);

  const handleAnimate = useCallback(() => {
    const bodies = bodiesRef.current;
    const trails = trailsRef.current;
    const dt = 0.01; // Time step

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
  }, [calculateForce]);

  return (
    <BaseScene
      containerId={containerId}
      onInit={handleInit}
      onAnimate={handleAnimate}
      cameraPosition={new THREE.Vector3(0, 20, 0)}
      backgroundColor={0x000000}
    />
  );
} 