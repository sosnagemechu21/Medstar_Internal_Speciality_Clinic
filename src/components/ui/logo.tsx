import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

/**
 * Medstar logo — pure SVG paths + shapes (no <text>) so it renders
 * correctly on any background without needing external fonts loaded.
 * Matches the brand: blue star left, MEDSTAR wordmark (A replaced with
 * red star accent), SPECIALTY CLINIC subtitle, ECG line + red dot,
 * divider, YOUR HEALTH MATTERS tagline.
 */
export function Logo({ className, size = "md" }: LogoProps) {
  // Responsive scale factor
  const scale = { sm: 0.65, md: 0.88, lg: 1.15 }[size]
  const w = Math.round(280 * scale)
  const h = Math.round(106 * scale)

  return (
    <Link
      href="/"
      aria-label="Medstar Specialty Clinic — home"
      className={cn("inline-flex shrink-0 items-center", className)}
    >
      {/* ──────────────────────────────────────────────────────────
          We render the logo as a single HTML block with CSS instead
          of <text> SVG tags (which need embedded fonts to paint).
          ────────────────────────────────────────────────────────── */}
      <div
        style={{ width: w, height: h, position: "relative", userSelect: "none" }}
        aria-hidden="true"
      >
        <svg
          width={w}
          height={h}
          viewBox="0 0 280 106"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: "absolute", inset: 0 }}
        >
          {/* ── Blue star ── */}
          <polygon
            points="34,2 40,18 58,18 44,29 49,46 34,36 19,46 24,29 10,18 28,18"
            fill="#1134A6"
          />
          {/* star inner highlight */}
          <polygon
            points="34,8 38,20 50,20 41,27 44,39 34,33 24,39 27,27 18,20 30,20"
            fill="#1a4bd4"
            opacity="0.4"
          />

          {/* ── ECG / heartbeat line (behind text area) ── */}
          <polyline
            points="152,52 158,52 162,43 166,61 170,38 174,66 178,52 218,52"
            stroke="#CC2936"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="219" cy="52" r="3" fill="#CC2936" />

          {/* ── Horizontal rule ── */}
          <line x1="34" y1="68" x2="260" y2="68" stroke="#1134A6" strokeWidth="1.2" />

          {/* ── Red dashes flanking tagline ── */}
          <line x1="34" y1="90" x2="42" y2="90" stroke="#CC2936" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="238" y1="90" x2="246" y2="90" stroke="#CC2936" strokeWidth="2.5" strokeLinecap="round" />
        </svg>

        {/* ── MEDSTAR wordmark — rendered as HTML for crisp font rendering ── */}
        <div
          style={{
            position: "absolute",
            top: `${(2 / 106) * h}px`,
            left: `${(62 / 280) * w}px`,
            lineHeight: 1,
          }}
        >
          {/* Main wordmark row */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 0,
            }}
          >
            <span
              style={{
                fontFamily: "'Arial Black', 'Helvetica Neue', Arial, sans-serif",
                fontWeight: 900,
                fontSize: `${Math.round(34 * scale)}px`,
                color: "#1134A6",
                letterSpacing: "-0.5px",
                lineHeight: 1,
              }}
            >
              MEDST
            </span>
            {/* A with a red star embedded */}
            <span style={{ position: "relative", display: "inline-block" }}>
              <span
                style={{
                  fontFamily: "'Arial Black', 'Helvetica Neue', Arial, sans-serif",
                  fontWeight: 900,
                  fontSize: `${Math.round(34 * scale)}px`,
                  color: "#1134A6",
                  letterSpacing: "-0.5px",
                  lineHeight: 1,
                }}
              >
                A
              </span>
              {/* tiny red star inside the A */}
              <svg
                width={Math.round(10 * scale)}
                height={Math.round(10 * scale)}
                viewBox="0 0 10 10"
                style={{
                  position: "absolute",
                  top: `${Math.round(3 * scale)}px`,
                  left: `${Math.round(3 * scale)}px`,
                  pointerEvents: "none",
                }}
              >
                <polygon points="5,0 6.2,3.5 10,3.5 7,5.5 8.1,9 5,7 1.9,9 3,5.5 0,3.5 3.8,3.5" fill="#CC2936" />
              </svg>
            </span>
            <span
              style={{
                fontFamily: "'Arial Black', 'Helvetica Neue', Arial, sans-serif",
                fontWeight: 900,
                fontSize: `${Math.round(34 * scale)}px`,
                color: "#1134A6",
                letterSpacing: "-0.5px",
                lineHeight: 1,
              }}
            >
              R
            </span>
          </div>

          {/* SPECIALTY CLINIC subtitle */}
          <div
            style={{
              fontFamily: "Arial, Helvetica, sans-serif",
              fontWeight: 600,
              fontSize: `${Math.round(8.5 * scale)}px`,
              color: "#1134A6",
              letterSpacing: `${Math.round(2.5 * scale)}px`,
              marginTop: `${Math.round(1 * scale)}px`,
              whiteSpace: "nowrap",
            }}
          >
            SPECIALTY CLINIC
          </div>
        </div>

        {/* YOUR HEALTH MATTERS tagline */}
        <div
          style={{
            position: "absolute",
            bottom: `${(4 / 106) * h}px`,
            left: `${(46 / 280) * w}px`,
            fontFamily: "'Arial Black', 'Helvetica Neue', Arial, sans-serif",
            fontWeight: 900,
            fontSize: `${Math.round(9 * scale)}px`,
            color: "#1134A6",
            letterSpacing: `${Math.round(2 * scale)}px`,
            whiteSpace: "nowrap",
          }}
        >
          YOUR HEALTH MATTERS
        </div>
      </div>
    </Link>
  )
}
