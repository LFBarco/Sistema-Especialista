import * as React from "react"

export interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, ...props }, ref) => {
    const handleClick = () => {
      onCheckedChange?.(!checked)
    }

    const buttonClasses = [
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      checked 
        ? "bg-gradient-to-r from-purple-600 to-pink-600" 
        : "bg-gray-200 dark:bg-gray-700",
      className
    ].filter(Boolean).join(" ");

    const thumbClasses = [
      "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
      checked ? "translate-x-5" : "translate-x-0"
    ].filter(Boolean).join(" ");

    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        ref={ref}
        onClick={handleClick}
        className={buttonClasses}
        {...props}
      >
        <span
          data-state={checked ? "checked" : "unchecked"}
          className={thumbClasses}
        />
      </button>
    )
  }
)

Switch.displayName = "Switch"

export { Switch }