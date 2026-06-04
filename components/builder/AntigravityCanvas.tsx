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
}: AntigravityCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000, active: false });

  const actualShowGrid = (visualMode === "no-grid" || visualMode === "lines-only") ? false : showGrid;
  const actualShowParticles = (visualMode === "lines-only") ? false : showParticles;
  const actualInteractive = (interactionScope === "none") ? false : interactive;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    // Particle class for floating "antigravity" particles
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      baseAlpha: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height + height; // start from bottom
        this.vx = (Math.random() - 0.5) * 0.5 * speed;
        this.vy = -(Math.random() * 0.8 + 0.2) * speed; // float upwards
        this.size = Math.random() * 2 + 1;
        this.baseAlpha = Math.random() * 0.5 + 0.2;
        this.alpha = this.baseAlpha;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Reset if goes off screen
        if (this.y < 0 || this.x < 0 || this.x > width) {
          this.x = Math.random() * width;
          this.y = height + 10;
          this.vx = (Math.random() - 0.5) * 0.5 * speed;
          this.vy = -(Math.random() * 0.8 + 0.2) * speed;
        }

        // Fade in/out near edges
        if (this.y < height * 0.2) {
          this.alpha = this.baseAlpha * (this.y / (height * 0.2));
        } else {
          this.alpha = this.baseAlpha;
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fillStyle = hexToRgba(color, this.alpha);
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

    const particles: Particle[] = actualShowParticles
      ? Array.from({ length: particleCount }, () => new Particle())
      : [];
    initGrid();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      initGrid();
    };

    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = e.clientX - rect.left;
      mouseRef.current.targetY = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const parent = canvas.parentElement;
    const trackingTarget = interactionScope === "global" ? window : parent;

    if (trackingTarget && actualInteractive) {
      trackingTarget.addEventListener("mousemove", handleMouseMove as EventListener);
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

    const render = () => {
      ctx.clearRect(0, 0, width, height);

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

      // 1. Draw grid lines
      if (actualShowGrid) {
        ctx.strokeStyle = hexToRgba(color, 0.05);
        ctx.lineWidth = 1;

        gridPoints.forEach((p) => {
          let dx = mouse.x - p.baseX;
          let dy = mouse.y - p.baseY;
          let dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = 220;
          if (mouse.active && actualInteractive && dist < maxDist) {
            const force = (maxDist - dist) / maxDist;
            const pullX = dx * force * 0.15;
            const pullY = dy * force * 0.15;
            p.x = p.baseX + pullX;
            p.y = p.baseY + pullY;
          } else {
            p.x += (p.baseX - p.x) * 0.1;
            p.y += (p.baseY - p.y) * 0.1;
          }
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

      // 2. Draw mouse connections and warp glow (also works if grid points are invisible)
      if (mouse.active && actualInteractive) {
        // If grid lines are hidden, base coordinates can still warp/connect to mouse
        gridPoints.forEach((p) => {
          let dx = mouse.x - p.x;
          let dy = mouse.y - p.y;
          let dist = Math.sqrt(dx * dx + dy * dy);

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

      // Draw intersections
      if (actualShowGrid) {
        ctx.fillStyle = hexToRgba(color, 0.15);
        gridPoints.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 3. Update & Draw floating particles
      if (actualShowParticles) {
        particles.forEach((p) => {
          p.update();
          p.draw(ctx);
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (trackingTarget) {
        trackingTarget.removeEventListener("mousemove", handleMouseMove as EventListener);
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
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
