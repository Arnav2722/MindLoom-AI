import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-black uppercase tracking-wide transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 brutal-border brutal-shadow brutal-hover",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-foreground hover:bg-primary-dark",
        destructive: "bg-destructive text-destructive-foreground border-foreground",
        outline: "border-foreground bg-background hover:bg-foreground hover:text-background",
        secondary: "bg-secondary text-secondary-foreground border-foreground hover:bg-secondary-dark",
        ghost: "border-transparent shadow-none hover:bg-muted hover:text-foreground",
        link: "border-transparent shadow-none text-primary underline-offset-4 hover:underline",
        brutal: "bg-foreground text-background border-foreground hover:bg-accent",
        warning: "bg-secondary text-secondary-foreground border-foreground brutal-shadow-secondary",
        accent: "bg-accent text-accent-foreground border-foreground",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4",
        lg: "h-16 px-10 text-lg",
        icon: "h-12 w-12",
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
