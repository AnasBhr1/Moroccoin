import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 shadow-sm",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 shadow-sm",
        outline: "text-foreground border-border hover:bg-accent hover:text-accent-foreground",
        success:
          "border-transparent bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30 shadow-sm",
        warning:
          "border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/30 shadow-sm",
        info:
          "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/30 shadow-sm",
        purple:
          "border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/30 shadow-sm",
        pink:
          "border-transparent bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-900/30 shadow-sm",
        glass:
          "border-white/20 bg-white/20 backdrop-blur-md text-foreground hover:bg-white/30 shadow-lg",
        gradient:
          "border-transparent bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-2xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  pulse?: boolean
  dot?: boolean
}

function Badge({ className, variant, size, pulse, dot, children, ...props }: BadgeProps) {
  return (
    <div 
      className={cn(
        badgeVariants({ variant, size }), 
        pulse && "animate-pulse-soft",
        className
      )} 
      {...props}
    >
      {dot && (
        <div className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      )}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }