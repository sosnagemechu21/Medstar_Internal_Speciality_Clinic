"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/ui/logo";
import { Container } from "@/components/ui/container";
import { ProtectedLink } from "@/components/auth/protected-link";
import { resolveLocale } from "@/lib/i18n-utils";
import { getLocalizedPath, swapLocaleInPathname } from "@/lib/locale-routing";
import { useAuth } from "@/providers/auth-provider";

const t = {
  en: {
    home: "Home",
    speciality: "Speciality",
    doctors: "Doctors",
    doctorPortal: "Doctor Portal",
    myPortal: "My Portal",
    adminPanel: "Admin Panel",
    adminAppointments: "Appointments",
    bookAppointment: "Book Appointment",
    signOut: "Sign Out",
    login: "Login",
    switchToAmharic: "Switch to Amharic",
    switchToEnglish: "Switch to English",
  },
  am: {
    home: "መነሻ",
    speciality: "ስፔሻሊቲ",
    doctors: "ዶክተሮች",
    doctorPortal: "የዶክተር ፖርታል",
    myPortal: "የእኔ ፖርታል",
    adminPanel: "አስተዳዳሪ",
    adminAppointments: "ቀጠሮዎች",
    bookAppointment: "ቀጠሮ ይያዙ",
    signOut: "ውጣ",
    login: "ግባ",
    switchToAmharic: "ወደ አማርኛ ቀይር",
    switchToEnglish: "ወደ እንግሊዝኛ ቀይር",
  }
} as const;

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const params = useParams<{ locale?: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const locale = resolveLocale(
    typeof params.locale === "string" ? params.locale : undefined,
  );
  const L = t[locale];
  const nextLocale = locale === "en" ? "am" : "en";
// Only actual doctors see the "Doctor Portal" label; admins & patients see "My Portal".
  const isDoctor = !loading && user?.role?.toLowerCase() === "doctor";
  const portalLabel = isDoctor ? L.doctorPortal : L.myPortal;

  const localize = (href: string) => getLocalizedPath(locale, href);

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
    window.location.href = localize("/");
  };

  const handleLocaleToggle = () => {
    router.push(swapLocaleInPathname(pathname, nextLocale));
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#0B1F6B] shadow-lg">
      <Container>
        <div className="flex h-16 items-center justify-between gap-6">
          <Logo size="md" href={localize("/")} />

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
            <Link
              href={localize("/")}
              className="hover:text-white transition-colors"
            >
              {L.home}
            </Link>
            <Link
              href={localize("/departments")}
              className="hover:text-white transition-colors"
            >
              {L.speciality}
            </Link>
            <Link
              href={localize("/brochure")}
              className="hover:text-white transition-colors"
            >
              Brochure
            </Link>
            <Link
              href={localize("/doctors")}
              className="hover:text-white transition-colors"
            >
              {L.doctors}
            </Link>
            <ProtectedLink
              href={localize("/dashboard")}
              className="hover:text-white transition-colors"
            >
              {portalLabel}
            </ProtectedLink>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button
              aria-label="Toggle language"
              onClick={handleLocaleToggle}
              className="flex items-center gap-1.5 rounded-full border border-white/30 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
            >
              {locale === "en" ? "EN" : "አማ"}&nbsp;
              <span className="text-white/40">|</span>&nbsp;
              {locale === "en" ? "አማ" : "EN"}
            </button>

            {!loading && isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-white/30 pl-1.5 pr-3 py-1 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ms-red text-xs font-bold">
                    {user.displayName.charAt(0).toUpperCase()}
                  </span>
                  {user.displayName}
                  <svg
                    className="w-3 h-3 opacity-60"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white shadow-xl py-1 text-sm z-50">
                    <Link
                      href={localize("/dashboard")}
                      className="block px-4 py-2.5 text-slate-700 hover:bg-slate-50"
                      onClick={() => setProfileOpen(false)}
                    >
                      {portalLabel}
                    </Link>
                    <Link
                      href={localize("/book")}
                      className="block px-4 py-2.5 text-slate-700 hover:bg-slate-50"
                      onClick={() => setProfileOpen(false)}
                    >
                      {L.bookAppointment}
                    </Link>
                    <hr className="my-1 border-slate-100" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50"
                    >
                      {L.signOut}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={localize("/login")}
                className="flex items-center gap-1.5 rounded-full border border-white/30 px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                {L.login}
              </Link>
            )}

            <ProtectedLink
              href={localize("/book")}
              className="rounded-full bg-ms-red px-5 py-2 text-sm font-bold text-white shadow-md hover:bg-ms-red-dark transition-colors"
            >
              {L.bookAppointment}
            </ProtectedLink>
          </div>

          <button
            aria-label="Open menu"
            className="md:hidden text-white"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
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

      {menuOpen && (
        <div className="md:hidden bg-[#0B1F6B] border-t border-white/10 py-4">
          <Container>
            <nav className="flex flex-col gap-3 text-sm font-medium text-white/80">
              <Link
                href={localize("/")}
                onClick={() => setMenuOpen(false)}
                className="hover:text-white"
              >
                {L.home}
              </Link>
              <Link
                href={localize("/departments")}
                onClick={() => setMenuOpen(false)}
                className="hover:text-white"
              >
                {L.speciality}
              </Link>
              <Link
                href={localize("/brochure")}
                onClick={() => setMenuOpen(false)}
                className="hover:text-white"
              >
                Brochure
              </Link>
              <Link
                href={localize("/doctors")}
                onClick={() => setMenuOpen(false)}
                className="hover:text-white"
              >
                {L.doctors}
              </Link>
              <ProtectedLink
                href={localize("/dashboard")}
                onClick={() => setMenuOpen(false)}
                className="hover:text-white"
              >
{portalLabel}
              </ProtectedLink>
              <hr className="border-white/10 my-1" />
              {!loading && isAuthenticated ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="text-left hover:text-white"
                >
                  {L.signOut} ({user?.displayName})
                </button>
              ) : (
                <Link
                  href={localize("/login")}
                  onClick={() => setMenuOpen(false)}
                  className="hover:text-white"
                >
                  {L.login}
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  handleLocaleToggle();
                  setMenuOpen(false);
                }}
                className="text-left hover:text-white"
              >
                {nextLocale === "am" ? L.switchToAmharic : L.switchToEnglish}
              </button>
              <ProtectedLink
                href={localize("/book")}
                onClick={() => setMenuOpen(false)}
                className="inline-block rounded-full bg-ms-red px-5 py-2 text-center text-sm font-bold text-white"
              >
                {L.bookAppointment}
              </ProtectedLink>
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
}
