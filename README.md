# N-Body Gravitational Simulation

A real-time 3D simulation of the gravitational N-body problem, with special focus on the three-body system. Built with Next.js, Three.js, and TypeScript.

## Overview

This project simulates gravitational interactions between multiple bodies in 3D space, demonstrating the complex dynamics of gravitational systems. While it can handle up to 1000 bodies, it's particularly interesting to observe the chaotic behavior of the three-body problem.

## Features

- Real-time 3D visualization
- Dynamic trail rendering for tracking body paths
- Interactive camera controls (orbit, zoom, pan)
- Adjustable simulation parameters:
  - Number of bodies (3-1000)
  - Gravitational constant
  - Time step
  - Trail length
- Performance optimizations:
  - TypedArrays for position and velocity data
  - Pre-allocated vectors
  - Optimized force calculations
  - Efficient trail updates

## Physics

The simulation implements Newton's law of universal gravitation:

F = G * (m₁m₂)/r²

where:
- F is the gravitational force
- G is the gravitational constant
- m₁ and m₂ are the masses of two bodies
- r is the distance between the bodies

For the three-body system, the equations of motion are:

r̈₁ = -Gm₂(r₁ - r₂)/|r₁ - r₂|³ - Gm₃(r₁ - r₃)/|r₁ - r₃|³
r̈₂ = -Gm₃(r₂ - r₃)/|r₂ - r₃|³ - Gm₁(r₂ - r₁)/|r₂ - r₁|³
r̈₃ = -Gm₁(r₃ - r₁)/|r₃ - r₁|³ - Gm₂(r₃ - r₂)/|r₃ - r₂|³

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation 
Visit `http://localhost:3000` to view the simulation.

## Controls

- **Left Mouse Button**: Rotate camera
- **Right Mouse Button**: Pan
- **Mouse Wheel**: Zoom
- **Parameter Sliders**: Adjust simulation properties in real-time

## Performance Notes

The simulation uses several optimization techniques:
- Float32Arrays for position and velocity data
- Pre-allocated Vector3 objects for calculations
- Reduced geometry complexity for non-primary bodies
- Optimized trail update frequency
- Efficient force calculation algorithms

## Technical Details

### Technologies Used

- Next.js 14
- Three.js
- TypeScript
- TailwindCSS

### Key Components

- Real-time physics engine
- 3D rendering with Three.js
- Interactive UI controls
- Dynamic trail system
- Optimized data structures

## License

MIT License - feel free to use this code for your own projects.

## Acknowledgments

- Inspired by the classical three-body problem in physics
- Built with Three.js and Next.js frameworks
 
