// Canvas confetti with rose-gold / purple / gold palette — self-contained.
// Spawns a full-screen, pointer-events-none canvas, animates physics particles, cleans up after.

const COLORS = ["#FF758F", "#C084FC", "#FFD166", "#FF4D6D", "#FBCFE8", "#FFFFFF"];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  color: string;
  shape: "rect" | "circle";
  life: number;
}

let canvas: HTMLCanvasElement | null = null;
let particles: Particle[] = [];
let raf = 0;

function ensureCanvas(): HTMLCanvasElement {
  if (!canvas || !canvas.isConnected) {
    canvas = document.createElement("canvas");
    canvas.style.cssText =
      "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:70;";
    document.body.appendChild(canvas);
  }
  return canvas;
}

function tick(): void {
  const c = canvas;
  if (!c) return;
  const ctx = c.getContext("2d");
  if (!ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (c.width !== window.innerWidth * dpr) {
    c.width = window.innerWidth * dpr;
    c.height = window.innerHeight * dpr;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles = particles.filter((p) => p.life > 0 && p.y < window.innerHeight + 40);
  for (const p of particles) {
    p.life -= 1 / 60;
    p.vy += 0.16;
    p.vx *= 0.992;
    p.vy *= 0.995;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 0.8));
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    if (p.shape === "circle") {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    }
    ctx.restore();
  }

  if (particles.length > 0) {
    raf = requestAnimationFrame(tick);
  } else {
    cancelAnimationFrame(raf);
    c.remove();
    canvas = null;
  }
}

function burst(x: number, y: number, count: number, power: number): void {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = power * (0.4 + Math.random() * 0.8);
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - power * 0.6,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.35,
      size: 5 + Math.random() * 7,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: Math.random() > 0.5 ? "rect" : "circle",
      life: 2.2 + Math.random() * 1.6,
    });
  }
}

/** Fire celebratory confetti from the bottom corners (and optionally a point). */
export function fireConfetti(point?: { x: number; y: number }): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  burst(0, h * 0.75, 90, 14);
  burst(w, h * 0.75, 90, 14);
  if (point) burst(point.x, point.y, 60, 11);
  ensureCanvas();
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(tick);
}

/** Quick burst from a single point — for likes, seals, small wins. */
export function fireMiniBurst(point: { x: number; y: number }): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  burst(point.x, point.y, 36, 8);
  ensureCanvas();
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(tick);
}
