const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext)
  
  const slots = inputOTPContext?.slots || []
  const slot = index >= 0 && index < slots.length ? slots[index] : null
  const char = slot?.char ?? ""
  const hasFakeCaret = slot?.hasFakeCaret ?? false
  const isActive = slot?.isActive ?? false

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-14 w-14 items-center justify-center border-2 border-input rounded-md text-xl transition-all",
        isActive && "z-10 ring-2 ring-primary/70 border-primary",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "text-foreground font-semibold text-2xl transition-opacity duration-200",
          char ? "opacity-100" : "opacity-0"
        )}
      >
        {char || "0"} {/* 默认填充避免空状态塌陷 */}
      </span>

      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-[2px] animate-caret-blink bg-primary duration-700" />
        </div>
      )}
    </div>
  )
})
InputOTPSlot.displayName = "InputOTPSlot"
