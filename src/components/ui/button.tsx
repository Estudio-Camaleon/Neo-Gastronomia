import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/core/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-xs font-black uppercase italic tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:pointer-events-none disabled:opacity-50 border-4 border-black",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-custom,#000000)] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:opacity-90 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        outline:
          "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        error:
          "bg-red-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        ghost:
          "border-transparent hover:bg-gray-100 active:bg-gray-200 shadow-none",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 px-3 text-[10px]",
        lg: "h-14 px-10 text-sm",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
