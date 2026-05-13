import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
  {
    variants: {
      variant: {
        neutral: "bg-zinc-700 text-zinc-200",
        bullish: "bg-emerald-600/20 text-emerald-300",
        bearish: "bg-red-600/20 text-red-300",
        warning: "bg-amber-500/20 text-amber-300",
        info: "bg-cyan-500/20 text-cyan-300",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
