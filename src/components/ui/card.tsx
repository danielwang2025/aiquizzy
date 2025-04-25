
import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    glass?: boolean; 
    neo?: boolean;
    hover?: boolean;
    gradient?: boolean;
    glow?: boolean;
    bordered?: boolean;
    cyber?: boolean;
    terminal?: boolean;
    holographic?: boolean;
  }
>(({ className, glass, neo, hover, gradient, glow, bordered, cyber, terminal, holographic, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-black/60 text-white shadow-sm transition-all duration-200",
      glass && "glass-effect bg-black/20 backdrop-blur-md border-white/10",
      neo && "neo-card shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_2px_2px_4px_rgba(255,255,255,0.1)]",
      hover && "card-hover transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10",
      gradient && "bg-gradient-to-br from-gray-900/90 to-black/90",
      glow && "shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30",
      bordered && "border-2 border-primary/20 hover:border-primary/40",
      cyber && "cyber-card",
      terminal && "terminal",
      holographic && "holographic",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 pb-3", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    glitch?: boolean;
    neon?: boolean;
  }
>(({ className, glitch, neon, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      glitch && "cyber-glitch-random",
      neon && "neon-text",
      className
    )}
    data-text={props.children?.toString()}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-2", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
