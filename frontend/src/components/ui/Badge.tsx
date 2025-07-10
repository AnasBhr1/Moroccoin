import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
        secondary:
          "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200",
        destructive:
          "border-transparent bg-red-600 text-white hover:bg-red-700 shadow-sm",
        outline: "text-gray-900 border-gray-300 hover:bg-gray-50 hover:text-gray-900",
        success:
          "border-transparent bg-green-100 text-green-800 hover:bg-green-200 shadow-sm",
        warning:
          "border-transparent bg-orange-100 text-orange-800 hover:bg-orange-200 shadow-sm",
        info:
          "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200 shadow-sm",
        purple:
          "border-transparent bg-purple-100 text-purple-800 hover:bg-purple-200 shadow-sm",
        pink:
          "border-transparent bg-pink-100 text-pink-800 hover:bg-pink-200 shadow-sm",
        glass:
          "border-white/20 bg-white/20 backdrop-blur-md text-gray-900 hover:bg-white/30 shadow-lg",
        gradient:
          "border-transparent bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
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
        pulse && "animate-pulse",
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