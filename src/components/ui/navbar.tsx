"use client"

import Link from "next/link"
import { useState } from "react"
import { Logo } from "@/components/ui/logo"
import { Container } from "@/components/ui/container"

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#0B1F6B] shadow-lg">
      <Container>
        <div className="flex h-16 items-center justify-between gap-6">
          {/* Logo */}
          <Logo size="md" />

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
            <Link href="/doctors" className="hover:text-white transition-colors">
              Find a Doctor
            </Link>
            <Link href="/departments" className="hover:text-white transition-colors">
              Departments
            </Link>
            <Link href="/portal" className="hover:text-white transition-colors">
              My Portal
            </Link>
          </nav>

          {/* Right controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language toggle */}
            <button
              aria-label="Toggle language"
              className="flex items-center gap-1.5 rounded-full border border-white/30 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
                  clipRule="evenodd"
                />
              </svg>
              EN&nbsp;<span className="text-white/40">|</span>&nbsp;አማ
            </button>

            {/* Login */}
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-full border border-white/30 px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L8.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zM17 10a1 1 0 01-1 1h-6a1 1 0 110-2h6a1 1 0 011 1z"
                  clipRule="evenodd"
                />
              </svg>
              Login
            </Link>

            {/* Book Appointment CTA */}
            <Link
              href="/book"
              className="rounded-full bg-ms-red px-5 py-2 text-sm font-bold text-white shadow-md hover:bg-ms-red-dark transition-colors"
            >
              Book Appointment
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            aria-label="Open menu"
            className="md:hidden text-white"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </Container>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-[#0B1F6B] border-t border-white/10 py-4">
          <Container>
            <nav className="flex flex-col gap-3 text-sm font-medium text-white/80">
              <Link href="/doctors" onClick={() => setMenuOpen(false)} className="hover:text-white">Find a Doctor</Link>
              <Link href="/departments" onClick={() => setMenuOpen(false)} className="hover:text-white">Departments</Link>
              <Link href="/portal" onClick={() => setMenuOpen(false)} className="hover:text-white">My Portal</Link>
              <hr className="border-white/10 my-1" />
              <Link href="/login" onClick={() => setMenuOpen(false)} className="hover:text-white">Login</Link>
              <Link href="/book" onClick={() => setMenuOpen(false)} className="inline-block rounded-full bg-ms-red px-5 py-2 text-center text-sm font-bold text-white">
                Book Appointment
              </Link>
            </nav>
          </Container>
        </div>
      )}
    </header>
  )
}
