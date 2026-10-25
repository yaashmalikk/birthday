import { motion } from "motion/react";
import SectionHeading from "./SectionHeading";

const MILESTONES = [
  {
    emoji: "🎓",
    title: "College Mission",
    desc: "Getting that dream college. Late-night study sessions, panicked syllabus sprints — and the admit that makes it all worth it.",
    tags: ["Dream College", "Madam's Era", "New Chapter"],
  },
  {
    emoji: "🏆",
    title: "Hackathon Spree",
    desc: "Coding all night, chai at 3 AM, demos at 9 — and still walking out with trophies. Team name: undefeatable.",
    tags: ["3 AM Chai", "Trophies", "Undefeated Team"],
  },
  {
    emoji: "💡",
    title: "The Big Startup Idea",
    desc: "Brainstorming the unicorn over midnight calls. Whiteboards, wild ideas, one of them is going to be THE one.",
    tags: ["Unicorn Loading", "Midnight Brainstorms", "Co-Founders"],
  },
  {
    emoji: "💼",
    title: "Founders Office",
    desc: "Sitting as bosses in our own company — and hiring employees to do the work while we take the credit 😂",
    tags: ["CEO Energy", "Boss Duo", "No Vacancy"],
  },
];

export default function RoadmapTimeline() {
  return (
    <section id="roadmap" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-4">
        <SectionHeading
          badge="Our Promise"
          title="Startup & Hackathon Roadmap 🚀"
          subtitle="The plan is already written — college, hackathons, the startup, and the founders' office. In that order."
        />

        <div className="relative mt-14">
          {/* the glowing line */}
          <div className="absolute left-[26px] top-0 h-full w-[3px] rounded-full bg-gradient-to-b from-pink-500/70 via-purple-500/60 to-amber-400/60 md:left-1/2 md:-translate-x-1/2" aria-hidden />

          <div className="flex flex-col gap-10">
            {MILESTONES.map((m, i) => {
              const left = i % 2 === 0;
              return (
                <motion.div
                  key={m.title}
                  initial={{ opacity: 0, y: 32, x: 0 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-70px" }}
                  transition={{ duration: 0.55, delay: 0.05 }}
                  className={`relative flex md:w-1/2 ${left ? "md:pr-10" : "md:ml-auto md:pl-10"} pl-16 md:pl-0 ${left ? "" : "md:pl-10"}`}
                  data-testid={`roadmap-milestone-${i + 1}`}
                >
                  {/* node */}
                  <span
                    className={`absolute top-6 grid h-8 w-8 place-items-center rounded-full border-2 border-pink-400/60 bg-[#0B0C1E] text-sm shadow-[0_0_18px_rgba(255,117,143,0.5)] left-[13px] md:left-auto ${left ? "md:-right-4" : "md:-left-4"}`}
                    aria-hidden
                  >
                    {m.emoji}
                  </span>
                  <div className="w-full rounded-3xl border border-purple-500/25 bg-[#151632]/70 p-6 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-pink-500/50 hover:shadow-[0_0_30px_rgba(255,117,143,0.25)]">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{m.emoji}</span>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-pink-300/80">
                          Milestone {i + 1}
                        </p>
                        <h3 className="font-heading text-xl font-extrabold text-white">{m.title}</h3>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-pink-100/75">{m.desc}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {m.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-purple-400/25 bg-purple-500/10 px-2.5 py-1 text-[11px] font-semibold text-purple-200"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
