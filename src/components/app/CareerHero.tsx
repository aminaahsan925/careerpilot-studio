import { motion } from "motion/react";

import { cn } from "@/lib/utils";

type CareerHeroProps = {
  personImage?: string;
  className?: string;
  compact?: boolean;
};

export function CareerHero({ personImage, className, compact }: CareerHeroProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-ink text-white",
        compact ? "min-h-[300px]" : "min-h-[360px]",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_20%_0%,rgba(255,255,255,0.08),transparent_60%)]" />

      <div className="absolute right-5 top-5 z-20 hidden gap-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60 sm:flex">
        <span>Focus</span>
        <span>Learn</span>
        <span>Grow</span>
      </div>

      {/* terracotta circle */}
      <div className="absolute bottom-0 right-[6%] aspect-square w-[46%] max-w-[380px] translate-y-[42%] rounded-full bg-terracotta sm:translate-y-[38%]" />

      {personImage ? (
        <img
          src={personImage}
          alt="Career hero"
          className="absolute bottom-0 right-[4%] z-10 h-[86%] w-auto object-contain object-bottom mix-blend-luminosity drop-shadow-[0_30px_40px_rgba(0,0,0,0.45)]"
        />
      ) : null}

      <div className="relative z-20 max-w-[62%] px-7 py-8 sm:px-10 sm:py-10">
        <h2 className="editorial-title text-[clamp(2.1rem,5.4vw,4rem)]">
          <span className="block">Build</span>
          <span className="block">Your</span>
          <span className="relative inline-block text-terracotta">
            Future
            <span className="absolute -right-4 top-1 text-base text-terracotta">✳</span>
          </span>
        </h2>

        <p className="mt-5 max-w-[240px] text-[13px] leading-relaxed text-white/70">
          Your career is a journey. We&apos;re here to guide you every step of the way.
        </p>

        <button
          type="button"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-terracotta px-5 py-3 text-[13px] font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
        >
          Start Roadmap <span aria-hidden>→</span>
        </button>
      </div>
    </motion.section>
  );
}
