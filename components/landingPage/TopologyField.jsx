"use client";

import React, { useMemo } from "react";

export const TOPOLOGY_FIELD_DEFAULTS = {
  mode: "dark",
  hue: 0,
  saturation: 1,
  brightness: 1,
};

function generateTopologyHtml(mode = "dark") {
  const isLight = mode === "light";
  const bgColor = isLight ? "rgb(248, 244, 237)" : "rgb(27, 8, 5)";
  const fogColorHex = isLight ? "0xf8f4ed" : "0x1b0805";
  const glowBg = isLight ? "rgba(92, 36, 26, 0.12)" : "rgba(255, 255, 255, 0.20)";
  const nodeColorHex = isLight ? "0x3a1914" : "0xffffff";
  const nodeOpacity = isLight ? "0.90" : "1.0";
  const blendingMode = isLight ? "THREE.NormalBlending" : "THREE.AdditiveBlending";
  const lineOpacity = isLight ? "0.75" : "0.92";

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Investor Forum - Global Topology</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body {
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        background: ${bgColor};
        position: relative;
      }
      #canvasGlow {
        position: absolute;
        pointer-events: none;
        border-radius: 50%;
        filter: blur(100px);
        background: ${glowBg};
        transform: translate(-50%, -50%);
        z-index: 0;
        transition: all 0.6s ease;
      }
      #animationCanvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        pointer-events: none;
      }
    </style>
</head>
<body>
    <div id="canvasGlow"></div>
    <canvas id="animationCanvas"></canvas>

    <script>
        const isLight = ${isLight ? "true" : "false"};
        const canvas = document.getElementById('animationCanvas');
        let width = window.innerWidth;
        let height = window.innerHeight;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(${fogColorHex}, 250, 950);

        const camera = new THREE.PerspectiveCamera(55, width / height, 1, 2000);
        camera.position.z = 620;

        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));

        const group = new THREE.Group();
        scene.add(group);

        // Majestic grand globe nodes
        const isMobile = width < 768;
        const numNodes = isMobile ? 85 : 140;
        const nodes = [];
        const nodeGeo = new THREE.SphereGeometry(1, 10, 10);
        
        for(let i = 0; i < numNodes; i++) {
            let phi = Math.acos(-1 + (2 * i) / numNodes);
            let theta = Math.sqrt(numNodes * Math.PI) * phi;
            let x = Math.cos(theta) * Math.sin(phi);
            let y = Math.sin(theta) * Math.sin(phi);
            let z = Math.cos(phi);

            let mesh = new THREE.Mesh(
                nodeGeo,
                new THREE.MeshBasicMaterial({
                    color: ${nodeColorHex},
                    transparent: true,
                    opacity: ${nodeOpacity}
                })
            );
            mesh.position.set(x, y, z);
            mesh.userData = {
                baseSize: Math.random() * 1.6 + 1.2,
                pulseSpeed: Math.random() * 0.015 + 0.008,
                pulseOffset: Math.random() * Math.PI * 2
            };
            group.add(mesh);
            nodes.push(mesh);
        }

        // Connection lines between adjacent nodes
        const linePos = [];
        const lineColors = [];
        const threshold = isMobile ? 0.50 : 0.44;
        
        for(let i = 0; i < numNodes; i++) {
            for(let j = i + 1; j < numNodes; j++) {
                let dist = nodes[i].position.distanceTo(nodes[j].position);
                if(dist < threshold) {
                    linePos.push(nodes[i].position.x, nodes[i].position.y, nodes[i].position.z);
                    linePos.push(nodes[j].position.x, nodes[j].position.y, nodes[j].position.z);
                    
                    let proximity = (1 - dist / threshold);
                    if (isLight) {
                        // Rich warm mahogany brown lines for Light Mode
                        let r = 0.23 + (proximity * 0.15);
                        let g = 0.10 + (proximity * 0.10);
                        let b = 0.08 + (proximity * 0.08);
                        lineColors.push(r, g, b);
                        lineColors.push(r, g, b);
                    } else {
                        // Pure bright glowing crystalline white lines for Dark Mode
                        let brightness = 0.75 + (proximity * 0.25);
                        lineColors.push(brightness, brightness, brightness);
                        lineColors.push(brightness, brightness, brightness);
                    }
                }
            }
        }
        
        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
        lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
        
        const lineMat = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            blending: ${blendingMode},
            depthWrite: false,
            opacity: ${lineOpacity}
        });
        const lines = new THREE.LineSegments(lineGeo, lineMat);
        group.add(lines);

        // Core subtle luminous center sphere to give solid celestial definition
        const coreGeo = new THREE.SphereGeometry(0.97, 28, 28);
        const coreMat = new THREE.MeshBasicMaterial({
            color: isLight ? 0x64241a : 0xffffff,
            transparent: true,
            opacity: isLight ? 0.04 : 0.07,
            wireframe: true
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        group.add(coreMesh);

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
            
            // Big, grand scale restored
            const R = width > 768 ? 385 : 230;
            group.scale.set(R, R, R);
            
            // Positioned with majestic presence
            const centerX = width > 768 ? width * 0.20 : 0; 
            const centerY = width > 768 ? -height * 0.06 : -height * 0.14;
            group.position.set(centerX, centerY, 0);

            const glow = document.getElementById('canvasGlow');
            if (glow) {
                glow.style.left = \`\${(width / 2) + centerX}px\`;
                glow.style.top = \`\${(height / 2) - centerY}px\`;
                glow.style.width = \`\${R * 2.5}px\`;
                glow.style.height = \`\${R * 2.5}px\`;
            }
        }

        window.addEventListener('resize', resize);
        resize();

        let time = 0;
        let animationFrameId;
        let isVisible = true;

        document.addEventListener('visibilitychange', () => {
            isVisible = !document.hidden;
        });

        function animate() {
            animationFrameId = requestAnimationFrame(animate);
            if (!isVisible) return;

            if (!prefersReducedMotion) {
                time += 1;
                
                // Majestic, smooth planetary orbital rotation
                group.rotation.y = time * 0.0012;
                group.rotation.x = 0.22 + Math.sin(time * 0.0005) * 0.05;
                group.rotation.z = time * 0.0004;

                nodes.forEach(mesh => {
                    let p = mesh.userData;
                    let pulse = (Math.sin((time * p.pulseSpeed) + p.pulseOffset) + 1) / 2;
                    let targetRadius = p.baseSize + (pulse * 1.5);
                    let scale = targetRadius / group.scale.x;
                    mesh.scale.set(scale, scale, scale);
                    
                    if (!isLight) {
                        // High brightness pulse in dark mode
                        mesh.material.opacity = 0.70 + (pulse * 0.30);
                    }
                });
            }

            renderer.render(scene, camera);
        }
        
        animate();

        window.addEventListener('beforeunload', () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            renderer.dispose();
        });
    </script>
</body>
</html>`;
}

export default function TopologyField({
  mode = TOPOLOGY_FIELD_DEFAULTS.mode,
  className,
  style,
}) {
  const safeMode = mode === "light" ? "light" : "dark";
  const source = useMemo(() => generateTopologyHtml(safeMode), [safeMode]);

  return (
    <iframe
      className={className}
      data-mode={safeMode}
      title="Investor Forum Globe Network"
      srcDoc={source}
      sandbox="allow-scripts"
      loading="eager"
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        border: 0,
        background: "transparent",
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}
