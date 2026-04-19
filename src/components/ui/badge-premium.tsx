import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgePremiumVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:shadow-glow",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        premium: "border-transparent bg-gradient-premium text-white hover:shadow-premium hover:scale-105",
        gold: "border-heritage-gold/50 bg-heritage-gold/10 text-heritage-gold hover:bg-heritage-gold/20 hover:shadow-glow",
        glow: "border-transparent bg-heritage-sunset text-white shadow-glow animate-pulse-glow",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgePremiumProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgePremiumVariants> {}

function BadgePremium({ className, variant, ...props }: BadgePremiumProps) {
  return (
    <div className={cn(badgePremiumVariants({ variant }), className)} {...props} />
  )
}

export { BadgePremium, badgePremiumVariants }
