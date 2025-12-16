import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

// Custom Shader Material for soothing fluid animation
const FluidGradientMaterial = {
    uniforms: {
        uTime: { value: 0 },
        // Soothing Palette: Pale Violet, Soft Cyan, Mist Blue
        uColor1: { value: [0.95, 0.96, 1.0] }, // Base White/Blueish #F3F4F6
        uColor2: { value: [0.87, 0.84, 1.0] }, // Soft Lavender #DDD6FE
        uColor3: { value: [0.73, 0.9, 0.99] }, // Pale Sky #BAE6FD
        uColor4: { value: [0.65, 0.95, 0.99] }, // Pale Cyan #A5F3FC
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform vec3 uColor4;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      float time = uTime * 0.3; // Slow, soothing speed

      // Create flowing coordinates
      // This distorts the UV space in large, gentle waves
      vec2 p = uv;
      p.x += sin(p.y * 3.0 + time) * 0.2;
      p.y += cos(p.x * 3.0 + time * 0.8) * 0.2;

      // Second layer of distortion for "fluid" feel
      float noise = sin(p.x * 4.0 - time) + cos(p.y * 4.0 + time);
      
      // Interpolate colors based on the distorted space
      // Using smoothstep to make the color zones distinct but soft bounds
      float smoothNoise = smoothstep(-1.0, 1.0, noise);
      
      // Horizontal gradient mixed with the noise
      vec3 finalColor = mix(uColor1, uColor2, uv.x + sin(time * 0.5) * 0.2);
      finalColor = mix(finalColor, uColor3, smoothNoise * 0.6);
      
      // Add occasional soft pulses of the fourth color (Accent)
      float pulse = sin(uv.y * 5.0 + time) * 0.5 + 0.5;
      finalColor = mix(finalColor, uColor4, pulse * 0.3);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

const AnimatedFluidPlane = () => {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            // Pass time to shader
            meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    return (
        <mesh ref={meshRef} scale={[20, 20, 1]}>
            <planeGeometry args={[1, 1, 32, 32]} />
            <shaderMaterial
                attach="material"
                args={[FluidGradientMaterial]}
                uniforms-uTime-value={0}
            />
        </mesh>
    );
};

const ThreeBackground = () => {
    return (
        <div className="absolute inset-0 -z-0">
            <Canvas camera={{ position: [0, 0, 1] }}>
                <AnimatedFluidPlane />
            </Canvas>
        </div>
    );
};

export default ThreeBackground;
