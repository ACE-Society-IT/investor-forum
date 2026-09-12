# Investor Forum: Intra-School Edition 2026 — Homepage Design Blueprint

> **Notice for Recreating Agents:** This document is an exhaustive, deterministic technical specification of the homepage for the **Investor Forum (Intra-School Edition 2026)** application. It contains every design token, typographic rule, layout hierarchy, CSS class, SVG asset, animation keyframe, data array, and interaction needed to reconstruct the exact homepage from scratch with 100% fidelity.

---

## Table of Contents
1. [Core Tech Stack & Dependencies](#1-core-tech-stack--dependencies)
2. [Design System & Tokens](#2-design-system--tokens)
   - [2.1 Color Palette](#21-color-palette)
   - [2.2 Typography Hierarchy](#22-typography-hierarchy)
   - [2.3 Tailwind Configuration](#23-tailwind-configuration)
   - [2.4 Global CSS & Keyframes](#24-global-css--keyframes)
   - [2.5 Helper Utilities](#25-helper-utilities)
3. [Architecture & Z-Index Layering Map](#3-architecture--z-index-layering-map)
4. [Component-by-Component Specifications](#4-component-by-component-specifications)
   - [4.1 Background System (`BackgroundAmbient.tsx`)](#41-background-system-backgroundambienttsx)
   - [4.2 3D Particle Mesh (`topology-field.tsx`)](#42-3d-particle-mesh-topology-fieldtsx)
   - [4.3 Dynamic Canvas Spotlight (`spotlight-cursor.tsx`)](#43-dynamic-canvas-spotlight-spotlight-cursortsx)
   - [4.4 Micro-Interactive Button (`spinning-border-button.tsx`)](#44-micro-interactive-button-spinning-border-buttontsx)
   - [4.5 Brand Identity Asset (`Logo.tsx`)](#45-brand-identity-asset-logotsx)
   - [4.6 Floating Header & Mobile Navigation (`Navbar.tsx`)](#46-floating-header--mobile-navigation-navbartsx)
   - [4.7 Hero Section (`Hero.tsx`)](#47-hero-section-herotsx)
   - [4.8 The Challenge Section (`ChallengeSection.tsx`)](#48-the-challenge-section-challengesectiontsx)
   - [4.9 The Market / Sectors Section (`MarketSection.tsx`)](#49-the-market--sectors-section-marketsectiontsx)
   - [4.10 The Rules Section (`RulesSection.tsx`)](#410-the-rules-section-rulessectiontsx)
   - [4.11 The Day / Timeline Section (`TimelineSection.tsx`)](#411-the-day--timeline-section-timelinesectiontsx)
   - [4.12 Frequently Asked Questions (`FaqSection.tsx`)](#412-frequently-asked-questions-faqsectiontsx)
   - [4.13 Call-to-Action Section (`CtaSection.tsx`)](#413-call-to-action-section-ctasectiontsx)
   - [4.14 Editorial Footer (`Footer.tsx`)](#414-editorial-footer-footertsx)
5. [Page Assembly & Layout Blueprint](#5-page-assembly--layout-blueprint)
6. [Complete Step-by-Step Recreation Guide](#6-complete-step-by-step-recreation-guide)

---

## 1. Core Tech Stack & Dependencies

| Category | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `^14.2.10` | Server-rendered React framework, App router structure |
| **Language** | TypeScript | `^5.5.4` | Type definitions and strict typing |
| **Core UI** | React & React DOM | `^18.3.1` | Component UI library |
| **Styling** | Tailwind CSS | `^3.4.10` | Utility-first styling engine |
| **PostCSS** | PostCSS + Autoprefixer | `^8.4.41` / `^10.4.20` | CSS processing |
| **Icons** | Lucide React | `^0.428.0` | Feather-style icons: `ArrowRight`, `Menu`, `X`, `Zap`, `Scale`, `Shield`, `ChevronDown` |
| **Class Merge** | `clsx` + `tailwind-merge` | `^2.1.1` / `^3.6.0` | Dynamic className resolution |
| **Primitives** | `@radix-ui/react-progress` | `^1.1.16` | Accessible progress indicator primitives |
| **3D Graphics** | Three.js (r128) | CDN included in iframe | Nexus Topology 3D interactive particle sphere |

---

## 2. Design System & Tokens

### 2.1 Color Palette

The visual identity is built on a dark espresso/wine aesthetic ("maroon") with warm cream editorial typography and emerald financial highlights:

| Token Name | CSS Value | Hex Approx | Semantic Usage |
| :--- | :--- | :--- | :--- |
| `maroon-base` | `rgb(27, 8, 5)` | `#1B0805` | Master viewport background, main body fill |
| `maroon-subtle` | `rgb(35, 14, 10)` | `#230E0A` | Card backgrounds, dropdown menus, button fills |
| `cream-light` | `rgb(248, 244, 237)` | `#F8F4ED` | Primary headings (H1, H2, H3), active badges, high-contrast labels |
| `cream-muted` | `rgb(234, 224, 211)` | `#EAE0D3` | Secondary text, descriptions, inactive states, spotlight color |
| `border-brown` | `rgb(64, 43, 40)` | `#402B28` | Card borders, section divider lines, subtle delimiters |
| `accent-green` | `rgb(48, 61, 55)` | `#303D37` | Text selection background, button container fills, tag backing |
| `accent-green-bright` | `#5fa886` | `#5FA886` | Active status dots, positive market ticker percentages, node highlights |
| `grey-muted` | `#8e857f` | `#8E857F` | Subtle annotations, timestamp details |
| `grey-subtle` | `#574d48` | `#574D48` | Low-priority lines and secondary borders |

---

### 2.2 Typography Hierarchy

Imported via Google Fonts in `src/app/globals.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,300..700;1,300..700&family=JetBrains+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700&display=swap');
```

1. **`font-serif` (`Newsreader, Georgia, serif`)**:
   - Editorial, authoritative, timeless financial press aesthetic.
   - Used for: Brand title (`Investor Forum`), H1 Hero heading, section titles (H2: *The Challenge*, *The Market*, *The Rules*, *The Day*, *Frequently Asked Questions*, *Ready for the Opening Bell?*), and card titles (H3).
2. **`font-sans` (`'Hanken Grotesk', sans-serif`)**:
   - Modern, geometric, clean legibility.
   - Used for: Body descriptions, nav items, button labels, accordion contents, footer notes.
3. **`font-mono` (`'JetBrains Mono', monospace`)**:
   - Technical, financial data aesthetic.
   - Used for: Edition badge (`INTRA-SCHOOL EDITION 2026`), stock tickers (`$TECH`, `$PHRM`, `$ENRG`, `$FMCG`), latency metrics, valuation equation, timeline numbers (`01`, `02`, `03`...).

---

### 2.3 Tailwind Configuration

**File:** `tailwind.config.ts`
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "maroon-base": "rgb(27, 8, 5)",
        "maroon-subtle": "rgb(35, 14, 10)",
        "cream-light": "rgb(248, 244, 237)",
        "cream-muted": "rgb(234, 224, 211)",
        "border-brown": "rgb(64, 43, 40)",
        "accent-green": "rgb(48, 61, 55)",
        "accent-green-bright": "#5fa886",
        "grey-muted": "#8e857f",
        "grey-subtle": "#574d48",
      },
      fontFamily: {
        serif: ["Newsreader", "Georgia", "serif"],
        sans: ["'Hanken Grotesk'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      animation: {
        "pulse-slow": "pulseSlow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float-glow": "floatGlow 20s ease-in-out infinite alternate",
        "curve-drift": "curveDrift 24s ease-in-out infinite alternate",
        "market-flow": "marketFlow 60s linear infinite",
      },
      keyframes: {
        pulseSlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.12)" },
        },
        floatGlow: {
          "0%": { transform: "translate(0, 0) scale(1)", opacity: "0.05" },
          "50%": { transform: "translate(25px, -20px) scale(1.1)", opacity: "0.09" },
          "100%": { transform: "translate(-20px, 15px) scale(0.95)", opacity: "0.06" },
        },
        curveDrift: {
          "0%": { transform: "translateX(-3%) translateY(0) scale(1)" },
          "50%": { transform: "translateX(2%) translateY(-8px) scale(1.01)" },
          "100%": { transform: "translateX(3%) translateY(5px) scale(0.99)" },
        },
        marketFlow: {
          "0%": { strokeDashoffset: "2000" },
          "100%": { strokeDashoffset: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

---

### 2.4 Global CSS & Keyframes

**File:** `src/app/globals.css`
```css
@import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,300..700;1,300..700&family=JetBrains+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
    background-color: rgb(27, 8, 5);
    color: rgb(248, 244, 237);
  }

  body {
    margin: 0;
    padding: 0;
    background-color: rgb(27, 8, 5);
    color: rgb(248, 244, 237);
    overflow-x: hidden;
  }

  /* Hide scrollbar for a clean editorial feel */
  ::-webkit-scrollbar {
    display: none;
  }
}

/* Subtle faint geometric grid */
.bg-grid-pattern {
  background-size: 64px 64px;
  background-image: 
    linear-gradient(to right, rgba(234, 224, 211, 0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(234, 224, 211, 0.03) 1px, transparent 1px);
}

/* Slow continuous stroke flow for abstract market curves */
@keyframes flowStroke {
  0% {
    stroke-dashoffset: 2000;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

.animate-market-flow {
  stroke-dasharray: 8 6;
  animation: flowStroke 60s linear infinite;
}

.animate-market-slow-wave {
  stroke-dasharray: 500;
  animation: flowStroke 45s ease-in-out infinite alternate;
}

details summary::-webkit-details-marker {
  display: none;
}
```

---

### 2.5 Helper Utilities

**File:** `src/lib/utils.ts`
```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 3. Architecture & Z-Index Layering Map

The homepage relies on strict stacking contexts so ambient layers never block mouse events or interfere with interactions:

```
┌────────────────────────────────────────────────────────┐
│ z-50: Sticky Pill Navbar (<Navbar />)                 │
├────────────────────────────────────────────────────────┤
│ z-10: Main Content (<main>, <Hero>, <Sectors>, etc.)   │
├────────────────────────────────────────────────────────┤
│ z-[2]: Spotlight Cursor Canvas (<SpotlightCursor />)   │
│        (pointer-events-none, tracks mouse coords)     │
├────────────────────────────────────────────────────────┤
│ z-0:   Ambient Background (<BackgroundAmbient />)      │
│        • 3D WebGL Sphere (<TopologyField />)          │
│        • 64px Grid Overlay (.bg-grid-pattern)          │
│        • 3 Blurred Floating Glowing Radial Orbs        │
├────────────────────────────────────────────────────────┤
│ Base:  bg-maroon-base rgb(27, 8, 5)                    │
└────────────────────────────────────────────────────────┘
```

---

## 4. Component-by-Component Specifications

### 4.1 Background System (`BackgroundAmbient.tsx`)

- **Role:** Creates an ethereal, living editorial ambiance underneath all website sections.
- **Positioning:** `fixed inset-0 pointer-events-none z-0 overflow-hidden` with `aria-hidden="true"`.
- **Sub-layers:**
  1. **3D Topology Field:** Wrapped in `absolute inset-0 w-full h-full opacity-50 sm:opacity-65`.
  2. **Subtle Grid Pattern:** `absolute inset-0 bg-grid-pattern opacity-35`.
  3. **Light Orb 1 (Top Left):**
     - Class: `absolute -top-36 left-1/4 w-[650px] h-[500px] rounded-full bg-cream-muted filter blur-[160px] opacity-[0.04] animate-float-glow pointer-events-none`
  4. **Light Orb 2 (Right Center):**
     - Class: `absolute top-1/3 -right-28 w-[600px] h-[600px] rounded-full bg-accent-green filter blur-[170px] opacity-[0.07] animate-float-glow pointer-events-none`
     - Inline style: `{ animationDelay: "-8s" }`
  5. **Light Orb 3 (Bottom Left):**
     - Class: `absolute bottom-16 left-12 w-[550px] h-[450px] rounded-full bg-cream-muted filter blur-[180px] opacity-[0.03] animate-float-glow pointer-events-none`
     - Inline style: `{ animationDelay: "-14s" }`

---

### 4.2 3D Particle Mesh (`topology-field.tsx`)

- **Role:** Renders a floating, slowly rotating 3D spherical mesh of interconnected nodes and glowing lines using Three.js inside an isolated, sandboxed iframe.
- **Node Geometry:** `SphereGeometry(1, 16, 16)` with 70 nodes on mobile (`< 768px`) or 120 nodes on desktop.
- **Node Material:** `MeshBasicMaterial({ color: 0xf8f4ed, transparent: true, opacity: 0.75 })` (`cream-light`).
- **Connection Threshold:** Lines connect nodes if distance `< 0.52` (mobile) or `< 0.45` (desktop).
- **Line Material:** `LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.55 })`.
- **Rotation Mechanics:**
  - `group.rotation.y = time * 0.0009;`
  - `group.rotation.x = 0.18 + Math.sin(time * 0.0004) * 0.04;`
  - `group.rotation.z = time * 0.0003;`
  - Individual nodes pulse in scale (`scale = (baseSize + pulse * 1.4) / group.scale.x`).
- **Camera:** PerspectiveCamera (FOV 60, aspect ratio, near 1, far 2000, position z = 650).
- **Scene Fog:** `new THREE.Fog(0x1b0805, 300, 1000)` (blends into `maroon-base`).
- **Positioning Offset:** Offset horizontally on desktop to `width * 0.22` and vertically `-height * 0.06` so it frames the hero content without obstructing typography.
- **Accessibility:** Detects `window.matchMedia('(prefers-reduced-motion: reduce)')` and pauses animation frames if requested.

---

### 4.3 Dynamic Canvas Spotlight (`spotlight-cursor.tsx`)

- **Role:** Casts a subtle, luxurious glow behind the user's cursor as they move over the dark background.
- **HTML Element:** `<canvas className="pointer-events-none fixed inset-0 z-[2] h-full w-full overflow-hidden select-none" />`
- **Default Parameters:**
  - `color`: `"234, 224, 211"` (`cream-muted`)
  - `radius`: `250` pixels
  - `brightness`: `0.1`
- **Interpolation / Lerp Dynamics:**
  - Linear interpolation smooths pointer tracking:
    ```javascript
    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;
    currentOpacity += (targetOpacity - currentOpacity) * 0.08;
    ```
- **Radial Gradient Stops:**
  - Stop `0.00`: `rgba(${color}, ${peakAlpha})`
  - Stop `0.40`: `rgba(${color}, ${peakAlpha * 0.45})`
  - Stop `0.75`: `rgba(${color}, ${peakAlpha * 0.12})`
  - Stop `1.00`: `rgba(${color}, 0)`
- **Graceful Degradation:**
  - Disabled on touch screens (`window.matchMedia("(pointer: coarse)").matches`).
  - Disabled if `prefers-reduced-motion: reduce`.
  - Automatically handles Retina / High-DPI screens via `devicePixelRatio` scaling.

---

### 4.4 Micro-Interactive Button (`spinning-border-button.tsx`)

- **Role:** High-end CTA button featuring a rotating conic-gradient beam that activates on hover.
- **Variants:**
  1. `primary`:
     - Inner: `bg-cream-muted text-maroon-base hover:bg-cream-light font-medium shadow-[0_4px_20px_rgba(234,224,211,0.1)]`
     - Glow: `group-hover:shadow-[0_0_24px_rgba(234,224,211,0.22)]`
     - Beam Conic: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 65deg, rgb(234, 224, 211) 120deg, #ffffff 140deg, transparent 185deg)`
     - Static Border: `border-border-brown/70 group-hover:border-transparent`
  2. `accent`:
     - Inner: `bg-accent-green hover:bg-[#384841] text-cream-light font-medium shadow-[0_0_15px_rgba(95,168,134,0.18)]`
     - Glow: `group-hover:shadow-[0_0_24px_rgba(95,168,134,0.3)]`
     - Beam Conic: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 65deg, #5fa886 120deg, rgb(234, 224, 211) 140deg, transparent 185deg)`
     - Static Border: `border-border-brown/80 group-hover:border-transparent`
  3. `secondary`:
     - Inner: `bg-maroon-subtle/80 hover:bg-maroon-subtle text-cream-light font-medium`
     - Glow: `group-hover:shadow-[0_0_20px_rgba(64,43,40,0.4)]`
     - Beam Conic: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 65deg, rgb(234, 224, 211) 120deg, rgb(248, 244, 237) 140deg, transparent 185deg)`
     - Static Border: `border-border-brown group-hover:border-transparent`
- **Sizes:**
  - `sm`: `text-xs px-4 py-1.5`
  - `md`: `text-sm px-7 py-3`
  - `lg`: `text-sm px-8 py-3.5`
- **Beam Element Implementation:**
  ```tsx
  <span
    className="absolute inset-[-200%] animate-[spin_3s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
    style={{ background: currentVariant.beam }}
    aria-hidden="true"
  />
  ```
- **Icon Hover Animation:**
  Child SVG arrows automatically slide right on hover via `group-hover:[&_svg.lucide-arrow-right]:translate-x-1`.
- **Next.js Link Integration:** If `href` prop is supplied, renders as `<Link href={href}>`; otherwise renders `<button>`.

---

### 4.5 Brand Identity Asset (`Logo.tsx`)

- **Role:** Bespoke SVG symbol evoking financial charting, growth, and institutional precision.
- **ViewBox:** `0 0 120 120`
- **Elements:**
  1. Base Tile: `<rect width="120" height="120" rx="28" fill="#240E0B" stroke="#402B28" strokeWidth="2" />`
  2. Stock Trend Line: `<path d="M30 84 L48 56 L64 68 L90 32" fill="none" stroke="#EAE0D3" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />`
  3. Peak Point: `<circle cx="90" cy="32" r="6" fill="#5FA886" />`
  4. Floor Guideline: `<path d="M34 84 L86 84" fill="none" stroke="#402B28" strokeWidth="3" strokeDasharray="4 4" />`
  5. 4 Volume Columns:
     - Bar 1: `x="30" y="66" width="6" height="18" rx="2" fill="#5FA886" opacity="0.4"`
     - Bar 2: `x="46" y="52" width="6" height="32" rx="2" fill="#EAE0D3" opacity="0.6"`
     - Bar 3: `x="62" y="62" width="6" height="22" rx="2" fill="#5FA886" opacity="0.5"`
     - Bar 4: `x="78" y="40" width="6" height="44" rx="2" fill="#EAE0D3" opacity="0.8"`

---

### 4.6 Floating Header & Mobile Navigation (`Navbar.tsx`)

- **Position & Layout:** `fixed top-0 inset-x-0 z-50 py-3.5 px-4 sm:px-6 lg:px-12 pointer-events-none`
- **Floating Pill Container:**
  - `max-w-6xl mx-auto flex items-center justify-between h-14 px-4 sm:px-6 rounded-full bg-maroon-base/85 backdrop-blur-md border border-border-brown shadow-[0_12px_36px_rgba(0,0,0,0.5)] pointer-events-auto`
- **Left - Brand Mark:**
  - Icon container: `w-8 h-8 rounded-lg overflow-hidden border border-border-brown/80 flex items-center justify-center p-0.5 bg-maroon-subtle` containing `<Logo className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300" />`
  - Text: `font-serif text-lg tracking-tight text-cream-light font-medium` ("Investor Forum")
  - Tag (hidden on mobile, visible `sm:inline-block`): `font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded bg-border-brown/40 border border-border-brown text-cream-muted/90` ("Intra-School Edition 2026")
- **Center - Navigation Links (Desktop):**
  - Wrapper: `hidden md:flex items-center gap-1 px-2 py-1 rounded-full bg-maroon-base/60 border border-border-brown/40`
  - Nav Items:
    1. About (`#about`)
    2. Sectors (`#sectors`)
    3. Rules (`#rules`)
    4. Timeline (`#timeline`)
    5. FAQs (`#faqs`)
  - Link Styling: `px-3.5 py-1 text-xs text-cream-muted hover:text-cream-light rounded-full transition-colors font-medium font-sans`
- **Right - Action CTA & Mobile Trigger:**
  - Login Button: `<SpinningBorderButton href="/login" variant="accent" size="sm">`
    - Contains: `<span className="w-1.5 h-1.5 rounded-full bg-accent-green-bright animate-pulse" />` + `<span>Team Login</span>`
  - Mobile Menu Toggle: `md:hidden p-1.5 rounded-full text-cream-muted hover:text-cream-light hover:bg-border-brown/30`
    - Renders `<Menu className="w-5 h-5" />` when closed, `<X className="w-5 h-5" />` when opened.
- **Mobile Menu Dropdown:**
  - Container: `md:hidden max-w-6xl mx-auto mt-2 rounded-2xl bg-maroon-base/95 backdrop-blur-xl border border-border-brown p-4 shadow-2xl pointer-events-auto`
  - Links: `px-3 py-2 text-sm text-cream-muted hover:text-cream-light hover:bg-border-brown/20 rounded-lg transition-colors font-medium`

---

### 4.7 Hero Section (`Hero.tsx`)

- **Layout:** `relative w-full pt-36 pb-24 md:pt-48 md:pb-32 px-5 sm:px-8 lg:px-12 flex flex-col items-center justify-center text-center overflow-hidden`
- **Hero Background SVG Graphics:**
  - Stretched SVG with `animate-curve-drift` (`w-full max-w-6xl h-96`, `viewBox="0 0 1000 400"`, `opacity-25`):
    - Linear gradients: `heroCurveGradient` (stops: `#402b28`, `#eae0d3`, `#5fa886`, `#402b28`) and `heroFillGradient` (vertical fade from `#eae0d3` 2.5% opacity to `#1b0805` 0% opacity).
    - Shaded Area: `<path d="M 0 320 C 140 310, 220 220, 340 260 C 460 300, 520 140, 640 160 C 760 180, 840 80, 1000 110 L 1000 400 L 0 400 Z" fill="url(#heroFillGradient)" />`
    - Dashed Secondary Curve: `stroke="#402b28" strokeWidth="1.2" strokeDasharray="4 4"`
    - Primary Flow Curve: `stroke="url(#heroCurveGradient)" strokeWidth="1.75" className="animate-market-flow"`
    - Key Coordinate Circles:
      - `(340, 260)`: `r="2.5" fill="#eae0d3" opacity="0.6"`
      - `(640, 160)`: `r="2.5" fill="#5fa886" opacity="0.75"`
      - `(1000, 110)`: `r="3" fill="#eae0d3" opacity="0.7"`
- **Pill Badge:**
  - `inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-maroon-subtle/80 border border-border-brown mb-8 text-cream-muted`
  - Indicator: `<span className="w-1.5 h-1.5 rounded-full bg-accent-green-bright animate-pulse" />`
  - Text: `<span className="font-mono text-[11px] tracking-widest uppercase">Intra-School Edition 2026</span>`
- **Headline (H1):**
  - Text: **"Where Market Instinct Meets Real-Time Pressure."**
  - Classes: `font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-cream-light tracking-tight leading-[1.1] mb-6`
- **Supporting Description:**
  - Text: *"An intra-school stock trading simulation where teams react to breaking market news, manage virtual capital and compete to maximize their net worth."*
  - Classes: `font-sans text-base sm:text-lg text-cream-muted/90 max-w-2xl leading-relaxed mb-10 font-normal`
- **CTA Actions:**
  - Primary Button: `<SpinningBorderButton href="/login" variant="primary" size="md">`
    - Content: `<span>Access Trading Floor</span>` + `<ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />`
  - Secondary Button: `<SpinningBorderButton href="#rules" variant="secondary" size="md">`
    - Content: `<span>Read the Rules</span>`
- **Market Ticker Ribbon:**
  - Layout: `mt-16 pt-6 border-t border-border-brown/30 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-mono text-cream-muted/70`
  - Items:
    1. `$TECH` (`text-cream-light`) + `+4.8%` (`text-accent-green-bright`)
    2. `$PHRM` (`text-cream-light`) + `-1.3%` (`text-cream-muted/60`)
    3. `$ENRG` (`text-cream-light`) + `+2.2%` (`text-accent-green-bright`)
    4. `$FMCG` (`text-cream-light`) + `+0.4%` (`text-accent-green-bright`)
    - Delimiter: `<span className="text-border-brown">•</span>`

---

### 4.8 The Challenge Section (`ChallengeSection.tsx`)

- **Section Attributes:** `id="about"`, `className="relative w-full py-24 md:py-32 px-5 sm:px-8 lg:px-12 border-t border-border-brown/40"`
- **Header:**
  - H2: `font-serif text-3xl sm:text-4xl text-cream-light font-normal tracking-tight mb-3` -> **"The Challenge"**
  - Subtitle: `text-cream-muted text-base max-w-xl font-normal font-sans` -> *"Think fast, manage risk and make the right call when the market moves."*
- **Grid Layout:** `max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6`
- **Card Specifications:**
  - Base Card: `group relative rounded-2xl bg-maroon-subtle/50 border border-border-brown p-8 flex flex-col justify-between hover:border-border-brown/90 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.4)]`
  - Icon Tile: `w-10 h-10 rounded-xl bg-accent-green/30 border border-border-brown/60 flex items-center justify-center text-cream-muted mb-6 group-hover:border-accent-green-bright/40 transition-colors`
  - Icon Element: `<Icon className="w-5 h-5 text-cream-light stroke-[1.75]" />`
  - Title (H3): `font-serif text-2xl text-cream-light font-normal mb-2.5`
  - Description: `text-cream-muted/80 text-sm leading-relaxed font-sans`
  - Card Footer: `mt-8 pt-4 border-t border-border-brown/30 flex items-center justify-between text-xs font-mono text-cream-muted/50`
- **Card Data:**
  1. **Card 1:**
     - Icon: `Zap`
     - Title: **Analytical Speed**
     - Description: *"React quickly to breaking market news."*
     - Tag Label: `LATENCY` | Tag Value: `< 15 SEC`
  2. **Card 2:**
     - Icon: `Scale`
     - Title: **Portfolio Balance**
     - Description: *"Balance opportunity and risk across sectors."*
     - Tag Label: `ALLOCATION` | Tag Value: `DIVERSIFIED`
  3. **Card 3:**
     - Icon: `Shield`
     - Title: **Capital Discipline**
     - Description: *"Protect your virtual capital and trade responsibly."*
     - Tag Label: `PRESERVATION` | Tag Value: `CAPITAL`

---

### 4.9 The Market / Sectors Section (`MarketSection.tsx`)

- **Section Attributes:** `id="sectors"`, `className="relative w-full py-24 md:py-32 px-5 sm:px-8 lg:px-12 border-t border-border-brown/40"`
- **Header:**
  - H2: `font-serif text-3xl sm:text-4xl text-cream-light font-normal tracking-tight mb-3` -> **"The Market"**
  - Subtitle: `text-cream-muted text-base max-w-xl font-normal font-sans` -> *"Four sectors. Different risks. One objective."*
- **Grid Layout:** `max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5`
- **Sector Card Styling:**
  - Container: `group rounded-2xl bg-maroon-subtle/40 border border-border-brown p-6 flex flex-col justify-between hover:border-border-brown/90 hover:bg-maroon-subtle/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.35)]`
  - Top Bar:
    - Ticker Badge: `font-mono text-xs text-accent-green-bright font-medium px-2 py-0.5 rounded bg-accent-green/20 border border-accent-green/30`
    - Category Tag: `text-[10px] font-mono text-cream-muted/60 tracking-wider`
  - Title (H3): `font-serif text-xl text-cream-light font-normal mb-2`
  - Description: `text-xs text-cream-muted/80 leading-relaxed font-sans`
  - Bottom Sparkline Container: `mt-8 pt-4 border-t border-border-brown/30`
  - Sparkline SVG: `<svg className="w-full h-8 overflow-visible opacity-50 group-hover:opacity-85 transition-opacity" fill="none" viewBox="0 0 100 28" aria-hidden="true"><path d={sector.sparkline} stroke="#eae0d3" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>`
- **Sector Data Items:**
  1. **Pharma & Healthcare:**
     - Ticker: `$PHRM`
     - Category: `HIGH VOLATILITY`
     - Description: *"High-volatility sector influenced by clinical trials, regulations and patents."*
     - Sparkline Path: `M 0 20 L 25 12 L 40 24 L 60 5 L 80 18 L 100 8`
  2. **AI & Technology:**
     - Ticker: `$TECH`
     - Category: `GROWTH`
     - Description: *"Growth-oriented sector driven by innovation and technology developments."*
     - Sparkline Path: `M 0 24 L 20 20 L 45 16 L 65 19 L 85 8 L 100 4`
  3. **Energy & Infrastructure:**
     - Ticker: `$ENRG`
     - Category: `CYCLICAL`
     - Description: *"Value-oriented sector affected by supply shocks and raw material prices."*
     - Sparkline Path: `M 0 14 L 30 18 L 50 10 L 70 22 L 88 15 L 100 12`
  4. **Consumer Retail:**
     - Ticker: `$FMCG`
     - Category: `DEFENSIVE`
     - Description: *"Defensive sector designed to provide portfolio stability during market swings."*
     - Sparkline Path: `M 0 16 L 25 15 L 50 17 L 75 14 L 90 15 L 100 13`

---

### 4.10 The Rules Section (`RulesSection.tsx`)

- **Section Attributes:** `id="rules"`, `className="relative w-full py-24 md:py-32 px-5 sm:px-8 lg:px-12 border-t border-border-brown/40"`
- **Container:** `max-w-3xl mx-auto flex flex-col gap-12`
- **Header:**
  - H2: `font-serif text-3xl sm:text-4xl text-cream-light font-normal tracking-tight mb-3` -> **"The Rules"**
  - Subtitle: `text-cream-muted text-base max-w-xl font-normal font-sans` -> *"Fair play. Same starting point. Every decision counts."*
- **Core Valuation Standard Card:**
  - Container: `p-6 sm:p-8 rounded-2xl bg-maroon-subtle/70 border border-border-brown text-center flex flex-col items-center justify-center gap-2 relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)]`
  - Subtle Gradient: `<div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#eae0d3]/[0.03] to-transparent pointer-events-none" />`
  - Subtitle: `<span className="font-mono text-[10px] text-cream-muted/60 uppercase tracking-widest">Core Valuation Standard</span>`
  - Equation: `<div className="font-mono text-base sm:text-xl md:text-2xl text-cream-light font-medium tracking-tight py-2">Total Net Worth = Cash + Market Value of Holdings</div>`
  - Note: `<p className="text-xs text-cream-muted/70 font-sans">Portfolios update automatically as live prices fluctuate across trading rounds.</p>`
- **Interactive Rules Accordion:**
  - Container: `divide-y divide-border-brown/40 border-y border-border-brown/40`
  - State: `const [openIndex, setOpenIndex] = useState<number | null>(0);` (First item open by default)
  - Toggle Button: `w-full flex items-center justify-between text-left text-cream-light select-none focus:outline-none group py-4`
  - Label: `font-serif text-lg md:text-xl font-normal group-hover:text-cream-muted transition-colors`
  - Icon: `<ChevronDown className={"w-5 h-5 text-cream-muted/60 transform transition-transform duration-200 " + (isOpen ? "rotate-180 text-cream-light" : "")} />`
  - Expanded Content: `pt-2 text-sm text-cream-muted/80 leading-relaxed font-sans animate-fadeIn`
- **Rules Content:**
  1. **Starting Capital:** *"Every team begins with the same virtual starting capital."*
  2. **Order Execution:** *"Buy and sell orders execute at the current market price."*
  3. **Short Selling:** *"Teams may only sell shares they currently hold."*
  4. **Trading Halts:** *"Administrators may pause trading during rounds or announcements."*
  5. **Winning Condition:** *"Final rankings are based on Total Net Worth."*

---

### 4.11 The Day / Timeline Section (`TimelineSection.tsx`)

- **Section Attributes:** `id="timeline"`, `className="relative w-full py-24 md:py-32 px-5 sm:px-8 lg:px-12 border-t border-border-brown/40"`
- **Container:** `max-w-2xl mx-auto flex flex-col gap-16`
- **Header:**
  - H2: `font-serif text-3xl sm:text-4xl text-cream-light font-normal tracking-tight mb-3` -> **"The Day"**
  - Subtitle: `text-cream-muted text-base max-w-md font-normal font-sans` -> *"Five deliberate phases from market open to final audit."*
- **Timeline Structure:**
  - Vertical Guide: `relative pl-8 border-l border-border-brown/60 flex flex-col gap-10`
  - Node Marker Container: `absolute -left-[37px] top-1 flex items-center justify-center`
  - **Active Stage Node (`active: true`):**
    ```tsx
    <div className="w-4 h-4 rounded-full bg-accent-green/40 flex items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-accent-green-bright animate-pulse-slow" />
    </div>
    ```
  - **Inactive Stage Node (`active: false`):**
    ```tsx
    <div className="w-4 h-4 rounded-full bg-maroon-subtle flex items-center justify-center border border-border-brown">
      <div className="w-2 h-2 rounded-full bg-cream-muted/50" />
    </div>
    ```
  - Header Tag: `flex items-center gap-2 font-mono text-[11px] text-cream-muted/60 uppercase tracking-wider mb-1` -> `{stage.number} • {stage.title}`
  - Title (H3): `font-serif text-xl text-cream-light font-normal mb-1`
  - Description: `text-sm text-cream-muted/80 leading-relaxed font-sans`
- **Timeline Stages:**
  1. `01` • **Market Open** (`active: true`): *"Teams log in and allocate their starting capital."*
  2. `02` • **Round 1** (`active: false`): *"The first market news creates sector movements."*
  3. `03` • **Half-Time** (`active: false`): *"Trading pauses and the leaderboard is revealed."*
  4. `04` • **Round 2** (`active: false`): *"Major market events create the final opportunities."*
  5. `05` • **Closing Bell** (`active: true`): *"Trading ends and final rankings are calculated."*

---

### 4.12 Frequently Asked Questions (`FaqSection.tsx`)

- **Section Attributes:** `id="faqs"`, `className="relative w-full py-24 md:py-32 px-5 sm:px-8 lg:px-12 border-t border-border-brown/40"`
- **Container:** `max-w-3xl mx-auto flex flex-col gap-12`
- **Header:**
  - H2: `font-serif text-3xl sm:text-4xl text-cream-light font-normal tracking-tight mb-3` -> **"Frequently Asked Questions"**
  - Subtitle: `text-cream-muted text-base max-w-md font-normal font-sans` -> *"Essential operational details for participating teams."*
- **Accordion Container:** `divide-y divide-border-brown/40 border-y border-border-brown/40`
- **Interactive State:** `const [openIndex, setOpenIndex] = useState<number | null>(null);` (All closed by default)
- **Question Trigger:** `w-full flex items-center justify-between text-left text-cream-light select-none focus:outline-none group pr-2 py-5`
  - Text: `font-serif text-lg md:text-xl font-normal group-hover:text-cream-muted transition-colors`
  - Icon: `<ChevronDown className={"w-5 h-5 text-cream-muted/60 transform transition-transform duration-200 shrink-0 ml-4 " + (isOpen ? "rotate-180 text-cream-light" : "")} />`
  - Answer Panel: `pt-3 text-sm text-cream-muted/80 leading-relaxed font-sans animate-fadeIn`
- **FAQ Items:**
  1. **Q:** *"Where do we receive our login credentials?"*
     - **A:** *"User accounts are pre-generated by organizers. Team IDs and temporary passcodes are distributed physically at the venue before the market opens."*
  2. **Q:** *"What happens if our device disconnects?"*
     - **A:** *"Portfolio state and balances are synchronized continuously, so reconnecting immediately restores your latest portfolio state with zero lost inventory."*
  3. **Q:** *"Can multiple team members log in simultaneously?"*
     - **A:** *"Multiple sessions can view the team portfolio, but teams should designate one primary operator to avoid duplicate orders during volatile moments."*

---

### 4.13 Call-to-Action Section (`CtaSection.tsx`)

- **Section Attributes:** `className="relative w-full py-28 md:py-36 px-5 sm:px-8 lg:px-12 border-t border-border-brown/40 overflow-hidden flex flex-col items-center justify-center text-center"`
- **Atmospheric Background Curve:**
  - SVG element: `absolute inset-0 pointer-events-none flex items-center justify-center opacity-20`
  - Classes: `w-full max-w-5xl h-72 animate-curve-drift`
  - Path: `<path className="animate-market-flow" d="M 0 180 C 150 120, 300 240, 450 130 C 600 20, 700 210, 800 120" stroke="#eae0d3" strokeDasharray="6 4" strokeWidth="1.2" />`
- **Center Glow:**
  - `<div className="absolute w-[450px] h-[300px] rounded-full bg-cream-muted filter blur-[140px] opacity-[0.035] pointer-events-none" />`
- **Content Container:** `relative max-w-2xl mx-auto flex flex-col items-center`
- **Headline (H2):**
  - Text: **"Ready for the Opening Bell?"**
  - Classes: `font-serif text-3xl sm:text-4xl md:text-5xl text-cream-light font-normal tracking-tight mb-4`
- **Subtitle:**
  - Text: *"Your capital is equal. Your decisions aren't."*
  - Classes: `font-sans text-base sm:text-lg text-cream-muted/90 font-normal mb-8`
- **Button:**
  - Component: `<SpinningBorderButton href="/login" variant="primary" size="lg">`
  - Children: `<span>Enter the Trading Floor</span>` + `<ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />`

---

### 4.14 Editorial Footer (`Footer.tsx`)

- **Footer Element:** `w-full bg-maroon-base border-t border-border-brown/50 py-12 px-5 sm:px-8 lg:px-12 text-cream-muted/80 text-xs`
- **Inner Container:** `max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6`
- **Left Branding:**
  - Container: `flex items-center gap-2.5`
  - Forum Name: `<span className="font-serif text-sm text-cream-light font-normal">Investor Forum</span>`
  - Divider: `<span className="text-cream-muted/40">|</span>`
  - Tag: `<span className="font-mono text-[11px] text-cream-muted/70">Intra-School Edition 2026</span>`
- **Center Navigation:**
  - Container: `flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-sans text-xs`
  - Links: `About` (`#about`), `Sectors` (`#sectors`), `Rules` (`#rules`), `Timeline` (`#timeline`), `FAQs` (`#faqs`)
  - Separator: `<span className="text-border-brown">·</span>`
- **Right Institutional Credit:**
  - Container: `flex flex-col sm:flex-row items-center gap-1.5 text-center md:text-right font-sans`
  - Sponsor: `<span className="text-cream-light font-medium">School Tech &amp; Planning Society</span>`
  - Dash: `<span className="hidden sm:inline text-cream-muted/40">—</span>`
  - Help note: `<span className="text-cream-muted/60">Need assistance? Visit the Admin Command Table at the venue.</span>`

---

## 5. Page Assembly & Layout Blueprint

### 5.1 Root Layout (`src/app/layout.tsx`)
```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Investor Forum: Intra-School Edition 2026",
  description: "An intra-school stock trading simulation where teams react to breaking market news, manage virtual capital, and compete to maximize net worth.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-maroon-base text-cream-light font-sans antialiased selection:bg-accent-green selection:text-cream-light min-h-screen">
        {children}
      </body>
    </html>
  );
}
```

### 5.2 Home Page (`src/app/page.tsx`)
```tsx
import React from "react";
import BackgroundAmbient from "@/components/BackgroundAmbient";
import SpotlightCursor from "@/components/ui/spotlight-cursor";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ChallengeSection from "@/components/ChallengeSection";
import MarketSection from "@/components/MarketSection";
import RulesSection from "@/components/RulesSection";
import TimelineSection from "@/components/TimelineSection";
import FaqSection from "@/components/FaqSection";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-maroon-base text-cream-light selection:bg-accent-green selection:text-cream-light overflow-x-hidden">
      {/* 1. Subtle Living Background (TopologyField, Grid, Ambient glows) */}
      <BackgroundAmbient />

      {/* 2. Global Spotlight Cursor layer (illuminates area around cursor, z-[2] pointer-events-none) */}
      <SpotlightCursor />

      {/* 3. Sticky Navbar (z-50) */}
      <Navbar />

      {/* 4. Main Content Flow (z-10) */}
      <main className="relative z-10 flex flex-col w-full">
        {/* Hero */}
        <Hero />

        {/* The Challenge */}
        <ChallengeSection />

        {/* The Market / Sectors */}
        <MarketSection />

        {/* The Rules */}
        <RulesSection />

        {/* The Day / Timeline */}
        <TimelineSection />

        {/* FAQ */}
        <FaqSection />

        {/* Final CTA */}
        <CtaSection />
      </main>

      {/* 5. Footer */}
      <Footer />
    </div>
  );
}
```

---

## 6. Complete Step-by-Step Recreation Guide

When another agent is tasked with building this homepage from scratch, execute in this exact sequence:

1. **Install Dependencies:**
   ```bash
   npm install next react react-dom clsx tailwind-merge lucide-react @radix-ui/react-progress radix-ui
   npm install -D tailwindcss postcss autoprefixer typescript @types/node @types/react @types/react-dom
   ```
2. **Setup Tailwind & PostCSS:**
   - Create `postcss.config.js`:
     ```js
     module.exports = {
       plugins: {
         tailwindcss: {},
         autoprefixer: {},
       },
     };
     ```
   - Copy the complete `tailwind.config.ts` from [Section 2.3](#23-tailwind-configuration).
3. **Setup Global Styles:**
   - Create `src/app/globals.css` using the code from [Section 2.4](#24-global-css--keyframes).
4. **Create Core Utilities:**
   - Create `src/lib/utils.ts` with the `cn` function from [Section 2.5](#25-helper-utilities).
5. **Create UI Components (`src/components/ui/`):**
   - Create `spotlight-cursor.tsx` with smooth canvas lerp and coarse-pointer checks.
   - Create `spinning-border-button.tsx` with conic gradient beams and link handling.
   - Create `topology-field.tsx` with the Three.js sandboxed iframe document.
6. **Create Visual Assets & Structure:**
   - Create `src/components/Logo.tsx` with the exact SVG vector paths.
   - Create `src/components/BackgroundAmbient.tsx` combining TopologyField, `.bg-grid-pattern`, and the 3 ambient blurred orbs.
   - Create `src/components/Navbar.tsx` with the glassmorphic pill header and mobile drawer.
   - Create `src/components/Footer.tsx` with the copyright and school tech society credits.
7. **Create Main Content Sections:**
   - Create `src/components/Hero.tsx` with the drifting SVG market curves, headline, CTAs, and ticker ribbon.
   - Create `src/components/ChallengeSection.tsx` with the 3 feature cards and latency/allocation/preservation metrics.
   - Create `src/components/MarketSection.tsx` with the 4 sector cards and SVG sparklines.
   - Create `src/components/RulesSection.tsx` with the valuation equation box and 5-item accordion.
   - Create `src/components/TimelineSection.tsx` with the 5 numbered stages and active pulse indicators.
   - Create `src/components/FaqSection.tsx` with the expandable questions.
   - Create `src/components/CtaSection.tsx` with the final opening bell CTA.
8. **Assemble App Entrypoints:**
   - Create `src/app/layout.tsx` with dark metadata and font definitions.
   - Create `src/app/page.tsx` with the exact layer hierarchy.
9. **Verification Check:**
   - Run `npm run dev` or `npm run build`.
   - Ensure horizontal scrolling is zero (`overflow-x: hidden`).
   - Check that mouse movement triggers the champagne spotlight behind text without capturing click events (`pointer-events-none`).
   - Test button hover states to confirm the conic spinning border illuminates properly.
   - Check accordion toggles in the Rules and FAQ sections.
