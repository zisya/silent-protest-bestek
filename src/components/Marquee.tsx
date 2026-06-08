import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function Marquee({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("overflow-hidden whitespace-nowrap bg-black text-white py-2 flex max-w-full", className)}>
      <motion.div
        className="flex gap-4 min-w-full font-bold text-lg sm:text-xl uppercase tracking-widest whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ ease: "linear", duration: 15, repeat: Infinity }}
      >
        <span>{text}</span>
        <span>{text}</span>
        <span>{text}</span>
        <span>{text}</span>
        <span>{text}</span>
        <span>{text}</span>
      </motion.div>
    </div>
  );
}
