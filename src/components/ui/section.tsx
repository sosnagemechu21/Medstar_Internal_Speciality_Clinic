import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionProps extends React.ComponentProps<"section"> {
  title?: string
  subtitle?: string
  titleClassName?: string
  centered?: boolean
}

export function Section({
  className,
  title,
  subtitle,
  titleClassName,
  centered = false,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn("py-16 md:py-20 lg:py-24", className)} {...props}>
      {(title || subtitle) && (
        <div className={cn("mb-10", centered && "text-center")}>
          {title && (
            <h2
              className={cn(
                "text-3xl font-bold tracking-tight text-ms-blue md:text-4xl",
                titleClassName
              )}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-3 text-base text-slate-500">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </section>
  )
}
