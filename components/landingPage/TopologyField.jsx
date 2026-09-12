"use client";

import React, { useMemo } from "react";

export const TOPOLOGY_FIELD_DEFAULTS = {
  mode: "dark",
  hue: 0,
  saturation: 1,
  brightness: 1,
};

const topologySource = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nexus Architecture - Topology</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400&display=swap" rel="stylesheet">
</head>
<body class="text-gray-100 antialiased" style="font-family: 'Hanken Grotesk', sans-serif; background: radial-gradient(circle at bottom right, rgb(35, 14, 10) 0%, rgb(27, 8, 5) 50%, rgb(20, 6, 4) 100%); overflow: hidden; margin: 0; padding: 0; height: 100vh; width: 100vw;">

    <div id="canvasGlow" class="absolute pointer-events-none rounded-full blur-[140px] opacity-[0.08] bg-[#eae0d3] transition-all duration-1000" style="z-index: 0; transform: translate(-50%, -50%);"></div>
    <canvas id="animationCanvas" class="absolute inset-0 w-full h-full z-0 pointer-events-none"></canvas>

    <script>
        const canvas = document.getElementById('animationCanvas');
        let width = window.innerWidth;
        let height = window.innerHeight;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Warm dark espresso fog to seamlessly blend with Investor Forum rgb(27, 8, 5)
        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x1b0805, 300, 1000);

        const camera = new THREE.PerspectiveCamera(60, width / height, 1, 2000);
        camera.position.z = 650;

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const group = new THREE.Group();
        scene.add(group);

        const isMobile = width < 768;
        const numNodes = isMobile ? 70 : 120;
        const nodes = [];
        const nodeGeo = new THREE.SphereGeometry(1, 16, 16);
        
        for(let i = 0; i < numNodes; i++) {
            let phi = Math.acos(-1 + (2 * i) / numNodes);
            let theta = Math.sqrt(numNodes * Math.PI) * phi;
            let x = Math.cos(theta) * Math.sin(phi);
            let y = Math.sin(theta) * Math.sin(phi);
            let z = Math.cos(phi);

            // Cream-light node color rgb(248, 244, 237)
            let mesh = new THREE.Mesh(
                nodeGeo,
                new THREE.MeshBasicMaterial({ color: 0xf8f4ed, transparent: true, opacity: 0.75 })
            );
            mesh.position.set(x, y, z);
            mesh.userData = {
                baseSize: Math.random() * 1.4 + 0.9,
                pulseSpeed: Math.random() * 0.01 + 0.008,
                pulseOffset: Math.random() * Math.PI * 2
            };
            group.add(mesh);
            nodes.push(mesh);
        }

        const linePos = [];
        const lineColors = [];
        const threshold = isMobile ? 0.52 : 0.45;
        for(let i = 0; i < numNodes; i++) {
            for(let j = i + 1; j < numNodes; j++) {
                let dist = nodes[i].position.distanceTo(nodes[j].position);
                if(dist < threshold) {
                    linePos.push(nodes[i].position.x, nodes[i].position.y, nodes[i].position.z);
                    linePos.push(nodes[j].position.x, nodes[j].position.y, nodes[j].position.z);
                    
                    // Subtle champagne cream line tone
                    let alpha = (1 - dist / threshold) * 0.45;
                    lineColors.push(alpha * 0.95, alpha * 0.90, alpha * 0.82);
                    lineColors.push(alpha * 0.95, alpha * 0.90, alpha * 0.82);
                }
            }
        }
        
        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
        lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
        const lineMat = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: 0.55
        });
        const lines = new THREE.LineSegments(lineGeo, lineMat);
        group.add(lines);

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
            
            const R = width > 768 ? 380 : 220;
            group.scale.set(R, R, R);
            
            const centerX = width > 768 ? width * 0.22 : 0; 
            const centerY = width > 768 ? -height * 0.06 : -height * 0.15;
            group.position.set(centerX, centerY, 0);

            const glow = document.getElementById('canvasGlow');
            if (glow) {
                glow.style.left = \`\${(width / 2) + centerX}px\`;
                glow.style.top = \`\${(height / 2) - centerY}px\`;
                glow.style.width = \`\${R * 2.8}px\`;
                glow.style.height = \`\${R * 2.8}px\`;
            }
        }

        window.addEventListener('resize', resize);
        resize();

        let time = 0;
        let animationFrameId;

        function animate() {
            animationFrameId = requestAnimationFrame(animate);
            if (!prefersReducedMotion) {
                time += 1;
                
                // Slow, majestic rotation tailored for an editorial event background
                group.rotation.y = time * 0.0009;
                group.rotation.x = 0.18 + Math.sin(time * 0.0004) * 0.04;
                group.rotation.z = time * 0.0003;

                nodes.forEach(mesh => {
                    let p = mesh.userData;
                    let pulse = (Math.sin((time * p.pulseSpeed) + p.pulseOffset) + 1) / 2;
                    let targetRadius = p.baseSize + pulse * 1.4;
                    let scale = targetRadius / group.scale.x;
                    mesh.scale.set(scale, scale, scale);
                    mesh.material.opacity = 0.35 + (pulse * 0.45);
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

const EFFECT = {
  title: "Nexus topology field",
  source: topologySource,
  background: "rgb(27, 8, 5)",
  targets: [{ selector: "#animationCanvas", role: "background" }],
  theme: {
    nativeMode: "dark",
    lightBackground: "rgb(248, 244, 237)",
    darkBackground: "rgb(27, 8, 5)",
    invertBackground: true,
  },
};

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function effectBackground(definition, mode) {
  return definition.theme?.[`${mode}Background`] ?? definition.background;
}

function buildFocusedDocument(definition, mode) {
  const background = effectBackground(definition, mode);
  const invertBackground =
    definition.theme?.invertBackground === true &&
    definition.theme.nativeMode !== mode;
  const source = definition.source;
  const targetJson = JSON.stringify(definition.targets).replace(/</g, "\\u003c");
  const hiddenTargetJson = JSON.stringify(definition.hiddenTargets ?? []).replace(/</g, "\\u003c");
  const modeJson = JSON.stringify(mode);
  const backgroundFilter = invertBackground
    ? "filter: invert(1) hue-rotate(180deg) saturate(.92) brightness(1.02) !important;"
    : "";
  const focusStyle = `<style data-threeui-focus>
html, body { width: 100% !important; height: 100% !important; min-height: 0 !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; background: ${background} !important; color-scheme: ${mode} !important; }
body { position: relative !important; display: flex !important; align-items: center !important; justify-content: center !important; }
body > * { visibility: hidden !important; }
body[data-threeui-ready] > [data-threeui-role] { visibility: visible !important; }
[data-threeui-residual] { display: none !important; }
[data-threeui-hidden] { display: none !important; }
[data-threeui-role="background"] { position: fixed !important; inset: 0 !important; width: 100% !important; height: 100% !important; max-width: none !important; max-height: none !important; z-index: 0 !important; opacity: 1 !important; pointer-events: none !important; ${backgroundFilter} }
</style>`;
  const focusScript = `<script data-threeui-focus>
(function () {
  document.documentElement.dataset.sfMode = ${modeJson};
  var isolated = false;
  function isolate() {
    if (isolated) return;
    var specs = ${targetJson};
    var hiddenSelectors = ${hiddenTargetJson};
    var roots = [];
    hiddenSelectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (element) {
        element.setAttribute('data-threeui-hidden', '');
        element.setAttribute('aria-hidden', 'true');
        if ('inert' in element) element.inert = true;
      });
    });
    specs.forEach(function (spec) {
      var element = document.querySelector(spec.selector);
      if (!element) return;
      element.setAttribute('data-threeui-role', spec.role);
      if (spec.fit) element.setAttribute('data-threeui-fit', spec.fit);
      if (spec.preserveTransform) element.setAttribute('data-threeui-preserve-transform', '');
      if (!roots.some(function (root) { return root.contains(element); })) roots.push(element);
    });
    if (!roots.length) return;
    isolated = true;
    roots.forEach(function (root) {
      var placeholderLink = root.matches('a[href="#"]') ? root : root.querySelector('a[href="#"]');
      if (placeholderLink) placeholderLink.addEventListener('click', function (event) { event.preventDefault(); });
      document.body.appendChild(root);
    });
    Array.from(document.body.children).forEach(function (element) {
      if (roots.indexOf(element) !== -1) return;
      element.setAttribute('data-threeui-residual', '');
      element.setAttribute('aria-hidden', 'true');
      if ('inert' in element) element.inert = true;
    });
    document.body.setAttribute('data-threeui-ready', '');
    requestAnimationFrame(function () { window.dispatchEvent(new Event('resize')); });
  }
  function scheduleIsolation() { setTimeout(isolate, 100); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scheduleIsolation, { once: true });
  else scheduleIsolation();
  window.addEventListener('load', isolate, { once: true });
})();
</script>`;
  return source
    .replace(/<\/head>/i, `${focusStyle}</head>`)
    .replace(/<\/body>/i, `${focusScript}</body>`);
}

export default function TopologyField({
  mode = TOPOLOGY_FIELD_DEFAULTS.mode,
  hue = TOPOLOGY_FIELD_DEFAULTS.hue,
  saturation = TOPOLOGY_FIELD_DEFAULTS.saturation,
  brightness = TOPOLOGY_FIELD_DEFAULTS.brightness,
  className,
  style,
}) {
  const safeMode = mode === "light" ? "light" : "dark";
  const background = effectBackground(EFFECT, safeMode);
  const source = useMemo(
    () => buildFocusedDocument(EFFECT, safeMode),
    [safeMode]
  );
  const safeHue = clamp(hue, -180, 180);
  const safeSaturation = clamp(saturation, 0, 2);
  const safeBrightness = clamp(brightness, 0.35, 1.65);
  const filter =
    safeHue === 0 && safeSaturation === 1 && safeBrightness === 1
      ? undefined
      : `hue-rotate(${safeHue}deg) saturate(${safeSaturation}) brightness(${safeBrightness})`;

  return (
    <iframe
      className={className}
      data-mode={safeMode}
      title={EFFECT.title}
      srcDoc={source}
      sandbox="allow-scripts"
      loading="eager"
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        border: 0,
        background,
        filter,
        ...style,
      }}
    />
  );
}
