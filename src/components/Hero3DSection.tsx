import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { motion } from "motion/react";
import { ChevronDown, Sparkles } from "lucide-react";
import { fireConfetti } from "@/lib/confetti";
import { playChime, playFireworks } from "@/lib/sounds";

/** Interactive 3D hero: starfield + balloons + rose-gold dust + a click-able birthday cake. */
export default function Hero3DSection() {
  const mountRef = useRef<HTMLDivElement>(null);
  const blowRef = useRef<() => void>(() => {});
  const [lit, setLit] = useState(true);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setWebglFailed(true);
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 640px)").matches;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.touchAction = "pan-y";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0b0c1e, 14, 36);

    const camera = new THREE.PerspectiveCamera(
      55,
      mount.clientWidth / Math.max(mount.clientHeight, 1),
      0.1,
      120,
    );
    const camZ = small ? 12 : 9.4;
    camera.position.set(0, 2.3, camZ);
    camera.lookAt(0, 0.9, 0);

    // ---------- lights ----------
    scene.add(new THREE.AmbientLight(0x6b5a9e, 1.1));
    const key = new THREE.DirectionalLight(0xffd166, 1.2);
    key.position.set(5, 9, 6);
    scene.add(key);
    const rose = new THREE.PointLight(0xff758f, 2.2, 24);
    rose.position.set(-4, 3.5, 4);
    scene.add(rose);
    const violet = new THREE.PointLight(0xc084fc, 1.6, 26);
    violet.position.set(5, 2, -4);
    scene.add(violet);

    // ---------- starfield ----------
    const starCount = small ? 800 : 1500;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 14 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = Math.abs(r * Math.cos(phi)) * 0.7 - 2;
      starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 6;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.085,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
      depthWrite: false,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // ---------- rose-gold dust ----------
    const dustCount = small ? 200 : 380;
    const dustPos = new Float32Array(dustCount * 3);
    const dustCol = new Float32Array(dustCount * 3);
    const dustSpeed = new Float32Array(dustCount);
    const palette = [new THREE.Color(0xff758f), new THREE.Color(0xc084fc), new THREE.Color(0xffd166)];
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 18;
      dustPos[i * 3 + 1] = -4 + Math.random() * 12;
      dustPos[i * 3 + 2] = -6 + Math.random() * 10;
      const c = palette[Math.floor(Math.random() * palette.length)];
      dustCol[i * 3] = c.r;
      dustCol[i * 3 + 1] = c.g;
      dustCol[i * 3 + 2] = c.b;
      dustSpeed[i] = 0.25 + Math.random() * 0.55;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    dustGeo.setAttribute("color", new THREE.BufferAttribute(dustCol, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // ---------- balloons ----------
    interface Balloon {
      group: THREE.Group;
      baseY: number;
      speed: number;
      phase: number;
    }
    const balloons: Balloon[] = [];
    const balloonColors = [0xff758f, 0xc084fc, 0xffd166, 0xff4d6d, 0xfbcfe8, 0x8b5cf6];
    const balloonCount = small ? 6 : 10;
    for (let i = 0; i < balloonCount; i++) {
      const color = balloonColors[i % balloonColors.length];
      const group = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 24, 24),
        new THREE.MeshStandardMaterial({
          color,
          roughness: 0.32,
          metalness: 0.12,
          emissive: color,
          emissiveIntensity: 0.32,
          transparent: true,
          opacity: 0.96,
        }),
      );
      body.scale.y = 1.18;
      group.add(body);
      const knot = new THREE.Mesh(
        new THREE.ConeGeometry(0.07, 0.14, 8),
        new THREE.MeshStandardMaterial({ color, roughness: 0.5 }),
      );
      knot.position.y = -0.56;
      knot.rotation.x = Math.PI;
      group.add(knot);
      const string = new THREE.Mesh(
        new THREE.CylinderGeometry(0.006, 0.006, 1.4, 6),
        new THREE.MeshBasicMaterial({ color: 0xe2d1f9, transparent: true, opacity: 0.45 }),
      );
      string.position.y = -1.3;
      group.add(string);
      const side = i % 2 === 0 ? -1 : 1;
      group.position.set(
        side * (3.4 + Math.random() * 4.2),
        -0.6 + Math.random() * 4.6,
        -2.5 + Math.random() * 3,
      );
      scene.add(group);
      balloons.push({
        group,
        baseY: group.position.y,
        speed: 0.5 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // ---------- the cake ----------
    const cake = new THREE.Group();
    const frostingMat = new THREE.MeshStandardMaterial({ color: 0xfff0f4, roughness: 0.35 });
    const addTier = (
      radius: number,
      height: number,
      y: number,
      color: number,
    ) => {
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, height, 48),
        new THREE.MeshStandardMaterial({ color, roughness: 0.55 }),
      );
      mesh.position.y = y;
      cake.add(mesh);
      const drip = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.14, 16, 48),
        frostingMat,
      );
      drip.rotation.x = Math.PI / 2;
      drip.position.y = y + height / 2;
      cake.add(drip);
      return mesh;
    };

    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(2.25, 2.25, 0.12, 56),
      new THREE.MeshStandardMaterial({ color: 0xf3e8ff, roughness: 0.2, metalness: 0.65 }),
    );
    plate.position.y = 0.06;
    cake.add(plate);

    addTier(1.7, 0.75, 0.12 + 0.375, 0xff9eb5);
    addTier(1.25, 0.65, 0.87 + 0.325, 0xff758f);
    addTier(0.85, 0.55, 1.52 + 0.275, 0xc084fc);

    const candleColors = [0xffd166, 0x4ade80, 0x60a5fa, 0xff758f, 0xc084fc];
    interface Flame {
      mesh: THREE.Mesh;
      light: THREE.PointLight;
      phase: number;
      base: THREE.Vector3;
    }
    const flames: Flame[] = [];
    candleColors.forEach((color, i) => {
      const angle = (i / candleColors.length) * Math.PI * 2;
      const x = Math.cos(angle) * 0.5;
      const z = Math.sin(angle) * 0.5;
      const candle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 0.5, 12),
        new THREE.MeshStandardMaterial({ color, roughness: 0.4, emissive: color, emissiveIntensity: 0.18 }),
      );
      candle.position.set(x, 2.12 + 0.25, z);
      cake.add(candle);

      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.07, 0.22, 10),
        new THREE.MeshBasicMaterial({ color: 0xffb347, transparent: true, opacity: 0.95 }),
      );
      const base = new THREE.Vector3(x, 2.12 + 0.5 + 0.11, z);
      flame.position.copy(base);
      cake.add(flame);
      const light = new THREE.PointLight(0xffaa33, 1.2, 5);
      light.position.copy(base);
      cake.add(light);
      flames.push({ mesh: flame, light, phase: i * 1.7, base });
    });
    cake.position.y = small ? -1.9 : -1.55;
    if (small) cake.scale.setScalar(0.85);
    scene.add(cake);

    // ---------- particle systems (smoke / confetti bursts in 3D) ----------
    interface System {
      points: THREE.Points;
      vel: Float32Array;
      life: number;
      max: number;
      gravity: number;
      baseOpacity: number;
    }
    const systems: System[] = [];

    function spawn(
      origins: THREE.Vector3[],
      opts: { color: number; size: number; speed: number; spread: number; max: number; gravity: number; opacity: number; additive: boolean },
    ): void {
      const count = origins.length;
      const pos = new Float32Array(count * 3);
      const vel = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        pos[i * 3] = origins[i].x;
        pos[i * 3 + 1] = origins[i].y;
        pos[i * 3 + 2] = origins[i].z;
        vel[i * 3] = (Math.random() - 0.5) * opts.spread;
        vel[i * 3 + 1] = opts.speed * (0.6 + Math.random() * 0.8);
        vel[i * 3 + 2] = (Math.random() - 0.5) * opts.spread;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({
        color: opts.color,
        size: opts.size,
        transparent: true,
        opacity: opts.opacity,
        depthWrite: false,
        blending: opts.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      });
      const points = new THREE.Points(geo, mat);
      scene.add(points);
      systems.push({ points, vel, life: 0, max: opts.max, gravity: opts.gravity, baseOpacity: opts.opacity });
    }

    // ---------- interaction ----------
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const mouse = { x: 0, y: 0 };
    let litCandles = true;

    const blow = () => {
      if (!litCandles) {
        // relight
        litCandles = true;
        flames.forEach((f) => {
          f.mesh.visible = true;
          f.light.visible = true;
        });
        playChime();
        setLit(true);
        return;
      }
      litCandles = false;
      setLit(false);
      flames.forEach((f) => {
        f.mesh.visible = false;
        f.light.visible = false;
      });
      // smoke from each flame
      const smokeOrigins = flames.map((f) => f.base.clone().applyMatrix4(cake.matrixWorld));
      spawn(smokeOrigins.concat(smokeOrigins), {
        color: 0x9ca3af,
        size: 0.22,
        speed: 1.1,
        spread: 0.35,
        max: 2.4,
        gravity: 0.12,
        opacity: 0.7,
        additive: false,
      });
      // golden spark burst
      const burstOrigin = new THREE.Vector3(0, 2.4, 0).applyMatrix4(cake.matrixWorld);
      spawn(
        Array.from({ length: small ? 80 : 140 }, () => burstOrigin.clone()),
        { color: 0xffd166, size: 0.12, speed: 3.4, spread: 7.5, max: 1.6, gravity: -2.6, opacity: 1, additive: true },
      );
      playFireworks();
      fireConfetti();
    };
    blowRef.current = blow;

    const onPointerMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouse.x = pointer.x;
      mouse.y = pointer.y;
    };

    const onPointerDown = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      if (raycaster.intersectObject(cake, true).length > 0) blow();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    renderer.domElement.addEventListener("pointerdown", onPointerDown);

    // ---------- resize ----------
    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / Math.max(mount.clientHeight, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    onResize();
    window.addEventListener("resize", onResize);

    // ---------- animate ----------
    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      if (!reduced) {
        stars.rotation.y = t * 0.012 + mouse.x * 0.05;
        stars.rotation.x = mouse.y * 0.03;
        balloons.forEach((b) => {
          b.group.position.y = b.baseY + Math.sin(t * b.speed + b.phase) * 0.45;
          b.group.rotation.z = Math.sin(t * 0.8 + b.phase) * 0.06;
        });
        camera.position.x += (mouse.x * 0.7 - camera.position.x) * 0.04;
        camera.position.y += (2.3 + mouse.y * 0.35 - camera.position.y) * 0.04;
        camera.lookAt(0, 0.9, 0);
      }

      // dust drift
      const dPos = dustGeo.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < dustCount; i++) {
        let y = dPos.getY(i) + dustSpeed[i] * dt;
        if (y > 8) y = -4.5;
        dPos.setY(i, y);
      }
      dPos.needsUpdate = true;

      // flame flicker
      if (litCandles) {
        flames.forEach((f) => {
          const s = 1 + Math.sin(t * 14 + f.phase) * 0.16 + Math.sin(t * 31 + f.phase) * 0.07;
          f.mesh.scale.set(0.92, reduced ? 1 : s, 0.92);
          f.light.intensity = reduced ? 1.1 : 1.0 + Math.sin(t * 17 + f.phase) * 0.35;
        });
      }

      // particle systems
      for (let i = systems.length - 1; i >= 0; i--) {
        const sys = systems[i];
        sys.life += dt;
        const attr = sys.points.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let j = 0; j < attr.count; j++) {
          sys.vel[j * 3 + 1] += sys.gravity * dt;
          attr.setXYZ(
            j,
            attr.getX(j) + sys.vel[j * 3] * dt,
            attr.getY(j) + sys.vel[j * 3 + 1] * dt,
            attr.getZ(j) + sys.vel[j * 3 + 2] * dt,
          );
        }
        attr.needsUpdate = true;
        const k = Math.max(0, 1 - sys.life / sys.max);
        (sys.points.material as THREE.PointsMaterial).opacity = sys.baseOpacity * k;
        if (sys.life >= sys.max) {
          scene.remove(sys.points);
          sys.points.geometry.dispose();
          (sys.points.material as THREE.PointsMaterial).dispose();
          systems.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    });

    return () => {
      renderer.setAnimationLoop(null);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
          obj.geometry.dispose();
          const mat = obj.material as THREE.Material | THREE.Material[];
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <section id="home" className="relative min-h-[100svh] overflow-hidden bg-[radial-gradient(ellipse_at_top,_#2a1650_0%,_#0B0C1E_55%,_#070714_100%)]">
      <div ref={mountRef} className="absolute inset-0 cursor-pointer" data-testid="hero-canvas" aria-hidden />
      {webglFailed ? (
        <div className="absolute inset-0 grid place-items-center" aria-hidden>
          <div className="animate-[float-soft_4s_ease-in-out_infinite] text-8xl drop-shadow-[0_0_35px_rgba(255,117,143,0.6)]">
            🎂
          </div>
        </div>
      ) : null}

      {/* ambient glow blobs */}
      <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-pink-500/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-32 top-1/2 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" aria-hidden />

      <div className="pointer-events-none relative z-10 mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-between px-4 pb-14 pt-24 text-center">
        <div className="flex flex-col items-center gap-4">
          <motion.span
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.3em] text-pink-300"
          >
            🎉 It&apos;s Taniyaaa Day 🎉
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="font-heading text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
          >
            <span className="text-white drop-shadow-[0_2px_20px_rgba(255,117,143,0.35)]">
              Happy Birthday{" "}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-400 to-purple-300 animate-[shimmer_3.2s_linear_infinite] bg-[length:200%_auto]">
              Taniyaaa
            </span>{" "}
            <span className="whitespace-nowrap">🎂❤️🥳</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="max-w-xl text-base font-medium tracking-wide text-pink-200/90 sm:text-lg md:text-xl"
          >
            The Best Friend, Co-Founder &amp; Partner in Crime ✨
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-2"
          >
            {["Guuu", "Devi ji", "Kallo", "Rehtal"].map((n) => (
              <span
                key={n}
                className="rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-200"
              >
                {n}
              </span>
            ))}
          </motion.div>
        </div>

        <div className="pointer-events-auto flex flex-col items-center gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-pink-200/60">
            {lit ? "psst… tap the cake 🕯️" : "wish locked in ✨ tap to relight"}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => blowRef.current()}
              data-testid={lit ? "cake-blow-candles-btn" : "cake-relight-btn"}
              className="rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3 text-sm font-bold text-white shadow-[0_0_25px_rgba(255,117,143,0.35)] transition-transform hover:scale-105 active:scale-95"
            >
              {lit ? "Blow the Candles 🕯️" : "Make a Wish Again ✨"}
            </button>
            <a
              href="#letter"
              className="rounded-full border border-pink-400/40 bg-white/5 px-6 py-3 text-sm font-bold text-pink-100 backdrop-blur transition-colors hover:bg-pink-500/15"
            >
              Read My Letter 💌
            </a>
          </div>
          <a
            href="#memories"
            data-testid="hero-scroll-hint"
            className="mt-2 flex flex-col items-center gap-1 text-pink-200/60 transition-colors hover:text-pink-200"
            aria-label="Scroll to memories"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em]">memories</span>
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </a>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[5] flex justify-center" aria-hidden>
        <Sparkles className="mb-2 h-4 w-4 text-pink-400/40" />
      </div>
    </section>
  );
}
