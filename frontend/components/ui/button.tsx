"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium",
    "transition-transform duration-150 ease-out", // ОПТИМИЗАЦИЯ: только transform
    "active:scale-95", // Быстрый feedback при клике
    /* Disabled */
    "disabled:pointer-events-none disabled:opacity-50",
    /* Focus */
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
    /* Performance */
    "will-change-transform", // GPU acceleration
  ],
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white border border-purple-500/30 hover:from-purple-500 hover:via-purple-600 hover:to-purple-700 hover:border-purple-400/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]",
        secondary:
          "bg-gradient-to-br from-purple-900/80 via-purple-800/60 to-purple-900/80 text-white border border-purple-500/30 hover:border-purple-400/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]",
        outline:
          "border-2 border-purple-500/50 bg-transparent text-purple-200 hover:bg-purple-900/30 hover:border-purple-400",
        ghost: 
          "text-purple-200 hover:bg-purple-900/30 hover:text-white",
        link: 
          "text-purple-300 underline-offset-4 hover:underline hover:text-purple-200",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4 py-2 text-sm",
        lg: "h-14 px-8 py-4 text-base",
        icon: "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }

