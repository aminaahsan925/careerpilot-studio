import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect, useRef } from "react";
import { cn } from "./utils";

/* ------------------------------------------------------------------ */
/* Animation primitives — reusable across all pages                    */
/* ------------------------------------------------------------------ */

/** Smoothly counts from 0 to `value` on mount / value change. */
export function AnimatedNumber({
  value,
  duration = 1.2,
  suffix = "",
  className,
}: {
  value: number;
  duration?: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => `${Math.round(v)}${suffix}`);

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration,
      ease: [0.22, 1, 0.36, 1] as const,
    });
    return () => controls.stop();
  }, [value, duration, motionVal]);

  return (
    <motion.span ref={ref} className={className}>
      {rounded}
    </motion.span>
  );
}

/** Container that fades in and sets up stagger timing for children. */
export function Stagger({
  children,
  className,
  delay = 0.06,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: delay, delayChildren: 0.05 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Child item inside <Stagger> — fades up when parent triggers "show". */
export function StaggerItem({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
      }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

/** Card with subtle hover-lift micro-interaction. */
export function AnimatedCard({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={cn("card-surface p-5", className)}
    >
      {children}
    </motion.div>
  );
}

/** Animated progress bar that fills from 0 to `percent`. */
export function AnimatedBar({
  percent,
  color = "bg-terracotta",
  className,
  delay = 0,
}: {
  percent: number;
  color?: string;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${percent}%` }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] as const }}
      className={cn("h-full rounded-full", color)}
    />
  );
}

/** Shimmer placeholder for loading skeletons. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0.4 }}
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      className={cn("rounded-lg bg-muted", className)}
    />
  );
}

/** Fade-up reveal triggered when the element scrolls into view. */
export function ScrollReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Card with a subtle pulsing terracotta glow border — used for AI insight highlights. */
export function GlowCard({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 16,
        boxShadow: "0 0 0 1px rgba(180,90,50,0.08), 0 0 20px -8px rgba(180,90,50,0)",
      }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      animate={{
        boxShadow: [
          "0 0 0 1px rgba(180,90,50,0.08), 0 0 20px -8px rgba(180,90,50,0)",
          "0 0 0 1px rgba(180,90,50,0.18), 0 0 20px -8px rgba(180,90,50,0.15)",
          "0 0 0 1px rgba(180,90,50,0.08), 0 0 20px -8px rgba(180,90,50,0)",
        ],
      }}
      transition={{
        boxShadow: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
        opacity: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
        y: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
      }}
      className={cn("card-surface p-5 rounded-2xl", className)}
    >
      {children}
    </motion.div>
  );
}

/** Small pulsing badge — used for data-freshness / staleness indicators. */
export function PulseBadge({
  children,
  className,
  variant = "amber",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "amber" | "emerald" | "blue";
}) {
  const dotColor =
    variant === "amber"
      ? "bg-amber-400"
      : variant === "emerald"
        ? "bg-emerald-400"
        : "bg-blue-400";
  const glowColor =
    variant === "amber"
      ? "bg-amber-400/30"
      : variant === "emerald"
        ? "bg-emerald-400/30"
        : "bg-blue-400/30";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        variant === "amber"
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : variant === "emerald"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-blue-200 bg-blue-50 text-blue-700",
        className,
      )}
    >
      <span className="relative flex h-2 w-2">
        <motion.span
          className={cn("absolute inset-0 rounded-full", glowColor)}
          animate={{ scale: [1, 2.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <span className={cn("relative inline-block h-2 w-2 rounded-full", dotColor)} />
      </span>
      {children}
    </span>
  );
}

/** Shimmer skeleton bar — gradient sweep left-to-right for loading states. */
export function ShimmerSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg bg-muted", className)}>
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)",
        }}
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/** Small animated trend arrow indicating direction (up / flat / down). */
export function TrendArrow({
  direction,
  color,
  className,
}: {
  direction: "up" | "flat" | "down";
  color?: string;
  className?: string;
}) {
  const stroke = color ?? "var(--terracotta)";

  const paths: Record<typeof direction, string> = {
    up: "M 2 10 L 10 2 M 10 2 L 10 6 M 10 2 L 6 2",
    flat: "M 2 6 L 10 6 M 10 6 L 7 3 M 10 6 L 7 9",
    down: "M 2 2 L 10 10 M 10 10 L 10 6 M 10 10 L 6 10",
  };

  return (
    <motion.svg
      viewBox="0 0 12 12"
      className={cn("h-3 w-3 shrink-0", className)}
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.path
        d={paths[direction]}
        fill="none"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.svg>
  );
}
