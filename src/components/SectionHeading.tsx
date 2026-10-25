import { motion } from "motion/react";

interface SectionHeadingProps {
  badge: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}

export default function SectionHeading({ badge, title, subtitle, align = "center" }: SectionHeadingProps) {
  const alignCls = align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`flex flex-col gap-3 ${alignCls}`}
    >
      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-pink-300/90 rounded-full bg-pink-500/10 border border-pink-500/30 px-3 py-1">
        {badge}
      </span>
      <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-400 to-purple-300">
        {title}
      </h2>
      {subtitle ? (
        <p className="max-w-2xl text-base md:text-lg text-pink-100/70">{subtitle}</p>
      ) : null}
    </motion.div>
  );
}
