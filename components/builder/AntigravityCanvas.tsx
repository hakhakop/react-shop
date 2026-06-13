"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface AntigravityCanvasProps {
  speed?: number;
  particleCount?: number;
  color?: string;
  gridDensity?: "compact" | "normal" | "sparse";
  interactive?: boolean;
  showGrid?: boolean;
  showParticles?: boolean;
  gridMoveSpeed?: number;
  glowIntensity?: number;
  interactionScope?: "section" | "global" | "none";
  visualMode?: "full" | "transparent-grid" | "no-grid" | "lines-only";
  effectType?: string;
}

function hexToRgba(hex: string, alpha: number): string {
  if (!hex) return `rgba(99, 102, 241, ${alpha})`;
  if (hex.startsWith("rgb")) {
    return hex;
  }
  let c = hex.replace("#", "");
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  if (c.length !== 6) {
    return `rgba(99, 102, 241, ${alpha})`;
  }
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// A fast, lightweight 3D Simplex Noise implementation for legacy 2D loops
class SimplexNoise {
  private grad3 = [
    [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
    [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
    [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
  ];
  private p: number[];
  private perm: number[];
  private permMod12: number[];

  constructor() {
    this.p = new Array(256);
    for (let i = 0; i < 256; i++) {
      this.p[i] = Math.floor(Math.random() * 256);
    }
    this.perm = new Array(512);
    this.permMod12 = new Array(512);
    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
      this.permMod12[i] = (this.perm[i] % 12);
    }
  }

  private dot(g: number[], x: number, y: number, z: number) {
    return g[0] * x + g[1] * y + g[2] * z;
  }

  public noise(xin: number, yin: number, zin: number): number {
    let n0 = 0, n1 = 0, n2 = 0, n3 = 0;
    const F3 = 1.0 / 3.0;
    const G3 = 1.0 / 6.0;
    const s = (xin + yin + zin) * F3;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const k = Math.floor(zin + s);
    const t = (i + j + k) * G3;
    const X0 = i - t;
    const Y0 = j - t;
    const Z0 = k - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;
    const z0 = zin - Z0;
    let i1, j1, k1;
    let i2, j2, k2;
    if (x0 >= y0) {
      if (y0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; }
      else if (x0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; }
      else { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; }
    } else {
      if (y0 < z0) { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; }
      else if (x0 < z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; }
      else { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; }
    }
    const x1 = x0 - i1 + G3;
    const y1 = y0 - j1 + G3;
    const z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2.0 * G3;
    const y2 = y0 - j2 + 2.0 * G3;
    const z2 = z0 - k2 + 2.0 * G3;
    const x3 = x0 - 1.0 + 3.0 * G3;
    const y3 = y0 - 1.0 + 3.0 * G3;
    const z3 = z0 - 1.0 + 3.0 * G3;
    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;
    const gi0 = this.permMod12[ii + this.perm[jj + this.perm[kk]]];
    const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]];
    const gi2 = this.permMod12[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]];
    const gi3 = this.permMod12[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]];
    let t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
    if (t0 >= 0) {
      t0 *= t0;
      n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0, z0);
    }
    let t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
    if (t1 >= 0) {
      t1 *= t1;
      n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1, z1);
    }
    let t2_ = 0.6 - x2*x2 - y2*y2 - z2*z2;
    if (t2_ >= 0) {
      t2_ *= t2_;
      n2 = t2_ * t2_ * this.dot(this.grad3[gi2], x2, y2, z2);
    }
    let t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
    if (t3 >= 0) {
      t3 *= t3;
      n3 = t3 * t3 * this.dot(this.grad3[gi3], x3, y3, z3);
    }
    return 32.0 * (n0 + n1 + n2 + n3);
  }
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function lerp(start: number, end: number, amt: number): number {
  return (1 - amt) * start + amt * end;
}

class ValueNoise {
  private MAX_VERTICES = 256;
  private MAX_VERTICES_MASK = 255;
  private amplitude = 1;
  private scale = 1;
  private r: number[] = [];

  constructor() {
    for (let i = 0; i < this.MAX_VERTICES; ++i) {
      this.r.push(Math.random());
    }
  }

  getVal(e: number): number {
    const t = e * this.scale;
    const i = Math.floor(t);
    const r = t - i;
    const o = r * r * (3 - 2 * r);
    const s = i % this.MAX_VERTICES_MASK;
    const a = (s + 1) % this.MAX_VERTICES_MASK;
    const l = this.lerp(this.r[s], this.r[a], o);
    return l * this.amplitude;
  }

  private lerp(e: number, t: number, i: number): number {
    return e * (1 - i) + t * i;
  }
}

// Uniform square Poisson-disk coordinate generator for Three.js particles
function generateSquarePoissonPoints(density: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const spacing = 10.0 - (8.0 * density / 300.0); // remap density [0, 300] to [10, 2]
  
  const gridSize = Math.ceil(500 / spacing);
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const baseX = -250 + c * spacing + spacing / 2;
      const baseY = -250 + r * spacing + spacing / 2;
      
      const x = baseX + (Math.random() - 0.5) * spacing * 0.5;
      const y = baseY + (Math.random() - 0.5) * spacing * 0.5;
      
      if (x >= -250 && x <= 250 && y >= -250 && y <= 250) {
        points.push({ x, y });
      }
    }
  }
  return points;
}

// 2D Legacy concentric circular coordinate generator
function generatePoissonDiskPoints(countTarget: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const numRings = Math.round(Math.sqrt(countTarget) * 0.8) || 1;
  
  for (let ring = 0; ring < numRings; ring++) {
    const r = (ring + 0.5) / numRings;
    const pointsInRing = Math.round(countTarget * (2 * r) / numRings) || 1;
    
    for (let i = 0; i < pointsInRing; i++) {
      const angle = (i / pointsInRing) * Math.PI * 2 + Math.random() * 0.5;
      const jitterR = r + (Math.random() - 0.5) * (0.5 / numRings);
      const clampedR = Math.max(0, Math.min(1.0, jitterR));
      
      points.push({
        x: Math.cos(angle) * clampedR,
        y: Math.sin(angle) * clampedR
      });
    }
  }
  
  while (points.length < countTarget) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random());
    points.push({
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r
    });
  }
  
  for (let i = points.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = points[i];
    points[i] = points[j];
    points[j] = temp;
  }
  
  return points.slice(0, countTarget);
}

// Exact GLSL Simplex Noise String from Ashima Arts (Ian McEwan)
const GLSL_NOISE = `
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  float permute(float x){return floor(mod(((x*34.0)+1.0)*x, 289.0));}

  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
  float taylorInvSqrt(float r){return 1.79284291400159 - 0.85373472095314 * r;}

  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
            -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
      dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float snoise(vec3 v){
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

    i = mod(i, 289.0 );
    vec4 p = permute( permute( permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    float n_ = 1.0/7.0;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                  dot(p2,x2), dot(p3,x3) ) );
  }
`;

export default function AntigravityCanvas({
  speed = 1.0,
  particleCount = 40,
  color = "#6366f1",
  gridDensity = "normal",
  interactive = true,
  showGrid = true,
  showParticles = true,
  gridMoveSpeed = 1.0,
  glowIntensity = 0.4,
  interactionScope = "section",
  visualMode = "full",
  effectType = "antigravity",
}: AntigravityCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000, active: false });

  const resolvedEffectType = effectType || "antigravity";
  const isAntigravityMode = resolvedEffectType === "antigravity";
  const isAntigravity2Mode = resolvedEffectType === "antigravity2";
  const isWebGLMode = isAntigravity2Mode || resolvedEffectType === "webgl_waves" || resolvedEffectType === "webgl_flowfield" || resolvedEffectType === "webgl_cybergrid" || resolvedEffectType === "webgl_fluid";
  const actualShowGrid = isAntigravityMode && (visualMode === "no-grid" || visualMode === "lines-only" ? false : showGrid);
  const actualShowParticles = (visualMode === "lines-only" || resolvedEffectType === "waves" || resolvedEffectType === "aurora") ? false : showParticles;
  const actualInteractive = (interactionScope === "none") ? false : interactive;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId: number;

    // -------------------------------------------------------------------------
    // WEBGL RENDER SYSTEM (Antigravity 2 Exact Replication)
    // -------------------------------------------------------------------------
    if (isWebGLMode) {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: true,
        stencil: false,
        precision: "highp",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
      camera.position.z = 3.1;

      const clock = new THREE.Clock();

      const ringPos = new THREE.Vector2(0, 0);
      const cursorPos = new THREE.Vector2(0, 0);
      const intersectionPoint = new THREE.Vector3(0, 0, 0);
      let isIntersecting = false;
      let mouseIsOver = false;

      const raycastPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(12.5, 12.5),
        new THREE.MeshBasicMaterial({ color: 0xff0000, visible: false, side: THREE.DoubleSide })
      );
      scene.add(raycastPlane);

      const raycaster = new THREE.Raycaster();

      const isDark = canvas.closest(".shop-builder-section--scheme-dark") || 
                     canvas.closest(".dark") || 
                     document.documentElement.getAttribute("data-theme") === "dark";

      const resolvedColor = color || (isDark ? "#7189ff" : "#2c64ed");

      // Antigravity 2 specific resources
      let valueNoise: ValueNoise | null = null;
      let posTex: THREE.DataTexture | null = null;
      let rt1: THREE.WebGLRenderTarget | null = null;
      let rt2: THREE.WebGLRenderTarget | null = null;
      let simMaterial: THREE.ShaderMaterial | null = null;
      let simGeometry: THREE.PlaneGeometry | null = null;
      let simMesh: THREE.Mesh | null = null;
      let simScene: THREE.Scene | null = null;
      let simCamera: THREE.OrthographicCamera | null = null;
      let pointsGeometry: THREE.BufferGeometry | null = null;
      let pointsMaterial: THREE.ShaderMaterial | null = null;
      let pointsMesh: THREE.Points | null = null;
      let everRendered = false;

      // WebGL Waves specific resources
      let wavesGeometry: THREE.PlaneGeometry | null = null;
      let wavesMaterial: THREE.ShaderMaterial | null = null;
      let wavesMesh: THREE.Mesh | null = null;

      // WebGL Flowfield specific resources
      let flowGeometry: THREE.BufferGeometry | null = null;
      let flowMaterial: THREE.ShaderMaterial | null = null;
      let flowMesh: THREE.Points | null = null;
      const flowCount = particleCount ? Math.min(particleCount * 40, 10000) : 4000;

      // WebGL Cyber Grid specific resources
      let cyberGeometry: THREE.PlaneGeometry | null = null;
      let cyberMaterial: THREE.ShaderMaterial | null = null;
      let cyberMesh: THREE.Mesh | null = null;

      // WebGL Fluid specific resources
      let fluidGeometry: THREE.PlaneGeometry | null = null;
      let fluidMaterial: THREE.ShaderMaterial | null = null;
      let fluidMesh: THREE.Mesh | null = null;

      // -------------------------------------------------------------------------
      // Initialize effect-specific objects
      // -------------------------------------------------------------------------
      if (isAntigravity2Mode) {
        valueNoise = new ValueNoise();

        let densityVal = 200;
        if (gridDensity === "compact") densityVal = 300;
        else if (gridDensity === "sparse") densityVal = 100;

        const particlesScale = 0.75;
        const ringDisplacement = 0.15;

        const pointsData = generateSquarePoissonPoints(densityVal);
        const count = pointsData.length;
        const size = 256;
        const length = size * size;

        const posTexData = new Float32Array(length * 4);
        for (let i = 0; i < count; i++) {
          const r = i * 4;
          posTexData[r + 0] = pointsData[i].x * (1 / 250);
          posTexData[r + 1] = pointsData[i].y * (1 / 250);
          posTexData[r + 2] = 0;
          posTexData[r + 3] = 0;
        }

        posTex = new THREE.DataTexture(posTexData, size, size, THREE.RGBAFormat, THREE.FloatType);
        posTex.needsUpdate = true;

        rt1 = new THREE.WebGLRenderTarget(size, size, {
          wrapS: THREE.ClampToEdgeWrapping,
          wrapT: THREE.ClampToEdgeWrapping,
          minFilter: THREE.NearestFilter,
          magFilter: THREE.NearestFilter,
          format: THREE.RGBAFormat,
          type: THREE.FloatType,
          depthBuffer: false,
          stencilBuffer: false,
        });
        rt2 = rt1.clone();

        renderer.setRenderTarget(rt1);
        renderer.setClearColor(0, 0);
        renderer.clear();
        renderer.setRenderTarget(rt2);
        renderer.setClearColor(0, 0);
        renderer.clear();
        renderer.setRenderTarget(null);

        simScene = new THREE.Scene();
        simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        const simVertexShader = `
          void main() {
            gl_Position = vec4(position, 1.0);
          }
        `;

        const simFragmentShader = `
          precision highp float;
          uniform sampler2D uPosition;
          uniform sampler2D uPosRefs;
          uniform vec2 uRingPos;
          uniform float uTime;
          uniform float uDeltaTime;
          uniform float uRingRadius;
          uniform float uRingWidth;
          uniform float uRingWidth2;
          uniform float uRingDisplacement;

          ${GLSL_NOISE}

          void main() {
            vec2 simTexCoords = gl_FragCoord.xy / vec2(256.0, 256.0);
            vec4 pFrame = texture2D(uPosition, simTexCoords);

            float scale = pFrame.z;
            float velocity = pFrame.w;
            vec2 refPos = texture2D(uPosRefs, simTexCoords).xy;

            float time = uTime * 0.5;
            vec2 curentPos = refPos;

            vec2 pos = pFrame.xy;
            pos *= 0.8;

            float dist = distance(curentPos.xy, uRingPos);
            float noise0 = snoise(vec3(curentPos.xy * 0.2 + vec2(18.4924, 72.9744), time * 0.5));
            float dist1 = distance(curentPos.xy + (noise0 * 0.005), uRingPos);

            float t = smoothstep(uRingRadius - (uRingWidth * 2.0), uRingRadius, dist) - smoothstep(uRingRadius, uRingRadius + uRingWidth, dist1);
            float t2 = smoothstep(uRingRadius - (uRingWidth2 * 2.0), uRingRadius, dist) - smoothstep(uRingRadius, uRingRadius + uRingWidth2, dist1);
            float t3 = smoothstep(uRingRadius + uRingWidth2, uRingRadius, dist);

            t = pow(t, 2.0);
            t2 = pow(t2, 3.0);

            t += t2 * 3.0;
            t += t3 * 0.4;
            t += snoise(vec3(curentPos.xy * 30.0 + vec2(11.4924, 12.9744), time * 0.5)) * t3 * 0.5;

            float nS = snoise(vec3(curentPos.xy * 2.0 + vec2(18.4924, 72.9744), time * 0.5));
            t += pow((nS + 1.5) * 0.5, 2.0) * 0.6;

            // Mid scale noise
            float noise1 = snoise(vec3(curentPos.xy * 4.0 + vec2(88.494, 32.4397), time * 0.35));
            float noise2 = snoise(vec3(curentPos.xy * 4.0 + vec2(50.904, 120.947), time * 0.35));

            // Close scale noise
            float noise3 = snoise(vec3(curentPos.xy * 20.0 + vec2(18.4924, 72.9744), time * 0.5));
            float noise4 = snoise(vec3(curentPos.xy * 20.0 + vec2(50.904, 120.947), time * 0.5));

            vec2 disp = vec2(noise1, noise2) * 0.03;
            disp += vec2(noise3, noise4) * 0.005;

            // Sin wave
            disp.x += sin((refPos.x * 20.0) + (time * 4.0)) * 0.02 * clamp(dist, 0.0, 1.0);
            disp.y += cos((refPos.y * 20.0) + (time * 3.0)) * 0.02 * clamp(dist, 0.0, 1.0);

            pos -= (uRingPos - (curentPos + disp)) * pow(t2, 0.75) * uRingDisplacement;

            // Add scale
            float scaleDiff = t - scale;
            scaleDiff *= 0.2;
            scale += scaleDiff;

            // Final position
            vec2 finalPos = curentPos + disp + (pos * 0.25);

            velocity *= 0.5;
            velocity += scale * 0.25;

            gl_FragColor = vec4(finalPos, scale, velocity);
          }
        `;

        simMaterial = new THREE.ShaderMaterial({
          uniforms: {
            uPosition: { value: posTex },
            uPosRefs: { value: posTex },
            uRingPos: { value: ringPos },
            uRingRadius: { value: 0.2 },
            uDeltaTime: { value: 0 },
            uRingWidth: { value: 0.15 },
            uRingWidth2: { value: 0.05 },
            uRingDisplacement: { value: ringDisplacement },
            uTime: { value: 0 },
          },
          vertexShader: simVertexShader,
          fragmentShader: simFragmentShader,
        });

        simGeometry = new THREE.PlaneGeometry(2, 2);
        simMesh = new THREE.Mesh(simGeometry, simMaterial);
        simScene.add(simMesh);

        pointsGeometry = new THREE.BufferGeometry();
        const posAttr = new Float32Array(count * 3);
        const uvAttr = new Float32Array(count * 2);
        const seedsAttr = new Float32Array(count * 4);

        for (let i = 0; i < count; i++) {
          const uCoord = (i % size) / size;
          const vCoord = Math.floor(i / size) / size;
          uvAttr[i * 2 + 0] = uCoord;
          uvAttr[i * 2 + 1] = vCoord;
          seedsAttr[i * 4 + 0] = Math.random();
          seedsAttr[i * 4 + 1] = Math.random();
          seedsAttr[i * 4 + 2] = Math.random();
          seedsAttr[i * 4 + 3] = Math.random();
        }

        pointsGeometry.setAttribute("position", new THREE.BufferAttribute(posAttr, 3));
        pointsGeometry.setAttribute("uv", new THREE.BufferAttribute(uvAttr, 2));
        pointsGeometry.setAttribute("seeds", new THREE.BufferAttribute(seedsAttr, 4));

        const color1Val = resolvedColor;
        const color2Val = color ? color : (isDark ? "#3074f9" : "#f84242");
        const color3Val = color ? (isDark ? "#000000" : "#ffffff") : (isDark ? "#000000" : "#ffcf03");

        const renderVertexShader = `
          precision highp float;
          attribute vec4 seeds;
          uniform sampler2D uPosition;
          uniform float uTime;
          uniform float uParticleScale;
          uniform float uPixelRatio;
          uniform int uColorScheme;

          varying vec4 vSeeds;
          varying float vVelocity;
          varying vec2 vLocalPos;
          varying vec2 vScreenPos;
          varying float vScale;

          void main() {
            vec4 pos = texture2D(uPosition, uv);
            vSeeds = seeds;

            vVelocity = pos.w;
            vScale = pos.z;
            vLocalPos = pos.xy;
            vec4 viewSpace = modelViewMatrix * vec4(vec3(pos.xy, 0.0), 1.0);

            gl_Position = projectionMatrix * viewSpace;
            vScreenPos = gl_Position.xy;

            gl_PointSize = ((vScale * 7.0) * (uPixelRatio * 0.5) * uParticleScale);
          }
        `;

        const renderFragmentShader = `
          precision highp float;

          varying vec4 vSeeds;
          varying vec2 vScreenPos;
          varying vec2 vLocalPos;
          varying float vScale;
          varying float vVelocity;

          uniform vec3 uColor1;
          uniform vec3 uColor2;
          uniform vec3 uColor3;

          uniform vec2 uRingPos;
          uniform vec2 uRez;

          uniform float uAlpha;
          uniform float uTime;

          uniform int uColorScheme;

          ${GLSL_NOISE}

          #define PI 3.1415926535897932384626433832795

          float sdRoundBox( in vec2 p, in vec2 b, in vec4 r ) {
            r.xy = (p.x > 0.0) ? r.xy : r.zw;
            r.x  = (p.y > 0.0) ? r.x  : r.y;
            vec2 q = abs(p) - b + r.x;
            return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r.x;
          }

          vec2 rotate(vec2 v, float a) {
            float s = sin(a);
            float c = cos(a);
            mat2 m = mat2(c, s, -s, c);
            return m * v;
          }

          void main() {
            float uBorderSize = 0.2;
            vec2 center = vec2(0.48, 0.4);
            float ratio = uRez.x / uRez.y;

            // Noise
            float noiseAngle = snoise(vec3(vLocalPos * 10.0 + vec2(18.4924, 72.9744), uTime * 0.85));
            float noiseColor = snoise(vec3(vLocalPos * 2.0 + vec2(74.664, 91.556), uTime * 0.5));
            noiseColor = (noiseColor + 1.0) * 0.5;

            // get angle between
            float angle = atan(vLocalPos.y - uRingPos.y, vLocalPos.x - uRingPos.x);

            vec2 uv = gl_PointCoord.xy;
            uv -= vec2(0.5);
            uv.y *= -1.0;
            uv = rotate(uv, -angle + (noiseAngle * 0.5));

            vec2 tuv = vScreenPos;
            tuv = rotate(tuv, uTime * 1.0);
            tuv.y *= 1.0 / ratio;
            tuv += 0.5;

            float h = 0.8;
            float progress = smoothstep(0.0, 0.75, pow(noiseColor, 2.0));
            vec3 col = mix(mix(uColor1, uColor2, progress / h), mix(uColor2, uColor3, (progress - h) / (1.0 - h)), step(h, progress));
            vec3 color = col;

            float dist = sqrt(dot(uv, uv));

            float dr = 0.5;
            float t = smoothstep(dr + (uBorderSize + 0.0001), dr - uBorderSize, dist);
            t = clamp(t, 0.0, 1.0);

            float rounded = sdRoundBox(uv, vec2(0.5, 0.2), vec4(0.25));
            rounded = smoothstep(0.1, 0.0, rounded);

            float a = uAlpha * rounded * smoothstep(0.1, 0.2, vScale);

            if (a < 0.01) {
              discard;
            }

            color = clamp(color, 0.0, 1.0);
            color = mix(color, color * clamp(vVelocity, 0.0, 1.0), float(uColorScheme));

            gl_FragColor = vec4(color, clamp(a, 0.0, 1.0));
          }
        `;

        pointsMaterial = new THREE.ShaderMaterial({
          uniforms: {
            uPosition: { value: posTex },
            uTime: { value: 0 },
            uColor1: { value: new THREE.Color(color1Val) },
            uColor2: { value: new THREE.Color(color2Val) },
            uColor3: { value: new THREE.Color(color3Val) },
            uAlpha: { value: glowIntensity },
            uRingPos: { value: ringPos },
            uRez: { value: new THREE.Vector2(width, height) },
            uParticleScale: { value: width / window.devicePixelRatio / 2000 * particlesScale },
            uPixelRatio: { value: window.devicePixelRatio },
            uColorScheme: { value: isDark ? 0 : 1 },
          },
          vertexShader: renderVertexShader,
          fragmentShader: renderFragmentShader,
          transparent: true,
          depthTest: false,
          depthWrite: false,
        });

        pointsMesh = new THREE.Points(pointsGeometry, pointsMaterial);
        pointsMesh.position.set(0, 0, 0);
        pointsMesh.scale.set(5, 5, 5);
        scene.add(pointsMesh);
      } else if (resolvedEffectType === "webgl_waves") {
        wavesGeometry = new THREE.PlaneGeometry(8, 8, 70, 70);

        const wavesVertexShader = `
          precision highp float;
          uniform float uTime;
          uniform vec2 uMousePos;
          uniform float uMouseActive;
          varying vec2 vUv;
          varying float vHeight;

          ${GLSL_NOISE}

          void main() {
            vUv = uv;
            vec3 pos = position;

            float h = snoise(vec3(pos.xy * 0.5, uTime * 0.18)) * 0.5;
            h += snoise(vec3(pos.xy * 1.2, uTime * 0.3)) * 0.15;
            
            float dist = distance(pos.xy, uMousePos * 3.5);
            float force = smoothstep(1.8, 0.0, dist) * 0.6 * uMouseActive;
            h += force;

            pos.z += h;
            vHeight = h;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `;

        const wavesFragmentShader = `
          precision highp float;
          uniform vec3 uColor;
          uniform float uAlpha;
          varying vec2 vUv;
          varying float vHeight;

          void main() {
            float edgeFade = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x) *
                             smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.85, vUv.y);

            vec3 col = mix(uColor * 0.6, vec3(1.0), clamp((vHeight + 0.4) * 0.5, 0.0, 1.0));
            
            gl_FragColor = vec4(col, uAlpha * edgeFade * 0.85);
          }
        `;

        wavesMaterial = new THREE.ShaderMaterial({
          uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(resolvedColor) },
            uAlpha: { value: glowIntensity },
            uMousePos: { value: new THREE.Vector2(0, 0) },
            uMouseActive: { value: 0 },
          },
          vertexShader: wavesVertexShader,
          fragmentShader: wavesFragmentShader,
          transparent: true,
          wireframe: true,
          depthTest: true,
          depthWrite: false,
        });

        wavesMesh = new THREE.Mesh(wavesGeometry, wavesMaterial);
        wavesMesh.rotation.x = -Math.PI / 3.0;
        wavesMesh.position.set(0, -0.6, 0);
        scene.add(wavesMesh);
      } else if (resolvedEffectType === "webgl_flowfield") {
        flowGeometry = new THREE.BufferGeometry();
        
        const posAttr = new Float32Array(flowCount * 3);
        const seedsAttr = new Float32Array(flowCount * 4);
        
        for (let i = 0; i < flowCount; i++) {
          posAttr[i * 3 + 0] = (Math.random() - 0.5) * 8.0;
          posAttr[i * 3 + 1] = (Math.random() - 0.5) * 6.0;
          posAttr[i * 3 + 2] = (Math.random() - 0.5) * 4.0;
          
          seedsAttr[i * 4 + 0] = Math.random();
          seedsAttr[i * 4 + 1] = Math.random();
          seedsAttr[i * 4 + 2] = Math.random();
          seedsAttr[i * 4 + 3] = Math.random();
        }

        flowGeometry.setAttribute("position", new THREE.BufferAttribute(posAttr, 3));
        flowGeometry.setAttribute("seeds", new THREE.BufferAttribute(seedsAttr, 4));

        const flowVertexShader = `
          precision highp float;
          attribute vec4 seeds;
          uniform float uTime;
          uniform float uSpeed;
          uniform float uPixelRatio;
          uniform vec2 uMousePos;
          uniform float uMouseActive;
          varying vec4 vSeeds;
          varying float vDepth;

          ${GLSL_NOISE}

          void main() {
            vSeeds = seeds;
            vec3 pos = position;

            float flowTime = uTime * uSpeed * 0.12 + seeds.x * 30.0;
            pos.y += mod(flowTime, 8.0) - 4.0;

            float noiseX = snoise(vec3(pos.xy * 0.4, uTime * 0.08 + seeds.z * 10.0)) * 0.6;
            float noiseZ = snoise(vec3(pos.xy * 0.4 + vec2(100.0), uTime * 0.08 + seeds.w * 10.0)) * 0.6;

            pos.x += noiseX;
            pos.z += noiseZ;

            vec3 mouse3D = vec3(uMousePos * 2.8, 0.0);
            vec3 diff = pos - mouse3D;
            float dist = length(diff);
            if (dist < 1.8 && uMouseActive > 0.5) {
              pos += normalize(diff) * (1.8 - dist) * 0.7;
            }

            vec4 viewSpace = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * viewSpace;
            
            vDepth = -viewSpace.z;
            gl_PointSize = (seeds.y * 3.5 + 1.5) * uPixelRatio * (2.0 / vDepth);
          }
        `;

        const flowFragmentShader = `
          precision highp float;
          uniform vec3 uColor;
          uniform float uAlpha;
          varying vec4 vSeeds;
          varying float vDepth;

          void main() {
            vec2 p = gl_PointCoord - vec2(0.5);
            float dist = length(p);
            if (dist > 0.5) discard;

            float intensity = smoothstep(0.5, 0.0, dist);
            vec3 col = mix(uColor, vec3(1.0), smoothstep(0.35, 0.0, dist) * 0.4);

            float depthFade = smoothstep(6.0, 1.0, vDepth);
            
            gl_FragColor = vec4(col, uAlpha * intensity * depthFade);
          }
        `;

        flowMaterial = new THREE.ShaderMaterial({
          uniforms: {
            uTime: { value: 0 },
            uSpeed: { value: speed },
            uPixelRatio: { value: window.devicePixelRatio },
            uColor: { value: new THREE.Color(resolvedColor) },
            uAlpha: { value: glowIntensity },
            uMousePos: { value: new THREE.Vector2(0, 0) },
            uMouseActive: { value: 0 },
          },
          vertexShader: flowVertexShader,
          fragmentShader: flowFragmentShader,
          transparent: true,
          depthTest: false,
          depthWrite: false,
        });

        flowMesh = new THREE.Points(flowGeometry, flowMaterial);
        scene.add(flowMesh);
      } else if (resolvedEffectType === "webgl_cybergrid") {
        cyberGeometry = new THREE.PlaneGeometry(16, 16, 50, 50);

        const cyberVertexShader = `
          precision highp float;
          uniform vec2 uMousePos;
          uniform float uMouseActive;
          varying vec2 vUv;
          varying float vWarp;

          void main() {
            vUv = uv;
            vec3 pos = position;

            vec3 mouse3D = vec3(uMousePos * 4.5, 0.0);
            float dist = distance(pos.xy, mouse3D.xy);
            float warp = smoothstep(2.2, 0.0, dist) * 0.8 * uMouseActive;
            pos.z -= warp;
            vWarp = warp;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `;

        const cyberFragmentShader = `
          precision highp float;
          uniform float uTime;
          uniform float uSpeed;
          uniform vec3 uColor;
          uniform float uAlpha;
          varying vec2 vUv;
          varying float vWarp;

          void main() {
            vec2 gridUv = vUv;
            gridUv.y += uTime * uSpeed * 0.08;

            vec2 grid = abs(fract(gridUv * 25.0 - 0.5) - 0.5) / (fwidth(gridUv * 25.0) + 0.008);
            float line = min(grid.x, grid.y);
            float intensity = 1.0 - min(line, 1.0);

            vec3 col = mix(uColor, vec3(1.0, 1.0, 1.0), vWarp * 0.5);

            float horizonFade = smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.75, vUv.y) *
                                smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);

            gl_FragColor = vec4(col, intensity * uAlpha * horizonFade * 0.9);
          }
        `;

        cyberMaterial = new THREE.ShaderMaterial({
          uniforms: {
            uTime: { value: 0 },
            uSpeed: { value: speed },
            uColor: { value: new THREE.Color(resolvedColor) },
            uAlpha: { value: glowIntensity },
            uMousePos: { value: new THREE.Vector2(0, 0) },
            uMouseActive: { value: 0 },
          },
          vertexShader: cyberVertexShader,
          fragmentShader: cyberFragmentShader,
          transparent: true,
          depthTest: true,
          depthWrite: false,
        });

        cyberMesh = new THREE.Mesh(cyberGeometry, cyberMaterial);
        cyberMesh.rotation.x = -Math.PI / 2.3;
        cyberMesh.position.set(0, -1.0, 0);
        scene.add(cyberMesh);
      } else if (resolvedEffectType === "webgl_fluid") {
        fluidGeometry = new THREE.PlaneGeometry(2, 2);

        const fluidVertexShader = `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
          }
        `;

        const fluidFragmentShader = `
          precision highp float;
          uniform float uTime;
          uniform float uSpeed;
          uniform vec3 uColor;
          uniform float uAlpha;
          uniform vec2 uMousePos;
          uniform float uMouseActive;
          uniform vec2 uRez;
          varying vec2 vUv;

          ${GLSL_NOISE}

          float pattern( in vec2 p, out vec2 q, out vec2 r, float time ) {
            q.x = snoise( p + vec2(0.0, 0.0) + time * 0.05 );
            q.y = snoise( p + vec2(5.2, 1.3) + time * 0.04 );

            r.x = snoise( p + 4.0 * q + vec2(1.7, 9.2) + time * 0.08 );
            r.y = snoise( p + 4.0 * q + vec2(8.3, 2.8) + time * 0.06 );

            return snoise( p + 4.0 * r );
          }

          void main() {
            vec2 uv = gl_FragCoord.xy / uRez;

            vec2 mousePosUV = (uMousePos + vec2(1.0)) * 0.5;
            float dist = distance(uv, mousePosUV);
            
            float mouseForce = smoothstep(0.4, 0.0, dist) * 0.25 * uMouseActive;
            uv += (uv - mousePosUV) * mouseForce;

            vec2 q, r;
            float f = pattern(uv * 2.8, q, r, uTime * uSpeed * 0.4);

            vec3 colorA = uColor * 0.4;
            vec3 colorB = mix(uColor, vec3(1.0, 1.0, 1.0), f * 0.4);
            vec3 colorC = mix(vec3(0.05, 0.05, 0.2), uColor * 1.5, dot(q, q));

            vec3 col = mix(colorA, colorB, f);
            col = mix(col, colorC, dot(r, r) * 1.4);

            gl_FragColor = vec4(col, uAlpha * (f * 0.75 + 0.25));
          }
        `;

        fluidMaterial = new THREE.ShaderMaterial({
          uniforms: {
            uTime: { value: 0 },
            uSpeed: { value: speed },
            uColor: { value: new THREE.Color(resolvedColor) },
            uAlpha: { value: glowIntensity },
            uMousePos: { value: new THREE.Vector2(0, 0) },
            uMouseActive: { value: 0 },
            uRez: { value: new THREE.Vector2(width, height) },
          },
          vertexShader: fluidVertexShader,
          fragmentShader: fluidFragmentShader,
          transparent: true,
          depthTest: false,
          depthWrite: false,
        });

        fluidMesh = new THREE.Mesh(fluidGeometry, fluidMaterial);
        scene.add(fluidMesh);
      }

      const onWindowResizeWebGL = () => {
        if (!canvas || !renderer || !camera) return;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        
        if (pointsMaterial) {
          pointsMaterial.uniforms.uRez.value.set(w, h);
          const particlesScale = 0.75;
          pointsMaterial.uniforms.uParticleScale.value = w / window.devicePixelRatio / 2000 * particlesScale;
        }
        if (fluidMaterial) {
          fluidMaterial.uniforms.uRez.value.set(w, h);
        }
      };

      window.addEventListener("resize", onWindowResizeWebGL);

      const handleMouseMoveGlobalWebGL = (e: MouseEvent) => {
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const rx = e.clientX - rect.left;
        const ry = e.clientY - rect.top;

        const inside = interactionScope === "global" || (
          rx >= -rect.width * 0.1 && rx <= rect.width * 1.1 &&
          ry >= -rect.height * 0.1 && ry <= rect.height * 1.1
        );

        if (inside && actualInteractive) {
          mouseRef.current.targetX = rx;
          mouseRef.current.targetY = ry;
          mouseIsOver = true;
        } else {
          mouseIsOver = false;
        }
      };

      window.addEventListener("mousemove", handleMouseMoveGlobalWebGL);

      const targetMousePos = new THREE.Vector2(0, 0);
      const currentMousePos = new THREE.Vector2(0, 0);

      const renderWebGL = () => {
        const time = clock.getElapsedTime() * speed;
        const dt = clock.getDelta();

        let tValNoise = 0;
        let iValNoise = 0;
        if (valueNoise) {
          tValNoise = (valueNoise.getVal(time * 0.66 + 94.234) - 0.5) * 2;
          iValNoise = (valueNoise.getVal(time * 0.75 + 21.028) - 0.5) * 2;
        }

        let lerpFactor = 0.01;

        if (mouseIsOver && actualInteractive) {
          const rect = canvas.getBoundingClientRect();
          const mouseX = mouseRef.current.targetX;
          const mouseY = mouseRef.current.targetY;
          const normMouseX = (mouseX / rect.width) * 2 - 1;
          const normMouseY = -(mouseY / rect.height) * 2 + 1;

          raycaster.setFromCamera(new THREE.Vector2(normMouseX, normMouseY), camera);
          const intersects = raycaster.intersectObject(raycastPlane);
          if (intersects.length > 0) {
            intersectionPoint.copy(intersects[0].point);
            isIntersecting = true;
          } else {
            isIntersecting = false;
          }
        } else {
          isIntersecting = false;
        }

        let mouseActiveTarget = 0;
        if (isIntersecting) {
          if (isAntigravity2Mode) {
            cursorPos.set(intersectionPoint.x * 0.175 + tValNoise * 0.1, intersectionPoint.y * 0.175 + iValNoise * 0.1);
            lerpFactor = 0.02;
          } else {
            targetMousePos.set(intersectionPoint.x, intersectionPoint.y);
            mouseActiveTarget = 1.0;
          }
        } else {
          if (isAntigravity2Mode) {
            cursorPos.set(tValNoise * 0.2, iValNoise * 0.1);
            lerpFactor = 0.01;
          } else {
            targetMousePos.set(0, 0);
            mouseActiveTarget = 0.0;
          }
        }

        if (isAntigravity2Mode) {
          ringPos.x += (cursorPos.x - ringPos.x) * lerpFactor;
          ringPos.y += (cursorPos.y - ringPos.y) * lerpFactor;

          if (simMaterial && pointsMaterial) {
            simMaterial.uniforms.uPosition.value = everRendered ? rt1!.texture : posTex!;
            simMaterial.uniforms.uTime.value = time;
            simMaterial.uniforms.uDeltaTime.value = dt;
            simMaterial.uniforms.uRingRadius.value = 0.175 + Math.sin(time * 1.0) * 0.03 + Math.cos(time * 3.0) * 0.02;
            simMaterial.uniforms.uRingPos.value = ringPos;

            renderer.setRenderTarget(rt2!);
            renderer.render(simScene!, simCamera!);
            renderer.setRenderTarget(null);

            pointsMaterial.uniforms.uPosition.value = everRendered ? rt2!.texture : posTex!;
            pointsMaterial.uniforms.uTime.value = time;
            pointsMaterial.uniforms.uRingPos.value = ringPos;

            renderer.autoClear = false;
            renderer.clear();
            renderer.render(scene, camera);

            const tempTarget = rt1!;
            rt1 = rt2!;
            rt2 = tempTarget;
            everRendered = true;
          }
        } else {
          currentMousePos.lerp(targetMousePos, 0.1);

          if (resolvedEffectType === "webgl_waves" && wavesMaterial) {
            wavesMaterial.uniforms.uTime.value = time;
            wavesMaterial.uniforms.uMousePos.value.copy(currentMousePos);
            wavesMaterial.uniforms.uMouseActive.value += (mouseActiveTarget - wavesMaterial.uniforms.uMouseActive.value) * 0.1;
          } else if (resolvedEffectType === "webgl_flowfield" && flowMaterial) {
            flowMaterial.uniforms.uTime.value = time;
            flowMaterial.uniforms.uMousePos.value.copy(currentMousePos);
            flowMaterial.uniforms.uMouseActive.value += (mouseActiveTarget - flowMaterial.uniforms.uMouseActive.value) * 0.1;
          } else if (resolvedEffectType === "webgl_cybergrid" && cyberMaterial) {
            cyberMaterial.uniforms.uTime.value = time;
            cyberMaterial.uniforms.uMousePos.value.copy(currentMousePos);
            cyberMaterial.uniforms.uMouseActive.value += (mouseActiveTarget - cyberMaterial.uniforms.uMouseActive.value) * 0.1;
          } else if (resolvedEffectType === "webgl_fluid" && fluidMaterial) {
            fluidMaterial.uniforms.uTime.value = time;
            fluidMaterial.uniforms.uMousePos.value.copy(currentMousePos);
            fluidMaterial.uniforms.uMouseActive.value += (mouseActiveTarget - fluidMaterial.uniforms.uMouseActive.value) * 0.1;
          }

          renderer.clear();
          renderer.render(scene, camera);
        }

        animationFrameId = requestAnimationFrame(renderWebGL);
      };

      renderWebGL();

      return () => {
        window.removeEventListener("resize", onWindowResizeWebGL);
        window.removeEventListener("mousemove", handleMouseMoveGlobalWebGL);
        cancelAnimationFrame(animationFrameId);
        renderer.dispose();
        
        // Dispose antigravity2 specific
        pointsGeometry?.dispose();
        pointsMaterial?.dispose();
        simGeometry?.dispose();
        simMaterial?.dispose();
        posTex?.dispose();
        rt1?.dispose();
        rt2?.dispose();

        // Dispose webgl_waves specific
        wavesGeometry?.dispose();
        wavesMaterial?.dispose();

        // Dispose webgl_flowfield specific
        flowGeometry?.dispose();
        flowMaterial?.dispose();

        // Dispose webgl_cybergrid specific
        cyberGeometry?.dispose();
        cyberMaterial?.dispose();

        // Dispose webgl_fluid specific
        fluidGeometry?.dispose();
        fluidMaterial?.dispose();

        raycastPlane.geometry.dispose();
        if (Array.isArray(raycastPlane.material)) {
          raycastPlane.material.forEach(m => m.dispose());
        } else {
          raycastPlane.material.dispose();
        }
      };
    }

    // -------------------------------------------------------------------------
    // ORIGINAL 2D CANVAS EFFECTS
    // -------------------------------------------------------------------------
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const ballRef = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };
    const ringPos = { x: 0, y: 0 };
    const simplex = new SimplexNoise();

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      baseAlpha: number;
      isTemporary: boolean;
      life: number;
      refX?: number;
      refY?: number;
      posX?: number;
      posY?: number;
      scale?: number;
      velocity?: number;
      theta?: number;
      phi?: number;
      orbitRadius?: number;
      orbitSpeed?: number;
      colorIndex?: number;
      colorPhase?: number;
      z3d?: number;

      constructor(isTemp = false, rx = 0, ry = 0) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.isTemporary = isTemp;
        this.life = 1.0;
        this.colorPhase = Math.random() * Math.PI * 2;
        
        if (resolvedEffectType === "constellation") {
          const angle = Math.random() * Math.PI * 2;
          const s = (Math.random() * 0.3 + 0.1) * speed;
          this.vx = Math.cos(angle) * s;
          this.vy = Math.sin(angle) * s;
        } else if (resolvedEffectType === "flowfield") {
          this.vx = (Math.random() - 0.5) * 0.2;
          this.vy = (Math.random() - 0.5) * 0.2;
        } else {
          this.vx = (Math.random() - 0.5) * 0.5 * speed;
          this.vy = -(Math.random() * 0.8 + 0.2) * speed;
          this.y = isTemp ? this.y : Math.random() * height + height;
        }
        
        this.size = Math.random() * 2.5 + 1;
        this.baseAlpha = Math.random() * 0.5 + 0.2;
        this.alpha = this.baseAlpha;
      }

      update() {
        if (resolvedEffectType === "flowfield") {
          const angle = (this.x * 0.005) + (this.y * 0.005) + (frameCount * 0.001 * speed);
          const force = 0.3 * speed;
          this.vx += Math.cos(angle) * force * 0.1;
          this.vy += Math.sin(angle) * force * 0.1;
          const s = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
          const maxS = 1.8 * speed;
          if (s > maxS) {
            this.vx = (this.vx / s) * maxS;
            this.vy = (this.vy / s) * maxS;
          }
        }

        this.x += this.vx;
        this.y += this.vy;

        if (!this.isTemporary) {
          if (resolvedEffectType === "constellation" || resolvedEffectType === "flowfield") {
            if (this.x < -20) this.x = width + 20;
            if (this.x > width + 20) this.x = -20;
            if (this.y < -20) this.y = height + 20;
            if (this.y > height + 20) this.y = -20;
          } else {
            if (this.y < 0 || this.x < 0 || this.x > width) {
              this.x = Math.random() * width;
              this.y = height + 10;
              this.vx = (Math.random() - 0.5) * 0.5 * speed;
              this.vy = -(Math.random() * 0.8 + 0.2) * speed;
            }
          }

          if (resolvedEffectType === "constellation" || resolvedEffectType === "flowfield") {
            this.alpha = this.baseAlpha;
          } else {
            if (this.y < height * 0.2) {
              this.alpha = this.baseAlpha * (this.y / (height * 0.2));
            } else {
              this.alpha = this.baseAlpha;
            }
          }
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fillStyle = hexToRgba(color, this.alpha);
        c.fill();
      }
    }

    class AuroraBlob {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      radius: number;
      color: string;
      angle: number;
      speedFactor: number;

      constructor(x: number, y: number, radius: number, blobColor: string, speedFactor: number) {
        this.baseX = x;
        this.baseY = y;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = blobColor;
        this.angle = Math.random() * Math.PI * 2;
        this.speedFactor = speedFactor;
      }

      update() {
        this.angle += 0.002 * speed * this.speedFactor;
        this.x = this.baseX + Math.sin(this.angle) * (width * 0.15);
        this.y = this.baseY + Math.cos(this.angle * 0.8) * (height * 0.12);
      }

      draw(c: CanvasRenderingContext2D) {
        const grad = c.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        grad.addColorStop(0, this.color);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        c.fillStyle = grad;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        c.fill();
      }
    }

    interface GridPoint {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      vx: number;
      vy: number;
    }

    const gridPoints: GridPoint[] = [];
    let gridCols = 18;
    let gridRows = 12;
    if (gridDensity === "compact") {
      gridCols = 24;
      gridRows = 16;
    } else if (gridDensity === "sparse") {
      gridCols = 12;
      gridRows = 8;
    }

    const initGrid = () => {
      if (!isAntigravityMode) return;
      gridPoints.length = 0;
      const colSpacing = width / (gridCols - 1);
      const rowSpacing = height / (gridRows - 1);

      for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
          const x = c * colSpacing;
          const y = r * rowSpacing;
          gridPoints.push({
            x,
            y,
            baseX: x,
            baseY: y,
            vx: 0,
            vy: 0,
          });
        }
      }
    };

    const auroraBlobs: AuroraBlob[] = [];
    const initAurora = () => {
      auroraBlobs.length = 0;
      if (resolvedEffectType !== "aurora") return;
      
      const primary = hexToRgba(color, 0.16 * glowIntensity);
      const secondary = hexToRgba(color === "#6366f1" ? "#a855f7" : color, 0.12 * glowIntensity);
      const tertiary = hexToRgba(color === "#6366f1" ? "#06b6d4" : color, 0.10 * glowIntensity);
      const quaternary = hexToRgba(color === "#6366f1" ? "#ec4899" : color, 0.08 * glowIntensity);
      const maxDim = Math.max(width, height);

      auroraBlobs.push(new AuroraBlob(width * 0.25, height * 0.35, maxDim * 0.5, primary, 0.5));
      auroraBlobs.push(new AuroraBlob(width * 0.75, height * 0.25, maxDim * 0.45, secondary, 0.7));
      auroraBlobs.push(new AuroraBlob(width * 0.45, height * 0.7, maxDim * 0.55, tertiary, 0.4));
      auroraBlobs.push(new AuroraBlob(width * 0.85, height * 0.75, maxDim * 0.4, quaternary, 0.8));
    };

    let particles: Particle[] = [];
    if (actualShowParticles) {
      particles = Array.from({ length: particleCount }, () => new Particle());
    }
      
    initGrid();
    initAurora();

    const resizeObserver = new ResizeObserver((entries) => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      initGrid();
      initAurora();
    });
    resizeObserver.observe(canvas);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = e.clientX - rect.left;
      mouseRef.current.targetY = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      if (isAntigravityMode) {
        gridPoints.forEach((p) => {
          const dx = p.x - clickX;
          const dy = p.y - clickY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 220) {
            const force = (220 - dist) / 220;
            const pushPower = force * force * 14 * speed;
            p.vx += (dx / (dist || 1)) * pushPower;
            p.vy += (dy / (dist || 1)) * pushPower;
          }
        });
      }

      if (actualShowParticles) {
        const burstCount = 14;
        for (let i = 0; i < burstCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const s = (Math.random() * 2.4 + 1.2) * speed;
          const p = new Particle(true);
          p.x = clickX;
          p.y = clickY;
          p.vx = Math.cos(angle) * s;
          p.vy = Math.sin(angle) * s;
          p.size = Math.random() * 2.8 + 1.2;
          p.baseAlpha = Math.random() * 0.7 + 0.3;
          particles.push(p);
        }
      }
    };

    const parent = canvas.parentElement;
    const trackingTarget = interactionScope === "global" ? window : parent;

    if (trackingTarget && actualInteractive) {
      trackingTarget.addEventListener("mousemove", handleMouseMove as EventListener);
      trackingTarget.addEventListener("mousedown", handleMouseDown as EventListener);
      if (interactionScope !== "global") {
        trackingTarget.addEventListener("mouseleave", handleMouseLeave as EventListener);
      }
    }

    const handleWindowMouseLeave = () => {
      mouseRef.current.active = false;
    };

    if (actualInteractive && interactionScope === "global") {
      window.addEventListener("blur", handleWindowMouseLeave);
      document.addEventListener("mouseleave", handleWindowMouseLeave);
    }

    let frameCount = 0;
    let hoverProgress = 0;

    const render = () => {
      frameCount++;
      hoverProgress += (((mouseRef.current.active && actualInteractive) ? 1.0 : 0.0) - hoverProgress) * 0.05;

      const isDarkTheme = canvas.closest(".shop-builder-section--scheme-dark") || 
                     canvas.closest(".dark") || 
                     document.documentElement.getAttribute("data-theme") === "dark";

      if (resolvedEffectType === "flowfield") {
        ctx.fillStyle = isDarkTheme ? "rgba(10, 10, 10, 0.08)" : "rgba(255, 255, 255, 0.08)";
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.clearRect(0, 0, width, height);
      }

      const mouse = mouseRef.current;
      if (mouse.active && actualInteractive) {
        if (mouse.x === -1000) {
          mouse.x = mouse.targetX;
          mouse.y = mouse.targetY;
        } else {
          mouse.x += (mouse.targetX - mouse.x) * 0.15;
          mouse.y += (mouse.targetY - mouse.y) * 0.15;
        }
      } else {
        mouse.x += (-1000 - mouse.x) * 0.1;
        mouse.y += (-1000 - mouse.y) * 0.1;
      }

      if (resolvedEffectType === "aurora") {
        auroraBlobs.forEach((blob) => {
          blob.update();
          blob.draw(ctx);
        });
      }

      if (actualShowGrid && isAntigravityMode) {
        ctx.strokeStyle = hexToRgba(color, 0.05);
        ctx.lineWidth = 1;

        gridPoints.forEach((p) => {
          const springK = 0.08 * speed;
          const damping = 0.84;
          
          const forceX = (p.baseX - p.x) * springK;
          const forceY = (p.baseY - p.y) * springK;
          
          p.vx += forceX;
          p.vy += forceY;

          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = 180;
          if (mouse.active && actualInteractive && dist < maxDist) {
            const force = (maxDist - dist) / maxDist;
            const pullPower = force * force * 2.8 * speed;
            p.vx += (dx / (dist || 1)) * pullPower;
            p.vy += (dy / (dist || 1)) * pullPower;
          }

          p.vx *= damping;
          p.vy *= damping;
          p.x += p.vx;
          p.y += p.vy;
        });

        for (let r = 0; r < gridRows; r++) {
          for (let c = 0; c < gridCols; c++) {
            const index = r * gridCols + c;
            const p = gridPoints[index];

            if (c < gridCols - 1) {
              const pRight = gridPoints[index + 1];
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(pRight.x, pRight.y);
              ctx.stroke();
            }

            if (r < gridRows - 1) {
              const pBottom = gridPoints[index + gridCols];
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(pBottom.x, pBottom.y);
              ctx.stroke();
            }
          }
        }
      }

      if (mouse.active && actualInteractive && isAntigravityMode) {
        gridPoints.forEach((p) => {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.strokeStyle = hexToRgba(color, 0.3 * glowIntensity * (1 - dist / 150));
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();

            ctx.fillStyle = hexToRgba(color, glowIntensity * (1 - dist / 150));
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      if (actualShowGrid && isAntigravityMode) {
        ctx.fillStyle = hexToRgba(color, 0.15);
        gridPoints.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      if (actualShowParticles) {
        particles.forEach((p) => {
          p.update();
          p.draw(ctx);
        });
      }

      if (resolvedEffectType === "constellation") {
        ctx.lineWidth = 0.6;
        for (let i = 0; i < particles.length; i++) {
          const p1 = particles[i];
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 85) {
              ctx.strokeStyle = hexToRgba(color, 0.14 * (1 - dist / 85) * glowIntensity);
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
          if (mouse.active && actualInteractive) {
            const dx = mouse.x - p1.x;
            const dy = mouse.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 160) {
              ctx.strokeStyle = hexToRgba(color, 0.3 * (1 - dist / 160) * glowIntensity);
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.stroke();
            }
          }
        }
      }

      if (resolvedEffectType === "waves") {
        ctx.lineWidth = 1.5;
        const waveCount = 3;
        const baseAlpha = 0.07 * glowIntensity;
        
        for (let w = 0; w < waveCount; w++) {
          ctx.strokeStyle = hexToRgba(color, baseAlpha * (1 - w * 0.25));
          ctx.beginPath();
          
          const speedFactor = (w + 1) * 0.001 * speed;
          const phaseShift = frameCount * speedFactor;
          const waveHeight = height * 0.15 * (1 - w * 0.15);
          const frequency = 0.004 + w * 0.0015;
          
          ctx.moveTo(0, height);
          for (let x = 0; x <= width; x += 10) {
            const y = height - 35 - Math.sin(x * frequency + phaseShift) * waveHeight;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, height);
          ctx.fillStyle = hexToRgba(color, baseAlpha * 0.18 * (1 - w * 0.2));
          ctx.fill();
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      resizeObserver.disconnect();
      if (trackingTarget) {
        trackingTarget.removeEventListener("mousemove", handleMouseMove as EventListener);
        trackingTarget.removeEventListener("mousedown", handleMouseDown as EventListener);
        if (interactionScope !== "global") {
          trackingTarget.removeEventListener("mouseleave", handleMouseLeave as EventListener);
        }
      }
      if (actualInteractive && interactionScope === "global") {
        window.removeEventListener("blur", handleWindowMouseLeave);
        document.removeEventListener("mouseleave", handleWindowMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    speed,
    particleCount,
    color,
    gridDensity,
    interactive,
    showGrid,
    showParticles,
    glowIntensity,
    interactionScope,
    visualMode,
    actualShowGrid,
    actualShowParticles,
    actualInteractive,
    effectType,
    resolvedEffectType,
    isAntigravityMode,
    isAntigravity2Mode,
    isWebGLMode,
  ]);

  return (
    <canvas
      key={isWebGLMode ? "webgl" : "2d"}
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
