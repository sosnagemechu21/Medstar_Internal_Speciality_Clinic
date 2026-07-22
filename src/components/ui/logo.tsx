import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  /** Set to true when logo sits on a light/white background */
  dark?: boolean
  href?: string
}

const dimensions = {
  sm: { width: 200, height: 75 },
  md: { width: 270, height: 90 },
  lg: { width: 350, height: 110 },
}

export function Logo({ className, size = "md", dark = false, href = "/" }: LogoProps) {
  const { width, height } = dimensions[size]

  return (
    <Link
      href={href}
      aria-label="Medstar Specialty Clinic — home"
      className={cn("inline-flex shrink-0 items-center", className)}
    >
      <Image
        src="/medstar logo.png"
        alt="Medstar Specialty Clinic"
        width={width}
        height={height}
        priority
        style={{
          objectFit: "contain",
          // Logo is white/light — invert for dark-text rendering on light backgrounds
          filter: dark ? "invert(1) brightness(0.15)" : "none",
        }}
      />
    </Link>
  )
}
