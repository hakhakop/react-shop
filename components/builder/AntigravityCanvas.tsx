"use client";

import React, { useEffect, useRef } from "react";

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

  const isAntigravityMode = effectType === "antigravity";
  const actualShowGrid = isAntigravityMode && (visualMode === "no-grid" || visualMode === "lines-only" ? false : showGrid);
  const actualShowParticles = (visualMode === "lines-only" || effectType === "waves" || effectType === "aurora") ? false : showParticles;
  const actualInteractive = (interactionScope === "none") ? false : interactive;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    // Particle class for floating particles
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

      constructor(isTemp = false) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.isTemporary = isTemp;
        this.life = 1.0;
        
        if (effectType === "constellation") {
          const angle = Math.random() * Math.PI * 2;
          const s = (Math.random() * 0.3 + 0.1) * speed;
          this.vx = Math.cos(angle) * s;
          this.vy = Math.sin(angle) * s;
        } else if (effectType === "flowfield") {
          this.vx = (Math.random() - 0.5) * 0.2;
          this.vy = (Math.random() - 0.5) * 0.2;
        } else {
          // Default antigravity float up
          this.vx = (Math.random() - 0.5) * 0.5 * speed;
          this.vy = -(Math.random() * 0.8 + 0.2) * speed;
          this.y = isTemp ? this.y : Math.random() * height + height; // start from bottom if not temp
        }
        
        this.size = Math.random() * 2.5 + 1;
        this.baseAlpha = Math.random() * 0.5 + 0.2;
        this.alpha = this.baseAlpha;
      }

      update() {
        if (effectType === "flowfield") {
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

        // Swirl particles around mouse pointer
        if (mouseRef.current.active && actualInteractive && (effectType === "antigravity" || effectType === "constellation" || effectType === "flowfield")) {
          const dx = mouseRef.current.x - this.x;
          const dy = mouseRef.current.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 135) {
            const force = (135 - dist) / 135;
            const swirlPower = force * 0.9 * speed;
            this.vx += (dy / dist) * swirlPower * 0.08;
            this.vy -= (dx / dist) * swirlPower * 0.08;
          }
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.isTemporary) {
          this.life -= 0.015; // decays in ~65 frames
          this.alpha = Math.max(0, this.baseAlpha * this.life);
        } else {
          if (effectType === "constellation" || effectType === "flowfield") {
            if (this.x < -10) this.x = width + 10;
            if (this.x > width + 10) this.x = -10;
            if (this.y < -10) this.y = height + 10;
            if (this.y > height + 10) this.y = -10;
          } else {
            if (this.y < 0 || this.x < 0 || this.x > width) {
              this.x = Math.random() * width;
              this.y = height + 10;
              this.vx = (Math.random() - 0.5) * 0.5 * speed;
              this.vy = -(Math.random() * 0.8 + 0.2) * speed;
            }
          }

          if (effectType === "constellation" || effectType === "flowfield") {
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

    // Aurora Blob class
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

    // Grid points for warping grid
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
      if (effectType !== "aurora") return;
      
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

    const particles: Particle[] = actualShowParticles
      ? Array.from({ length: particleCount }, () => new Particle())
      : [];
      
    initGrid();
    initAurora();

    // ResizeObserver implementation to guarantee pixel-perfect coverage
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

      // 1. Force grid points away from click center (elastic explosion ripple)
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

      // 2. Spawn outward shooting temporary particles
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

    const render = () => {
      frameCount++;

      const isDark = canvas.closest(".shop-builder-section--scheme-dark") || 
                     canvas.closest(".dark") || 
                     document.documentElement.getAttribute("data-theme") === "dark";

      // Clear Canvas
      if (effectType === "flowfield") {
        ctx.fillStyle = isDark ? "rgba(10, 10, 10, 0.08)" : "rgba(255, 255, 255, 0.08)";
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

      // 1. Draw Aurora Mesh Blobs
      if (effectType === "aurora") {
        auroraBlobs.forEach((blob) => {
          blob.update();
          blob.draw(ctx);
        });
      }

      // 2. Draw Antigravity Grid
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

      // 3. Draw Antigravity Mouse connections and warp glow
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

      // 4. Draw intersections for grid
      if (actualShowGrid && isAntigravityMode) {
        ctx.fillStyle = hexToRgba(color, 0.15);
        gridPoints.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 5. Update & Draw floating particles
      if (actualShowParticles) {
        particles.forEach((p) => {
          p.update();
          p.draw(ctx);
        });
      }

      // 6. Draw Constellation lines
      if (effectType === "constellation") {
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

      // 7. Draw Waves
      if (effectType === "waves") {
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
    isAntigravityMode,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
