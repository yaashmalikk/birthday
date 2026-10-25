import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Heart, MailOpen } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { fireMiniBurst } from "@/lib/confetti";
import { playSparkle } from "@/lib/sounds";

// The exact letter — verbatim.
const PARAGRAPHS = [
  "Happy Birthday Taniyaaa 🎂❤️🥳",
  "Happiest birthday meri Guuu, Devi ji, Kallo aur Rehtal 😂❤️ Pta nhi tu kaise jhel leti h mujhe, but kasam se yaar tu meri life ki sbse achi dost h 🫶🏻 Tere jaisi dost milna sach m luck ki baat h, aur tu mere liye kitni special h ye shyd m words m bta bhi nhi skta 😭❤️",
  "Ab madam college jane ki tyyari kr rhi h 😎😂 Dil se dua h ki tujhe bht acha college mile, tu apne saare dreams pure kre aur life m bht aage jaye 🫂✨ Aur haan college milne ke baad mujhe bhul mt jana, kyuki abhi toh humne bht saare hackathons m participate krna h, saath m jeetna h, aur fir apna khud ka startup bhi kholna h 🚀💻 Ek din apni company hogi aur hum dono boss banke baithenge, bas kaam krne ke liye employees bhi mil jaye 😂😂",
  "Aur ek baat yaad rkhna, life m kabhi bhi kisi bhi situation m tujhe meri jarurat pde na, toh mujhe yaad kr lena, m tere saath khada milunga ❤️ Har baar sb kuch perfect nhi hoga, but tu akeli nhi h, tera dost tera saath h. Bas hamesha khush rehna aur apni smile aise hi maintain rkhna 🫶🏻",
  "Aur sun madam 😤😂 Iss duniya m tu meri sbse achi dost h aur chahe koi bhi aa jaye, teri jagah koi nhi le skta. Ye position permanent h, isme koi vacancy nhi niklegi 😂❤️",
  "Ab zyada emotional mt ho jana, aur haan mera birthday ka pending gift aur party dono yaad h na? 👀😂 Gift ke saath party bhi chahiye, sirf happy birthday bolke hisaab barabar nhi hoga 😭🤣",
  "Once again Happy Birthday meri Kallo ❤️🎂 Hamesha khush reh, shine krti reh aur apne saare dreams pure kr. Love you dosttt 🫂❤️✨",
];

const FULL_TEXT = PARAGRAPHS.join("\n\n");

type Stage = "sealed" | "opening" | "reading";

export default function EnvelopeLetter() {
  const [stage, setStage] = useState<Stage>("sealed");
  const [shown, setShown] = useState(0);
  const timerRef = useRef<number | null>(null);

  const done = shown >= FULL_TEXT.length;

  useEffect(() => {
    if (stage !== "reading" || done) return;
    timerRef.current = window.setInterval(() => {
      setShown((s) => Math.min(FULL_TEXT.length, s + 2));
    }, 16);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [stage, done]);

  useEffect(() => {
    if (done && stage === "reading") {
      const el = document.getElementById("letter");
      if (el) {
        const rect = el.getBoundingClientRect();
        fireMiniBurst({ x: window.innerWidth / 2, y: Math.max(rect.top, 120) });
      }
    }
  }, [done, stage]);

  const open = () => {
    if (stage !== "sealed") return;
    playSparkle();
    setStage("opening");
    window.setTimeout(() => setStage("reading"), 1300);
  };

  return (
    <section id="letter" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-4">
        <SectionHeading
          badge="A Letter For You"
          title="Sealed With Love 💌"
          subtitle="An old-school envelope, a wax seal, and words straight from the heart."
        />

        {stage !== "reading" ? (
          <div className="mt-14 flex justify-center [perspective:1200px]">
            <div
              className={`relative w-[min(92vw,420px)] transition-all duration-700 ${stage === "opening" ? "scale-95 opacity-90" : ""}`}
              style={{ aspectRatio: "8 / 5" }}
              data-testid="envelope"
            >
              {/* envelope back */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#3b1d5e] to-[#1E1A38] shadow-[0_0_45px_rgba(255,117,143,0.25)]" />
              {/* letter peeking inside */}
              <div
                className={`absolute inset-x-[7%] top-[8%] bottom-[12%] rounded-lg bg-[#FFF1F2] transition-transform duration-[900ms] ease-in-out ${stage === "opening" ? "-translate-y-[62%]" : "translate-y-0"}`}
              />
              {/* envelope front pocket */}
              <div
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#2a1650] to-[#1E1A38]"
                style={{ clipPath: "polygon(0 28%, 50% 62%, 100% 28%, 100% 100%, 0 100%)" }}
              />
              {/* flap */}
              <div
                className="absolute inset-x-0 top-0 h-[62%] origin-top rounded-t-xl bg-gradient-to-b from-[#4c2a7a] to-[#2a1650] transition-transform duration-[900ms] ease-in-out [transform-style:preserve-3d]"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  transform: stage === "opening" ? "rotateX(178deg)" : "rotateX(0deg)",
                  zIndex: stage === "opening" ? 0 : 5,
                }}
              />
              {/* glow ring */}
              <div className="absolute -inset-3 -z-10 rounded-2xl bg-pink-500/20 blur-2xl" aria-hidden />
              {/* wax seal */}
              <button
                type="button"
                onClick={open}
                data-testid="envelope-seal"
                aria-label="Open the birthday letter"
                className="absolute left-1/2 top-[54%] z-10 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-gradient-to-br from-rose-600 to-rose-800 text-2xl font-black text-rose-100 shadow-[0_0_30px_rgba(225,29,72,0.55)] ring-4 ring-rose-400/40 transition-transform hover:scale-110 active:scale-95"
                style={{ animation: "pulse-soft 2.2s ease-in-out infinite" }}
              >
                <span className="flex flex-col items-center leading-none">
                  <span>T</span>
                  <Heart className="mt-0.5 h-3.5 w-3.5 fill-rose-200 text-rose-200" />
                </span>
              </button>
              <p className="absolute inset-x-0 -bottom-10 text-center text-xs font-semibold uppercase tracking-[0.3em] text-pink-200/60">
                tap the seal to open
              </p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative mt-12"
          >
            <div className="relative overflow-hidden rounded-3xl border border-amber-400/25 bg-[#1E1A38] p-6 shadow-[0_0_50px_rgba(255,209,102,0.12)] sm:p-10">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-pink-500/10 blur-3xl" aria-hidden />
              <div className="mb-6 flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-amber-300">
                  <MailOpen className="h-3.5 w-3.5" /> opened with love
                </span>
                {!done ? (
                  <button
                    type="button"
                    onClick={() => setShown(FULL_TEXT.length)}
                    data-testid="letter-reveal-all"
                    className="rounded-full border border-pink-500/30 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-pink-300 transition-colors hover:bg-pink-500/10"
                  >
                    reveal all ✨
                  </button>
                ) : null}
              </div>
              <div
                data-testid="letter-typewriter"
                className="max-h-[60vh] overflow-y-auto whitespace-pre-line pr-2 font-letter text-[15px] leading-relaxed text-[#FFF1F2] sm:text-lg sm:leading-8"
              >
                {FULL_TEXT.slice(0, shown)}
                {!done ? <span className="ml-0.5 inline-block h-5 w-[2px] animate-[caret-blink_0.8s_steps(1)_infinite] bg-pink-300 align-middle" /> : null}
              </div>
              {done ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8 text-right font-letter text-xl italic text-amber-200/90"
                >
                  — your best friend, forever 🫶🏻
                </motion.p>
              ) : null}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
