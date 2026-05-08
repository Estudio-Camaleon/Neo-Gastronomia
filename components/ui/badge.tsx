import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center border-2 border-black px-2.5 py-0.5 text-[10px] font-black uppercase italic tracking-tighter transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-custom text-white border-transparent",
        secondary: "bg-gray-100 text-black border-black",
        destructive: "bg-red-500 text-white border-transparent",
        outline:
          "text-black bg-transparent shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
