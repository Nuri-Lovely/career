import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";
import { cn } from "../lib/utils";

interface ChecklistItemProps {
  key?: string | number;
  id: string;
  label: string;
  icon: LucideIcon;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function ChecklistItem({ id, label, icon: Icon, selected, onClick, disabled }: ChecklistItemProps) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled && !selected}
      className={cn(
        "flex flex-col items-center justify-center p-4 transition-all gap-3 h-32 w-full border-2 border-ink font-black uppercase text-xs tracking-wider",
        selected 
          ? "bg-accent text-white shadow-none translate-x-[2px] translate-y-[2px]" 
          : "bg-white text-ink shadow-[4px_4px_0px_#141414] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]",
        disabled && !selected && "opacity-40 cursor-not-allowed grayscale"
      )}
    >
      <Icon className={cn("w-8 h-8", selected ? "text-white" : "text-accent")} />
      <span className="text-center leading-tight">{label}</span>
    </motion.button>
  );
}
