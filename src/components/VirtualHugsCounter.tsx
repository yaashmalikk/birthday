import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import SectionHeading from "./SectionHeading";
import { apiGet, apiPost } from "@/lib/api";
import type { Counter, IncrementResponse } from "@/lib/types";
import { playPop } from "@/lib/sounds";

interface FloatingHeart {
  id: number;
  x: number;
  size: number;
  duration: number;
  drift: number;
}

let heartId = 0;

export default function VirtualHugsCounter() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["counter"],
    queryFn: () => apiGet<Counter>("/counter"),
  });
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const increment = useMutation({
    mutationFn: () => apiPost<IncrementResponse>("/counter/increment"),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["counter"] });
      const prev = queryClient.getQueryData<Counter>(["counter"]);
      if (prev) queryClient.setQueryData<Counter>(["counter"], { ...prev, count: prev.count + 1 });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData<Counter>(["counter"], ctx.prev);
      toast.error("Hug didn't reach her — try once more 🫂");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["counter"] });
    },
  });

  const hug = (e: React.MouseEvent<HTMLButtonElement>) => {
    increment.mutate();
    playPop();
    const batch: FloatingHeart[] = Array.from({ length: 12 }, () => ({
      id: ++heartId,
      x: e.clientX - window.innerWidth / 2 + (Math.random() - 0.5) * 120,
      size: 16 + Math.random() * 22,
      duration: 1.6 + Math.random() * 1.2,
      drift: (Math.random() - 0.5) * 60,
    }));
    setHearts((h) => [...h, ...batch]);
    const timer = window.setTimeout(() => {
      setHearts((h) => h.filter((x) => !batch.some((b) => b.id === x.id)));
    }, 3000);
    timers.current.push(timer);
  };

  const count = data?.count ?? 0;
  const display = new Intl.NumberFormat("en-IN").format(count);

  return (
    <section id="hugs" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-4">
        <SectionHeading
          badge="Virtual Hugs"
          title="Send Taniyaaa a Hug 🫂"
          subtitle="Every tap is stored forever in the hug bank. She can count how loved she is."
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55 }}
          className="relative mt-12 overflow-hidden rounded-[2.5rem] border border-pink-500/25 bg-[#151632]/70 px-6 py-14 text-center backdrop-blur-xl shadow-[0_8px_40px_rgba(255,117,143,0.16)]"
        >
          <div className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-pink-500/15 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-purple-500/15 blur-3xl" aria-hidden />

          <div className="relative mx-auto w-fit">
            <span className="absolute inset-0 animate-[pulse-ring_2s_ease-out_infinite] rounded-full bg-pink-500/40" aria-hidden />
            <button
              type="button"
              onClick={hug}
              data-testid="virtual-hug-btn"
              aria-label="Send a virtual hug to Taniyaaa"
              className="relative grid h-24 w-24 cursor-pointer place-items-center rounded-full bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500 text-white shadow-[0_0_40px_rgba(255,117,143,0.5)] transition-transform hover:scale-110 active:scale-90"
            >
              <Heart className="h-10 w-10 fill-white" />
            </button>
          </div>

          <p className="mt-8 font-heading text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-400 to-purple-300" data-testid="hug-count">
            {display}
          </p>
          <p className="mt-2 text-sm text-pink-100/70">hugs delivered and counting 💗</p>

          {/* floating hearts layer */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            {hearts.map((h) => (
              <span
                key={h.id}
                className="absolute bottom-10 left-1/2"
                style={{
                  ["--drift" as string]: `${h.drift}px`,
                  animation: `heart-rise ${h.duration}s ease-out forwards`,
                  animationDelay: `${(h.id % 5) * 0.05}s`,
                  transform: `translateX(${h.x}px)`,
                }}
              >
                <Heart
                  className="fill-pink-400 text-pink-400"
                  style={{ width: h.size, height: h.size, opacity: 0.9 }}
                />
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
